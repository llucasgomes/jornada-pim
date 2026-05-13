import { HistoricoAgrupado, UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { ZardAvatarComponent } from '@/shared/components/avatar';
import { Component, Input, OnInit } from '@angular/core';


interface StatusConfig {
  label: string;
  classes: string;
  status: 'online' | 'offline' | 'doNotDisturb';
}



@Component({
  selector: 'app-foto-cell',
  imports: [ZardAvatarComponent],
  templateUrl: './foto-cell.html',
  styleUrl: './foto-cell.css',
})
export class FotoCell implements OnInit {
  statusPresenca: 'fora' | 'dentro' | 'intervalo' = 'fora';
  @Input() colaborador!: {
    foto: string | null;
    historico: HistoricoAgrupado[];
  };

  ngOnInit() {
    this.calcularStatusAtual();
  }

  private calcularStatusAtual() {
    const hojeIso = new Date().toISOString().split('T')[0];

    // 1. Encontrar o mês atual no histórico
    const mesAtual = this.colaborador.historico.find((h) => {
      const dataRef = new Date(h.dias[0]?.data);
      return (
        dataRef.getMonth() === new Date().getMonth() &&
        dataRef.getFullYear() === new Date().getFullYear()
      );
    });

    if (!mesAtual) return;

    // 2. Encontrar o dia de hoje
    const diaHoje = mesAtual.dias.find((d) => d.data === hojeIso);

    if (!diaHoje || diaHoje.registros.length === 0) {
      this.statusPresenca = 'fora';
      return;
    }

    // 3. Pegar a última batida do dia (assumindo que o back já manda ordenado)
    const ultimaBatida = diaHoje.registros[diaHoje.registros.length - 1];

    switch (ultimaBatida.tipo) {
      case 'entrada':
      case 'retorno_almoco':
        this.statusPresenca = 'dentro';
        break;
      case 'saida_almoco':
        this.statusPresenca = 'intervalo';
        break;
      case 'saida':
        this.statusPresenca = 'fora';
        break;
      default:
        this.statusPresenca = 'fora';
    }
  }
  get configStatus(): StatusConfig {
    const mapeamento: Record<'dentro' | 'intervalo' | 'fora', StatusConfig> = {
      dentro: {
        label: 'No Posto',
        classes: 'bg-green-100 text-green-700 border-green-200',
        status: 'online',
      },
      intervalo: {
        label: 'Em Intervalo',
        classes: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        status: 'doNotDisturb',
      },
      fora: {
        label: 'Ausente',
        classes: 'bg-red-100 text-red-700 border-red-200',
        status: 'offline',
      },
    };

    return mapeamento[this.statusPresenca] || mapeamento.fora;
  }
}
