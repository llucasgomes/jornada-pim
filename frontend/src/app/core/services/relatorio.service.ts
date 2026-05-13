import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/relatorio`;

  /**
   * Baixa o PDF do cartão de ponto de um colaborador específico.
   * GET /relatorio/:userId
   */
  downloadRelatorioPorUsuario(userId: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${userId}`, {
        responseType: 'blob',
      })
      .pipe(tap((blob) => this.triggerDownload(blob, `relatorio-ponto-${userId}.pdf`)));
  }

  /**
   * Baixa o PDF do cartão de ponto de todos os colaboradores ativos.
   * POST /relatorio/allActives
   */
  downloadRelatorioTodos(mes?: string, setor?: string): Observable<Blob> {
    const body: { mes?: string; setor?: string } = {};
    if (mes) body.mes = mes;
    if (setor) body.setor = setor;

    return this.http
      .post(`${this.apiUrl}/allActives`, body, {
        responseType: 'blob',
      })
      .pipe(tap((blob) => this.triggerDownload(blob, `relatorio-ponto-todos.pdf`)));
  }

  /**
   * Cria um link temporário para forçar o download do blob como arquivo PDF.
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
