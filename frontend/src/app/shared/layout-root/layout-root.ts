import { Component, Input, signal } from '@angular/core';
import {
  FooterComponent,
  LayoutComponent,
  HeaderComponent,
  SidebarComponent,
  SidebarGroupComponent,
  SidebarGroupLabelComponent,
  ContentComponent,
} from '../components/layout';

import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuLayout } from '@/core/types';
import { NgIcon } from '@ng-icons/core';
import { ZardButtonComponent } from '../components/button';

import { ZardAvatarComponent } from '../components/avatar';
import { ZardDividerComponent } from '../components/divider';
import { ZardMenuImports } from '../components/menu';
import { ButtonLogout } from '../components/button-logout/button-logout';
import { CardUser } from "./components/card-user/card-user";
import { Footer } from "./components/footer/footer";
import { Header } from "./components/header/header";

@Component({
  selector: 'app-layout',
  imports: [
    LayoutComponent,
    SidebarComponent,
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    ContentComponent,
    RouterLink,
    RouterOutlet,
    NgIcon,
    ZardButtonComponent,
    ZardMenuImports,
    CardUser,
    Footer,
    Header
],
  templateUrl: './layout-root.html',
  styleUrl: './layout-root.css',
})
export class Layout {
  @Input() menu: MenuLayout[] = {} as MenuLayout[];
  readonly sidebarCollapsed = signal(false);

  onCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }
}
