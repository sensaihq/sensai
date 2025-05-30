import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  isEnterKey,
  isBackspaceKey,
  makeTheme,
  type Theme,
  type Status,
} from "@inquirer/core";
import type { PartialDeep } from "@inquirer/type";
import { orange } from "@/src/lib/terminal";

type InputTheme = {
  validationFailureMode: "keep" | "clear";
};

const inputTheme: InputTheme = {
  validationFailureMode: "keep",
};

type InputConfig = {
  message: string;
  initialValue?: string;
  errorMsg?: string;
  default?: string;
  required?: boolean;
  transformer?: (value: string, { isFinal }: { isFinal: boolean }) => string;
  validate?: (value: string) => boolean | string | Promise<string | boolean>;
  theme?: PartialDeep<Theme<InputTheme>>;
};

export default createPrompt<string, InputConfig>((config, done) => {
  const { required, validate = () => true } = config;
  const theme = makeTheme<InputTheme>(inputTheme, config.theme);
  const [status, setStatus] = useState<Status>("idle");
  const [defaultValue = "", setDefaultValue] = useState<string>(config.default);
  const [errorMsg, setError] = useState<string>(config.errorMsg);
  const [value, setValue] = useState<string>(config.initialValue);

  const prefix = usePrefix({ status, theme });

  useKeypress(async (key, rl) => {
    // Ignore keypress while our prompt is doing other processing.
    if (status !== "idle") {
      return;
    }

    if (isEnterKey(key)) {
      const answer = value || defaultValue;
      setStatus("loading");

      const isValid =
        required && !answer
          ? "You must provide a value"
          : await validate(answer);
      if (isValid === true) {
        setValue(answer);
        setStatus("done");
        done(answer);
      } else {
        if (theme.validationFailureMode === "clear") {
          setValue("");
        } else {
          // Reset the readline line value to the previous value. On line event, the value
          // get cleared, forcing the user to re-enter the value instead of fixing it.
          rl.write(value);
        }
        setError(isValid || "You must provide a valid value");
        setStatus("idle");
      }
    } else if (isBackspaceKey(key) && !value) {
      setDefaultValue(undefined);
    } else if (key.name === "tab" && !value) {
      setDefaultValue(undefined);
      rl.clearLine(0); // Remove the tab character.
      rl.write(defaultValue);
      setValue(defaultValue);
    } else {
      setValue(rl.line);
      setError(undefined);
    }
  });

  const message = theme.style.message(config.message, status);
  let formattedValue = value;
  if (typeof config.transformer === "function") {
    formattedValue = config.transformer(value, { isFinal: status === "done" });
  } else if (status === "done") {
    formattedValue = orange(value);
  }

  let defaultStr;
  if (defaultValue && status !== "done" && !value) {
    defaultStr = theme.style.defaultAnswer(defaultValue);
  }

  let error = "";
  if (errorMsg) {
    error = theme.style.error(errorMsg);
  }

  return [
    [prefix, message, defaultStr, formattedValue]
      .filter((v) => v !== undefined)
      .join(" "),
    error,
  ];
});
