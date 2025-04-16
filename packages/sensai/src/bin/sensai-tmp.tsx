#!/usr/bin/env node
import * as commander from "commander";
import React, { useState, useEffect } from 'react';

// CLI Component
const terminal = async () => {
  const { render, Box, Text, Newline, useInput } = await import('ink');
  const { default: TextInput } = await import('ink-text-input');
  const Welcome = () => {
    return (
      <Box flexDirection='column'>
          <Box borderStyle="round" borderColor="magenta" alignSelf='flex-start'>
            <Text>
              {' '}<Text color='magenta' bold>✱</Text> Welcome to <Text bold>Sensai</Text>
              <Newline />
              <Newline />
              {'   '}<Text color='gray'>mode:</Text>{' '}<Text color='brightWhite'>agent</Text>{'   '}
              <Newline />
              <Newline />
              {'   '}<Text color='gray'>dev:</Text>{' '}<Text color='brightWhite'>http://localhost:3030/api</Text>{'   '}
              <Newline />
              {'   '}<Text color='gray'>doc:</Text>{' '}<Text color='brightWhite'>http://localhost:3030/doc</Text>{'   '}
              <Newline />
              {'   '}<Text color='gray'>cwd: {process.cwd()}{'   '}</Text>
            </Text>
          </Box>
      <Box padding={1}>
        <Text color='gray'>
          Tips for getting started:
          <Newline />
          <Newline />
            1. /help for help
          <Newline />
            2. Use Sensai to help with file analysis, editing, bash commands and git 
          <Newline /> 
            3. Be as specific as you would with another engineer for the best results
          <Newline />
            4. /deploy to deploy
        </Text>
      </Box>
      </Box>
    )
  }

  const CLI = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [input, setInput] = useState<string>('');
    const [showShortcuts, setShowShortcuts] = useState(false);
    // useInput((inputKey, key) => {
    //   if (key.return) {
    //     setLogs((prevLogs) => [...prevLogs, input]);
    //     setInput('');
    //   } else if (key.backspace) {
    //     setInput((prevInput) => prevInput.slice(0, -1));
    //   } else {
    //     setInput((prevInput) => prevInput + inputKey);
    //   }
    // });
    useInput((inputKey, key) => {
      if (key.return) {
        setInput('')
        setLogs((prevLogs) => [...prevLogs, input]); 
      }
    })
  
    return (
      <>
        <Box flexDirection='column' padding={1}>
          <Box flexDirection="column">
            {logs.map((log, index) => (
              <Text key={index}>{log}</Text>
            ))}
          </Box> 
        </Box>
        <Box flexDirection='column'>
          <Box flexDirection="column">
            <Text>command output</Text>
          </Box> 
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Box borderStyle="round" borderColor="cyan">
            <Text color="brightWhite"> > </Text>
            <TextInput value={input} onChange={(char) => {
              const isQuestionMark = char === '?'
              if (!isQuestionMark) setInput(char)
              setShowShortcuts(isQuestionMark)
            }} placeholder='Try "build"' /> 

            {/*<Text color={input ? 'brightWhite' : 'gray'}>{input || 'Try "build"'}</Text> */}
          </Box>
          <Box>
            {showShortcuts
              ? (
                <Text color="gray">
                {'  '}! for bash mode       double tap esc to undo<Newline />
                {'  '}/ for commands        shift + tab to auto-accept edits<Newline />
                </Text>
              )
              : <Text color="gray">  ? for shortcuts</Text>
            }
            <Text>{' '}<Newline />{''}</Text>
          </Box>
        </Box>
      </>
    );
  };
  
  render(<>
    <Welcome />
    <CLI />
  </>);
};


export default new commander.Command()
  .command('tmp')
  .description('Interactive CLI with Claude-like interface')
  .action(async () => {
    await terminal()
  });