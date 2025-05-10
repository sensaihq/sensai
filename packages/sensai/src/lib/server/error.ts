export default class ServerError extends Error {
  code: number;
  //date: Date
  constructor(code: number = 500, ...params: any[]) {
    super(...params);
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }
    this.name = "ServerError";
    this.code = code; // TODO should we call `code`, `status` instead and reserve code as an identifier?
    //this.date = new Date()
  }
}
