import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard(['rh', 'gestor'])],
      },
      {
        path: 'ponto',
        loadComponent: () => import('./pages/ponto/ponto.component').then(m => m.PontoComponent),
      },
      {
        path: 'historico',
        loadComponent: () => import('./pages/historico/historico.component').then(m => m.HistoricoComponent),
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent),
        canActivate: [roleGuard(['rh', 'gestor'])],
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
