import { Component } from '@angular/core';
import { Layout } from "@/shared/layout-root/layout-root";
import { MenuLayout } from '@/core/types';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucideChevronsUpDown, lucideFile, lucideFileArchive, lucideFolder, lucideGalleryVertical, lucideHouse, lucideInbox, lucideLayout, lucideUser, lucideUserRound, lucideUserRoundCog, lucideUsers } from '@ng-icons/lucide';

@Component({
  selector: 'app-gestor',
  imports: [Layout],
  templateUrl: './gestor.html',
  styleUrl: './gestor.css',
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
export class Gestor {
  MenuGestor: MenuLayout[] = [
    {
      label: 'Home',
      icon: 'lucideLayout',
      path: '/gestor/',
    },
    {
      label: 'Equipe',
      icon: 'lucideUsers',
      path: '/gestor/equipe',
    },
    // {
    //   label: 'Historico e RH',
    //   icon: 'lucideUsers',
    //   path: '/gestor/history-and-rh',
    // },
    // {
    //   label: 'Escalas e Setores',
    //   icon: 'lucideGalleryVertical',
    //   path: '/gestor/sectors-and-schedules',
    // },
    // {
    //   label: 'Relatorios PDF',
    //   icon: 'lucideFile',
    //   path: '/gestor/reports',
    // },
  ];
}
