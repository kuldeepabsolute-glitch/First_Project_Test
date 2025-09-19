import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { TicTacToeComponent } from './tic-tac-toe.component';

describe('TicTacToeComponent', () => {
  let component: TicTacToeComponent;
  let fixture: ComponentFixture<TicTacToeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicTacToeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TicTacToeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty board', () => {
    expect(component.board).toEqual(Array(9).fill(null));
    expect(component.currentPlayer).toBe('X');
    expect(component.gameState).toBe('playing');
  });

  it('should make a move when cell is clicked', () => {
    component.makeMove(0);
    expect(component.board[0]).toBe('X');
    expect(component.currentPlayer).toBe('O');
  });

  it('should not allow move on occupied cell', () => {
    component.board[0] = 'X';
    component.makeMove(0);
    expect(component.board[0]).toBe('X');
  });

  it('should detect horizontal win', () => {
    // Simulate X winning horizontally
    component.board = ['X', 'X', 'X', null, null, null, null, null, null];
    component['checkGameEnd']();
    expect(component.gameState).toBe('won');
    expect(component.winner).toBe('X');
  });

  it('should detect draw', () => {
    component.board = ['X', 'O', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
    component['checkGameEnd']();
    expect(component.gameState).toBe('draw');
  });

  it('should reset game correctly', () => {
    component.board[0] = 'X';
    component.currentPlayer = 'O';
    component.gameState = 'won';
    
    component.resetGame();
    
    expect(component.board).toEqual(Array(9).fill(null));
    expect(component.currentPlayer).toBe('X');
    expect(component.gameState).toBe('playing');
  });

  it('should handle keyboard navigation', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(event);
    expect(component.focusedCell).toBe(1);
  });

  it('should make move with Enter key', () => {
    component.focusedCell = 4;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeyDown(event);
    expect(component.board[4]).toBe('X');
  });

  it('should update score when game ends', () => {
    component.board = ['X', 'X', null, null, null, null, null, null, null];
    component.makeMove(2); // X wins
    expect(component.score.X).toBe(1);
  });

  it('should reset score correctly', () => {
    component.score = { X: 5, O: 3, draws: 2 };
    component.resetScore();
    expect(component.score).toEqual({ X: 0, O: 0, draws: 0 });
  });

  it('should return correct cell classes', () => {
    component.board[0] = 'X';
    component.winningLine = [0, 1, 2];
    component.focusedCell = 0;
    
    const classes = component.getCellClass(0);
    expect(classes).toContain('cell-x');
    expect(classes).toContain('cell-winning');
    expect(classes).toContain('cell-focused');
  });

  it('should return correct game status message', () => {
    expect(component.getGameStatusMessage()).toBe("Player X's turn");
    
    component.gameState = 'won';
    component.winner = 'O';
    expect(component.getGameStatusMessage()).toBe('Player O wins!');
    
    component.gameState = 'draw';
    expect(component.getGameStatusMessage()).toBe("It's a draw!");
  });
});