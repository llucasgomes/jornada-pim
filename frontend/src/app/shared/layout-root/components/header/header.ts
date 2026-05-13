import { Component } from '@angular/core';
import { HeaderComponent } from "@/shared/components/layout";
import { ToggleThemes } from "@/shared/components/toggle-themes/toggle-themes";

@Component({
  selector: 'app-header',
  imports: [HeaderComponent, ToggleThemes],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
