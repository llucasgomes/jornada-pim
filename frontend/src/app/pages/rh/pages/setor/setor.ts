import { Component, inject } from '@angular/core';
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from '@ng-icons/lucide';
import { AuthService } from '@/core/services/auth.service';
import { useListarSetoresDaEmpresaQuery, useCriarSetorMutation } from '@/core/queries/rh.queries';
import { ColumnDef, FlexRenderComponent } from '@tanstack/angular-table';
import { SetorEmpresa } from '@/core/models/interfaces';
import { ZardLoaderComponent } from "@/shared/components/loader";
import { Table } from "@/shared/table/table";
import { ZardEmptyComponent } from "@/shared/components/empty";
import { ActionsCell } from './components/actions-cell/actions-cell';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setor',
  imports: [ZardButtonComponent, NgIcon, ZardLoaderComponent, Table, ZardEmptyComponent, FormsModule],
  templateUrl: './setor.html',
  styleUrl: './setor.css',
  viewProviders: [
    provideIcons({
      lucidePlusCircle,
    }),
  ],
})
export class Setor {
  private authService = inject(AuthService);

  private user = this.authService.getUser()!;
  private empresaId = this.user.vinculo.empresaId;

  setoresQuery = useListarSetoresDaEmpresaQuery(this.empresaId);
  criarSetorMutation = useCriarSetorMutation(this.empresaId);

  // Formulário de novo setor
  novoSetorNome = '';
  novoSetorDescricao = '';
  showFormCriar = false;

  columns: ColumnDef<SetorEmpresa>[] = [
      {
        accessorKey: 'nome',
        header: 'Nome',
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: 'descricao',
        header: 'Descrição',
        cell: (info) => info.getValue<string>() ?? '—',
      },
      {
        accessorKey: 'ativo',
        header: 'Status',
        cell: (info) => info.getValue<boolean>() ? '✅ Ativo' : '❌ Inativo',
      },
      {
        id: 'acoes',
        header: '',
        cell: (info) =>
          new FlexRenderComponent(ActionsCell, {
            colaborador: info.row.original,
          }),
      },
    ];

  toggleFormCriar() {
    this.showFormCriar = !this.showFormCriar;
    if (!this.showFormCriar) {
      this.novoSetorNome = '';
      this.novoSetorDescricao = '';
    }
  }

  criarSetor() {
    if (!this.novoSetorNome.trim()) return;

    this.criarSetorMutation.mutate({
      nome: this.novoSetorNome.trim(),
      descricao: this.novoSetorDescricao.trim() || undefined,
      empresaId: this.empresaId,
    });

    this.novoSetorNome = '';
    this.novoSetorDescricao = '';
    this.showFormCriar = false;
  }
}
