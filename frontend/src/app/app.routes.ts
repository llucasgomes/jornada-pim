import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(['rh', 'gestor'])],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'ponto',
        loadComponent: () => import('./features/ponto/ponto.component').then(m => m.PontoComponent),
      },
      {
        path: 'historico',
        loadComponent: () => import('./features/historico/historico.component').then(m => m.HistoricoComponent),
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard(['rh', 'gestor'])],
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent),
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
