import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errorText } from '../core/api.service';
@Component({
  selector: 'vv-login', standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <div class="auth">
    <section class="stage" aria-hidden="true">
      <div class="curtain"></div>
      <div class="hall">
        @for (r of rows; track r; let ri = $index) {
          <div class="r">@for (s of r; track s) { <i [class.lit]="lit.has(ri + '-' + $index)" [style.animation-delay.ms]="600 + (ri * 120)"></i> }</div>
        }
      </div>
      <h1>Every seat,<br>sold to someone<br>who’ll be there.</h1>
    </section>
    <section class="form">
      <form (ngSubmit)="submit()" #f="ngForm">
        <h2>Welcome back</h2>
        <p class="muted">Sign in to book seats or run your events.</p>
        @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
        <div class="field"><label for="e">Email</label><input id="e" name="email" type="email" [(ngModel)]="email" required autocomplete="email"></div>
        <div class="field"><label for="p">Password</label><input id="p" name="password" type="password" [(ngModel)]="password" required autocomplete="current-password"></div>
        <button class="btn block" [disabled]="f.invalid || busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
        <p class="alt">New to VenueVista? <a routerLink="/register">Create an account</a></p>
        <div class="demo">
          <p class="hint">Demo accounts (click to fill)</p>
          <button type="button" (click)="fill('admin@venuevista.com','Admin@123')">Admin</button>
          <button type="button" (click)="fill('organizer@venuevista.com','Organizer@123')">Organiser</button>
          <button type="button" (click)="fill('customer@venuevista.com','Customer@123')">Customer</button>
        </div>
      </form>
    </section>
  </div>`,
  styles: [`
    .auth { display:grid; grid-template-columns:1.1fr 1fr; min-height:100vh; }
    .stage { background:var(--ink); color:#fff; padding:56px; display:flex; flex-direction:column; justify-content:flex-end; gap:36px; position:relative; overflow:hidden; }
    .curtain { position:absolute; inset:0 0 auto 0; height:90px; background:linear-gradient(var(--crimson-d), transparent); opacity:.85; }
    .hall { display:flex; flex-direction:column; align-items:center; gap:8px; margin-bottom:auto; margin-top:80px; }
    .r { display:flex; gap:7px; } .r i { width:14px; height:14px; border-radius:4px 4px 7px 7px; background:var(--ink-3); display:block; }
    .r i.lit { animation:light .5s forwards; } @keyframes light { to { background:var(--crimson); box-shadow:0 0 14px var(--crimson); } }
    .stage h1 { font-size:clamp(2rem,3.4vw,3.2rem); }
    .form { display:grid; place-items:center; padding:32px; } form { width:100%; max-width:380px; }
    form h2 { font-size:2rem; margin-bottom:6px; } form .muted { margin-bottom:24px; }
    .alt { margin-top:18px; text-align:center; } .alt a { color:var(--crimson); font-weight:600; }
    .demo { margin-top:28px; padding-top:18px; border-top:1px solid var(--line); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .demo .hint { width:100%; } .demo button { border:1.5px solid var(--line); background:#fff; border-radius:99px; padding:4px 14px; cursor:pointer; }
    .demo button:hover { border-color:var(--ink); }
    @media (max-width:820px) { .auth { grid-template-columns:1fr; } .stage { padding:28px; min-height:260px; } .hall { display:none; } }`]
})
export class LoginComponent {
  private auth = inject(AuthService); private router = inject(Router);
  email = ''; password = ''; error = signal(''); busy = signal(false);
  rows = [6, 8, 10, 12, 14, 16].map(n => Array.from({ length: n }));
  lit = new Set(['1-3', '2-5', '2-6', '3-2', '3-9', '4-7', '5-4', '5-10', '5-11']);
  fill(e: string, p: string) { this.email = e; this.password = p; }
  submit() {
    this.busy.set(true); this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate([this.auth.isStaff() ? '/dashboard' : '/events']),
      error: e => { this.error.set(errorText(e)); this.busy.set(false); }
    });
  }
}
