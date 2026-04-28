import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import type { RegistroPonto, PontoHoje, DashboardStats } from '../models/interfaces';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class PontoService {
  private readonly apiUrl = `${environment.apiUrl}/ponto`;

  constructor(private http: HttpClient) {}

  registrarBatida() {
    return this.http.post<RegistroPonto>(`${this.apiUrl}`, {});
  }

  buscarHoje() {
    return this.http.get<PontoHoje>(`${this.apiUrl}/hoje`);
  }

  buscarHistorico(usuarioId: string, de?: string, ate?: string) {
    let url = `${this.apiUrl}/${usuarioId}/historico`;
    const params: string[] = [];
    if (de) params.push(`de=${de}`);
    if (ate) params.push(`ate=${ate}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<RegistroPonto[]>(url);
  }

  deletarBatida(id: string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  buscarRelatorioMensal(usuarioId: string, mes: number, ano: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/${usuarioId}/relatorio-mensal?mes=${mes}&ano=${ano}`,
    );
  }

  getStats(date: string): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/resumo-mensal?date=${date}`);
  }
}
