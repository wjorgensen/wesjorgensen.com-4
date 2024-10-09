import React, { useEffect, useRef, useState } from 'react';

const GRID_WIDTH = 40;
const GRID_HEIGHT = 20;
const INITIAL_SNAKE = [{ x: 0, y: 0 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_FOOD = { x: 20, y: 10 };

interface SnakeGameProps {
  onExit: () => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onExit }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const getSnakeHeadChar = () => {
    if (direction.x === 1) return '>';
    if (direction.x === -1) return '<';
    if (direction.y === -1) return '^';
    if (direction.y === 1) return 'v';
    return '>';
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'c') {
        onExit();
      } else if (!gameOver) {
        switch (e.key) {
          case 'ArrowUp':
            if (direction.y === 1) {
              setGameOver(true);
            } else if (direction.y === 0) {
              setDirection({ x: 0, y: -1 });
            }
            break;
          case 'ArrowDown':
            if (direction.y === -1) {
              setGameOver(true);
            } else if (direction.y === 0) {
              setDirection({ x: 0, y: 1 });
            }
            break;
          case 'ArrowLeft':
            if (direction.x === 1) {
              setGameOver(true);
            } else if (direction.x === 0) {
              setDirection({ x: -1, y: 0 });
            }
            break;
          case 'ArrowRight':
            if (direction.x === -1) {
              setGameOver(true);
            } else if (direction.x === 0) {
              setDirection({ x: 1, y: 0 });
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [direction, gameOver, onExit]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOver) return;

      const newHead = {
        x: (snake[0].x + direction.x + GRID_WIDTH) % GRID_WIDTH,
        y: (snake[0].y + direction.y + GRID_HEIGHT) % GRID_HEIGHT,
      };

      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prevScore => prevScore + 1);
        setFood({
          x: Math.floor(Math.random() * GRID_WIDTH),
          y: Math.floor(Math.random() * GRID_HEIGHT),
        });
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);

      if (direction.x !== 0) {
        const secondNewHead = {
          x: (newHead.x + direction.x + GRID_WIDTH) % GRID_WIDTH,
          y: newHead.y,
        };

        if (!snake.some(segment => segment.x === secondNewHead.x && segment.y === secondNewHead.y)) {
          const secondNewSnake = [secondNewHead, ...newSnake];
          if (secondNewHead.x === food.x && secondNewHead.y === food.y) {
            setScore(prevScore => prevScore + 1);
            setFood({
              x: Math.floor(Math.random() * GRID_WIDTH),
              y: Math.floor(Math.random() * GRID_HEIGHT),
            });
          } else {
            secondNewSnake.pop();
          }
          setSnake(secondNewSnake);
        }
      }
    }, 200);

    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameOver, score]);

  const renderGrid = () => {
    const grid = Array(GRID_HEIGHT + 2).fill(null).map(() => Array(GRID_WIDTH + 2).fill(' '));

    for (let i = 0; i < GRID_WIDTH + 2; i++) {
      grid[0][i] = '-';
      grid[GRID_HEIGHT + 1][i] = '-';
    }
    for (let i = 1; i < GRID_HEIGHT + 1; i++) {
      grid[i][0] = '|';
      grid[i][GRID_WIDTH + 1] = '|';
    }

    grid[food.y + 1][food.x + 1] = '@';

    snake.forEach((segment, index) => {
      if (index === 0) {
        grid[segment.y + 1][segment.x + 1] = getSnakeHeadChar();
      } else {
        grid[segment.y + 1][segment.x + 1] = '*';
      }
    });

    grid[0][0] = '+';
    grid[0][GRID_WIDTH + 1] = '+';
    grid[GRID_HEIGHT + 1][0] = '+';
    grid[GRID_HEIGHT + 1][GRID_WIDTH + 1] = '+';

    return grid.map((row, y) => (
      <div key={y} style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
        {row.join('')}
      </div>
    ));
  };

  return (
    <div>
      <div style={{ display: 'inline-block' }}>
        {renderGrid()}
      </div>
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
        </div>
      )}
      <p>Score: {score}{score === 69 && ' Nice'}</p>
      <p>Use arrow keys to move. Press Ctrl+C to exit.</p>
    </div>
  );
};