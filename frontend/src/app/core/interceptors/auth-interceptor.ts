//Interceptor que adiciona o token em todas as requisições
//app.config.ts =>	Configurado o interceptor global

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const PUBLIC_ROUTES = ['/login', '/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Não adiciona token em rotas públicas
  const isPublic = PUBLIC_ROUTES.some((route) => req.url.includes(route));
  if (isPublic) {
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  return next(req);
};;
