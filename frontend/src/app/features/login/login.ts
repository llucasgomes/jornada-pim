import { AuthService } from '@/core/services/auth.service';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  matricula = '';
  senha = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService) {}

  onLogin() {
    if (!this.matricula || !this.senha) {
      this.error.set('Preencha todos os campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({ matricula: this.matricula, senha: this.senha }).subscribe({
      next: (res) => {
        this.authService.handleLoginSuccess(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erro ao fazer login');
      },
    });
  }
}
