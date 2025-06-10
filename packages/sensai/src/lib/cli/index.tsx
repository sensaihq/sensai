import React, { useState } from "react";
import { SENSAI_MODE } from "@/src/constants";

export default async (mode: SENSAI_MODE, port: number) => {
  const { render, Box, Text, Newline, useInput, useStdout } = await import(
    "ink"
  );
  const { default: TextInput } = await import("ink-text-input");
  const { default: Spinner } = await import("ink-spinner");

  const Welcome = () => {
    const { stdout } = useStdout();
    return (
      <Box flexDirection="column">
        <Box borderStyle="round" borderColor="magenta" alignSelf="flex-start">
          <Text>
            {" "}
            <Text color="magenta" bold>
              ✱
            </Text>{" "}
            Welcome to <Text bold>Sensai</Text>
            <Newline />
            <Newline />
            {"   "}
            <Text color="gray">mode:</Text>{" "}
            <Text color="brightWhite">{mode}</Text>
            {"   "}
            <Newline />
            {"   "}
            <Text color="gray">dev:</Text>{" "}
            <Text color="brightWhite">http://localhost:{port}/api</Text>
            {"   "}
            <Newline />
            {"   "}
            <Text color="gray">
              cwd: {process.cwd()}
              {"   "}
            </Text>
          </Text>
        </Box>
      </Box>
    );
  };

  const AgentInput = () => {
    const [isThinking, setIsThinking] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [input, setInput] = useState<string>("");
    const [showShortcuts, setShowShortcuts] = useState(false);

    const sendMessage = async (message: string) => {
      setIsThinking(true);
      try {
        const response = await fetch("http://localhost:3030/api?city=paris", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: message }),
        });
        setIsThinking(false);
        for await (const chunk of response.body) {
          const data = new TextDecoder().decode(chunk);
          setLogs((prevLogs) => {
            const arr = [...prevLogs];
            const last = arr.pop() || "";
            return [...arr, last + data];
          });
        }
      } catch (error) {
        setIsThinking(false);
      }
    };

    useInput((inputKey, key) => {
      if (key.return) {
        setInput("");
        sendMessage(input);
      }
    });

    return (
      <>
        <Box flexDirection="column" padding={1}>
          <Box flexDirection="column">
            {logs.map((log, index) => (
              <Text key={index}>{log}</Text>
            ))}
          </Box>
        </Box>
        <Box flexDirection="column">
          <Box borderStyle="round" borderColor="cyan">
            <Text color="brightWhite">
              {" "}
              {isThinking ? <Spinner type="dots" /> : ">"}{" "}
            </Text>
            <TextInput
              value={input}
              onChange={(char) => {
                const isQuestionMark = char === "?";
                if (!isQuestionMark) setInput(char);
                setShowShortcuts(isQuestionMark);
              }}
              placeholder={isThinking ? "Thinking..." : "Type something..."}
            />

            {/*<Text color={input ? 'brightWhite' : 'gray'}>{input || 'Try "build"'}</Text> */}
          </Box>
          {/* <Box>
            {showShortcuts ? (
              <Text color="gray">
                {"  "}! for bash mode double tap esc to undo
                <Newline />
                {"  "}/ for commands shift + tab to auto-accept edits
                <Newline />
              </Text>
            ) : (
              <Text color="gray"> ? for shortcuts</Text>
            )}
            <Text>
              {" "}
              <Newline />
              {""}
            </Text>
          </Box> */}
        </Box>
      </>
    );
  };

  render(
    <>
      <Welcome />
      {mode === SENSAI_MODE.AGENT && <AgentInput />}
    </>
  );
};
