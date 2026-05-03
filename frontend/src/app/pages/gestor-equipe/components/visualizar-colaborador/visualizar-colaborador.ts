import { UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-visualizar-colaborador',
  imports: [DatePipe],
  templateUrl: './visualizar-colaborador.html',
  styleUrl: './visualizar-colaborador.css',
})
export class VisualizarColaborador {
  data: UsuarioEmpresaEnriquecido = inject(Z_MODAL_DATA);
}
