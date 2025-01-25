export const print = (txt: string | string[]) => {
  for (const message of [].concat(txt)) {
    console.log(message);
  }
};

// export const green = (txt: any) => `\u001b[32m${txt}\u001b[0m`;
export const blue = (txt: any) => `\u001B[34m${txt}\u001b[0m`;
export const red = (txt: any) => `\u001B[31m${txt}\u001b[0m`;
// export const cyan = (txt: any) => `\u001B[36m${txt}\u001b[0m`;
export const gray = (txt: any) => `\u001b[90m${txt}\u001b[0m`;
// export const bold = (txt: any) => `\u001b[1m${txt}\u001b[0m`;
export const orange = (txt: any) => `\u001B[38;2;255;165;0m${txt}\u001b[0m`;
