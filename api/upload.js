import { put } from '@vercel/blob';
import { isAuthorized, blobConfigured } from './_auth.js';

// Fotoğraflar tarayıcıda küçültülüp JPEG olarak gönderilir (Vercel 4.5MB gövde sınırı).
const MAX_BYTES = 4 * 1024 * 1024;

async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Yetkisiz' });
  if (!blobConfigured()) {
    return res.status(500).json({ error: 'Vercel Blob deposu projeye bağlı değil .' });
  }

  const body = await readBody(req);
  if (!body.length) return res.status(400).json({ error: 'Boş dosya' });
  if (body.length > MAX_BYTES) return res.status(413).json({ error: 'Dosya çok büyük' });

  const raw = String(req.query.name || 'foto').toLowerCase();
  const safe = raw.replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9-_]+/g, '-').slice(0, 40) || 'foto';

  const pathname = `photos/${Date.now()}-${safe}.jpg`;
  // Depo herkese açık mı özel mi bilmediğimizden önce public, olmazsa private dene.
  let blob;
  try {
    blob = await put(pathname, body, { access: 'public', contentType: 'image/jpeg', addRandomSuffix: true });
  } catch (err) {
    try {
      blob = await put(pathname, body, { access: 'private', contentType: 'image/jpeg', addRandomSuffix: true });
    } catch (err2) {
      console.error(err, err2);
      return res.status(500).json({ error: 'Depoya yazılamadı: ' + err2.message });
    }
  }
  res.status(200).json({ pathname: blob.pathname });
}
