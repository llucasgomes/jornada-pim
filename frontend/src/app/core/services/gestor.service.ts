import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { DashboardStats } from '../models/interfaces';

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


@Injectable({
  providedIn: 'root',
})
export class GestorService {
  private http = inject(HttpClient)
  private readonly apiUrl = `${environment.apiUrl}/gestor`;

  listarColaboradoresPorSetor(empresaId: string, setor: string) {
    return this.http.post<UserForSetor[]>(
      `${this.apiUrl}/colaboradores`,
      {
        empresaId,
        setor,
      },
    );
  }

  // resumo filtrado por setor
  getStatsPorSetor(empresaId: string, setor: string, mes?: string): Observable<DashboardStats> {
    let query = `?empresaId=${empresaId}&setor=${encodeURIComponent(setor)}`;
    if (mes) query += `&mes=${mes}`;
    return this.http.get<DashboardStats>(`${this.apiUrl}/resumo-mensal-setor${query}`);
  }

}
