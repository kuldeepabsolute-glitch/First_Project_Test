import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../users/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h2>Login</h2>
        <form (submit)="login($event)">
          <div class="form-group">
            <label>Email</label>
            <input [(ngModel)]="email" name="email" type="email" required placeholder="Enter your email" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input [(ngModel)]="password" name="password" type="password" required placeholder="Enter your password" />
          </div>
          <div *ngIf="error" class="error">{{ error }}</div>
          <button type="submit" class="btn primary">Login</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--app-bg); }
    .login-card { width:400px; max-width:90vw; background:var(--card-grad-start); padding:2rem; border-radius:16px; box-shadow:0 20px 60px rgba(2,6,23,0.1); }
    h2 { margin:0 0 1.5rem 0; text-align:center; color:var(--card-text); }
    .form-group { margin-bottom:1rem; }
    .form-group label { display:block; margin-bottom:0.5rem; font-weight:600; color:var(--card-text); }
    .form-group input { width:100%; padding:0.75rem; border:1px solid rgba(0,0,0,0.1); border-radius:8px; background:var(--card-grad-start); color:var(--card-text); box-sizing:border-box; }
    .form-group input:focus { outline:none; border-color:rgba(var(--accent),0.5); }
    .error { color:#dc3545; margin-bottom:1rem; padding:0.5rem; background:rgba(220,53,69,0.1); border-radius:6px; }
    .btn { width:100%; padding:0.75rem; border:none; border-radius:8px; cursor:pointer; font-weight:600; }
    .btn.primary { background:linear-gradient(90deg, rgba(var(--accent),1), rgba(99,118,255,1)); color:white; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login(e: Event) {
    e.preventDefault();
    this.error = '';
    
    if (this.auth.login(this.email, this.password)) {
      this.router.navigateByUrl('/');
    } else {
      this.error = 'Invalid email or password';
    }
  }
}