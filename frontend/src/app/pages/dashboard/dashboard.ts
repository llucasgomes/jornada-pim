import { DashboardStats } from "@/core/models/interfaces";
import { PontoService } from "@/core/services/ponto.service";
import { DecimalPipe } from "@angular/common";
import { Component, computed, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  NgApexchartsModule,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexAxisChartSeries,
} from 'ng-apexcharts';


@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, DecimalPipe, NgApexchartsModule],
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

  chartOptions = computed(() => {
    const data = this.stats()?.graficoExtras || [];

    return {
      series: [
        {
          name: 'Horas Extras',
          data: data.map((d) => Number(d.total.toFixed(2))),
        },
      ],
      chart: {
        type: 'area',
        height: 300,
        toolbar: { show: false },
      },
      xaxis: {
        categories: data.map((d) =>
          new Date(d.data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
        ),
      },
      stroke: {
        curve: 'smooth',
      },
      dataLabels: {
        enabled: false,
      },
    } as {
      series: ApexAxisChartSeries;
      chart: ApexChart;
      xaxis: ApexXAxis;
      stroke: ApexStroke;
      dataLabels: ApexDataLabels;
    };
  });

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
