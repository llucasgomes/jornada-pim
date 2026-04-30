import { Component } from '@angular/core';
import { FooterComponent } from "@/shared/components/layout";

@Component({
  selector: 'app-footer',
  imports: [FooterComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  year = new Date().getFullYear();
}
