// Panel şifresi Vercel ortam değişkeni PANEL_PASSWORD ile belirlenir.
export function isAuthorized(req) {
  const expected = process.env.PANEL_PASSWORD;
  if (!expected) return false;
  const given = req.headers['x-panel-password'] || '';
  return given === expected;
}

// Vercel Blob iki şekilde bağlanabilir: eski usul token ya da OIDC + store id.
export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}
