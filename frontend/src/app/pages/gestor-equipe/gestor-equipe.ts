import { Component, inject, signal } from '@angular/core';
import { ColumnDef, FlexRenderComponent } from '@tanstack/angular-table';
import { Table } from '@/shared/table/table';
import { UsuarioEmpresaEnriquecido } from '@/core/models/interfaces';
import { GestorService } from '@/core/services/gestor.service';
import { AuthService } from '@/core/services/auth.service';
import { ZardEmptyComponent } from '@/shared/components/empty';
import { provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';
import { forkJoin, map, switchMap } from 'rxjs';
import { ZardAvatarComponent } from '@/shared/components/avatar';
import { ActionsCell } from './components/actions-cell/actions-cell';

const columns: ColumnDef<UsuarioEmpresaEnriquecido>[] = [
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
      return `
        <div class="flex items-center gap-2">
          <img
            src="${foto}"
            alt="${nome}"
            class="size-8 rounded-full object-cover bg-muted"
            onerror="this.style.display='none'"
          />
        </div>
      `;
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
      }),
  },
];

@Component({
  selector: 'app-gestor-equipe',
  imports: [Table, ZardEmptyComponent],
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
  colaboradores = signal<UsuarioEmpresaEnriquecido[]>([]);
  loading = signal(true);

  ngOnInit() {
    const user = this.authService.getUser()!;
    const empresaId = user.vinculo.empresaId;
    const setor = user.vinculo.setor ?? '';

    this.gestorService
      .listarColaboradoresPorSetor(empresaId, setor)
      .pipe(
        switchMap((data) => {
          const semMim = data.filter((c) => c.id !== this.myId);
          return forkJoin(
            semMim.map((c) =>
              this.gestorService.getColaboradorPeloId(c.usuarioId).pipe(
                map((usuario) => ({
                  ...c,
                  nome: usuario.nome,
                  foto: usuario.imageUrl ?? null,
                })),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (data) => {
          console.log('Colaboradores enriquecidos:', data);
          this.colaboradores.set(data as UsuarioEmpresaEnriquecido[]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
