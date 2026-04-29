import { DashboardStats } from "@/core/models/interfaces";
import { PontoService } from "@/core/services/ponto.service";
import { DecimalPipe } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";


@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  constructor(private pontoService: PontoService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);

    const today = new Date().toISOString().split('T')[0]; // 👉 "2026-04-28"

    this.pontoService.getStats(today).subscribe({
      next: (data) => {
        console.log('🔥 DADOS DO BACKEND:', data); // 👈 AQUI
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
