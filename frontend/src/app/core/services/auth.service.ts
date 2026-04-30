import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Perfil } from '../models/interfaces';


export interface StoredUser {
  id: string;
  nome: string;
  matricula: string;
  perfil: Perfil;
  imageUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userKey = 'user_logged';
  private tokenKey = 'auth_token';
  private router = inject(Router);

  private decodeToken(token: string): StoredUser | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  login(token: string) {
    localStorage.setItem(this.tokenKey, token);
    const payload = this.decodeToken(token);
    if (payload) {
      const userData: StoredUser = {
        id: payload.id,
        nome: payload.nome,
        matricula: payload.matricula,
        perfil: payload.perfil as Perfil,
        imageUrl: payload.imageUrl,
      };
      localStorage.setItem(this.userKey, JSON.stringify(userData));
    }
  }

  logout() {
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): StoredUser | null {
    const data = localStorage.getItem(this.userKey);
    if (!data || !this.getToken()) {
      localStorage.removeItem(this.userKey);
      return null;
    }
    return JSON.parse(data) as StoredUser;
  }

  isLogged(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: Perfil[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    return roles.includes(user.perfil);
  }

  getPerfil(): Perfil | null {
    return this.getUser()?.perfil ?? null;
  }

  // adicione após getPerfil()
  perfil(): Perfil | null {
    return this.getPerfil();
  }

  isLoggedIn(): boolean {
    return this.isLogged();
  }
}
