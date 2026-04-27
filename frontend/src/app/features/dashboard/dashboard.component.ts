import { Component, signal, OnInit, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '@/core/services/auth.service';

interface DashboardStats {
  totalColaboradores: number;
  ativos: number;
  presentesHoje: number;
  horasExtrasMes: string;
  atrasosMesMinutos: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div class="max-w-[1200px]">
      <header class="mb-8 animate-in fade-in slide-in-from-top duration-500">
        <h1 class="text-3xl font-bold text-white">Dashboard Gerencial</h1>
        <p class="text-slate-400 text-sm mt-1">Acompanhamento em tempo real da equipe</p>
      </header>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
          <div class="w-10 h-10 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
          <p class="animate-pulse">Calculando métricas...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Card Total -->
          <div class="card flex items-start gap-4 group cursor-default">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Colaboradores</span>
              <h2 class="text-3xl font-bold text-white mt-0.5">{{ stats()?.totalColaboradores }}</h2>
              <span class="text-[11px] text-slate-500">{{ stats()?.ativos }} ativos no sistema</span>
            </div>
          </div>

          <!-- Card Presentes -->
          <div class="card flex items-start gap-4 group cursor-default">
            <div class="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Presentes Hoje</span>
              <h2 class="text-3xl font-bold text-white mt-0.5">{{ stats()?.presentesHoje }}</h2>
              <span class="text-[11px] text-slate-500">Batidas registradas hoje</span>
            </div>
          </div>

          <!-- Card Horas Extras -->
          <div class="card flex items-start gap-4 group cursor-default">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Horas Extras (Mês)</span>
              <h2 class="text-3xl font-bold text-white mt-0.5">{{ stats()?.horasExtrasMes }}h</h2>
              <span class="text-[11px] text-slate-500">Total acumulado de extras</span>
            </div>
          </div>

          <!-- Card Atrasos -->
          <div class="card flex items-start gap-4 group cursor-default">
            <div class="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Atrasos (Mês)</span>
              <h2 class="text-3xl font-bold text-white mt-0.5">{{ stats()?.atrasosMesMinutos }}m</h2>
              <span class="text-[11px] text-slate-500">Minutos de atraso na entrada</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
