import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { RedirectGuard } from './core/guards/redirect.guard';
import { Login } from './pages/login/login';
import { RoleGuard } from './core/guards/role.guard';
import { Rh } from './pages/rh/rh';
import { Gestor } from './pages/gestor/gestor';
import { Colaborador } from './pages/colaborador/colaborador';

export const routes: Routes = [
  // LOGIN
  {
    path: 'login',
    canActivate: [RedirectGuard],
    component: Login,
  },
  // // ADMIN
  {
    path: 'rh',
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['rh'] },
    component: Rh,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/resumo-operacional/resumo-operacional').then((c) => c.ResumoOperacional),
      },
      {
        path:'equipe',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/rh-equipe/rh-equipe').then((c) => c.RhEquipe),
      },
      {
        path:'colaboradores',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/rh-colaboradores/rh-colaboradores').then((c) => c.RhColaboradores),
      }
    ],
  },
  {
    path: 'gestor',
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['gestor'] },
    component: Gestor,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/resumo-operacional/resumo-operacional').then((c) => c.ResumoOperacional),
      },
      {
        path: 'equipe',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/gestor-equipe/gestor-equipe').then((c) => c.GestorEquipe),
      },
    ],
  },
  {
    path: 'colaborador',
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['colaborador'] },
    component: Colaborador,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/resumo-operacional/resumo-operacional').then((c) => c.ResumoOperacional),
      },
    ],
  },
  // // ROOT
  // { path: '', redirectTo: 'login', pathMatch: 'full' },

  // // 404
  // { path: '**', redirectTo: 'login' },

  // {
  //   path: '**',
  //   redirectTo: 'login',
  // },

  // ACESSO NEGADO
  // {
  //   path: 'acesso-negado',
  //   component: AcessoNegado,
  // },
];
