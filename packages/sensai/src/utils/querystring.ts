import querystring from "node:querystring";

/**
 * Wrap legacy querystring parser until we create a faster and more
 * reliable version (something that does not throw malformed URI errors
 * and cn both work for query strings and url encoded bodies)
 */

export const parse = (query: string) => {
  if (!query) {
    return {};
  }
  return querystring.parse(query);
};
