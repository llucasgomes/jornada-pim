import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SetorEmpresa } from '../models/interfaces';

export interface CriarSetorPayload {
  nome: string;
  descricao?: string;
  empresaId: string;
}

export interface AtualizarSetorPayload {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SetorService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/rh`;

  /**
   * Criar novo setor vinculado a uma empresa.
   * POST /rh/setore/register
   */
  criar(payload: CriarSetorPayload): Observable<SetorEmpresa> {
    return this.http.post<SetorEmpresa>(`${this.apiUrl}/setore/register`, payload);
  }

  /**
   * Buscar setor por ID.
   * GET /rh/setores/:id
   */
  buscarPorId(id: string): Observable<SetorEmpresa> {
    return this.http.get<SetorEmpresa>(`${this.apiUrl}/setores/${id}`);
  }

  /**
   * Atualizar setor existente.
   * PATCH /rh/setores/:id
   */
  atualizar(id: string, payload: AtualizarSetorPayload): Observable<SetorEmpresa> {
    return this.http.patch<SetorEmpresa>(`${this.apiUrl}/setores/${id}`, payload);
  }

  /**
   * Desativar (soft delete) setor.
   * DELETE /rh/setores/:id
   */
  deletar(id: string): Observable<{ message: string; setor: SetorEmpresa }> {
    return this.http.delete<{ message: string; setor: SetorEmpresa }>(`${this.apiUrl}/setores/${id}`);
  }
}
