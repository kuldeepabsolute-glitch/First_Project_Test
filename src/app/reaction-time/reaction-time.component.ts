import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'tooSoon';

@Component({
  selector: 'app-reaction-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reaction-time.component.html',
  styleUrls: ['./reaction-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactionTimeComponent implements OnDestroy {
  
  // Game state management
  gameState: GameState = 'idle';
  
  // Timing variables
  private startTime = 0;
  private timeout?: number;
  
  // Results tracking
  currentReactionTime = 0;
  reactionTimes: number[] = [];
  averageReactionTime = 0;
  
  constructor(private cdr: ChangeDetectorRef) {
    this.loadResults();
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  /**
   * Start the reaction time test
   */
  startTest(): void {
    this.gameState = 'waiting';
    this.clearTimeout();
    
    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;
    
    this.timeout = window.setTimeout(() => {
      this.gameState = 'ready';
      this.startTime = performance.now();
      this.cdr.markForCheck();
    }, delay);
    
    this.cdr.markForCheck();
  }

  /**
   * Handle click during the test
   */
  onTestClick(): void {
    switch (this.gameState) {
      case 'idle':
        this.startTest();
        break;
        
      case 'waiting':
        // Clicked too soon
        this.gameState = 'tooSoon';
        this.clearTimeout();
        this.cdr.markForCheck();
        break;
        
      case 'ready':
        // Calculate reaction time
        const endTime = performance.now();
        this.currentReactionTime = Math.round(endTime - this.startTime);
        this.recordResult(this.currentReactionTime);
        this.gameState = 'result';
        this.cdr.markForCheck();
        break;
    }
  }

  /**
   * Reset to idle state
   */
  resetTest(): void {
    this.gameState = 'idle';
    this.clearTimeout();
    this.cdr.markForCheck();
  }

  /**
   * Record a reaction time result
   */
  private recordResult(time: number): void {
    this.reactionTimes.unshift(time);
    
    // Keep only last 5 attempts
    if (this.reactionTimes.length > 5) {
      this.reactionTimes = this.reactionTimes.slice(0, 5);
    }
    
    // Calculate average
    this.averageReactionTime = Math.round(
      this.reactionTimes.reduce((sum, time) => sum + time, 0) / this.reactionTimes.length
    );
    
    this.saveResults();
  }

  /**
   * Save results to localStorage
   */
  private saveResults(): void {
    localStorage.setItem('reactionTimeResults', JSON.stringify({
      times: this.reactionTimes,
      average: this.averageReactionTime
    }));
  }

  /**
   * Load results from localStorage
   */
  private loadResults(): void {
    const saved = localStorage.getItem('reactionTimeResults');
    if (saved) {
      const data = JSON.parse(saved);
      this.reactionTimes = data.times || [];
      this.averageReactionTime = data.average || 0;
    }
  }

  /**
   * Clear the timeout
   */
  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  /**
   * Get the current instruction text
   */
  getInstructionText(): string {
    switch (this.gameState) {
      case 'idle':
        return 'Click anywhere to start the test';
      case 'waiting':
        return 'Wait for green...';
      case 'ready':
        return 'CLICK NOW!';
      case 'result':
        return `Your reaction time: ${this.currentReactionTime}ms`;
      case 'tooSoon':
        return 'Too soon! Wait for green.';
      default:
        return '';
    }
  }

  /**
   * Get reaction time rating
   */
  getReactionRating(time: number): string {
    if (time < 200) return 'Excellent';
    if (time < 250) return 'Good';
    if (time < 300) return 'Average';
    if (time < 400) return 'Below Average';
    return 'Slow';
  }

  /**
   * Get the CSS class for current state
   */
  getStateClass(): string {
    return `state-${this.gameState}`;
  }

  /**
   * Get the best (minimum) reaction time
   */
  getBestTime(): number {
    return this.reactionTimes.length > 0 ? Math.min(...this.reactionTimes) : 0;
  }
}