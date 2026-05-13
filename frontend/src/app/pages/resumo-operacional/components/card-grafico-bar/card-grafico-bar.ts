import { Component, computed, Input } from '@angular/core';
import {
  NgApexchartsModule,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexTitleSubtitle,
  ApexTheme,
  ApexGrid,
} from 'ng-apexcharts';
import { ZardCardComponent } from '@/shared/components/card';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  title: ApexTitleSubtitle;
  colors: string[];
  theme: ApexTheme;
  grid: ApexGrid;
};

@Component({
  selector: 'app-card-grafico-bar',
  imports: [NgApexchartsModule, ZardCardComponent],
  templateUrl: './card-grafico-bar.html',
  styleUrl: './card-grafico-bar.css',
})
export class CardGraficoBar {
  @Input() historicoMeses: { mes: string; extras: number; atrasos: number; faltas: number }[] = [];

  chartOptions = computed((): Partial<ChartOptions> => {
    const dados = this.historicoMeses;

    return {
      series: [
        {
          name: 'Horas Extras',
          data: dados.map((d) => Number(d.extras.toFixed(2))),
        },
      ],
      colors: ['#6366f1'],
      chart: {
        height: 350,
        type: 'bar',
        background: 'transparent',
        foreColor: '#94a3b8',
      },
      theme: {
        mode: 'dark',
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val + 'h',
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#94a3b8'],
        },
      },
      grid: {
        borderColor: '#1e293b',
      },
      xaxis: {
        categories: dados.map((d) => {
          const [ano, mes] = d.mes.split('-');
          // return new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', {
          //   month: 'short',
          //   year: '2-digit',
          // });
          return d.mes.split('-')[1] + '/' + d.mes.split('-')[0].slice(2);
        }),
        position: 'top',
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#6366f1',
              colorTo: '#818cf8',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: { enabled: true },
        labels: { style: { colors: '#94a3b8' } },
      },
      yaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          show: false,
          formatter: (val: number) => val + 'h',
        },
      },
      title: {
        text: 'Horas Extras — Últimos 6 Meses',
        floating: true,
        offsetY: 330,
        align: 'center',
        style: { color: '#94a3b8' },
      },
    };
  });
}
