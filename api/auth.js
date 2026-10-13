import { isAuthorized } from './_auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.PANEL_PASSWORD) {
    return res.status(500).json({ error: 'PANEL_PASSWORD ortam değişkeni Vercel\'de tanımlı değil.' });
  }
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Şifre yanlış' });
  res.status(200).json({ ok: true });
}
