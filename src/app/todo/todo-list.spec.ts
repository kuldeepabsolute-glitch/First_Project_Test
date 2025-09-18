import { TestBed } from '@angular/core/testing';
import { ToDoList } from './todo-list';

describe('ToDoList persistence', () => {
  const KEY = 'first_project_todos_v1';

  beforeEach(() => {
    localStorage.removeItem(KEY);
  });

  it('loads todos from localStorage on init', () => {
    const sample = [{ id: 42, title: 'saved task', done: false }];
    localStorage.setItem(KEY, JSON.stringify(sample));

    TestBed.configureTestingModule({ imports: [ToDoList] });
    const fixture = TestBed.createComponent(ToDoList);
    const cmp = fixture.componentInstance;
    cmp.ngOnInit();

    expect(cmp.todos.length).toBeGreaterThan(0);
    expect(cmp.todos[0].title).toBe('saved task');
  });

  it('saves todos to localStorage when changed', () => {
    TestBed.configureTestingModule({ imports: [ToDoList] });
    const fixture = TestBed.createComponent(ToDoList);
    const cmp = fixture.componentInstance;
    cmp.ngOnInit();

    cmp.add('persist me');
    const raw = localStorage.getItem(KEY) as string;
    const arr = JSON.parse(raw || '[]');
    expect(arr.some((t: any) => t.title === 'persist me')).toBeTrue();
  });
});
