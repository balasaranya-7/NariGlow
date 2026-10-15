const HOP_BY_HOP_HEADERS = new Set([
  'connection', 'content-length', 'host', 'keep-alive', 'proxy-authenticate',
  'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade'
]);

module.exports = async function apiProxy(req, res) {
  const configuredApiUrl = process.env.NARIGLOW_API_URL;
  if (!configuredApiUrl) {
    return res.status(503).json({
      success: false,
      message: 'The backend URL has not been configured for this deployment.'
    });
  }

  try {
    const pathValue = req.query.path;
    const requestedPath = (Array.isArray(pathValue) ? pathValue.join('/') : String(pathValue || ''));
    const segments = requestedPath.split('/').filter(Boolean);
    if (!segments.length || segments.some(segment => segment === '.' || segment === '..' || !/^[\w.-]+$/.test(segment))) {
      return res.status(400).json({ success: false, message: 'Invalid API path.' });
    }

    const backend = new URL(configuredApiUrl);
    const destination = new URL(`/api/${segments.map(encodeURIComponent).join('/')}`, backend);
    const incoming = new URL(req.url, 'https://vercel.invalid');
    for (const [key, value] of incoming.searchParams) {
      if (key !== 'path') destination.searchParams.append(key, value);
    }

    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && value) {
        headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    let body;
    if (!['GET', 'HEAD'].includes(req.method)) {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 4 * 1024 * 1024) {
          return res.status(413).json({ success: false, message: 'Request body is too large.' });
        }
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    const upstream = await fetch(destination, {
      method: req.method,
      headers,
      body,
      redirect: 'manual'
    });

    res.statusCode = upstream.status;
    res.setHeader('Cache-Control', 'no-store');
    for (const headerName of ['content-type', 'retry-after']) {
      const value = upstream.headers.get(headerName);
      if (value) res.setHeader(headerName, value);
    }
    const responseBody = Buffer.from(await upstream.arrayBuffer());
    return res.end(responseBody);
  } catch (error) {
    console.error('NariGlow API proxy error:', error.message);
    return res.status(502).json({ success: false, message: 'The NariGlow backend is unavailable.' });
  }
};

module.exports.config = { api: { bodyParser: false } };
