// components/Terminal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';

const TerminalWrapper = styled.div`
  background: black;
  color: green;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  font-family: 'Courier New', Courier, monospace;
`;

const TerminalInputWrapper = styled.div`
  display: flex;
`;

const TerminalInput = styled.input`
  background: black;
  color: green;
  border: none;
  outline: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  flex-grow: 1;
`;

const TerminalOutput = styled.div`
  margin-bottom: 10px;
`;

const Prompt = styled.span`
  margin-right: 5px;
`;

const tabSpace = () => `\u00A0\u00A0`;


interface FileSystem {
  [key: string]: string | FileSystem;
}

const fileSystem: FileSystem = {
  '~': {
    'projects': {},
    'writing': {},
    'hello.txt': 'Hello, this is a test file.',
    'about-me.txt': 'This is the about me file.',
    'help.txt': 'Available commands: help, ls, cat {filename}, clear',
    'sus.txt': '⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⠉⢁⣀⣀⣀⡈⠉⠛⢿⡿⠿⢿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⠏⢀⣴⣾⣿⣿⣿⣿⣿⡟⠃⢀⣀⣤⣤⣄⠉⢿⣿<br />⣿⣿⣿⣿⣿⡏⠀⣾⣿⣿⣿⣿⣿⣿⠏⠀⣴⣿⣿⣿⣯⣻⣧⠀⢻<br />⣿⣿⣿⣿⣿⠁⢸⣿⣿⣿⣿⣿⣿⣿⠀⠸⣿⣿⣿⣿⣿⣿⣿⡇⠈<br />⣿⣿⣿⣿⡏⠀⣼⣿⣿⣿⣿⣿⣿⣿⣧⠀⠹⢿⣿⣿⣿⡿⠟⠀⣼<br />⣿⣿⣿⡿⠇⠀⠛⠿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣀⡈⠉⠀⠀⣴⣿⣿<br />⣿⡿⠁⣀⢠⢤⣤⠀⠀⠉⢀⠀⠀⠈⠉⠻⢿⣿⣿⣿⡇⠀⣿⣿⣿<br />⡟⠀⣴⣽⣷⣷⠆⠀⣴⣾⣿⣔⡳⢦⡄⣄⣠⣿⣿⣿⡇⠀⣿⣿⣿<br />⠀⢰⣿⣿⣿⠇⠀⣼⣿⣿⣿⣿⣿⣷⣶⣿⣿⣿⣿⣿⣿⠀⢻⣿⣿<br />⠀⠸⣾⣿⣿⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⣿⣿<br />⣧⠀⠻⢿⣿⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⣿⣿<br />⣿⣷⣤⣀⣈⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⠟⠙⣿⣿⣿⡏⠀⣼⣿⣿<br />⣿⣿⣿⣿⣿⡇⠀⣄⠀⠙⠛⠿⠿⠛⠁⢀⣼⣿⣿⣿⡇⠀⣿⣿⣿<br />⣿⣿⣿⣿⣿⣷⡀⠘⠿⠶⠀⢀⣤⣤⡀⠙⢿⣿⣿⡿⠁⢰⣿⣿⣿<br />⢻⣿⣿⣿⣿⣿⣿⣦⣤⣤⣴⣿⣿⣿⣷⣄⣀⠈⠁⣀⣠⣿⣿⣿⣿<br />⣹⣿⣿⣿⡿⢋⣩⣬⣩⣿⠃⣿⣿⣿⣿⢸⣿⡿⢋⣡⣬⣩⣿⣿⣿<br />⡗⣿⣿⣿⣧⣈⣛⠛⠻⣿⠀⣿⣿⣿⡿⢸⣿⣧⣈⣛⠛⠻⣿⣿⣿<br />⣿⣿⣿⣿⠹⣿⣿⡿⠂⣿⣇⠸⣿⣿⠃⣼⣿⠻⣿⣿⡿⠀⣿⣿⣿<br />⣿⣿⣿⣿⣶⣤⣤⣴⣾⣿⣿⣶⣤⣤⣾⣿⣿⣶⣤⣤⣴⣾⣿⣿⣿',
  },
};

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState(['~']);

  const getCurrentFolderContents = () => {
    return currentFolder.reduce((acc, folder) => acc[folder], fileSystem);
  };

  const commands: { [key: string]: () => string } = {
    ls: () => {
      const contents = getCurrentFolderContents();
      return Object.keys(contents).join(tabSpace());
    },
    help: () => 'Available commands: help, ls, cat {filename}, clear',
    clear: () => {
      setOutput([]);
      return '';
    },
  };

  const handleCommand = (command: string, args: string[]) => {
    if (commands[command]) {
      return commands[command]();
    } else if (command === 'cat' && args.length > 0) {
      const filename = args[0];
      const contents = getCurrentFolderContents();
      if (contents[filename]) {
        return contents[filename];
      } else {
        return `cat: ${filename}: No such file or directory`;
      }
    } else {
      return `Command not found: ${command}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const inputParts = input.split(' ');
      const command = inputParts[0];
      const args = inputParts.slice(1);
      const commandOutput = handleCommand(command, args);
      if (commandOutput !== '') {
        setOutput([...output, `user@wesjorgensen.com ${currentFolder.join('/')} $ ${input}`, commandOutput]);
      }
      setInput('');
    }
  };

  return (
    <TerminalWrapper>
      {output.map((line, index) => (
        <TerminalOutput key={index}dangerouslySetInnerHTML={{ __html: line }} />
      ))}
      <TerminalInputWrapper>
        <Prompt>user@wesjorgensen.com {currentFolder.join('/')} $</Prompt>
        <TerminalInput
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
          autoFocus
        />
      </TerminalInputWrapper>
    </TerminalWrapper>
  );
};

export default Terminal;
