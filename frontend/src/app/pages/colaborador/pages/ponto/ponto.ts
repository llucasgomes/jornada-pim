import { PontoHoje, TipoBatida } from '@/core/models/interfaces';
import { AuthService } from '@/core/services/auth.service';
import { PontoService } from '@/core/services/ponto.service';
import { Component, computed, OnInit, signal } from '@angular/core';
import { ZardCardComponent } from "@/shared/components/card";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardBadgeComponent } from "@/shared/components/badge";

@Component({
  selector: 'app-ponto',
  imports: [ZardCardComponent, ZardButtonComponent, ZardBadgeComponent],
  templateUrl: './ponto.html',
  styleUrl: './ponto.css',
})
export class Ponto implements OnInit {
  dados = signal<PontoHoje | null>(null);
  punching = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  currentTime = signal('');
  today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  proximaBatida = computed(() => this.dados()?.proxima_batida ?? null);

  private timerInterval: any;

  constructor(
    private pontoService: PontoService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);
    this.loadDados();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  private updateClock() {
    this.currentTime.set(
      new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
  }

  loadDados() {
    this.pontoService.buscarHoje().subscribe({
      next: (data) => this.dados.set(data),
      error: () => {},
    });
  }

  registrarPonto() {
    this.punching.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.pontoService.registrarBatida().subscribe({
      next: (batida) => {
        this.punching.set(false);
        this.successMsg.set(`${this.formatTipoBatida(batida.tipo)} registrada com sucesso!`);
        this.loadDados();
        setTimeout(() => this.successMsg.set(''), 4000);
      },
      error: (err) => {
        this.punching.set(false);
        this.errorMsg.set(err.error?.message || 'Erro ao registrar batida');
        setTimeout(() => this.errorMsg.set(''), 4000);
      },
    });
  }

  formatTipoBatida(tipo: TipoBatida): string {
    const map: Record<string, string> = {
      entrada: 'Entrada',
      saida_almoco: 'Saída Almoço',
      retorno_almoco: 'Retorno Almoço',
      saida: 'Saída',
    };
    return map[tipo] || tipo;
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatMinutes(val: string): string {
    const minutes = Math.round(Number(val));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m.toString().padStart(2, '0')}`;
  }

  dotClass(tipo: string): string {
    const map: Record<string, string> = {
      entrada: 'border-green-500 bg-green-500',
      saida_almoco: 'border-amber-500 bg-amber-500',
      retorno_almoco: 'border-cyan-500 bg-cyan-500',
      saida: 'border-red-500 bg-red-500',
    };
    return map[tipo] || 'border-slate-500 bg-slate-500';
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      completo: 'badge-success',
      incompleto: 'badge-warning',
      falta: 'badge-danger',
      afastamento: 'badge-info',
    };
    return map[status] || 'badge-info';
  }
}
