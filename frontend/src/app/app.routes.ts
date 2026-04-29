import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(['rh', 'gestor'])],
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'ponto',
        loadComponent: () => import('./features/ponto/ponto').then(m => m.Ponto),
      },
      {
        path: 'historico',
        loadComponent: () => import('./features/historico/historico').then(m => m.Historico),
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard(['rh', 'gestor'])],
        loadComponent: () => import('./features/admin/users/users').then(m => m.Users),
      },
      {
        path: '',
        redirectTo: 'ponto',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
