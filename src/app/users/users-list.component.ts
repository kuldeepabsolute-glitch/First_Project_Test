import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { User } from './user.model';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'users-list',
  standalone: true,
  imports: [CommonModule, UserFormComponent],
  template: `
    <div class="users-page">
      <div class="users-header">
        <h2>User Management</h2>
        <div>
          <button class="btn primary" (click)="openNew()">+ New User</button>
        </div>
      </div>

      <div *ngIf="!users?.length" class="empty">No users yet. Create one to get started.</div>

      <div class="users-grid">
        <div class="user-card" *ngFor="let u of users">
          <div class="avatar" [style.backgroundImage]="u.avatarUrl ? 'url('+u.avatarUrl+')' : ''">{{ !u.avatarUrl ? (u.name.charAt(0)||'U') : '' }}</div>
          <div class="info">
            <div class="name">{{ u.name }}</div>
            <div class="meta">{{ u.email }} • {{ u.mobile || '—' }}</div>
          </div>
          <div class="actions">
            <button class="btn" (click)="edit(u)">Edit</button>
            <button class="btn danger" (click)="remove(u)">Delete</button>
          </div>
        </div>
      </div>

      <user-form *ngIf="showForm" [user]="editing" (close)="onClose($event)"></user-form>
    </div>
  `,
  styles: [`
    .users-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .users-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem; }
    .users-header h2 { margin: 0; color: var(--app-text); }
    .empty { text-align: center; padding: 3rem; color: var(--muted-text); font-size: 1.1rem; }
    .users-grid { display:flex; flex-direction:column; gap:1.2rem; }
    .user-card { display:flex; gap:1rem; align-items:center; padding:1.2rem; border-radius:12px; background:var(--card-grad-start); box-shadow:0 6px 20px rgba(2,6,23,0.04); transition: transform 200ms ease, box-shadow 200ms ease; width:100%; }
    .user-card:hover { transform: translateY(-2px); box-shadow:0 12px 30px rgba(2,6,23,0.08); }
    .avatar { width:60px; height:60px; border-radius:12px; background:linear-gradient(135deg, rgba(var(--accent),0.12), rgba(255,255,255,0.02)); display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--card-text); background-size:cover; background-position:center; font-size: 1.2rem; flex-shrink:0; }
    .info { flex: 1; }
    .info .name { font-weight:700; font-size: 1.1rem; color: var(--card-text); margin-bottom: 0.25rem; }
    .info .meta { color:var(--muted-text); font-size:0.9rem; }
    .actions { display:flex; gap:0.5rem; flex-shrink:0; }
    .btn { background:var(--btn-bg); color:var(--btn-text); border:none; padding:0.5rem 0.8rem; border-radius:8px; cursor:pointer; font-weight: 500; transition: all 200ms ease; }
    .btn:hover { transform: translateY(-1px); }
    .btn.primary { background:linear-gradient(90deg, rgba(var(--accent),1), rgba(99,118,255,1)); color:white; }
    .btn.danger { background:transparent; color:#dc3545; border:1px solid rgba(220,53,69,0.2); }
    .btn.danger:hover { background: rgba(220,53,69,0.1); }
  `]
})
export class UsersListComponent {
  users: User[] = [];
  showForm = false;
  editing: User | null = null;

  constructor(private svc: UserService) { this.load(); }

  load() { this.users = this.svc.list(); }

  openNew() { this.editing = null; this.showForm = true; }
  edit(u: User) { this.editing = { ...u }; this.showForm = true; }

  remove(u: User) { if (!confirm('Delete user ' + u.name + '?')) return; this.svc.remove(u.id); this.load(); }

  onClose(saved?: User) {
    this.showForm = false;
    this.editing = null;
    if (saved) { this.load(); }
  }
}
