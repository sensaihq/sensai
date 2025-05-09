import { IncomingMessage } from "node:http";

/**
 * Parse the request body based on the content-type header.
 * Supports JSON, URL-encoded form data, and raw text.
 * @param req The IncomingMessage request object
 * @returns Promise that resolves to the parsed body
 */
async function parseBody(req: IncomingMessage): Promise<unknown> {
  const contentType = req.headers["content-type"] || "";
  const charset = getCharsetFromContentType(contentType);
  const mainContentType = getMainContentType(contentType);
  
  // Collect the body data
  const body = await getBodyFromRequest(req);
  
  // If body is empty, return empty object
  if (!body) {
    return {};
  }
  
  // Parse based on content type
  switch (mainContentType) {
    case "application/json":
      try {
        return JSON.parse(body);
      } catch (err) {
        const error = new Error(`Invalid JSON: ${(err as Error).message}`);
        throw error;
      }
    case "application/x-www-form-urlencoded":
      return parseUrlEncoded(body);
    default:
      // If content type is not recognized, return raw body
      return body;
  }
}

/**
 * Extracts the main content type without charset or other parameters
 */
function getMainContentType(contentType: string): string {
  return contentType.split(";")[0].trim().toLowerCase();
}

/**
 * Extracts the charset from the content-type header
 */
function getCharsetFromContentType(contentType: string): string {
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  return charsetMatch ? charsetMatch[1].trim().toLowerCase() : "utf-8";
}

/**
 * Collects the body data from the request stream
 */
async function getBodyFromRequest(req: IncomingMessage): Promise<string> {
  return new Promise<string>((resolve) => {
    const chunks: Buffer[] = [];
    
    req.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    
    req.on("end", () => {
      const bodyBuffer = Buffer.concat(chunks);
      resolve(bodyBuffer.toString());
    });
  });
}

/**
 * Parse URL-encoded form data
 * 
 * Handles various edge cases:
 * - Empty values
 * - Missing values
 * - Special characters
 */
function parseUrlEncoded(body: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Handle empty body
  if (!body) {
    return result;
  }

  // Split the string by & to get key-value pairs
  const pairs = body.split("&");

  for (const pair of pairs) {
    // For each pair, split by = to get key and value
    const [key, value] = pair.split("=", 2);

    // Decode the key and value (handling missing values)
    const decodedKey = decodeURIComponent(key);
    const decodedValue = value !== undefined ? decodeURIComponent(value) : "";

    result[decodedKey] = decodedValue;
  }

  return result;
}

export default parseBody;