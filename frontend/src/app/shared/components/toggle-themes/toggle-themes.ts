import { ZardDarkMode } from '@/shared/themes';
import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { ZardButtonComponent } from "../button";
import { lucideMoon, lucideSun } from '@ng-icons/lucide';

@Component({
  selector: 'app-toggle-themes',
  imports: [NgIcon, ZardButtonComponent],
  templateUrl: './toggle-themes.html',
  styleUrl: './toggle-themes.css',
  viewProviders: [
    provideIcons({
      lucideSun,
      lucideMoon,
    }),
  ],
})
export class ToggleThemes {
  private readonly darkModeService = inject(ZardDarkMode);

  icon = computed(() => (this.darkModeService.themeMode() === 'dark' ? 'lucideSun' : 'lucideMoon'));

  toggleTheme(): void {
    this.darkModeService.toggleTheme();
  }
}
