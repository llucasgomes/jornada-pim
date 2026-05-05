import { Component, effect, input, signal } from '@angular/core';
import {
  ColumnDef,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
} from '@tanstack/angular-table';

import { NgIcon } from '@ng-icons/core';
import { ZardTableImports } from '../components/table';

@Component({
  selector: 'app-table',
  imports: [ZardTableImports, FlexRenderDirective],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  data = input.required<any[]>();
  columns = input.required<ColumnDef<any>[]>();
  paginate = input<boolean>(false);
  pageSize = input<number>(10);

  sorting = signal<SortingState>([]);

  // 1. Crie o sinal de paginação
  pagination = signal<PaginationState>({
    pageIndex: 0,
    pageSize: 10, // valor inicial
  });

  // 2. Opcional: Efeito para atualizar o pageSize se o input mudar
  constructor() {
    // Sincroniza o pageSize apenas se o input mudar externamente
    effect(
      () => {
        this.pagination.update((prev) => ({
          ...prev,
          pageSize: this.pageSize(),
        }));
      },
      { allowSignalWrites: true },
    );
  }

  table = createAngularTable(() => ({
    data: this.data(),
    columns: this.columns(),
    autoResetPageIndex: false, // Impede que a tabela volte para a página 1 sempre que 'data' muda
    state: {
      sorting: this.sorting(),
      pagination: this.pagination(), // 3. Use o sinal aqui
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(this.sorting()) : updater;
      this.sorting.set(next);
    },
    // 4. Adicione o handler de mudança de paginação
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(this.pagination()) : updater;
      this.pagination.set(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  }));
}
