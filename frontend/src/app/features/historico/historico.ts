import { RegistroPonto, TipoBatida } from '@/core/models/interfaces';
import { AuthService } from '@/core/services/auth.service';
import { PontoService } from '@/core/services/ponto.service';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historico',
  imports: [FormsModule],
  templateUrl: './historico.html',
  styleUrl: './historico.css',
})
export class Historico implements OnInit {
  registros = signal<RegistroPonto[]>([]);
  loading = signal(false);
  dateFrom = '';
  dateTo = '';

  constructor(
    private pontoService: PontoService,
    private authService: AuthService,
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
      error: () => this.loading.set(false),
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
    const rows = data.map((reg) => [
      this.formatDate(reg.timestamp),
      this.formatTipo(reg.tipo),
      this.formatTime(reg.timestamp),
      reg.origem,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

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
