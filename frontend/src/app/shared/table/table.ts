import { Component, input, signal } from '@angular/core';
import {
  ColumnDef,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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

  table = createAngularTable(() => ({
    data: this.data(),
    columns: this.columns(),
    state: {
      sorting: this.sorting(),
      pagination: {
        pageIndex: 0,
        pageSize: this.pageSize(),
      },
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(this.sorting()) : updater;
      this.sorting.set(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  }));
}
