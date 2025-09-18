import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from './user.model';
import { UserService } from './user.service';

function uid() { return Math.random().toString(36).slice(2,9); }

@Component({
  selector: 'user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ user ? 'Edit User' : 'New User' }}</h3>
          <button type="button" class="close-btn" (click)="close.emit(undefined)">&times;</button>
        </div>
        <form (submit)="save($event)">
          <div class="form-group">
            <label>Full Name</label>
            <input [(ngModel)]="model.name" name="name" required placeholder="Enter full name" />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input [(ngModel)]="model.email" name="email" type="email" required placeholder="Enter email address" />
          </div>
          <div class="form-group">
            <label>Mobile Number</label>
            <input [(ngModel)]="model.mobile" name="mobile" placeholder="Enter mobile number" />
          </div>
          <div class="form-group">
            <label>Profile Image</label>
            <input type="file" (change)="onFile($event)" accept="image/*" />
            <div *ngIf="model.avatarUrl" class="preview">
              <img [src]="model.avatarUrl" alt="Preview" />
            </div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input [(ngModel)]="model.password" name="password" type="password" required placeholder="Enter password" />
          </div>

          <div class="buttons">
            <button type="button" class="btn secondary" (click)="close.emit(undefined)">Cancel</button>
            <button type="submit" class="btn primary">{{ user ? 'Update' : 'Create' }} User</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.6); z-index:1000; }
    .modal { width:480px; max-width:90vw; max-height:90vh; background:var(--card-grad-start); border-radius:16px; box-shadow:0 20px 60px rgba(2,6,23,0.2); overflow:hidden; display:flex; flex-direction:column; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.5rem 1.5rem 0; }
    .modal-header h3 { margin:0; color:var(--card-text); font-size:1.3rem; }
    .close-btn { background:none; border:none; font-size:1.8rem; color:var(--muted-text); cursor:pointer; padding:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:50%; }
    .close-btn:hover { background:rgba(0,0,0,0.05); }
    form { padding:1.5rem; display:flex; flex-direction:column; gap:1rem; overflow-y:auto; flex:1; }
    .form-group { display:flex; flex-direction:column; gap:0.4rem; }
    .form-group label { font-weight:600; color:var(--card-text); font-size:0.9rem; }
    .form-group input { padding:0.75rem; border:1px solid rgba(0,0,0,0.1); border-radius:8px; background:var(--card-grad-start); color:var(--card-text); font-size:0.95rem; }
    .form-group input:focus { outline:none; border-color:rgba(var(--accent),0.5); box-shadow:0 0 0 3px rgba(var(--accent),0.1); }
    .preview { margin-top:0.5rem; }
    .preview img { width:60px; height:60px; border-radius:8px; object-fit:cover; }
    .buttons { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1rem; }
    .btn { border:none; padding:0.75rem 1.25rem; border-radius:8px; cursor:pointer; font-weight:600; transition:all 200ms ease; }
    .btn.secondary { background:var(--btn-bg); color:var(--btn-text); }
    .btn.primary { background:linear-gradient(90deg, rgba(var(--accent),1), rgba(99,118,255,1)); color:white; }
    .btn:hover { transform:translateY(-1px); }
  `]
})
export class UserFormComponent {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<User | undefined>();

  model: any = { name: '', email: '', mobile: '', avatarUrl: '', password: '' };

  constructor(private svc: UserService) {}

  ngOnInit() {
    if (this.user) this.model = { ...this.user };
  }

  onFile(ev: any) {
    const f: File = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { this.model.avatarUrl = String(r.result || ''); };
    r.readAsDataURL(f);
  }

  onBackdropClick(e: Event) {
    this.close.emit(undefined);
  }

  save(e: Event) {
    e.preventDefault();
    if (!this.model.name || !this.model.email || !this.model.password) return;
    if (this.user) {
      const updated: User = { ...this.model, id: this.user.id };
      this.svc.update(updated);
      this.close.emit(updated);
    } else {
      const newu: User = { ...this.model, id: uid() };
      this.svc.add(newu);
      this.close.emit(newu);
    }
  }
}
