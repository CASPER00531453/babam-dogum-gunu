import { list, del } from '@vercel/blob';
import { isAuthorized, blobConfigured } from './_auth.js';

const PREFIX = 'photos/';

// Depo herkese açık ya da özel olabilir; resimler her durumda /api/image üzerinden sunulur.
const imageUrl = (pathname) => '/api/image?p=' + encodeURIComponent(pathname);

export default async function handler(req, res) {
  if (!blobConfigured()) {
    return res.status(200).json({ photos: [], warning: 'Vercel Blob bağlı değil.' });
  }

  try {
    if (req.method === 'GET') {
      const photos = [];
      let cursor;
      do {
        const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
        photos.push(...page.blobs);
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      photos.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
      return res.status(200).json({
        photos: photos.map((p) => ({ url: imageUrl(p.pathname), pathname: p.pathname, uploadedAt: p.uploadedAt })),
      });
    }

    if (req.method === 'DELETE') {
      if (!isAuthorized(req)) return res.status(401).json({ error: 'Yetkisiz' });
      const pathname = String(req.query.p || '');
      if (!pathname.startsWith(PREFIX) || pathname.includes('..')) {
        return res.status(400).json({ error: 'Geçersiz dosya' });
      }
      await del(pathname);
      return res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Depo hatası: ' + err.message });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
