import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RelatorioService } from '@/core/services/relatorio.service';
import { RhService } from '@/core/services/rh.service';
import { AuthService } from '@/core/services/auth.service';
import { SetorEmpresa } from '@/core/models/interfaces';

@Component({
  selector: 'app-relatorio',
  imports: [FormsModule],
  templateUrl: './relatorio.html',
})
export class Relatorio {
  private relatorioService = inject(RelatorioService);
  private rhService = inject(RhService);
  private authService = inject(AuthService);

  private user = this.authService.getUser()!;
  private empresaId = this.user.vinculo.empresaId;

  dataInicio = '';
  dataFim = '';
  setorSelecionado = '';
  setores: SetorEmpresa[] = [];
  exportando = false;
  mensagem = '';

  ngOnInit() {
    this.rhService.listarSetores(this.empresaId).subscribe({
      next: (data) => (this.setores = data),
    });
  }

  exportarPdf() {
    this.exportando = true;
    this.mensagem = '';

    const mes = this.dataInicio ? this.dataInicio.substring(0, 7) : undefined;
    const setor = this.setorSelecionado || undefined;

    this.relatorioService.downloadRelatorioTodos(mes, setor).subscribe({
      next: () => {
        this.exportando = false;
        this.mensagem = 'PDF exportado com sucesso!';
      },
      error: () => {
        this.exportando = false;
        this.mensagem = 'Erro ao gerar PDF.';
      },
    });
  }
}
