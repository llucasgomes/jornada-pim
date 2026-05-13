import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DashboardStatsSimples {
  totalColaboradores: number;
  ativos: number;
  presentesHoje: number;
  horasExtrasMes: string;
  atrasosMesMinutos: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardStatsSimples> {
    return this.http.get<DashboardStatsSimples>(`${this.apiUrl}/stats`);
  }
}
