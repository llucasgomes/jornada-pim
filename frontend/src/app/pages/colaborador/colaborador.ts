import { Component } from '@angular/core';
import { Layout } from "@/shared/layout-root/layout-root";
import { MenuLayout } from '@/core/types';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronRight,
  lucideChevronsUpDown,
  lucideFolder,
  lucideHouse,
  lucideInbox,
  lucideUser,
} from '@ng-icons/lucide';


@Component({
  selector: 'app-colaborador',
  imports: [Layout],
  templateUrl: './colaborador.html',
  styleUrl: './colaborador.css',
  viewProviders: [
    provideIcons({
      lucideHouse,
      lucideInbox,
      lucideFolder,
      lucideChevronRight,
      lucideChevronsUpDown,
      lucideUser,
    }),
  ],
})
export class Colaborador {
  MenuColaborador: MenuLayout[] = [
    {
      label: 'Meu Ponto',
      icon: 'lucideFolder',
      path: '/supervisor/dashboard',
    },
    {
      label: 'Histórico',
      icon: 'lucideFolder',
      path: '/supervisor/sectors',
    },
  ];
}
