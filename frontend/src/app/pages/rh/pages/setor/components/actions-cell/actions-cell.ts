import { Component, inject, Input } from '@angular/core';
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { SetorEmpresa } from '@/core/models/interfaces';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { SetorService } from '@/core/services/setor.service';
import { useAtualizarSetorMutation, useDeletarSetorMutation } from '@/core/queries/rh.queries';
import { AuthService } from '@/core/services/auth.service';

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
  @Input() colaborador!: SetorEmpresa;

  private authService = inject(AuthService);
  private user = this.authService.getUser()!;
  private empresaId = this.user.vinculo.empresaId;

  atualizarMutation = useAtualizarSetorMutation(this.empresaId);
  deletarMutation = useDeletarSetorMutation(this.empresaId);

  onVisualizar() {
    /* abre modal de visualização */
  }

  onEditar() {
    const novoNome = prompt('Novo nome do setor:', this.colaborador.nome);
    if (novoNome === null || !novoNome.trim()) return;

    this.atualizarMutation.mutate({
      id: this.colaborador.id,
      dados: { nome: novoNome.trim() },
    });
  }

  onExcluir() {
    const confirmou = confirm(`Deseja desativar o setor "${this.colaborador.nome}"?`);
    if (!confirmou) return;

    this.deletarMutation.mutate(this.colaborador.id);
  }
}
