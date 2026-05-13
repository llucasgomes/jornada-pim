import { DashboardStats } from '@/core/models/interfaces';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CardDetails } from "./components/card-details/card-details";
import { CardRanking } from "./components/card-ranking/card-ranking";
import { GestorService } from '@/core/services/gestor.service';
import { AuthService } from '@/core/services/auth.service';
import { CardResumo } from "./components/card-resumo/card-resumo";
import { CardGraficoBar } from "./components/card-grafico-bar/card-grafico-bar";
import { RhService } from '@/core/services/rh.service';

@Component({
  selector: 'app-resumo-operacional',
  imports: [FormsModule, CardDetails, CardRanking, CardResumo, CardGraficoBar],
  templateUrl: './resumo-operacional.html',
  styleUrl: './resumo-operacional.css',
})
export class ResumoOperacional implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  private gestorService = inject(GestorService);
  private authService = inject(AuthService);
  private rhService = inject(RhService);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);

    const user = this.authService.getUser()!;
    const empresaId = user.vinculo.empresaId;
    const setor = user.vinculo.setor ?? '';
    const mes = new Date().toISOString().slice(0, 7); // "2026-05"

    let request$;
    if (user.vinculo.perfil === 'gestor') {
      request$ = this.gestorService.getStatsPorSetor(empresaId, setor, mes);
    } else {
      request$ = this.rhService.getResumoMensal(empresaId, mes);
    }

    request$.subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
