// 문장 하나를 ElevenLabs 음성(mp3)으로 만들어 돌려준다. API 키는 서버에만 있다.
const guard = require('./_guard')
const clamp = (x, a, b, d) => (Number.isFinite(+x) ? Math.min(b, Math.max(a, +x)) : d)

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method', message: 'POST만 돼요.' })
  const key = guard(req, res)
  if (!key) return
  const { text, voiceId, stability, speed } = req.body || {}
  if (typeof text !== 'string' || !text.trim() || text.length > 400) {
    return res.status(400).json({ error: 'text', message: '문장은 1~400자여야 해요.' })
  }
  if (typeof voiceId !== 'string' || !/^[A-Za-z0-9]{8,40}$/.test(voiceId)) {
    return res.status(400).json({ error: 'voice', message: 'AI 목소리를 먼저 골라 주세요.' })
  }
  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: clamp(stability, 0, 1, 0.5),
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true,
            speed: clamp(speed, 0.7, 1.2, 1),
          },
        }),
      }
    )
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      return res.status(r.status).json({ error: 'upstream', message: j?.detail?.message || j?.detail?.status || `ElevenLabs 오류 ${r.status}` })
    }
    const buf = Buffer.from(await r.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(buf)
  } catch (e) {
    res.status(502).json({ error: 'network', message: String(e).slice(0, 200) })
  }
}
