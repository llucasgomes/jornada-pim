import { Api } from '@/core/services/api.service';
import { AuthService } from '@/core/services/auth.service';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/shared/components/form';
import { ZardInputDirective } from '@/shared/components/input';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ZardButtonComponent,
    ZardCardComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
    ReactiveFormsModule,
],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected readonly isLoading = signal(false);
  isclicked = signal<boolean>(false);
  showError = signal<boolean>(false);
  errorMessage = signal<string>('');

  private auth = inject(AuthService);
  private router = inject(Router);
  private ApiService = inject(Api);

  protected readonly loginForm = new FormGroup({
    matricula: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loginAuth() {
    if (this.isclicked()) return;

    this.isclicked.set(true); // desabilitar o botão
    this.showError.set(false);
    this.errorMessage.set('');

    const credentials = {
      matricula: this.loginForm.value.matricula?.toUpperCase() ?? '',
      senha: this.loginForm.value.password ?? '',
    };

    this.ApiService.login(credentials).subscribe({
      next: (response: any) => {
        // A API retorna: { message: string, token: string }
        // Verifica se tem token válido
        if (response.token) {
          this.auth.login(response.token);
          const perfil = this.auth.getPerfil()

          this.router.navigate([perfil]);
          this.isclicked.set(false);

        } else {
          this.isclicked.set(false);
          this.showError.set(true);
          this.errorMessage.set('Resposta inválida do servidor');
        }
      },
      error: (error) => {
        this.isclicked.set(false);

        if (error.status === 401) {
          this.showError.set(true);
          this.errorMessage.set('Matricula ou senha incorretos');
        } else if (error.status === 0) {
          this.showError.set(true);
          this.errorMessage.set('Erro de conexão. Verifique se o servidor está rodando.');
        } else {
          this.showError.set(true);
          this.errorMessage.set(error.error?.message || 'Erro ao fazer login');
        }
      },
    });
  }
}
