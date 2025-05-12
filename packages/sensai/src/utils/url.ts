/**
 * Extract URL path and search parameters.
 * @notes we are not using URL or URLSearchParams because of speed.
 */

export const parseUrl = (url: string) => {
  const index = url.indexOf("?");
  return index > -1
    ? {
        url: url.substring(0, index),
        searchParams: url.substring(index + 1),
      }
    : { url, searchParams: "" };
};

/**
 * Remove trailling slashes from url.
 *
 * @examples
 *   sanitize('/')
 *   // => '/'
 *   sanitize('/api')
 *   // => '/api'
 *   sanitize('/api/')
 *   // => '/api'
 *   sanitize('/api//')
 *   // => '/api'
 *
 */

export const sanitize = (url: string) => {
  if (url === "/") return url;
  const normalized = url.replace(/\/{2,}/g, "/");
  const len = normalized.length;
  return normalized[len - 1] === "/"
    ? normalized.substring(0, len - 1)
    : normalized;
};
