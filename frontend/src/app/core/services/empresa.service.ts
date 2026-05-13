import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  logo: string | null;
  razao_social: string | null;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriarEmpresaPayload {
  nome: string;
  cnpj: string;
  logo?: string;
  razaoSocial?: string;
  email?: string;
  telefone?: string;
}

export interface AtualizarEmpresaPayload {
  nome?: string;
  cnpj?: string;
  logo?: string;
  razaoSocial?: string;
  email?: string;
  telefone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/empresa`;

  /** Listar todas as empresas (ativas e inativas). */
  listarTodas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/all`);
  }

  /** Listar apenas empresas ativas. */
  listarAtivas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/findAllActive`);
  }

  /** Listar apenas empresas inativas. */
  listarInativas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/findAllInactive`);
  }

  /** Buscar empresa por ID. */
  buscarPorId(id: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  /** Buscar empresa por CNPJ. */
  buscarPorCnpj(cnpj: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/cnpj/${cnpj}`);
  }

  /** Criar nova empresa. */
  criar(payload: CriarEmpresaPayload): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}`, payload);
  }

  /** Atualizar empresa existente. */
  atualizar(id: string, payload: AtualizarEmpresaPayload): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, payload);
  }

  /** Desativar empresa (soft delete). */
  desativar(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/disable/${id}`, {});
  }

  /** Restaurar empresa inativa. */
  restaurar(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/restore/${id}`, {});
  }
}
