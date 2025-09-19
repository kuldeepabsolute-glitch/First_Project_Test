import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Bird {
  x: number;
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

@Component({
  selector: 'app-flappy-bird',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flappy-bird.component.html',
  styleUrls: ['./flappy-bird.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlappyBirdComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private gameLoop?: number;
  
  // Game settings
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private readonly BIRD_SIZE = 30;
  private readonly PIPE_WIDTH = 80;
  private readonly PIPE_GAP = 200;
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -12;
  private readonly PIPE_SPEED = 3;
  private readonly GROUND_HEIGHT = 100;
  
  // Game state
  bird: Bird = { x: 100, y: 300, velocity: 0 };
  pipes: Pipe[] = [];
  score = 0;
  gameRunning = false;
  gameOver = false;
  gameStarted = false;
  
  private lastPipeTime = 0;
  private backgroundX = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initCanvas();
    this.resetGame();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  ngOnDestroy(): void {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
      this.jump();
    }
  }

  @HostListener('click')
  @HostListener('touchstart', ['$event'])
  onTouch(event?: TouchEvent): void {
    if (event) {
      event.preventDefault();
    }
    this.jump();
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
  }

  jump(): void {
    if (!this.gameStarted) {
      this.startGame();
    } else if (this.gameRunning) {
      this.bird.velocity = this.JUMP_FORCE;
    } else if (this.gameOver) {
      this.restartGame();
    }
  }

  startGame(): void {
    this.gameStarted = true;
    this.gameRunning = true;
    this.gameOver = false;
    this.bird.velocity = this.JUMP_FORCE;
    this.cdr.markForCheck();
  }

  private resetGame(): void {
    this.bird = { x: 100, y: 300, velocity: 0 };
    this.pipes = [];
    this.score = 0;
    this.gameStarted = false;
    this.gameRunning = false;
    this.gameOver = false;
    this.lastPipeTime = 0;
    this.backgroundX = 0;
  }

  restartGame(): void {
    this.resetGame();
    this.cdr.markForCheck();
  }

  private stopGame(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = undefined;
    }
  }

  private update(currentTime: number): void {
    this.updateGame(currentTime);
    this.draw();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  private updateGame(currentTime: number): void {
    if (!this.gameRunning) return;

    // Update bird physics
    this.bird.velocity += this.GRAVITY;
    this.bird.y += this.bird.velocity;

    // Generate pipes
    if (currentTime - this.lastPipeTime > 2000) {
      this.generatePipe();
      this.lastPipeTime = currentTime;
    }

    // Update pipes
    this.pipes.forEach(pipe => {
      pipe.x -= this.PIPE_SPEED;
      
      // Check if bird passed pipe
      if (!pipe.passed && pipe.x + this.PIPE_WIDTH < this.bird.x) {
        pipe.passed = true;
        this.score++;
        this.cdr.markForCheck();
      }
    });

    // Remove off-screen pipes
    this.pipes = this.pipes.filter(pipe => pipe.x > -this.PIPE_WIDTH);

    // Update background
    this.backgroundX -= 1;
    if (this.backgroundX <= -this.CANVAS_WIDTH) {
      this.backgroundX = 0;
    }

    // Check collisions
    this.checkCollisions();
  }

  private generatePipe(): void {
    const minHeight = 100;
    const maxHeight = this.CANVAS_HEIGHT - this.GROUND_HEIGHT - this.PIPE_GAP - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    this.pipes.push({
      x: this.CANVAS_WIDTH,
      topHeight: topHeight,
      bottomY: topHeight + this.PIPE_GAP,
      passed: false
    });
  }

  private checkCollisions(): void {
    // Ground and ceiling collision
    if (this.bird.y + this.BIRD_SIZE > this.CANVAS_HEIGHT - this.GROUND_HEIGHT || this.bird.y < 0) {
      this.endGame();
      return;
    }

    // Pipe collision
    for (const pipe of this.pipes) {
      if (this.bird.x + this.BIRD_SIZE > pipe.x && 
          this.bird.x < pipe.x + this.PIPE_WIDTH) {
        
        if (this.bird.y < pipe.topHeight || 
            this.bird.y + this.BIRD_SIZE > pipe.bottomY) {
          this.endGame();
          return;
        }
      }
    }
  }

  private endGame(): void {
    this.gameRunning = false;
    this.gameOver = true;
    this.cdr.markForCheck();
  }

  private draw(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Draw background
    this.drawBackground();

    // Draw pipes
    this.pipes.forEach(pipe => this.drawPipe(pipe));

    // Draw ground
    this.drawGround();

    // Draw bird
    this.drawBird();

    // Draw UI
    this.drawUI();
  }

  private drawBackground(): void {
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT - this.GROUND_HEIGHT);

    // Clouds (simple scrolling effect)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 3; i++) {
      const x = (this.backgroundX * 0.5 + i * 300) % (this.CANVAS_WIDTH + 100);
      this.drawCloud(x, 100 + i * 80);
    }
  }

  private drawCloud(x: number, y: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 30, 0, Math.PI * 2);
    this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
    this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawGround(): void {
    const groundY = this.CANVAS_HEIGHT - this.GROUND_HEIGHT;
    
    // Ground
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, groundY, this.CANVAS_WIDTH, this.GROUND_HEIGHT);
    
    // Grass
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, groundY, this.CANVAS_WIDTH, 20);
    
    // Ground pattern
    this.ctx.fillStyle = '#654321';
    for (let x = this.backgroundX % 40; x < this.CANVAS_WIDTH; x += 40) {
      this.ctx.fillRect(x, groundY + 20, 20, this.GROUND_HEIGHT - 20);
    }
  }

  private drawPipe(pipe: Pipe): void {
    // Pipe gradient
    const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.PIPE_WIDTH, 0);
    gradient.addColorStop(0, '#228B22');
    gradient.addColorStop(0.5, '#32CD32');
    gradient.addColorStop(1, '#228B22');
    this.ctx.fillStyle = gradient;

    // Top pipe
    this.ctx.fillRect(pipe.x, 0, this.PIPE_WIDTH, pipe.topHeight);
    
    // Bottom pipe
    this.ctx.fillRect(pipe.x, pipe.bottomY, this.PIPE_WIDTH, this.CANVAS_HEIGHT - pipe.bottomY);

    // Pipe caps
    this.ctx.fillStyle = '#006400';
    this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.PIPE_WIDTH + 10, 30);
    this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.PIPE_WIDTH + 10, 30);
  }

  private drawBird(): void {
    const birdX = this.bird.x;
    const birdY = this.bird.y;

    // Bird body (circle)
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(birdX + this.BIRD_SIZE/2, birdY + this.BIRD_SIZE/2, this.BIRD_SIZE/2, 0, Math.PI * 2);
    this.ctx.fill();

    // Bird wing
    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.ellipse(birdX + this.BIRD_SIZE/2, birdY + this.BIRD_SIZE/2, this.BIRD_SIZE/3, this.BIRD_SIZE/4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Bird beak
    this.ctx.fillStyle = '#FF4500';
    this.ctx.beginPath();
    this.ctx.moveTo(birdX + this.BIRD_SIZE, birdY + this.BIRD_SIZE/2);
    this.ctx.lineTo(birdX + this.BIRD_SIZE + 10, birdY + this.BIRD_SIZE/2 - 5);
    this.ctx.lineTo(birdX + this.BIRD_SIZE + 10, birdY + this.BIRD_SIZE/2 + 5);
    this.ctx.fill();

    // Bird eye
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(birdX + this.BIRD_SIZE/2 + 5, birdY + this.BIRD_SIZE/2 - 5, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawUI(): void {
    // Score
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.strokeText(this.score.toString(), this.CANVAS_WIDTH / 2, 80);
    this.ctx.fillText(this.score.toString(), this.CANVAS_WIDTH / 2, 80);

    // Instructions
    if (!this.gameStarted) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 36px Arial';
      this.ctx.fillText('Flappy Bird', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 100);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Click or Press SPACE to Start', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);
      this.ctx.fillText('Click or Press SPACE to Fly', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
    }

    // Game over
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillText('Game Over!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
      this.ctx.fillText('Click to Restart', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 50);
    }
  }
}