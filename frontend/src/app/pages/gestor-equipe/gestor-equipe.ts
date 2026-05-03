import { Component, inject, signal } from '@angular/core';
import { ColumnDef } from '@tanstack/angular-table';
import { Table } from "@/shared/table/table";
import { UsuarioEmpresa } from '@/core/models/interfaces';
import { GestorService } from '@/core/services/gestor.service';
import { AuthService } from '@/core/services/auth.service';
import { ZardEmptyComponent } from "@/shared/components/empty";
import { provideIcons } from '@ng-icons/core';
import { lucideFolderCode, lucideUsers } from '@ng-icons/lucide';





const columns: ColumnDef<UsuarioEmpresa>[] = [
  {
    accessorKey: 'matricula',
    header: 'Matrícula',
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

  columns = columns;
  colaboradores = signal<UsuarioEmpresa[]>([]);
  loading = signal(true);

  ngOnInit() {
    const user = this.authService.getUser()!;
    const empresaId = user.vinculo.empresaId;
    const setor = user.vinculo.setor ?? '';

    this.gestorService.listarColaboradoresPorSetor(empresaId, setor).subscribe({
      next: (data: any) => {
        this.colaboradores.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
