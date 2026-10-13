// Panel şifresi Vercel ortam değişkeni PANEL_PASSWORD ile belirlenir.
export function isAuthorized(req) {
  const expected = process.env.PANEL_PASSWORD;
  if (!expected) return false;
  const given = req.headers['x-panel-password'] || '';
  return given === expected;
}

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
