import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errorText } from '../core/api.service';
@Component({
  selector: 'vv-register', standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <div class="wrap">
    <form class="panel" (ngSubmit)="submit()" #f="ngForm">
      <a routerLink="/login" class="back">Back to sign in</a>
      <h2>Create your account</h2>
      @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
      <div class="field"><label for="n">Full name</label><input id="n" name="name" [(ngModel)]="name" required></div>
      <div class="field"><label for="e">Email</label><input id="e" name="email" type="email" [(ngModel)]="email" required></div>
      <div class="field"><label for="p">Password</label><input id="p" name="password" type="password" [(ngModel)]="password" required minlength="8">
        <span class="hint">At least 8 characters.</span></div>
      <fieldset>
        <legend>What will you do on VenueVista?</legend>
        <label class="opt" [class.on]="role==='CUSTOMER'"><input type="radio" name="role" value="CUSTOMER" [(ngModel)]="role"><strong>Attend events</strong><span>Browse, pick seats and keep your tickets.</span></label>
        <label class="opt" [class.on]="role==='ORGANIZER'"><input type="radio" name="role" value="ORGANIZER" [(ngModel)]="role"><strong>Organise events</strong><span>Manage venues, seating, pricing and sales.</span></label>
      </fieldset>
      <button class="btn block" [disabled]="f.invalid || busy()">{{ busy() ? 'Creating account…' : 'Create account' }}</button>
    </form>
  </div>`,
  styles: [`
    .wrap { min-height:100vh; display:grid; place-items:center; padding:24px; } form { width:100%; max-width:460px; padding:32px; }
    .back { font-size:13px; color:var(--muted); display:inline-block; margin-bottom:14px; } h2 { margin-bottom:20px; }
    fieldset { border:0; padding:0; margin:0 0 20px; display:grid; gap:10px; } legend { font-weight:600; font-size:13.5px; margin-bottom:8px; padding:0; }
    .opt { display:grid; gap:2px; border:1.5px solid var(--line); border-radius:var(--r-md); padding:12px 14px; cursor:pointer; }
    .opt input { position:absolute; opacity:0; } .opt span { color:var(--muted); font-size:13.5px; }
    .opt.on { border-color:var(--crimson); background:#FDF3F5; } .opt:focus-within { outline:3px solid var(--periwinkle); }`]
})
export class RegisterComponent {
  private auth = inject(AuthService); private router = inject(Router);
  name = ''; email = ''; password = ''; role = 'CUSTOMER'; error = signal(''); busy = signal(false);
  submit() {
    this.busy.set(true); this.error.set('');
    this.auth.register({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => this.router.navigate([this.auth.isStaff() ? '/dashboard' : '/events']),
      error: e => { this.error.set(errorText(e)); this.busy.set(false); }
    });
  }
}
