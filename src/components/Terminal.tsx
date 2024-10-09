// Terminal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { executeCommand, getAvailableCommands, getCurrentFolderContents } from './commands';
import { SnakeGame } from './snakeGame';
import s from '@/styles/Terminal.module.scss';
import Fuse from 'fuse.js';
import { CommandOutput } from './commands';

const MAX_HISTORY_LENGTH = 50;
const WELCOME_MESSAGE = {
  type: 'html',
  content: "Hello, my name is Wes. <br/>This is my personal website. <br/>Use help for a list of commands or just use it like a normal bash terminal :)<br/><br/>"
};

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<CommandOutput[]>([]);
  const [currentFolder, setCurrentFolder] = useState(['~']);
  const [isPlayingSnake, setIsPlayingSnake] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const fuseRef = useRef<Fuse<string>>();
  const [isLoadingSnake, setIsLoadingSnake] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [inputParts, setInputParts] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      setCommandHistory(JSON.parse(savedHistory));
    }

    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setOutput([WELCOME_MESSAGE]);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
  }, [commandHistory]);

  useEffect(() => {
    const availableCommands = getAvailableCommands();
    fuseRef.current = new Fuse(availableCommands, {
      threshold: 0.4,
      distance: 100,
    });
  }, []);

  const changeThemeColor = (theme: string) => {
    if (terminalRef.current) {
      if (theme === "light") {
        terminalRef.current.style.setProperty('--background-color', "white");
        terminalRef.current.style.setProperty('--text-color', "black");
      } else {
        terminalRef.current.style.setProperty('--background-color', "black");
        terminalRef.current.style.setProperty('--text-color', "green");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setInputParts(e.target.value.split(' '));
    setAutocompleteOptions([]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const inputParts = input.split(' ');
      const lastPart = inputParts[inputParts.length - 1];
      let options: string[] = [];

      if (inputParts.length === 1) {
        // Autocomplete commands
        const availableCommands = getAvailableCommands();
        options = availableCommands.filter(cmd => cmd.startsWith(lastPart));
      } else if (['cd', 'cat'].includes(inputParts[0])) {
        // Autocomplete filenames for 'cd' and 'cat' commands
        const contents = getCurrentFolderContents(currentFolder);
        if (typeof contents === 'object') {
          options = Object.keys(contents).filter(file => file.startsWith(lastPart));
        }
      }

      if (options.length === 1) {
        // Autocomplete the single option
        const newInputParts = [...inputParts];
        newInputParts[newInputParts.length - 1] = options[0];
        setInput(newInputParts.join(' '));
      } else if (options.length > 1) {
        // Show multiple options
        setAutocompleteOptions(options);
      }
    } else if (e.key === 'Enter') {
      const inputParts = input.split(' ');
      const command = inputParts[0];
      const args = inputParts.slice(1);
      
      if (command === 'snake') {
        setIsLoadingSnake(true);
        setOutput(prev => [...prev, `user@wesjorgensen.com ${currentFolder[currentFolder.length - 1]} $ Loading Snake game`]);
        let dots = '';
        const loadingInterval = setInterval(() => {
          dots = dots.length < 3 ? dots + '.' : '';
          setLoadingDots(dots);
        }, 500);
        
        setTimeout(() => {
          clearInterval(loadingInterval);
          setIsLoadingSnake(false);
          setIsPlayingSnake(true);
          setOutput([]);
          setLoadingDots('');
        }, 3000);
      } else {
        const commandOutput = executeCommand(command, args, currentFolder, setCurrentFolder, changeThemeColor);
        
        if (commandOutput === 'CLEAR_TERMINAL') {
          setOutput([]);
        } else if (commandOutput) {
          setOutput(prev => [...prev, `user@wesjorgensen.com ${currentFolder[currentFolder.length - 1]} $ ${input}`, commandOutput]);
        } else {
          setOutput(prev => [...prev, `user@wesjorgensen.com ${currentFolder[currentFolder.length - 1]} $ ${input}`]);
        }
      }
      
      setCommandHistory(prev => {
        const newHistory = [input, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)];
        return newHistory;
      });
      setHistoryIndex(-1);
      setInput('');
      setAutocompleteOptions([]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isPlayingSnake]);

  const handleInputBlur = () => {
    inputRef.current?.focus();
  };

  const renderOutput = (output: CommandOutput) => {
    if (typeof output === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: output }} />;
    } else if (output.type === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: output.content }} />;
    } else {
      return <div>{output.content}</div>;
    }
  };

  return (
    <div className={s.terminalWrapper} ref={terminalRef}>
      {isPlayingSnake ? (
        <SnakeGame onExit={() => setIsPlayingSnake(false)} />
      ) : (
        <>
          {output.map((line, index) => (
            <div key={index} className={s.terminalOutput}>
              {renderOutput(line)}
              {index === output.length - 1 && isLoadingSnake && (
                <span className={s.loadingDots}>{loadingDots}</span>
              )}
            </div>
          ))}
          {!isLoadingSnake && (
            <div className={s.terminalInputWrapper}>
              <span className={s.prompt}>user@wesjorgensen.com {currentFolder[currentFolder.length - 1]} $</span>
              <input
                ref={inputRef}
                className={s.terminalInput}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                autoFocus
              />
            </div>
          )}
          {autocompleteOptions.length > 0 && (
            <div className={s.autocompleteOptions}>
              {autocompleteOptions.map((option, index) => (
                <div key={index} className={s.autocompleteOption}>{option}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Terminal;