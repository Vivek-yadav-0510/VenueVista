import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from './api.service';
export interface AuthUser { token: string; name: string; email: string; role: 'ADMIN' | 'ORGANIZER' | 'CUSTOMER'; }
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient); private router = inject(Router);
  user = signal<AuthUser | null>(JSON.parse(localStorage.getItem('vv_user') || 'null'));
  isStaff = computed(() => ['ADMIN', 'ORGANIZER'].includes(this.user()?.role ?? ''));
  login(b: { email: string; password: string }) { return this.http.post<AuthUser>(`${API}/auth/login`, b).pipe(tap(u => this.store(u))); }
  register(b: { name: string; email: string; password: string; role: string }) { return this.http.post<AuthUser>(`${API}/auth/register`, b).pipe(tap(u => this.store(u))); }
  logout() { localStorage.removeItem('vv_user'); this.user.set(null); this.router.navigate(['/login']); }
  private store(u: AuthUser) { localStorage.setItem('vv_user', JSON.stringify(u)); this.user.set(u); }
}
