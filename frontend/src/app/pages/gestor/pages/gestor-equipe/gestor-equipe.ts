import { Component, inject, signal } from '@angular/core';
import { ColumnDef, FlexRenderComponent } from '@tanstack/angular-table';
import { Table } from '@/shared/table/table';
import { ColaboradoreComHistorico } from '@/core/models/interfaces';
import { GestorService } from '@/core/services/gestor.service';
import { AuthService } from '@/core/services/auth.service';
import { ZardEmptyComponent } from '@/shared/components/empty';
import { provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';
import { forkJoin, map, switchMap } from 'rxjs';
import { ActionsCell } from './components/actions-cell/actions-cell';
import { FotoCell } from '@/shared/table/components/foto-cell/foto-cell';
import { useColaboradoresQuery } from '@/core/queries/gestor.queries';
import { ZardLoaderComponent } from '@/shared/components/loader';

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
  selector: 'app-gestor-equipe',
  imports: [Table, ZardEmptyComponent,ZardLoaderComponent],
  templateUrl: './gestor-equipe.html',
  styleUrl: './gestor-equipe.css',
  viewProviders: [
    provideIcons({
      lucideUsers,
    }),
  ],
})
export class GestorEquipe {
  private gestorService = inject(GestorService);
  private authService = inject(AuthService);

  myId = this.authService.getUser()?.vinculo?.id ?? '';
  columns = columns;
  colaboradores = signal<ColaboradoreComHistorico[]>([]);
  loading = signal(true);

  private user = this.authService.getUser()!;
  private empresaId = this.user.vinculo.empresaId;
  private setor = this.user.vinculo.setor ?? '';

 colaboradoresQuery = useColaboradoresQuery(this.empresaId,this.setor);
}
