/*  this is required by both the CLI and the test suite, so we put it in a shared file.
 It is used to normalize the host and path parts of a URL, and to build a test URL from those parts.
*/

export function normalizeUrlParts(host, path) {
  return {
    host: host.trim().replace(/\/+$/, ''),
    path: path.trim().replace(/^\/+/, '')
  }
}

export function buildTestUrl(host, path) {
  const { host: normalizedHost, path: normalizedPath } = normalizeUrlParts(host, path)
  return `${normalizedHost}/${normalizedPath}`
}
