
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { AppDialogComponent } from "@/shared/components/dialog-custon/dialog-custon";
import { VisualizarColaborador } from '../visualizar-colaborador/visualizar-colaborador';
import { EditarColaborador } from '../editar-colaborador/editar-colaborador';
import { RhService } from '@/core/services/rh.service';


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
    }),
  ],
})
export class ActionsCell {
  @Input() onDesligar!: (id: string) => void; // ← recebe o callback do pai
  @Input() colaborador!: UsuarioEmpresaEnriquecido;

  rhService = inject(RhService);

  // referência da classe para passar ao zContent
  VisualizarColaborador = VisualizarColaborador;
  EditarColaborador = EditarColaborador;

  onVisualizar() {
    /* abre modal de visualização */
  }
  onEditar = (instance: EditarColaborador) => {
    // Pegamos o valor atual do formulário que está dentro da instância do modal
    const dadosParaSalvar = instance.form.value;
    const id = instance.data.id; // ID original vindo do zData

    // Aqui você chama seu serviço:
    // this.colaboradorService.update(id, dadosParaSalvar).then(...)
  };
  onExcluir() {
    /* abre modal de confirmação */
    this.onDesligar(this.colaborador.id);
    // console.log('Excluir colaborador com ID:', this.colaborador.id);
    // this.rhService.desligarColaborador(this.colaborador.id).subscribe({
    //   next: (response) => {
    //     console.log('Colaborador desligado com sucesso:', response);
    //     // Aqui você pode adicionar lógica para atualizar a lista de colaboradores ou mostrar uma mensagem de sucesso
    //   },
    //   error: (error) => {
    //     console.error('Erro ao desligar colaborador:', error);
    //     // Aqui você pode adicionar lógica para mostrar uma mensagem de erro para o usuário
    //   },
    // });
  }
}
