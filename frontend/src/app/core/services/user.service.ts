import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import type { User, CreateUser } from '../models/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

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
    return this.http.post<CreateUser>(`${this.apiUrl}/register`, data);
  }

  update(matricula: string, data: Partial<CreateUser>) {
    return this.http.put<User>(`${this.apiUrl}/${matricula}`, data);
  }

  disable(matricula: string) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/disable/${matricula}`, {});
  }
}
