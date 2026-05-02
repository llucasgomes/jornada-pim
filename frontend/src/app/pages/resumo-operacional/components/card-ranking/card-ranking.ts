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
}
