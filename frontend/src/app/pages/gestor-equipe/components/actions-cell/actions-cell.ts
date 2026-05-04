import { Component, Input } from '@angular/core';
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { AppDialogComponent } from "@/shared/components/dialog-custon/dialog-custon";
import { VisualizarColaborador } from '../visualizar-colaborador/visualizar-colaborador';
import { EditarColaborador } from '../editar-colaborador/editar-colaborador';

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
  @Input() colaborador!: UsuarioEmpresaEnriquecido;

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

    console.log('dados para atualizar...', { id, dadosParaSalvar });
    console.log('vindo da tabela...', instance.data); // Aqui tem todos os dados que você passou no zData, incluindo o ID

    // Aqui você chama seu serviço:
    // this.colaboradorService.update(id, dadosParaSalvar).then(...)
  }
  onExcluir() {
    /* abre modal de confirmação */
  }
}
