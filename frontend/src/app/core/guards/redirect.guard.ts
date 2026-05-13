import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const RedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLogged()) {
    const perfil = auth.getPerfil();
    if (perfil === 'rh') router.navigate(['/rh']);
    else if (perfil === 'gestor') router.navigate(['/gestor']);
    else router.navigate(['/colaborador']);
    return false;
  }
  return true;
};
