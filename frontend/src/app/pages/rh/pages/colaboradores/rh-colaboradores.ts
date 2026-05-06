import { Component, inject, signal } from '@angular/core';
import { Table } from '@/shared/table/table';
import { ZardEmptyComponent } from '@/shared/components/empty';
import { ColumnDef } from '@tanstack/table-core';
import { ColaboradoreComHistorico } from '@/core/models/interfaces';
import { FlexRenderComponent } from '@tanstack/angular-table';

import { ActionsCell } from './components/actions-cell/actions-cell';
import { AuthService } from '@/core/services/auth.service';
import { forkJoin, lastValueFrom, map, switchMap } from 'rxjs';
import { RhService } from '@/core/services/rh.service';
import { FotoCell } from './components/foto-cell/foto-cell';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { useColaboradoresQuery, useDesligarColaboradorMutation } from '@/core/queries/rh.queries';
import { ZardLoaderComponent } from "@/shared/components/loader";



@Component({
  selector: 'app-rh-colaboradores',
  imports: [Table, ZardEmptyComponent, ZardLoaderComponent],
  templateUrl: './rh-colaboradores.html',
  styleUrl: './rh-colaboradores.css',
})
export class RhColaboradores {
  private authService = inject(AuthService);

  private user = this.authService.getUser()!;
  private empresaId = this.user.vinculo.empresaId;

  // Apenas solicita a query centralizada
  colaboradoresQuery = useColaboradoresQuery(this.empresaId);
  desligarMutation = useDesligarColaboradorMutation(this.empresaId);

  columns: ColumnDef<ColaboradoreComHistorico>[] = [
    {
      accessorKey: 'matricula',
      header: 'Matrícula',
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'foto',
      header: 'Foto',
      cell: (info) => {
        const row = info.row.original;
        const isActive = row.ativo;
        const foto = row.foto ?? '';
        const nome = row.nome ?? '-';

        return new FlexRenderComponent(FotoCell, {
          colaborador: {
            foto: info.row.original.foto,
            historico: info.row.original.historico,
            ativo: isActive,
          },
        });
      },
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'cargo',
      header: 'Cargo',
      cell: (info) => info.getValue<string>() ?? '-',
    },
    {
      accessorKey: 'setor',
      header: 'Setor',
      cell: (info) => info.getValue<string>() ?? '-',
    },
    {
      accessorKey: 'perfil',
      header: 'Perfil',
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'turno',
      header: 'Turno',
      cell: (info) => info.getValue<string>() ?? '-',
    },
    {
      accessorKey: 'horarioEntrada',
      header: 'Entrada',
      cell: (info) => info.getValue<string>() ?? '-',
    },
    {
      accessorKey: 'horarioSaida',
      header: 'Saída',
      cell: (info) => info.getValue<string>() ?? '-',
    },
    {
      accessorKey: 'ativo',
      header: 'Ativo',
      cell: (info) => (info.getValue<boolean>() ? 'Sim' : 'Não'),
    },
    {
      id: 'acoes',
      header: '', // sem título, ou coloque 'Ações'
      cell: (info) =>
        new FlexRenderComponent(ActionsCell, {
          colaborador: info.row.original,
          onDesligar: (id: string) => this.desligarMutation.mutate(id), // ← passa o callback
        }),
    },
  ];

}
