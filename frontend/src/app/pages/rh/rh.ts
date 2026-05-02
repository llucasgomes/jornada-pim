import { Component } from '@angular/core';
import { Layout } from "@/shared/layout-root/layout-root";
import { MenuLayout } from '@/core/types';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronRight,
  lucideChevronsUpDown,
  lucideFile,
  lucideFolder,
  lucideGalleryVertical,
  lucideHouse,
  lucideInbox,
  lucideLayout,
  lucideUser,
  lucideUsers,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-rh',
  imports: [Layout],
  templateUrl: './rh.html',
  styleUrl: './rh.css',
  viewProviders: [
    provideIcons({
      lucideChevronRight,
      lucideChevronsUpDown,
      lucideUsers,
      lucideLayout,
      lucideGalleryVertical,
      lucideFile,
    }),
  ],
})
export class Rh {
  MenuRH: MenuLayout[] = [
    {
      label: 'Home',
      icon: 'lucideLayout',
      path: '/rh/',
    },
    {
      label: 'Equipe',
      icon: 'lucideUsers',
      path: '/rh/sectors',
    },
    {
      label: 'Historico e RH',
      icon: 'lucideUsers',
      path: '/rh/sectors',
    },
    {
      label: 'Escalas e Setores',
      icon: 'lucideGalleryVertical',
      path: '/rh/sectors',
    },
    {
      label: 'Relatorios PDF',
      icon: 'lucideFile',
      path: '/rh/sectors',
    },
  ];
}
