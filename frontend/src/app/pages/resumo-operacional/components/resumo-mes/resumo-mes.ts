import { Component, inject, OnInit } from '@angular/core';
import { PontoService } from '@/core/services/ponto.service';
import { DecimalPipe } from '@angular/common';
import type { DashboardStats } from '@/core/models/interfaces';

@Component({
  selector: 'app-resumo-mes',
  imports: [DecimalPipe],
  templateUrl: './resumo-mes.html',
})
export class ResumoMes implements OnInit {
  private pontoService = inject(PontoService);

  stats: DashboardStats | null = null;
  loading = true;
  error = false;

  ngOnInit() {
    this.pontoService.getResumoMensal().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
