import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
@Component({
  selector: 'vv-shell', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="layout">
    <aside>
      <a routerLink="/events" class="brand"><span class="mark">V</span><span>VenueVista</span></a>
      <nav aria-label="Main">
        <a routerLink="/events" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">Discover events</a>
        @if (auth.user()) { <a routerLink="/tickets" routerLinkActive="on">My tickets</a> }
        @if (auth.isStaff()) {
          <p class="group">Organiser tools</p>
          <a routerLink="/dashboard" routerLinkActive="on">Sales analytics</a>
          <a routerLink="/events/new" routerLinkActive="on">Create event</a>
          <a routerLink="/venues" routerLinkActive="on">Venues &amp; seating</a>
        }
      </nav>
      <div class="me">
        @if (auth.user(); as u) {
          <div class="avatar">{{ u.name.charAt(0) }}</div>
          <div class="who"><strong>{{ u.name }}</strong><small>{{ u.role.toLowerCase() }}</small></div>
          <button class="out" (click)="auth.logout()" aria-label="Sign out">Sign out</button>
        } @else { <a routerLink="/login" class="btn block">Sign in</a> }
      </div>
    </aside>
    <main><router-outlet /></main>
  </div>`,
  styles: [`
    .layout { display:grid; grid-template-columns:248px 1fr; min-height:100vh; }
    aside { background:var(--ink); color:#E9E9F6; padding:22px 16px; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }
    .brand { display:flex; align-items:center; gap:10px; font:800 1.3rem var(--head); text-decoration:none; color:#fff; margin-bottom:28px; padding:0 8px; }
    .mark { width:34px; height:34px; border-radius:9px; background:var(--crimson); display:grid; place-items:center; font-size:1.2rem; }
    nav { display:flex; flex-direction:column; gap:2px; flex:1; }
    nav a { color:#C9CAE6; text-decoration:none; padding:10px 12px; border-radius:var(--r-sm); font-weight:500; }
    nav a:hover { background:var(--ink-2); color:#fff; } nav a.on { background:var(--ink-3); color:#fff; box-shadow:inset 3px 0 0 var(--crimson); }
    .group { margin:20px 12px 6px; font-size:12.5px; color:#8E90B8; }
    .me { display:flex; align-items:center; gap:10px; padding:12px 8px; border-top:1px solid var(--ink-3); flex-wrap:wrap; }
    .avatar { width:36px; height:36px; border-radius:50%; background:var(--brass); color:#fff; display:grid; place-items:center; font-weight:700; }
    .who { display:flex; flex-direction:column; line-height:1.2; flex:1; } .who small { color:#9A9CC4; text-transform:capitalize; }
    .out { background:none; border:1px solid var(--ink-3); color:#C9CAE6; border-radius:var(--r-sm); padding:5px 10px; cursor:pointer; font-size:12.5px; }
    .out:hover { background:var(--ink-2); }
    @media (max-width: 860px) {
      .layout { grid-template-columns:1fr; } aside { position:static; height:auto; flex-direction:row; flex-wrap:wrap; align-items:center; gap:8px; }
      .brand { margin:0; } nav { flex-direction:row; flex-wrap:wrap; } .group { display:none; } .me { border:0; }
    }`]
})
export class ShellComponent { auth = inject(AuthService); }
