import { Api } from '@/core/services/api.service';
import { AuthService } from '@/core/services/auth.service';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/shared/components/form';
import { ZardInputDirective } from '@/shared/components/input';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

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

  private formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  protected readonly loginForm = new FormGroup({
    cpf: new FormControl('', [Validators.required, Validators.minLength(11)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loginAuth() {
    if (this.isclicked()) return;

    this.isclicked.set(true); // desabilitar o botão
    this.showError.set(false);
    this.errorMessage.set('');

    const credentials = {
      cpf: this.formatCPF(this.loginForm.value.cpf ?? ''),
      senha: this.loginForm.value.password ?? '',
    };

    this.ApiService.login(credentials).subscribe({
      next: (response: any) => {
        // A API retorna: { message: string, token: string }
        // Verifica se tem token válido
        if (response.token) {
          this.auth.login(response.token);
          const perfil = this.auth.getPerfil();

          this.router.navigate([perfil]);
          toast.success("Login efetuado com sucesso")

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
          toast.error('Matricula ou senha incorretos', {});

        } else if (error.status === 0) {
          this.showError.set(true);
           toast.error('Erro de conexão. Verifique se o servidor está rodando.', {
             description: 'Verifique sua conexão e tente novamente.',
           });


        } else {
          this.showError.set(true);
          this.errorMessage.set(error.error?.message || 'Erro ao fazer login');
           toast.error('Erro ao fazer login', {});
        }
      },
    });
  }
}
