import crypto from "node:crypto";

// TODO test and benchmark for p[erformance
export const getUniqueRequestId = () => {
  // insure interoperability with systems expecting UUID
  return crypto.randomUUID();
};
