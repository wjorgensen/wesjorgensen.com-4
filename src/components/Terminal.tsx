// Terminal.tsx
import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { executeCommand, getAvailableCommands, getCurrentFolderContents } from './commands';
import s from '@/styles/Terminal.module.scss';
import Fuse from 'fuse.js';
import { CommandOutput } from './commands';
import DOMPurify from 'dompurify';
import Commodore64 from './Commodore64';

// Dynamically import SnakeGame for better performance
const SnakeGame = lazy(() => import('./snakeGame').then(module => ({ default: module.SnakeGame })));

const MAX_HISTORY_LENGTH = 50;
const WELCOME_MESSAGE = {
  type: 'html',
  content: "Hello, my name is Wes. <br/>This is my personal website. <br/>Use help for a list of commands or just use it like a normal bash terminal :)<br/><br/>"
};

interface StarWarsFrame {
  duration: number;
  content: string;
}

const StarWarsPlayer: React.FC<{ frames: StarWarsFrame[], onExit: () => void }> = ({ frames, onExit }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const playFrame = () => {
      if (currentFrameIndex >= frames.length) {
        setIsPlaying(false);
        return;
      }

      const frame = frames[currentFrameIndex];
      const frameDuration = frame.duration;

      // Just use the frame content without adding any counter
      setCurrentFrame(frame.content);

      // 15 FPS = 66.67ms per frame, multiply by frame duration
      const displayTime = (1000 / 15) * frameDuration;

      timeoutRef.current = setTimeout(() => {
        setCurrentFrameIndex(prev => prev + 1);
      }, displayTime);
    };

    if (isPlaying) {
      playFrame();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentFrameIndex, frames, isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Escape') {
        setIsPlaying(false);
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit]);

  return (
    <div className={s.starwarsPlayer}>
      <div className={s.movieControls}>
        <span>Press 'q' or 'Escape' to exit | Frame: {currentFrameIndex + 1}/{frames.length} | {isPlaying ? 'Playing' : 'Finished'}</span>
      </div>
      <pre className={s.movieFrame}>
        {currentFrame}
      </pre>
    </div>
  );
};

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<CommandOutput[]>([]);
  const [currentFolder, setCurrentFolder] = useState(['~']);
  const [isPlayingSnake, setIsPlayingSnake] = useState(false);
  const [isPlayingStarWars, setIsPlayingStarWars] = useState(false);
  const [starWarsFrames, setStarWarsFrames] = useState<StarWarsFrame[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const fuseRef = useRef<Fuse<string>>();
  const [isLoadingSnake, setIsLoadingSnake] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [showCommodore64, setShowCommodore64] = useState(true);
  const [commodore64Fullscreen, setCommodore64Fullscreen] = useState(false);

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
      } else if (inputParts[0] === 'python' && inputParts.length === 2) {
        // Autocomplete python scripts
        const pythonFiles = ['snake.py', 'blockchain.py'];
        options = pythonFiles.filter(file => file.startsWith(lastPart));
      } else if (inputParts[0] === 'vlc' && inputParts.length === 2) {
        // Autocomplete movie files
        const movieFiles = ['starwars.mov'];
        options = movieFiles.filter(file => file.startsWith(lastPart));
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
      
      if (command === 'python' && args[0] === 'snake.py') {
        setIsLoadingSnake(true);
        setOutput(prev => [...prev, `user@wesjorgensen.com ${currentFolder[currentFolder.length - 1]} $ Loading Snake game`]);
        let dots = '';
        const loadingInterval = setInterval(() => {
          dots = dots.length < 3 ? dots + '.' : '';
          setLoadingDots(dots);
        }, 500);
        
        window.setTimeout(() => {
          clearInterval(loadingInterval);
          setIsLoadingSnake(false);
          setIsPlayingSnake(true);
          setOutput([]);
          setLoadingDots('');
        }, 3000);
      } else {
        // Immediately show the command in the output
        setOutput(prev => [...prev, `user@wesjorgensen.com ${currentFolder[currentFolder.length - 1]} $ ${input}`]);
        
        // Handle async command execution
        const handleCommand = async () => {
          try {
            const commandOutput = await executeCommand(command, args, currentFolder, setCurrentFolder, changeThemeColor);
            
            if (commandOutput === 'CLEAR_TERMINAL') {
              setOutput([]);
            } else if (commandOutput) {
              // Check if it's a Star Wars movie
              if (typeof commandOutput === 'object' && commandOutput.type === 'starwars') {
                const frames = JSON.parse(commandOutput.content) as StarWarsFrame[];
                setStarWarsFrames(frames);
                setIsPlayingStarWars(true);
                setOutput([]);
              } else {
                setOutput(prev => [...prev, commandOutput]);
              }
            }
          } catch (error) {
            setOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
          }
        };
        
        handleCommand();
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
  }, [isPlayingSnake, isPlayingStarWars]);

  const renderOutput = (output: CommandOutput) => {
    if (typeof output === 'string') {
      // Sanitize HTML content before rendering
      const sanitizedHTML = DOMPurify.sanitize(output, {
        ALLOWED_TAGS: ['br', 'a', 'strong', 'em', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      });
      return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    } else if (output.type === 'html') {
      // Sanitize HTML content before rendering
      const sanitizedHTML = DOMPurify.sanitize(output.content, {
        ALLOWED_TAGS: ['br', 'a', 'strong', 'em', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      });
      return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    } else {
      return <div>{output.content}</div>;
    }
  };

  return (
    <>
      {/* 3D Commodore 64 Model Background */}
      {!isPlayingSnake && !isPlayingStarWars && showCommodore64 && (
        <div className={s.commodore64Background}>
          <Commodore64 
            modelPath="/commodore_64.glb"
            width="100%"
            height="100%"
          />
        </div>
      )}

      {/* Terminal running "on" the Commodore 64 screen */}
      <div 
        className={`${s.terminalWrapper} ${showCommodore64 ? s.onCommodore64 : ''}`}
        ref={terminalRef}
        role="application"
        aria-label="Interactive terminal emulator"
        aria-live="polite"
      >
        {isPlayingSnake ? (
          <Suspense fallback={<div>Loading Snake game...</div>}>
            <SnakeGame onExit={() => setIsPlayingSnake(false)} />
          </Suspense>
        ) : isPlayingStarWars ? (
          <StarWarsPlayer 
            frames={starWarsFrames} 
            onExit={() => setIsPlayingStarWars(false)} 
          />
        ) : (
          <>
            <div 
              className={s.terminalOutput}
              role="log"
              aria-label="Terminal output"
              aria-live="polite"
            >
              {output.map((line, index) => (
                <div key={index} className={s.terminalOutput}>
                  {renderOutput(line)}
                  {index === output.length - 1 && isLoadingSnake && (
                    <span className={s.loadingDots} aria-live="polite">
                      {loadingDots}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {!isLoadingSnake && (
              <div className={s.terminalInputWrapper}>
                <label 
                  htmlFor="terminal-input"
                  className={s.prompt}
                  aria-label={`Terminal prompt, current directory: ${currentFolder.join('/')}`}
                >
                  user@wesjorgensen.com {currentFolder[currentFolder.length - 1]} $
                </label>
                <input
                  id="terminal-input"
                  ref={inputRef}
                  className={s.terminalInput}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                  aria-label="Terminal command input"
                  aria-describedby="terminal-help"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            )}
            {autocompleteOptions.length > 0 && (
              <div 
                className={s.autocompleteOptions}
                role="listbox"
                aria-label="Autocomplete suggestions"
              >
                {autocompleteOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={s.autocompleteOption}
                    role="option"
                    aria-selected={false}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
            
            {/* Hidden helper text for screen readers */}
            <div id="terminal-help" className="sr-only">
              This is a terminal emulator. Type commands and press Enter to execute. 
              Use Tab for autocomplete, Arrow Up/Down for command history. 
              Type 'help' to see available commands.
            </div>
          </>
        )}
      </div>

      {/* Toggle button for 3D model */}
      {!isPlayingSnake && !isPlayingStarWars && (
        <button
          className={s.commodore64Toggle}
          onClick={() => setShowCommodore64(!showCommodore64)}
          aria-label={showCommodore64 ? 'Switch to normal terminal' : 'Run terminal on Commodore 64'}
        >
          {showCommodore64 ? '💻 Normal Mode' : '🖥️ C64 Mode'}
        </button>
      )}

      {/* Fullscreen 3D model */}
      {commodore64Fullscreen && (
        <div className={s.commodore64Fullscreen}>
          <div className={s.commodore64Content}>
            <button
              className={s.closeButton}
              onClick={() => setCommodore64Fullscreen(false)}
              aria-label="Close fullscreen view"
            >
              ✕ Close
            </button>
            <Commodore64 
              modelPath="/commodore_64.glb"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Terminal;