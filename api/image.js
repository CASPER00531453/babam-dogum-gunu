import { get } from '@vercel/blob';
import { Readable } from 'node:stream';

const PREFIX = 'photos/';

async function fetchBlob(pathname) {
  // Önce özel, olmazsa herkese açık depo olarak dene.
  for (const access of ['private', 'public']) {
    try {
      const r = await get(pathname, { access });
      if (r) return r;
    } catch (err) {
      if (access === 'public') throw err;
    }
  }
  return null;
}

export default async function handler(req, res) {
  const pathname = String(req.query.p || '');
  if (!pathname.startsWith(PREFIX) || pathname.includes('..')) {
    return res.status(400).end('Geçersiz dosya');
  }
  try {
    const r = await fetchBlob(pathname);
    if (!r || r.statusCode !== 200) return res.status(404).end('Bulunamadı');
    res.setHeader('Content-Type', r.blob.contentType || 'image/jpeg');
    // Dosya adları benzersiz olduğundan uzun süre önbelleğe alınabilir.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    Readable.fromWeb(r.stream).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).end('Resim okunamadı');
  }
}
