import { Component } from '@angular/core';
import { Layout } from "@/shared/layout-root/layout-root";
import { provideIcons } from '@ng-icons/core';
import { lucideFile, lucideFolder, lucideGalleryVertical, lucideUsers } from '@ng-icons/lucide';
import { MenuLayout } from '@/core/types';

@Component({
  selector: 'app-administrador',
  imports: [Layout],
  templateUrl: './administrador.html',
  styleUrl: './administrador.css',
  viewProviders: [
    provideIcons({
      lucideFolder,
      lucideUsers,
      lucideGalleryVertical,
      lucideFile,
    }),
  ],
})
export class Administrador {
  MenuAdministrador: MenuLayout[] = [
    {
      label: 'Equipe',
      icon: 'lucideUsers',
      path: '/gestor/sectors',
    },
    {
      label: 'Historico e RH',
      icon: 'lucideUsers',
      path: '/gestor/sectors',
    },
    {
      label: 'Escalas e Setores',
      icon: 'lucideGalleryVertical',
      path: '/gestor/sectors',
    },
    {
      label: 'Relatorios PDF',
      icon: 'lucideFile',
      path: '/supervisor/sectors',
    },
  ];
}
