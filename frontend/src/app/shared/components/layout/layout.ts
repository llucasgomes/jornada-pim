import { AuthService } from "@/core/services/auth.service";
import { Component, computed, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private authService = inject(AuthService);

  perfil = this.authService.perfil;
  userName = computed(() => this.authService.currentUser()?.nome || '');
  userInitials = computed(() => {
    const name = this.userName();
    if (!name) return '?';
    const parts = name.split(' ');
    return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
  });

  isColaborador = computed(() => this.perfil() === 'colaborador');
  isAdmin = computed(() => this.perfil() === 'gestor' || this.perfil() === 'rh');

  roleBadgeClass = computed(() => {
    const p = this.perfil();
    if (p === 'rh') return 'badge-danger';
    if (p === 'gestor') return 'badge-warning';
    return 'badge-info';
  });

  onLogout() {
    this.authService.logout();
  }
}
