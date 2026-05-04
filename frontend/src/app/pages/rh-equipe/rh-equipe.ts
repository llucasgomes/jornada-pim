import { Component, inject, signal } from '@angular/core';
import { Table } from "@/shared/table/table";
import { ZardEmptyComponent } from "@/shared/components/empty";
import { ColumnDef } from '@tanstack/table-core';
import { ColaboradoreComHistorico } from '@/core/models/interfaces';
import { FlexRenderComponent } from '@tanstack/angular-table';
import { FotoCell } from '@/shared/table/components/foto-cell/foto-cell';
import { ActionsCell } from './components/actions-cell/actions-cell';
import { AuthService } from '@/core/services/auth.service';
import { forkJoin, map, switchMap } from 'rxjs';
import { RhService } from '@/core/services/rh.service';


const columns: ColumnDef<ColaboradoreComHistorico>[] = [
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
      const foto = row.foto ?? '';
      const nome = row.nome ?? '-';

      return new FlexRenderComponent(FotoCell, {
        colaborador: {
          foto: info.row.original.foto,
          historico: info.row.original.historico,
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
  // {
  //   accessorKey: 'setor',
  //   header: 'Setor',
  //   cell: (info) => info.getValue<string>() ?? '-',
  // },
  // {
  //   accessorKey: 'perfil',
  //   header: 'Perfil',
  //   cell: (info) => info.getValue<string>(),
  // },
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
  // {
  //   accessorKey: 'ativo',
  //   header: 'Ativo',
  //   cell: (info) => (info.getValue<boolean>() ? 'Sim' : 'Não'),
  // },
  {
    id: 'acoes',
    header: '', // sem título, ou coloque 'Ações'
    cell: (info) =>
      new FlexRenderComponent(ActionsCell, {
        colaborador: info.row.original,
      }),
  },
];

@Component({
  selector: 'app-rh-equipe',
  imports: [Table, ZardEmptyComponent],
  templateUrl: './rh-equipe.html',
  styleUrl: './rh-equipe.css',
})
export class RhEquipe {
  private rhService = inject(RhService);
  private authService = inject(AuthService);

  myId = this.authService.getUser()?.vinculo?.id ?? '';
  columns = columns;
  colaboradores = signal<ColaboradoreComHistorico[]>([]);
  loading = signal(true);

  ngOnInit() {
    const user = this.authService.getUser()!;
    const empresaId = user.vinculo.empresaId;
    const setor = user.vinculo.setor ?? '';

    this.rhService
      .listarColaboradoresPorSetor(empresaId, setor)
      .pipe(
        switchMap((data) => {
          // Filtra para não aparecer o próprio gestor na lista
          const semMim = data.filter((c) => c.id !== this.myId);

          if (semMim.length === 0) return [[]];

          return forkJoin(
            semMim.map((c) =>
              // Fazemos o forkJoin de duas chamadas para cada colaborador
              forkJoin({
                usuario: this.rhService.getColaboradorPeloId(c.usuarioId),
                historico: this.rhService.getHistoricoDoColaboradorNaEmpresa(c.id), // c.id é o usuarioEmpresaId
              }).pipe(
                map(
                  ({ usuario, historico }) =>
                    ({
                      ...c,
                      nome: usuario.nome,
                      foto: usuario.imageUrl ?? null,
                      historico: historico, // Adiciona o histórico agrupado aqui
                    }) as ColaboradoreComHistorico,
                ),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (data) => {
          console.log('Colaboradores enriquecidos:', data);
          this.colaboradores.set(data as ColaboradoreComHistorico[]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
