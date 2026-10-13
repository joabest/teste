module.exports = function handler(req, res) {
  const value = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

  if (!value) {
    res.statusCode = 400;
    res.end('Missing image url');
    return;
  }

  let target = value;
  try {
    target = decodeURIComponent(target);
  } catch (_) {}

  if (!target.startsWith('/')) target = '/' + target;

  if (target.startsWith('//') || target.includes('..')) {
    res.statusCode = 400;
    res.end('Invalid image url');
    return;
  }

  // The HTTrack mirror saved service images as .webp while the original
  // rendered Next.js HTML still requests old .jpg/.jpeg/.png source paths.
  if (target.startsWith('/images/services/')) {
    target = target.replace(/\.(?:jpe?g|png)$/i, '.webp');
  }

  // Some image families were never downloaded by HTTrack. Keep the mirror
  // functional by falling back to the original public asset for those paths.
  const missingLocalFamily =
    (target.startsWith('/images/') && !target.startsWith('/images/services/')) ||
    target.startsWith('/logos/clients/');

  if (missingLocalFamily) {
    target = 'https://weevolveit.com' + target;
  }

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.statusCode = 307;
  res.setHeader('Location', target);
  res.end();
};
