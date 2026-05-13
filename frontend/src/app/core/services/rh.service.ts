import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { DashboardStats, HistoricoAgrupado, SetorEmpresa } from '../models/interfaces';

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
export class RhService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/rh`;

  listarColaboradoresPorSetor(empresaId: string, setor: string) {
    return this.http.post<UserForSetor[]>(`${this.apiUrl}/colaboradores/sector`, {
      empresaId,
      setor,
    });
  }
  //  Rota para listar colaboradores da mesa empresa
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

  getColaboradorPeloId(userId: string) {
    return this.http.get<User>(`${this.apiUrl}/colaborador/${userId}`);
  }

  // resumo filtrado por setor
  getStatsPorSetor(empresaId: string, setor: string, mes?: string): Observable<DashboardStats> {
    let query = `?empresaId=${empresaId}&setor=${encodeURIComponent(setor)}`;
    if (mes) query += `&mes=${mes}`;
    return this.http.get<DashboardStats>(`${environment.apiUrl}/ponto/rh/resumo-mensal-setor${query}`);
  }
  getHistoricoDoColaboradorNaEmpresa(usuarioEmpresa: string) {
    return this.http.get<HistoricoAgrupado[]>(
      `${this.apiUrl}/colaborador/${usuarioEmpresa}/historico`,
    );
  }

  atualizarVinculo(
    usuarioEmpresaId: string,
    dados: Partial<{
      nome: string;
      foto: string | null;
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

  listarSetores(empresaId: string) {

     let query = `?empresaId=${empresaId}`;

      return this.http.get<SetorEmpresa[]>(`${this.apiUrl}/all-setor${query}`);
  }

  getResumoMensal(empresaId: string, mes?: string): Observable<DashboardStats> {
    let url = `${environment.apiUrl}/ponto/rh/resumo-mensal?empresaId=${empresaId}`;
    if (mes) url += `&mes=${mes}`;
    return this.http.get<DashboardStats>(url);
  }
}
