import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: User | null = null;
  private logoutTimer: any = null;
  private countdownTimer: any = null;
  private timeRemaining = new BehaviorSubject<number>(0);
  
  timeRemaining$ = this.timeRemaining.asObservable();

  constructor(private userService: UserService, private router: Router) {
    this.loadSession();
  }

  login(email: string, password: string): boolean {
    const user = this.userService.findByEmail(email);
    if (user && user.password === password) {
      this.currentUser = user;
      const loginTime = Date.now();
      localStorage.setItem('login_time', loginTime.toString());
      this.saveSession();
      this.startAutoLogout();
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('current_user_session');
    localStorage.removeItem('login_time');
    this.clearAutoLogout();
    this.timeRemaining.next(0);
  }

  private startAutoLogout() {
    this.startAutoLogoutWithTime(5 * 60);
  }

  private startAutoLogoutWithTime(seconds: number) {
    this.clearAutoLogout();
    let remaining = Math.floor(seconds);
    this.timeRemaining.next(remaining);
    
    this.countdownTimer = setInterval(() => {
      remaining--;
      this.timeRemaining.next(remaining);
      if (remaining <= 0) {
        this.logout();
        this.router.navigate(['/login']);
      }
    }, 1000);
    
    this.logoutTimer = setTimeout(() => {
      this.logout();
      this.router.navigate(['/login']);
    }, remaining * 1000);
  }

  private clearAutoLogout() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  private saveSession() {
    if (this.currentUser) {
      localStorage.setItem('current_user_session', JSON.stringify(this.currentUser));
    }
  }

  private loadSession() {
    try {
      const session = localStorage.getItem('current_user_session');
      const loginTime = localStorage.getItem('login_time');
      if (session && loginTime) {
        this.currentUser = JSON.parse(session);
        const elapsed = (Date.now() - parseInt(loginTime)) / 1000;
        const remaining = Math.max(0, 5 * 60 - elapsed);
        if (remaining > 0) {
          this.startAutoLogoutWithTime(remaining);
        } else {
          this.logout();
        }
      }
    } catch {}
  }
}