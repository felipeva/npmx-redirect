/**
 * Check if a URL matches an exclusion pattern.
 *
 * Supported patterns:
 *
 * Hostname-only patterns:
 * - `example.com`       → matches exactly + subdomains (www.example.com)
 * - `*.example.com`     → matches only subdomains, not example.com itself
 * - `.example.com`      → same as *.example.com
 * - `google`            → matches any hostname containing "google"
 *
 * Path patterns:
 * - `example.com/docs`    → matches example.com with path starting with /docs
 * - `example.com/api/*`   → same as above (trailing * is implicit)
 * - `*.example.com/blog`  → subdomains of example.com with path starting with /blog
 */
export function matchesPattern(hostname: string, pathname: string, pattern: string): boolean {
  const slashIndex = pattern.indexOf('/');

  if (slashIndex === -1) {
    return matchesHostname(hostname, pattern);
  }

  const hostPart = pattern.slice(0, slashIndex);
  let pathPart = pattern.slice(slashIndex);

  // Remove trailing wildcard — we always do prefix matching on paths
  if (pathPart.endsWith('/*')) {
    pathPart = pathPart.slice(0, -2);
  } else if (pathPart.endsWith('*')) {
    pathPart = pathPart.slice(0, -1);
  }

  // Remove trailing slash for consistent matching
  if (pathPart.length > 1 && pathPart.endsWith('/')) {
    pathPart = pathPart.slice(0, -1);
  }

  if (!matchesHostname(hostname, hostPart)) return false;

  return pathname === pathPart || pathname.startsWith(`${pathPart}/`);
}

/**
 * Check if a hostname matches a hostname-only pattern.
 *
 * Supported patterns:
 * - `example.com`       → matches exactly + subdomains (www.example.com)
 * - `*.example.com`     → matches only subdomains, not example.com itself
 * - `.example.com`      → same as *.example.com
 * - `google`            → matches any hostname containing "google"
 */
export function matchesHostname(hostname: string, pattern: string): boolean {
  // Wildcard prefix: *.example.com → subdomains only
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(2);
    return hostname.endsWith(`.${suffix}`);
  }

  // Dot prefix: .example.com → subdomains only
  if (pattern.startsWith('.')) {
    const suffix = pattern.slice(1);
    return hostname.endsWith(`.${suffix}`);
  }

  // No dots at all (e.g. "google") → contains match
  if (!pattern.includes('.')) {
    return hostname.includes(pattern);
  }

  // Exact domain → matches itself + subdomains
  return hostname === pattern || hostname.endsWith(`.${pattern}`);
}
