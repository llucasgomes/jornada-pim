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



@Component({
  selector: 'app-rh-colaboradores',
  imports: [Table, ZardEmptyComponent],
  templateUrl: './rh-colaboradores.html',
  styleUrl: './rh-colaboradores.css',
})
export class RhColaboradores {
  private rhService = inject(RhService);
  private authService = inject(AuthService);
  private queryClient = inject(QueryClient);

  private user = this.authService.getUser()!;
  private empresaId = this.user.vinculo.empresaId;

  // ─── Query principal ─────────────────────────────────────────────────────
  colaboradoresQuery = injectQuery(() => ({
    queryKey: ['colaboradores', this.empresaId],
    // Ativa a atualização automática a cada 10 segundos (10000ms)
    refetchInterval: 10000,
    // Garante que continue atualizando mesmo se a janela perder o foco (opcional)
    refetchIntervalInBackground: true,
    queryFn: async () => {
      // 1. Busca a lista básica de colaboradores
      const colaboradores = await lastValueFrom(this.rhService.listarColaboradores(this.empresaId));

      // 2. Para cada colaborador, dispara as buscas de detalhes em paralelo
      const enriquecidosPromises = colaboradores.map(async (c) => {
        const detalhes = await lastValueFrom(
          forkJoin({
            usuario: this.rhService.getColaboradorPeloId(c.usuarioId),
            historico: this.rhService.getHistoricoDoColaboradorNaEmpresa(c.id),
          }),
        );

        return {
          ...c,
          nome: detalhes.usuario.nome,
          foto: detalhes.usuario.imageUrl ?? null,
          historico: detalhes.historico,
        } as ColaboradoreComHistorico;
      });

      // 3. Aguarda todas as resoluções e retorna o array final
      return Promise.all(enriquecidosPromises);
    },
  }));

  // ─── Mutation de desligar ─────────────────────────────────────────────────
  desligarMutation = injectMutation(() => ({
    mutationFn: (usuarioEmpresaId: string) =>
      lastValueFrom(this.rhService.desligarColaborador(usuarioEmpresaId)),
    onSuccess: () => {
      // invalida a query → ela recarrega automaticamente
      this.queryClient.invalidateQueries({
        queryKey: ['colaboradores', this.empresaId],
      });
    },
  }));

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

  // ngOnInit() {
  //   const user = this.authService.getUser()!;
  //   const empresaId = user.vinculo.empresaId;

  //   this.rhService
  //     .listarColaboradores(empresaId)
  //     .pipe(
  //       switchMap((data) => {
  //         // Filtra para não aparecer o próprio gestor na lista
  //         // const semMim = data.filter((c) => c.id !== this.myId);

  //         if (data.length === 0) return [[]];

  //         return forkJoin(
  //           data.map((c) =>
  //             // Fazemos o forkJoin de duas chamadas para cada colaborador
  //             forkJoin({
  //               usuario: this.rhService.getColaboradorPeloId(c.usuarioId),
  //               historico: this.rhService.getHistoricoDoColaboradorNaEmpresa(c.id), // c.id é o usuarioEmpresaId
  //             }).pipe(
  //               map(
  //                 ({ usuario, historico }) =>
  //                   ({
  //                     ...c,
  //                     nome: usuario.nome,
  //                     foto: usuario.imageUrl ?? null,
  //                     historico: historico, // Adiciona o histórico agrupado aqui
  //                   }) as ColaboradoreComHistorico,
  //               ),
  //             ),
  //           ),
  //         );
  //       }),
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         this.colaboradores.set(data as ColaboradoreComHistorico[]);
  //         this.loading.set(false);
  //       },
  //       error: () => this.loading.set(false),
  //     });
  // }
}
