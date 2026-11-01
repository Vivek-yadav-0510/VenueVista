import { Routes } from '@angular/router';
import { authGuard, staffGuard } from './core/guards';
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register.component').then(m => m.RegisterComponent) },
  { path: '', loadComponent: () => import('./pages/shell.component').then(m => m.ShellComponent), children: [
    { path: '', pathMatch: 'full', redirectTo: 'events' },
    { path: 'events', loadComponent: () => import('./pages/events.component').then(m => m.EventsComponent) },
    { path: 'events/new', canActivate: [staffGuard], loadComponent: () => import('./pages/event-form.component').then(m => m.EventFormComponent) },
    { path: 'events/:id', loadComponent: () => import('./pages/event-detail.component').then(m => m.EventDetailComponent) },
    { path: 'tickets', canActivate: [authGuard], loadComponent: () => import('./pages/my-tickets.component').then(m => m.MyTicketsComponent) },
    { path: 'dashboard', canActivate: [staffGuard], loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'venues', canActivate: [staffGuard], loadComponent: () => import('./pages/venues.component').then(m => m.VenuesComponent) },
  ] },
  { path: '**', redirectTo: '' }
];
