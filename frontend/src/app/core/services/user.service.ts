import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

import type { User, CreateUser } from '../models/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;
  private readonly uploadUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  findAllActive() {
    return this.http.get<User[]>(`${this.apiUrl}/findAllActive`);
  }

  findAllInactive() {
    return this.http.get<User[]>(`${this.apiUrl}/findAllInactive`);
  }

  findByMatricula(matricula: string) {
    return this.http.get<User>(`${this.apiUrl}/${matricula}`);
  }

  create(data: CreateUser) {
    // Se não houver arquivo, enviar diretamente como JSON
    if (!data.imageFile) {
      return this.http.post<CreateUser>(`${this.apiUrl}/register`, data);
    }

    // Se houver arquivo, primeiro faz upload e depois cria o usuário
    const formData = new FormData();
    formData.append('file', data.imageFile);

    return this.http.post<{ url: string }>(this.uploadUrl, formData).pipe(
      switchMap((response) => {
        // Criar payload com a URL da imagem (sem o arquivo)
        const userData = {
          nome: data.nome,
          senha: data.senha,
          perfil: data.perfil,
          cargo: data.cargo,
          setor: data.setor,
          turno: data.turno,
          carga_horaria_dia: data.carga_horaria_dia,
          horario_entrada: data.horario_entrada,
          horario_saida: data.horario_saida,
          ativo: data.ativo,
          imageUrl: response.url,
        };
        return this.http.post<CreateUser>(`${this.apiUrl}/register`, userData);
      })
    );
  }

  update(matricula: string, data: Partial<CreateUser>) {
    return this.http.put<User>(`${this.apiUrl}/${matricula}`, data);
  }

  disable(matricula: string) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/disable/${matricula}`, {});
  }
}
