
import { Component, inject } from '@angular/core';
import { ZardButtonComponent } from "../button/button.component";
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-button-logout',
  imports: [ZardButtonComponent],
  templateUrl: './button-logout.html',
  styleUrl: './button-logout.css',
})
export class ButtonLogout {
  private auth  = inject(AuthService)

  logout(){
    this.auth.logout()
  }
}
