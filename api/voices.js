// ElevenLabs에서 쓸 수 있는 목소리 목록
const guard = require('./_guard')

module.exports = async (req, res) => {
  const key = guard(req, res)
  if (!key) return
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: 'upstream', message: j?.detail?.message || JSON.stringify(j).slice(0, 300) })
    const voices = (j.voices || []).map((v) => ({
      id: v.voice_id,
      name: v.name,
      gender: v.labels?.gender || '',
      accent: v.labels?.accent || v.labels?.language || '',
      desc: v.labels?.description || v.labels?.descriptive || '',
      category: v.category || '',
    }))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ voices })
  } catch (e) {
    res.status(502).json({ error: 'network', message: String(e).slice(0, 200) })
  }
}
