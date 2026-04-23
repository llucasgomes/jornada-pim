import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import type { LoginRequest, LoginResponse, JwtPayload, Perfil } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'jpim_token';

  readonly isLoggedIn = signal(this.hasToken());
  readonly currentUser = signal<JwtPayload | null>(this.decodeStoredToken());
  readonly perfil = computed<Perfil | null>(() => {
    const user = this.currentUser();
    return user ? (user.perfil as Perfil) : null;
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  handleLoginSuccess(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    const decoded = this.decodeToken(response.token);
    this.currentUser.set(decoded);
    this.isLoggedIn.set(true);

    const perfil = decoded?.perfil as Perfil;
    if (perfil === 'rh' || perfil === 'gestor') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/ponto']);
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    return decoded.exp * 1000 > Date.now();
  }

  private decodeStoredToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }
}
