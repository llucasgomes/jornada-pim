import { Component, Input } from '@angular/core';
import { ZardCardComponent } from "@/shared/components/card";

interface TopRanking {
  id: string;
  nome: string;
  total: number;
  imageUrl?: string | null;
  cargo?: string;
  setor?: string;
}

@Component({
  selector: 'app-card-ranking',
  imports: [ZardCardComponent],
  templateUrl: './card-ranking.html',
  styleUrl: './card-ranking.css',
})
export class CardRanking {
  @Input() title: string = '';
  @Input() fiveTopAtrasados: TopRanking[] = [];
  @Input() tempo: 'hs' | 'min' | 'dia' | null = null;

  horasDecimalParaHHMM(horas: number): string {
    if (!horas || horas <= 0) return '00:00';
    const totalMin = Math.round(horas * 60);
    const h = Math.floor(totalMin / 60)
      .toString()
      .padStart(2, '0');
    const m = (totalMin % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
  }

  minutosParaHHMM(minutos: number): string {
    if (!minutos || minutos <= 0) return '00:00';
    const h = Math.floor(minutos / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutos % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
  }
}
