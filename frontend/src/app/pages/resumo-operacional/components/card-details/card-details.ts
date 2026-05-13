import { Component, Input, Signal } from '@angular/core';
import { ZardCardComponent } from "@/shared/components/card";

@Component({
  selector: 'app-card-details',
  imports: [ZardCardComponent],
  templateUrl: './card-details.html',
  styleUrl: './card-details.css',
})
export class CardDetails {
  @Input() title!: string;
  @Input() total:number | string | null = 0
}
