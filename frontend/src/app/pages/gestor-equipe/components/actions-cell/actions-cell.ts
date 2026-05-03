import { Component, Input } from '@angular/core';
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-actions-cell',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './actions-cell.html',
  styleUrl: './actions-cell.css',
  viewProviders:[
    provideIcons({
      lucideEye,
      lucidePencil,
      lucideTrash2
    })
  ]
})
export class ActionsCell {
  @Input() colaborador!: UsuarioEmpresaEnriquecido;

  onVisualizar() {
    /* abre modal de visualização */
  }
  onEditar() {
    /* abre modal de edição */
  }
  onExcluir() {
    /* abre modal de confirmação */
  }
}
