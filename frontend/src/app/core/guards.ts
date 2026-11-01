import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = () => { const a = inject(AuthService); return a.user() ? true : inject(Router).createUrlTree(['/login']); };
export const staffGuard: CanActivateFn = () => { const a = inject(AuthService); return a.user() ? (a.isStaff() ? true : inject(Router).createUrlTree(['/events'])) : inject(Router).createUrlTree(['/login']); };
