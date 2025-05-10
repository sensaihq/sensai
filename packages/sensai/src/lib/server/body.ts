import { IncomingMessage } from "node:http";
import querystring from "node:querystring";
import ServerError from "@/src/lib/server/error";

/**
 * Parses content type header to extract main type and charset
 * @param contentType The content-type header value
 * @returns Object containing mainType and charset
 */

function parseContentType(contentType: string): {
  mainType: string;
  charset: string;
} {
  const mainType = contentType.split(";")[0].trim().toLowerCase();
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  const charset = charsetMatch
    ? normalizeCharset(charsetMatch[1].trim())
    : "utf-8";

  return { mainType, charset };
}

/**
 * Normalize HTTP charset to Node.js supported encodings
 * @notes we do not suppor windows-1252 as it is not a standard encoding
 * @param charset The charset from HTTP headers
 * @returns Normalized charset name for Node.js Buffer
 */

function normalizeCharset(charset: string): string {
  charset = charset.toLowerCase();

  switch (charset) {
    case "iso-8859-1":
      return "latin1";
    case "us-ascii":
      return "ascii";
    default:
      return charset;
  }
}

/**
 * Parse URL-encoded form data
 * @param body The raw body string
 * @returns Parsed query parameters
 */

function parseUrlEncoded(body: string): querystring.ParsedUrlQuery {
  if (!body) {
    return {};
  }
  return querystring.parse(body);
}

/**
 * Collects the body data from the request stream with proper limits
 * @param request The IncomingMessage request object
 * @param contentLength Content length from header
 * @param limit Maximum allowed size in bytes (default: 1MB)
 * @returns Promise that resolves to the body as Buffer
 */

async function getBodyFromRequest(
  request: IncomingMessage,
  contentLength: number,
  limit: number = 1000000 // 1MB
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    // Check content length immediately if available
    if (contentLength && contentLength > limit) {
      return reject(new ServerError(413, "Request entity too large"));
    }

    let complete = false;
    let buffer: Uint8Array[] = [];
    let received = 0;

    // resolve/reject promise and clean up resources
    function done(err: Error | null, value?: Buffer): void {
      if (complete) return;
      complete = true;

      // Clean up event listeners
      request.removeListener("data", onData);
      request.removeListener("end", onEnd);
      request.removeListener("error", onError);
      request.removeListener("close", onClose);

      if (err) {
        // Unpipe everything and pause the stream
        request.unpipe();
        request.pause();
        reject(err);
      } else {
        // Free memory after creating the final buffer
        const result = Buffer.concat(buffer);
        buffer = [];
        resolve(result);
      }
    }

    // Handle data chunks
    function onData(chunk: Buffer): void {
      received += chunk.length;

      // Enforce size limit including current chunk
      if (received > limit) {
        done(new ServerError(413, "Request entity too large"));
      } else {
        buffer.push(chunk);
      }
    }

    // Handle stream completion
    function onEnd(): void {
      // Validate content length if provided
      if (contentLength && received !== contentLength) {
        done(new ServerError(400, "Request size did not match content length"));
      } else {
        done(null, Buffer.concat(buffer));
      }
    }

    // Handle errors
    function onError(err: Error): void {
      done(new ServerError(400, `Request error: ${err.message}`));
    }

    // Handle premature close
    function onClose(): void {
      if (!complete) {
        done(new ServerError(499, "Client closed request"));
      }
    }

    // Attach listeners
    request.on("data", onData);
    request.on("end", onEnd);
    request.on("error", onError);
    request.on("close", onClose);
  });
}

/**
 * Parse the request body based on the content-type header.
 * Supports JSON, URL-encoded form data, and raw text.
 *
 * @param request The IncomingMessage request object
 * @param limit Maximum allowed size in bytes (default: 1MB)
 * @returns Promise that resolves to the parsed body
 */
async function parseBody(
  request: IncomingMessage,
  limit: number = 1000000 // 1MB
): Promise<unknown> {
  const { headers } = request;
  const contentType = headers["content-type"] || "";

  // Parse content type once
  const { mainType, charset } = parseContentType(contentType);

  // Get content length or default to 0 if not present
  const contentLength = Number(headers["content-length"]) || 0;

  // Collect the body data
  const bodyBuffer = await getBodyFromRequest(request, contentLength, limit);

  // If body is empty, return empty object
  if (!bodyBuffer.length) {
    return {};
  }

  // Convert buffer to string using the specified charset
  let body: string;
  try {
    body = bodyBuffer.toString(charset as BufferEncoding);
  } catch (err) {
    // Fallback to UTF-8 if the charset is not supported
    body = bodyBuffer.toString();
  }

  // Parse based on content type
  switch (mainType) {
    case "application/json":
      try {
        return JSON.parse(body);
      } catch (err) {
        throw new ServerError(400, `Invalid JSON: ${(err as Error).message}`);
      }
    case "application/x-www-form-urlencoded":
      return parseUrlEncoded(body);
    default:
      // If content type is not recognized, return raw body
      return body;
  }
}

export default parseBody;
export { normalizeCharset };
