// Terminal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { executeCommand } from './commands';
import { SnakeGame } from './SnakeGame';
import s from '@/styles/Terminal.module.scss';

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState(['~']);
  const [isPlayingSnake, setIsPlayingSnake] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

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
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const inputParts = input.split(' ');
      const command = inputParts[0];
      const args = inputParts.slice(1);
      
      if (command === 'snake') {
        setIsPlayingSnake(true);
        setOutput([]);
      } else {
        const commandOutput = executeCommand(command, args, currentFolder, setCurrentFolder, changeThemeColor);
        
        if (commandOutput === 'CLEAR_TERMINAL') {
          setOutput([]);
        } else if (commandOutput !== '') {
          setOutput([...output, `user@wesjorgensen.com ${currentFolder[currentFolder.length - 1]} $ ${input}`, commandOutput]);
        } else {
          setOutput([...output, `user@wesjorgensen.com ${currentFolder[currentFolder.length - 1]} $ ${input}`]);
        }
      }
      setInput('');
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className={s.terminalWrapper} ref={terminalRef}>
      {isPlayingSnake ? (
        <SnakeGame onExit={() => setIsPlayingSnake(false)} />
      ) : (
        <>
          {output.map((line, index) => (
            <div key={index} className={s.terminalOutput} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
          <div className={s.terminalInputWrapper}>
            <span className={s.prompt}>user@wesjorgensen.com {currentFolder[currentFolder.length - 1]} $</span>
            <input
              className={s.terminalInput}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputSubmit}
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Terminal;