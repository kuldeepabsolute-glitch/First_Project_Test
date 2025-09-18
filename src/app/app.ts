import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { toast } from './shared/toast.service';
import { AuthService } from './users/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('First_Project_Test');
  protected readonly loading = signal(false);
  protected readonly toast = toast;

  // theme mode: 'light' | 'dark' | 'system'
  protected themeMode: 'light' | 'dark' | 'system' = 'light';
  // controls the custom theme picker popup
  protected pickerOpen = false;

  private router = inject(Router);
  protected auth = inject(AuthService);

  get profile() {
    const user = this.auth.getCurrentUser();
    return user ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl } : { name: 'Guest', email: '', avatarUrl: '' };
  }

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  timeRemaining = 0;

  ngOnInit() {
    this.auth.timeRemaining$.subscribe(time => {
      this.timeRemaining = time;
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  constructor() {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) this.loading.set(true);
      if (ev instanceof NavigationEnd || ev instanceof NavigationCancel || ev instanceof NavigationError) this.loading.set(false);
    });

    // initialize theme mode from localStorage (or system preference)
    try {
      const stored = localStorage.getItem('first_project_theme_mode');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        this.themeMode = stored;
      } else {
        // default to system if available
        this.themeMode = 'system';
      }
    } catch {
      this.themeMode = 'system';
    }
  }

  runToastAction() {
    const t = this.toast.get();
    if (!t) return;
    t.action?.();
    this.toast.clear();
  }

  // set a theme mode (light/dark/system)
  setThemeMode(mode: 'light' | 'dark' | 'system') {
    this.themeMode = mode;
    try {
      localStorage.setItem('first_project_theme_mode', mode);
    } catch {}
  }

  // effective theme resolves 'system' to the OS preference
  get theme() {
    if (this.themeMode === 'system') {
      try {
        const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        return mq && mq.matches ? 'dark' : 'light';
      } catch {
        return 'light';
      }
    }
    return this.themeMode;
  }

  signOut() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
