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
  if (url === '/') return url;
  const normalized = url.replace(/\/{2,}/g, '/');
  const len = normalized.length;
  return normalized[len - 1] === '/' ? normalized.substring(0, len - 1) : normalized;
}