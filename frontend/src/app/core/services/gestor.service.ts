import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { DashboardStats, HistoricoAgrupado } from '../models/interfaces';

interface UserForSetor {
  id: string;
  usuarioId: string;
  empresaId: string;
  matricula: string;
  cargo: string;
  setor: string;
  perfil: string;
  turno: string;
  cargaHorariaDia: number;
  horarioEntrada: string;
  horarioSaida: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string | null;
}
interface User {
  id: string;
  nome: string;
  cpf: string;
  imageUrl: string;
  ativo: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class GestorService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/gestor`;

  listarColaboradoresPorSetor(empresaId: string, setor: string) {
    return this.http.post<UserForSetor[]>(`${this.apiUrl}/colaboradores`, {
      empresaId,
      setor,
    });
  }
  getColaboradorPeloId(userId: string) {
    return this.http.get<User>(`${this.apiUrl}/colaborador/${userId}`);
  }

  // resumo filtrado por setor
  getStatsPorSetor(empresaId: string, setor: string, mes?: string): Observable<DashboardStats> {
    let query = `?empresaId=${empresaId}&setor=${encodeURIComponent(setor)}`;
    if (mes) query += `&mes=${mes}`;
    return this.http.get<DashboardStats>(`${environment.apiUrl}/ponto/gestor/resumo-mensal-setor${query}`);
  }
  getHistoricoDoColaboradorNaEmpresa(usuarioEmpresa: string) {
    return this.http.get<HistoricoAgrupado[]>(
      `${this.apiUrl}/colaborador/${usuarioEmpresa}/historico`,
    );
  }

  listarColaboradores(empresaId: string) {
    return this.http.post<UserForSetor[]>(`${this.apiUrl}/colaboradores`, {
      empresaId,
    });
  }

  desligarColaborador(usuarioEmpresaId: string) {
    return this.http.post(`${this.apiUrl}/desligar-colaborador`, {
      usuarioEmpresaId,
    });
  }

  atualizarVinculo(
    usuarioEmpresaId: string,
    dados: Partial<{
      nome: string;
      imageUrl: string | null;
      perfil: string;
      cargo: string;
      setor: string;
      turno: string;
      horarioEntrada: string;
      horarioSaida: string;
      cargaHorariaDia: number;
    }>,
  ) {
    return this.http.put(`${this.apiUrl}/colaborador/${usuarioEmpresaId}`, dados);
  }

  getResumoMensal(mes?: string): Observable<DashboardStats> {
    let url = `${environment.apiUrl}/ponto/gestor/resumo-mensal`;
    if (mes) url += `?mes=${mes}`;
    return this.http.get<DashboardStats>(url);
  }
}
