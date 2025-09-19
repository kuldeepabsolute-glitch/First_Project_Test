import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Difficulty = 'slow' | 'medium' | 'fast';

interface Food {
  x: number;
  y: number;
  type: string;
  emoji: string;
  points: number;
  color: string;
}

interface DifficultySettings {
  name: string;
  speed: number;
  emoji: string;
}

@Component({
  selector: 'app-snake-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeGameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private gameLoop?: number;
  
  // Game settings
  private readonly GRID_SIZE = 20;
  private readonly CANVAS_WIDTH = 400;
  private readonly CANVAS_HEIGHT = 400;
  
  difficulty: Difficulty = 'medium';
  gameSpeed = 150;
  
  private difficultySettings: Record<Difficulty, DifficultySettings> = {
    slow: { name: 'Slow', speed: 200, emoji: '🐌' },
    medium: { name: 'Medium', speed: 150, emoji: '🚶' },
    fast: { name: 'Fast', speed: 100, emoji: '🏃' }
  };
  
  // Game state
  snake: Position[] = [{ x: 10, y: 10 }];
  food: Food = { x: 15, y: 15, type: 'apple', emoji: '🍎', points: 10, color: '#FF0000' };
  direction: Direction = 'RIGHT';
  nextDirection: Direction = 'RIGHT';
  score = 0;
  highScore = 0;
  gameRunning = false;
  gameOver = false;
  
  private lastMoveTime = 0;
  
  private foodTypes = [
    { type: 'apple', emoji: '🍎', points: 10, color: '#FF0000' },
    { type: 'cherry', emoji: '🍒', points: 20, color: '#8B0000' },
    { type: 'grape', emoji: '🍇', points: 18, color: '#800080' },
    { type: 'strawberry', emoji: '🍓', points: 25, color: '#FF1493' },
    { type: 'blueberry', emoji: '🫐', points: 15, color: '#0000FF' },
    { type: 'eggplant', emoji: '🍆', points: 12, color: '#4B0082' },
    { type: 'tomato', emoji: '🍅', points: 14, color: '#FF6347' },
    { type: 'avocado', emoji: '🥑', points: 22, color: '#228B22' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initCanvas();
    this.loadHighScore();
    this.startGame();
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('snakeHighScore');
    this.highScore = saved ? parseInt(saved) : 0;
  }

  private saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
  }

  ngOnDestroy(): void {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (!this.gameRunning) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (this.direction !== 'DOWN') this.nextDirection = 'UP';
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (this.direction !== 'UP') this.nextDirection = 'DOWN';
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
        break;
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
  }

  startGame(): void {
    this.resetGame();
    this.gameRunning = true;
    this.gameOver = false;
    this.lastMoveTime = performance.now();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
    this.cdr.markForCheck();
  }

  private resetGame(): void {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.score = 0;
    this.generateFood();
  }

  private stopGame(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = undefined;
    }
    this.gameRunning = false;
  }

  private update(currentTime: number): void {
    if (!this.gameRunning) return;

    // Control game speed
    if (currentTime - this.lastMoveTime >= this.gameSpeed) {
      this.direction = this.nextDirection;
      this.moveSnake();
      this.checkCollisions();
      this.lastMoveTime = currentTime;
      this.cdr.markForCheck();
    }

    this.draw();
    
    if (this.gameRunning) {
      this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }
  }

  private moveSnake(): void {
    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'UP':
        head.y--;
        break;
      case 'DOWN':
        head.y++;
        break;
      case 'LEFT':
        head.x--;
        break;
      case 'RIGHT':
        head.x++;
        break;
    }

    this.snake.unshift(head);

    // Check if food is eaten
    const foodEaten = head.x === this.food.x && head.y === this.food.y;
    
    if (foodEaten) {
      this.score += this.food.points;
      this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  private checkCollisions(): void {
    const head = this.snake[0];
    const gridWidth = this.CANVAS_WIDTH / this.GRID_SIZE;
    const gridHeight = this.CANVAS_HEIGHT / this.GRID_SIZE;

    // Wall collision
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      this.endGame();
      return;
    }

    // Self collision
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.endGame();
        return;
      }
    }
  }



  private generateFood(): void {
    const gridWidth = this.CANVAS_WIDTH / this.GRID_SIZE;
    const gridHeight = this.CANVAS_HEIGHT / this.GRID_SIZE;
    
    const randomFoodType = this.foodTypes[Math.floor(Math.random() * this.foodTypes.length)];
    
    let x: number = 0;
    let y: number = 0;
    do {
      x = Math.floor(Math.random() * gridWidth);
      y = Math.floor(Math.random() * gridHeight);
    } while (this.snake.some(segment => segment.x === x && segment.y === y));
    
    this.food = {
      x: x,
      y: y,
      type: randomFoodType.type,
      emoji: randomFoodType.emoji,
      points: randomFoodType.points,
      color: randomFoodType.color
    };
  }

  private endGame(): void {
    this.gameRunning = false;
    this.gameOver = true;
    this.saveHighScore();
    this.stopGame();
  }

  private draw(): void {
    // Clear canvas with light background
    this.ctx.fillStyle = '#f0f8ff';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Draw grid
    this.drawGrid();

    // Draw snake with cute design
    this.snake.forEach((segment, index) => {
      const x = segment.x * this.GRID_SIZE;
      const y = segment.y * this.GRID_SIZE;
      
      if (index === 0) {
        // Snake head with gradient and eyes
        const headGradient = this.ctx.createRadialGradient(x + 10, y + 10, 2, x + 10, y + 10, 10);
        headGradient.addColorStop(0, '#81C784');
        headGradient.addColorStop(1, '#4CAF50');
        this.ctx.fillStyle = headGradient;
        
        // Round head
        this.ctx.beginPath();
        this.ctx.roundRect(x + 2, y + 2, this.GRID_SIZE - 4, this.GRID_SIZE - 4, 8);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x + 7, y + 7, 2, 0, Math.PI * 2);
        this.ctx.arc(x + 13, y + 7, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x + 7, y + 7, 1, 0, Math.PI * 2);
        this.ctx.arc(x + 13, y + 7, 1, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Snake body with gradient
        const bodyGradient = this.ctx.createRadialGradient(x + 10, y + 10, 2, x + 10, y + 10, 8);
        bodyGradient.addColorStop(0, '#66BB6A');
        bodyGradient.addColorStop(1, '#388E3C');
        this.ctx.fillStyle = bodyGradient;
        
        this.ctx.beginPath();
        this.ctx.roundRect(x + 3, y + 3, this.GRID_SIZE - 6, this.GRID_SIZE - 6, 6);
        this.ctx.fill();
        
        // Body pattern
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.roundRect(x + 5, y + 5, this.GRID_SIZE - 10, this.GRID_SIZE - 10, 4);
        this.ctx.fill();
      }
    });

    // Draw food as colored rectangle
    this.ctx.fillStyle = this.food.color;
    this.ctx.beginPath();
    this.ctx.roundRect(
      this.food.x * this.GRID_SIZE + 3,
      this.food.y * this.GRID_SIZE + 3,
      this.GRID_SIZE - 6,
      this.GRID_SIZE - 6,
      4
    );
    this.ctx.fill();
    
    // Add white border for visibility
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw game over overlay
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 30);
      
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`Score: ${this.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
      
      if (this.score === this.highScore && this.score > 0) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText('🎉 NEW HIGH SCORE! 🎉', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 25);
      }
    }
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= this.CANVAS_WIDTH; x += this.GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.CANVAS_HEIGHT);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.CANVAS_HEIGHT; y += this.GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.CANVAS_WIDTH, y);
      this.ctx.stroke();
    }
  }

  restartGame(): void {
    this.stopGame();
    this.startGame();
  }

  // Mobile control methods
  moveUp(): void {
    if (this.gameRunning && this.direction !== 'DOWN') {
      this.nextDirection = 'UP';
    }
  }

  moveDown(): void {
    if (this.gameRunning && this.direction !== 'UP') {
      this.nextDirection = 'DOWN';
    }
  }

  moveLeft(): void {
    if (this.gameRunning && this.direction !== 'RIGHT') {
      this.nextDirection = 'LEFT';
    }
  }

  moveRight(): void {
    if (this.gameRunning && this.direction !== 'LEFT') {
      this.nextDirection = 'RIGHT';
    }
  }

  setDifficulty(level: Difficulty): void {
    this.difficulty = level;
    this.gameSpeed = this.difficultySettings[level].speed;
    if (this.gameRunning) {
      this.restartGame();
    }
    this.cdr.markForCheck();
  }

  getDifficultyName(): string {
    return this.difficultySettings[this.difficulty].name;
  }

  getDifficultyEmoji(): string {
    return this.difficultySettings[this.difficulty].emoji;
  }
}