import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmModal } from '../shared/confirm-modal';
import { showUndo } from '../shared/toast.service';

@Component({
  selector: 'todo-list',
  standalone: true,
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.css'],
  imports: [CommonModule, FormsModule, ConfirmModal]
})
export class ToDoList implements OnInit {
  private readonly STORAGE_KEY = 'first_project_todos_v1';
  private readonly ARCHIVE_KEY = 'first_project_todos_archive_v1';

  todos: Array<{ id: number; title: string; done: boolean; dueDate?: string | null; completedAt?: string | null; editing?: boolean; originalTitle?: string }> = [];
  archived: Array<{ id: number; title: string; done: boolean; dueDate?: string | null; completedAt?: string | null; archivedAt?: string | null }> = [];
  today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  confirmTarget = signal<any | null>(null);

  ngOnInit(): void {
    // load tasks and ensure each has a dueDate (migrate older items)
    const loaded = this.load();
    if (loaded && Array.isArray(loaded)) {
      const migrated = loaded.map((t) => ({ ...(t as any), dueDate: (t as any).dueDate ?? this.today }));
      this.todos = migrated as any;
    } else {
      // start with an empty list when no saved todos are present
      this.todos = [];
    }
    this.archived = this.loadArchive();
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Array<{ id: number; title: string; done: boolean; dueDate?: string }>;
    } catch {
      return null;
    }
  }

  private loadArchive() {
    try {
      const raw = localStorage.getItem(this.ARCHIVE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Array<{ id: number; title: string; done: boolean; dueDate?: string; archivedAt?: string }>;
    } catch {
      return [];
    }
  }

  private save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
      localStorage.setItem(this.ARCHIVE_KEY, JSON.stringify(this.archived));
    } catch {
      // ignore write errors (e.g., storage quota)
    }
  }

  toggle(todo: any) {
    // do nothing if already completed
    if (todo.done) return;

    todo.done = !todo.done;
    // record completion timestamp when marked done
    if (todo.done) {
      todo.completedAt = new Date().toISOString();
    }
    // if a todo was marked done, cancel any editing state
    if (todo.done) {
      todo.editing = false;
      delete todo.originalTitle;
    }
    this.save();
  }

  add(title: string) {
    // legacy single-arg add (keeps backwards compatibility)
    title = title?.trim();
    if (!title) return;
    this.todos.unshift({ id: Date.now(), title, done: false, dueDate: this.today, completedAt: null });
    this.save();
  }

  // new overloaded add that accepts a due date from the UI
  addWithDate(title: string, due?: string) {
    title = title?.trim();
    if (!title) return;
    const date = due ?? this.today;
    this.todos.unshift({ id: Date.now(), title, done: false, dueDate: date, completedAt: null });
    this.save();
  }

  groupedTodos() {
    // group todos by dueDate (YYYY-MM-DD)
    const map = new Map<string, any[]>();
    for (const t of this.todos) {
      const d = (t.dueDate ?? this.today).slice(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(t);
    }
    // produce sorted array by date descending (newest date first)
    const groups = Array.from(map.entries()).map(([date, items]) => ({ date, items }));
    groups.sort((a, b) => b.date.localeCompare(a.date));
    return groups;
  }

  startEdit(todo: any) {
    if (todo.done) return; // no editing of completed tasks
    todo.originalTitle = todo.title;
    todo.editing = true;
  }

  saveEdit(todo: any) {
    if (todo.done) return; // prevent saving edits to completed tasks
    if (!todo.title || !String(todo.title).trim()) {
      // if title becomes empty, revert
      todo.title = todo.originalTitle ?? todo.title;
    }
    todo.editing = false;
    delete todo.originalTitle;
    this.save();
  }

  cancelEdit(todo: any) {
    if (todo.originalTitle !== undefined) todo.title = todo.originalTitle;
    todo.editing = false;
    delete todo.originalTitle;
  }

  delete(todo: any) {
    // move to archive rather than permanent delete
    this.todos = this.todos.filter((t) => t !== todo);
    this.archived.unshift({ id: todo.id, title: todo.title, done: todo.done, completedAt: todo.completedAt ?? null, archivedAt: new Date().toISOString() });
    this.save();

    // show undo toast
    const archivedItem = this.archived[0];
    showUndo('Task deleted', 'Undo', () => {
      // restore the item
      this.archived = this.archived.filter((a) => a !== archivedItem);
      this.todos.unshift({ id: archivedItem.id, title: archivedItem.title, done: archivedItem.done, completedAt: archivedItem.completedAt ?? null });
      this.save();
    });
  }

  restore(archivedItem: any) {
    // remove from archive and put back into active todos
    this.archived = this.archived.filter((a) => a !== archivedItem);
    this.todos.unshift({ id: archivedItem.id, title: archivedItem.title, done: archivedItem.done, completedAt: archivedItem.completedAt ?? null });
    this.save();
  }

  permanentDelete(archivedItem: any) {
    // permanently remove the archived item
    this.archived = this.archived.filter((a) => a !== archivedItem);
    this.save();
  }

  restoreAll() {
    if (!this.archived?.length) return;
    // move all archived back to todos in original order
    const items = [...this.archived];
    this.archived = [];
    // put them at the front preserving archive order
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      this.todos.unshift({ id: it.id, title: it.title, done: it.done, completedAt: it.completedAt ?? null });
    }
    this.save();
  }

  confirmDelete(todo: any) {
    this.confirmTarget.set(todo);
  }

  onConfirmResult(ok: boolean) {
    const target = this.confirmTarget();
    this.confirmTarget.set(null);
    if (!ok || !target) return;
    this.delete(target);
  }
}
