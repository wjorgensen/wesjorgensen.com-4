// SnakeGame.tsx
import React, { useEffect, useRef, useState } from 'react';

const CELL_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const INITIAL_SNAKE = [{ x: 0, y: 0 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_FOOD = { x: 10, y: 10 };

interface SnakeGameProps {
  onExit: () => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'c') {
        onExit();
      } else if (!gameOver) {
        switch (e.key) {
          case 'ArrowUp':
            if (direction.y === 0) setDirection({ x: 0, y: -1 });
            break;
          case 'ArrowDown':
            if (direction.y === 0) setDirection({ x: 0, y: 1 });
            break;
          case 'ArrowLeft':
            if (direction.x === 0) setDirection({ x: -1, y: 0 });
            break;
          case 'ArrowRight':
            if (direction.x === 0) setDirection({ x: 1, y: 0 });
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
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      if (gameOver) return;

      // Move snake
      const newHead = {
        x: (snake[0].x + direction.x + CANVAS_WIDTH / CELL_SIZE) % (CANVAS_WIDTH / CELL_SIZE),
        y: (snake[0].y + direction.y + CANVAS_HEIGHT / CELL_SIZE) % (CANVAS_HEIGHT / CELL_SIZE),
      };

      // Check collision with self
      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prevScore => prevScore + 1);
        setFood({
          x: Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE)),
          y: Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE)),
        });
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);

      // Clear canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw snake
      ctx.fillStyle = 'green';
      newSnake.forEach(segment => {
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

      // Draw food
      ctx.fillStyle = 'red';
      ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);
    }, 100);

    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameOver, score]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: '1px solid white' }}
      />
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
        </div>
      )}
      <p>Use arrow keys to move. Press Ctrl+C to exit.</p>
    </div>
  );
};