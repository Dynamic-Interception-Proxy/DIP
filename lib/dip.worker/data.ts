var headerData = {
  status: [204, 101, 205, 304],
  body: ['GET', 'HEAD'],
  cspData: {
    "worker-src": [["worker"], ['child-src', 'script-src', 'default-src']],
    "script-src": [["script"], ['default-src']],
    "style-src": [["style"], ['default-src']],
    "object-src": [["object", "embed"], ['default-src']],
    "img-src": [["image"], ['default-src']],
    "frame-src": [["iframe"], ['default-src']],
    "font-src": [["font"], ['default-src']],
    "child-src": [["worker", "iframe"], ['default-src']]
  },
  csp: [
    'cross-origin-embedder-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'content-security-policy',
    'content-security-policy-report-only',
    'expect-ct',
    'feature-policy',
    'origin-isolation',
    'strict-transport-security',
    'upgrade-insecure-requests',
    'x-content-type-options',
    'x-download-options',
    'x-frame-options',
    'x-permitted-cross-domain-policies',
    'x-powered-by',
    'x-xss-protection',
  ],
}

var defaultConfig = {
  version: "1.3",
  config: {
    prefix: '/service/',
    encoding: 'plain',
    ws: true,
    cookie: true,
    worker: true,
    bare: {
      version: 2,
      path: '/bare/',
    },
    tab: {
      title: 'Dynamic Interception Proxy',
      icon: 'https://google.com/favicon.ico',
      ua: 'Mozilla/5.0 (X11; CrOS x86_64 14388.61.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.107 Safari/537.36'
    }
  }
}

export default { defaultConfig, headerData };