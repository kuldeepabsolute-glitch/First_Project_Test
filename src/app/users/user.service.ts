import { Injectable } from '@angular/core';
import { User } from './user.model';

const STORAGE_KEY = 'first_project_users_v1';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [];

  constructor() {
    this.load();
    this.createDefaultAdmin();
  }

  private createDefaultAdmin() {
    const adminExists = this.users.find(u => u.email === 'admin@admin.com');
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-001',
        name: 'Admin',
        email: 'admin@admin.com',
        mobile: '9999999999',
        password: '123',
        avatarUrl: ''
      };
      this.users.push(adminUser);
      this.save();
    }
  }

  private save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users)); } catch {}
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.users = raw ? JSON.parse(raw) : [];
    } catch (e) { this.users = []; }
  }

  list(): User[] {
    return [...this.users];
  }

  get(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  add(u: User) {
    this.users.push(u);
    this.save();
  }

  update(u: User) {
    const i = this.users.findIndex(x => x.id === u.id);
    if (i >= 0) { this.users[i] = u; this.save(); }
  }

  remove(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.save();
  }

  findByEmail(email: string) {
    return this.users.find(u => u.email === email);
  }
}
