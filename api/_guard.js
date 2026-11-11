// 공용: API 키 확인 + (선택) 앱 암호 확인
module.exports = function guard(req, res) {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    res.status(500).json({ error: 'no_key', message: 'Vercel 환경 변수에 ELEVENLABS_API_KEY가 없어요.' })
    return null
  }
  const pass = process.env.APP_PASSCODE
  if (pass && req.headers['x-app-pass'] !== pass) {
    res.status(401).json({ error: 'passcode', message: '앱 암호가 맞지 않아요.' })
    return null
  }
  return key
}
