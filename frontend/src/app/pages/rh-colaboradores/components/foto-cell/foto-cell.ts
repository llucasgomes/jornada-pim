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
export class FotoCell {
  statusPresenca: 'fora' | 'dentro' | 'intervalo' = 'fora';
  @Input() colaborador!: {
    foto: string | null;
    historico: HistoricoAgrupado[];
    ativo: boolean;
  };




}
