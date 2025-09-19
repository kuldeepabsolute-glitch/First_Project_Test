import { Component, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../users/auth.service';

type Player = 'X' | 'O';
type Cell = Player | null;
type GameState = 'setup' | 'playing' | 'won' | 'draw';
type GameMode = 'friend' | 'computer';

interface GameScore {
  X: number;
  O: number;
  draws: number;
}

interface GameHistory {
  date: string;
  mode: GameMode;
  playerX: string;
  playerO: string;
  winner: Player | 'draw';
  moves: number;
}

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicTacToeComponent {
  board: Cell[] = Array(9).fill(null);
  currentPlayer: Player = 'X';
  gameState: GameState = 'playing';
  gameMode: GameMode = 'friend';
  winner: Player | null = null;
  winningLine: number[] = [];
  focusedCell = 0;
  countdown = 0;
  moveCount = 0;
  
  playerXName = '';
  playerOName = '';
  friendName = '';
  
  private countdownTimer?: number;
  aiThinking = false;
  
  score: GameScore = {
    X: 0,
    O: 0,
    draws: 0
  };

  private readonly winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  constructor(private cdr: ChangeDetectorRef, private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    this.playerXName = user?.name || 'You';
    this.friendName = 'Friend';
    this.playerOName = 'Friend';
    this.loadUserData();
  }

  private getUserKey(suffix: string): string {
    const user = this.authService.getCurrentUser();
    return `ticTacToe_${user?.id || 'guest'}_${suffix}`;
  }

  private loadUserData(): void {
    const scoreKey = this.getUserKey('score');
    const savedScore = localStorage.getItem(scoreKey);
    if (savedScore) {
      this.score = JSON.parse(savedScore);
    }
  }

  private saveUserScore(): void {
    const scoreKey = this.getUserKey('score');
    localStorage.setItem(scoreKey, JSON.stringify(this.score));
  }

  startGame(): void {
    if (this.gameMode === 'friend' && !this.friendName.trim()) return;
    
    this.playerOName = this.gameMode === 'computer' ? 'Computer' : this.friendName;
    this.gameState = 'playing';
    this.resetGame();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.gameState !== 'playing' || this.aiThinking) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.focusedCell = Math.max(0, this.focusedCell - 3);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusedCell = Math.min(8, this.focusedCell + 3);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusedCell = Math.max(0, this.focusedCell - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusedCell = Math.min(8, this.focusedCell + 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.makeMove(this.focusedCell);
        break;
    }
    this.cdr.markForCheck();
  }

  makeMove(index: number): void {
    if (this.board[index] || this.gameState !== 'playing' || this.aiThinking) return;

    this.board[index] = this.currentPlayer;
    this.moveCount++;
    this.checkGameEnd();
    
    if (this.gameState === 'playing') {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      
      if (this.gameMode === 'computer' && this.currentPlayer === 'O') {
        this.makeAIMove();
      }
    }
    
    this.cdr.markForCheck();
  }

  private makeAIMove(): void {
    this.aiThinking = true;
    this.cdr.markForCheck();
    
    setTimeout(() => {
      const move = this.getBestMove();
      if (move !== -1) {
        this.board[move] = 'O';
        this.moveCount++;
        this.checkGameEnd();
        
        if (this.gameState === 'playing') {
          this.currentPlayer = 'X';
        }
      }
      this.aiThinking = false;
      this.cdr.markForCheck();
    }, 500);
  }

  private getBestMove(): number {
    // Try to win
    for (let i = 0; i < 9; i++) {
      if (!this.board[i]) {
        this.board[i] = 'O';
        if (this.checkWinner() === 'O') {
          this.board[i] = null;
          return i;
        }
        this.board[i] = null;
      }
    }
    
    // Block player from winning
    for (let i = 0; i < 9; i++) {
      if (!this.board[i]) {
        this.board[i] = 'X';
        if (this.checkWinner() === 'X') {
          this.board[i] = null;
          return i;
        }
        this.board[i] = null;
      }
    }
    
    // Take center if available
    if (!this.board[4]) return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !this.board[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available spot
    const available = this.board.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
  }

  private checkWinner(): Player | null {
    for (const pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    return null;
  }

  private checkGameEnd(): void {
    // Check for winner
    for (const pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.gameState = 'won';
        this.winner = this.board[a];
        this.winningLine = pattern;
        this.score[this.winner!]++;
        this.saveUserScore();
        this.saveGameHistory(this.winner);
        this.startCountdown();
        return;
      }
    }

    // Check for draw
    if (this.board.every(cell => cell !== null)) {
      this.gameState = 'draw';
      this.score.draws++;
      this.saveUserScore();
      this.saveGameHistory('draw');
      this.startCountdown();
    }
  }

  private saveGameHistory(result: Player | 'draw'): void {
    const history: GameHistory = {
      date: new Date().toLocaleString(),
      mode: this.gameMode,
      playerX: this.playerXName,
      playerO: this.playerOName,
      winner: result,
      moves: this.moveCount
    };
    
    const historyKey = this.getUserKey('history');
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    existingHistory.unshift(history);
    existingHistory.splice(10); // Keep only last 10 games
    localStorage.setItem(historyKey, JSON.stringify(existingHistory));
  }

  getGameHistory(): GameHistory[] {
    const historyKey = this.getUserKey('history');
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
  }

  resetGame(): void {
    this.clearCountdown();
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    if (this.gameState !== 'setup') {
      this.gameState = 'playing';
    }
    this.winner = null;
    this.winningLine = [];
    this.focusedCell = 0;
    this.countdown = 0;
    this.moveCount = 0;
    this.aiThinking = false;
    this.cdr.markForCheck();
  }

  backToSetup(): void {
    this.gameState = 'setup';
    this.resetGame();
  }

  private startCountdown(): void {
    this.countdown = 3;
    this.cdr.markForCheck();
    
    this.countdownTimer = window.setInterval(() => {
      this.countdown--;
      this.cdr.markForCheck();
      
      if (this.countdown <= 0) {
        this.resetGame();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  resetScore(): void {
    this.score = { X: 0, O: 0, draws: 0 };
    this.saveUserScore();
    this.cdr.markForCheck();
  }

  getCellClass(index: number): string {
    const classes = ['cell'];
    
    if (this.board[index]) {
      classes.push(`cell-${this.board[index]?.toLowerCase()}`);
    }
    
    if (this.winningLine.includes(index)) {
      classes.push('cell-winning');
    }
    
    if (this.focusedCell === index && this.gameState === 'playing') {
      classes.push('cell-focused');
    }
    
    return classes.join(' ');
  }

  getGameStatusMessage(): string {
    switch (this.gameState) {
      case 'won':
        const winnerName = this.winner === 'X' ? this.playerXName : this.playerOName;
        return this.countdown > 0 ? `${winnerName} wins! New game in ${this.countdown}...` : `${winnerName} wins!`;
      case 'draw':
        return this.countdown > 0 ? `It's a draw! New game in ${this.countdown}...` : "It's a draw!";
      default:
        if (this.aiThinking) {
          return 'Computer is thinking...';
        }
        const currentPlayerName = this.currentPlayer === 'X' ? this.playerXName : this.playerOName;
        return `${currentPlayerName}'s turn`;
    }
  }
}