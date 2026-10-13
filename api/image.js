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

  // Only allow local static assets from this deployment.
  if (target.startsWith('//') || target.includes('..')) {
    res.statusCode = 400;
    res.end('Invalid image url');
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.statusCode = 307;
  res.setHeader('Location', target);
  res.end();
};
