import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ZardToastComponent } from "./shared/components/toast";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ZardToastComponent],
  template: `<router-outlet /> <z-toaster [richColors]="true" />`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class App {}
