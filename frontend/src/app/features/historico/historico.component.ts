import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PontoService } from '../../core/services/ponto.service';
import { AuthService } from '../../core/services/auth.service';
import type { RegistroPonto, TipoBatida } from '../../core/models/interfaces';

@Component({
  selector: 'app-historico',
  imports: [FormsModule],
  template: `
    <div class="max-w-[900px]">
      <header class="mb-6 animate-in fade-in slide-in-from-left duration-500">
        <h1 class="text-3xl font-bold text-white">Histórico de Ponto</h1>
        <p class="text-slate-400 text-sm mt-1">Consulte seus registros anteriores</p>
      </header>

      <div class="card mb-6 animate-in fade-in duration-700" style="animation-delay: 0.1s">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">De</label>
            <input class="input py-2" type="date" [(ngModel)]="dateFrom" name="dateFrom" />
          </div>
          <div class="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Até</label>
            <input class="input py-2" type="date" [(ngModel)]="dateTo" name="dateTo" />
          </div>
          <div class="flex gap-2">
            <button class="btn-primary py-2 px-6" (click)="search()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Buscar
            </button>
            @if (registros().length > 0) {
              <button class="btn-outline py-2" (click)="exportCSV()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                CSV
              </button>
            }
          </div>
        </div>
      </div>

      <div class="card p-0 overflow-hidden animate-in fade-in duration-700" style="animation-delay: 0.2s">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <div class="w-8 h-8 border-3 border-slate-800 border-t-primary rounded-full animate-spin"></div>
            <p>Carregando...</p>
          </div>
        } @else if (registros().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="opacity-20">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p class="text-sm italic">Nenhum registro encontrado no período</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-800/50">
                  <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border">Data</th>
                  <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border">Tipo</th>
                  <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border">Horário</th>
                  <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border">Origem</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                @for (reg of registros(); track reg.id) {
                  <tr class="hover:bg-primary/5 transition-colors group">
                    <td class="px-6 py-4 text-sm text-slate-300">{{ formatDate(reg.timestamp) }}</td>
                    <td class="px-6 py-4">
                      <span class="badge" [class]="tipoBadge(reg.tipo)">
                        {{ formatTipo(reg.tipo) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-bold text-white tabular-nums">{{ formatTime(reg.timestamp) }}</td>
                    <td class="px-6 py-4">
                      <span class="badge" [class]="reg.origem === 'sistema' ? 'badge-info' : 'badge-warning'">
                        {{ reg.origem }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class HistoricoComponent implements OnInit {
  registros = signal<RegistroPonto[]>([]);
  loading = signal(false);
  dateFrom = '';
  dateTo = '';

  constructor(
    private pontoService: PontoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const today = new Date();
    const past = new Date();
    past.setDate(past.getDate() - 30);
    this.dateTo = this.toDateString(today);
    this.dateFrom = this.toDateString(past);
    this.search();
  }

  search() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.loading.set(true);
    this.pontoService.buscarHistorico(userId, this.dateFrom, this.dateTo).subscribe({
      next: (data) => {
        this.registros.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatTipo(tipo: TipoBatida): string {
    const map: Record<string, string> = {
      entrada: 'Entrada',
      saida_almoco: 'Saída Almoço',
      retorno_almoco: 'Retorno Almoço',
      saida: 'Saída',
    };
    return map[tipo] || tipo;
  }

  tipoBadge(tipo: string): string {
    const map: Record<string, string> = {
      entrada: 'badge-success',
      saida_almoco: 'badge-warning',
      retorno_almoco: 'badge-info',
      saida: 'badge-danger',
    };
    return map[tipo] || 'badge-info';
  }

  formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString('pt-BR');
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  exportCSV() {
    const data = this.registros();
    if (data.length === 0) return;

    const headers = ['Data', 'Tipo', 'Horario', 'Origem'];
    const rows = data.map(reg => [
      this.formatDate(reg.timestamp),
      this.formatTipo(reg.tipo),
      this.formatTime(reg.timestamp),
      reg.origem
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_ponto_${this.dateFrom}_a_${this.dateTo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private toDateString(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
