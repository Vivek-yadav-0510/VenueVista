import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.user()?.token;
  const r = token && !req.url.includes('/auth/') ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(r).pipe(catchError(e => {
    if (e.status === 401 && token && !req.url.includes('/auth/')) auth.logout();   // expired session
    return throwError(() => e);
  }));
};
