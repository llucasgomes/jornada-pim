import { Component, EventEmitter, inject, Input, Output, Signal, signal } from '@angular/core';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { ZardDividerComponent } from "@/shared/components/divider";
import { ZardAvatarComponent } from "@/shared/components/avatar";
import { ZardMenuImports } from '@/shared/components/menu';
import { lucideChevronsUpDown, lucideLogOut, lucideSettings, lucideUser } from '@ng-icons/lucide';
import { AuthService, StoredUser } from '@/core/services/auth.service';
import { User } from '@/core/models/interfaces';

@Component({
  selector: 'app-card-user',
  imports: [NgIcon, ZardDividerComponent, ZardAvatarComponent, ZardMenuImports],
  templateUrl: './card-user.html',
  styleUrl: './card-user.css',
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideChevronsUpDown,
      lucideSettings,
      lucideLogOut,
    }),
  ],
})
export class CardUser {
  @Input() sidebarCollapsed!: Signal<boolean>;
  @Output() collapsed = new EventEmitter<boolean>();

  private auth = inject(AuthService);

  user: StoredUser = this.auth.getUser()!;

  parts = this.user.nome.split(' ');
  firstName = this.parts[0];
  lastName = this.parts[this.parts.length - 1];
  name = this.firstName + ' ' + this.lastName;

  logout() {
    this.auth.logout();
  }
}
