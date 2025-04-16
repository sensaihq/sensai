import { FILE_TYPE, HTTP_ANY, VERSION_DEFAULT } from "@/src/constants";


/**
 * Get metadata from file path.
 * @notes please note we will assume we can only have one slot folder in a file path (usually right before filename).
 */

export default (filePath: string): {
  pathname: string;
  filename: string;
  method: string;
  version: string;
  type: string;
} => {
  // Split the entire path into segments
  const segments = filePath.split('/');
  // The last segment is the filename
  const filename = segments.pop();
  
  // Determine method from filename (route.METHOD.ts)
  const chunks = filename.split('.')
  const method = chunks.length > 2 ? chunks[1].toUpperCase() : HTTP_ANY;

  // filter collections/slots
  let version = VERSION_DEFAULT;
  const pathname = segments.filter((segment) => {
    if (segment.startsWith('(') && segment.endsWith(')')) {
      return false;
    }
    if (segment.startsWith('@')) {
      version = segment.substring(1);
      return false;
    }
    return true;
  }).join('/');

  return {
    pathname,
    filename,
    method,
    version,
    type: FILE_TYPE.ROUTE // TODO this should differ based on filename
  };
}
