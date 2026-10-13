import { list, del } from '@vercel/blob';
import { isAuthorized, blobConfigured } from './_auth.js';

const PREFIX = 'photos/';

export default async function handler(req, res) {
  if (!blobConfigured()) {
    return res.status(200).json({ photos: [], warning: 'Vercel Blob bağlı değil.' });
  }

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
      photos: photos.map((p) => ({ url: p.url, pathname: p.pathname, uploadedAt: p.uploadedAt })),
    });
  }

  if (req.method === 'DELETE') {
    if (!isAuthorized(req)) return res.status(401).json({ error: 'Yetkisiz' });
    const url = req.query.url;
    if (!url || !new URL(url).pathname.startsWith('/' + PREFIX)) {
      return res.status(400).json({ error: 'Geçersiz adres' });
    }
    await del(url);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
