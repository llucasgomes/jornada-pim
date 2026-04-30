import { Component } from '@angular/core';
import { HeaderComponent } from "@/shared/components/layout";

@Component({
  selector: 'app-header',
  imports: [HeaderComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
