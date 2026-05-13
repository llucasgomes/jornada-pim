import { Component, inject, Input, Output } from '@angular/core';
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { lucideEye, lucidePencil, lucideTrash2, lucideFileText } from '@ng-icons/lucide';
import { AppDialogComponent } from "@/shared/components/dialog-custon/dialog-custon";
import { RHColaboradoresVisualizarColaborador } from '../visualizar-colaborador/visualizar-colaborador';
import { RhService } from '@/core/services/rh.service';
import { RHColaboradoresEditarColaborador } from '../editar-colaborador/editar-colaborador';
import { useAtualizarColaboradorMutation } from '@/core/queries/rh.queries';
import { ZardDialogService } from '@/shared/components/dialog';
import { lastValueFrom } from 'rxjs';
import { UploadService } from '@/core/services/upload';
import { RelatorioService } from '@/core/services/relatorio.service';



@Component({
  selector: 'app-actions-cell',
  imports: [ZardButtonComponent, NgIcon, AppDialogComponent],
  templateUrl: './actions-cell.html',
  styleUrl: './actions-cell.css',
  viewProviders: [
    provideIcons({
      lucideEye,
      lucidePencil,
      lucideTrash2,
      lucideFileText,
    }),
  ],
})
export class ActionsCell {
  @Input() onDesligar!: (id: string) => void; // ← recebe o callback do pai
  @Input() colaborador!: UsuarioEmpresaEnriquecido;

  // referência da classe para passar ao zContent
  VisualizarColaborador = RHColaboradoresVisualizarColaborador;
  EditarColaborador = RHColaboradoresEditarColaborador;

  rhService = inject(RhService);
  uploadService = inject(UploadService);
  dialogService = inject(ZardDialogService);
  relatorioService = inject(RelatorioService);

  isGerandoPdf = false;

  // Injeta a mutation (precisamos do empresaId do colaborador atual)
  atualizarMutation = useAtualizarColaboradorMutation(this.colaborador?.id);



  onVisualizar() {
    /* abre modal de visualização */
  }
  onEditar = async (instance: RHColaboradoresEditarColaborador) => {
    try {
      const alteracoes = instance.camposAlterados();
      // Pegamos o arquivo do componente de upload
      const imageFile = instance.uploadImage?.getFile();

      // 1. Verificação: Se não mudou texto NEM imagem, apenas fecha e sai
      if (Object.keys(alteracoes).length === 0 && !imageFile) {
        console.log('Nada foi alterado.');

        return;
      }

      // 2. Se o usuário ALTEROU a imagem (imageFile não é null)
      if (imageFile) {
        const uploadRes = await lastValueFrom(this.uploadService.uploadImage(imageFile));
        alteracoes.imageUrl = uploadRes.url; // Adiciona a nova URL ao payload
      }

      // 3. Executa a atualização no banco
      await this.atualizarMutation.mutateAsync({
        id: this.colaborador.id,
        dados: alteracoes,
      });


    } catch (error) {
      console.error('Erro no processo de edição:', error);
    }

    return false; // Mantém o modal aberto durante o processamento
  };
  onExcluir() {
    this.onDesligar(this.colaborador.id);
  }

  onGerarPdf() {
    this.isGerandoPdf = true;
    this.relatorioService.downloadRelatorioPorUsuario(this.colaborador.usuarioId).subscribe({
      next: () => {
        this.isGerandoPdf = false;
      },
      error: (err) => {
        console.error('Erro ao gerar PDF', err);
        this.isGerandoPdf = false;
      }
    });
  }
}
