import { Component, inject } from '@angular/core';
import { AppDialogComponent } from "@/shared/components/dialog-custon/dialog-custon";
import { ZardButtonComponent } from "@/shared/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from '@ng-icons/lucide';
import { AuthService } from '@/core/services/auth.service';
import { useListarSetoresDaEmpresaQuery } from '@/core/queries/rh.queries';
import { ColumnDef, FlexRenderComponent } from '@tanstack/angular-table';
import { SetorEmpresa } from '@/core/models/interfaces';
import { ZardLoaderComponent } from "@/shared/components/loader";
import { Table } from "@/shared/table/table";
import { ZardEmptyComponent } from "@/shared/components/empty";
import { ActionsCell } from './components/actions-cell/actions-cell';

@Component({
  selector: 'app-setor',
  imports: [AppDialogComponent, ZardButtonComponent, NgIcon, ZardLoaderComponent, Table, ZardEmptyComponent],
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

  setoresQuery = useListarSetoresDaEmpresaQuery(this.empresaId)

  columns: ColumnDef<SetorEmpresa>[] = [
      {
        accessorKey: 'nome',
        header: 'Nome',
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: 'descricao',
        header: 'Descrição',
        cell: (info) => info.getValue<string>(),
      },

      {
        id: 'acoes',
        header: '', // sem título, ou coloque 'Ações'
        cell: (info) =>
          new FlexRenderComponent(ActionsCell, {
            colaborador: info.row.original,
          }),
      },
    ];
}
