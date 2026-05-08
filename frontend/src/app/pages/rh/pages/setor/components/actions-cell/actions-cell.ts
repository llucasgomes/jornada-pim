import { Component, inject, Input, Output } from '@angular/core';
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { AppDialogComponent } from "@/shared/components/dialog-custon/dialog-custon";

import { RhService } from '@/core/services/rh.service';

import { useAtualizarColaboradorMutation } from '@/core/queries/rh.queries';
import { ZardDialogService } from '@/shared/components/dialog';
import { lastValueFrom } from 'rxjs';
import { UploadService } from '@/core/services/upload';



@Component({
  selector: 'app-actions-cell',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './actions-cell.html',
  styleUrl: './actions-cell.css',
  viewProviders: [
    provideIcons({
      lucideEye,
      lucidePencil,
      lucideTrash2,
    }),
  ],
})
export class ActionsCell {
  @Input() onDesligar!: (id: string) => void; // ← recebe o callback do pai
  @Input() colaborador!: UsuarioEmpresaEnriquecido;

  rhService = inject(RhService);
  uploadService = inject(UploadService);
  dialogService = inject(ZardDialogService);





  onVisualizar() {
    /* abre modal de visualização */
  }
  onEditar = async () => {


    return false; // Mantém o modal aberto durante o processamento
  };
  onExcluir() {

  }
}
