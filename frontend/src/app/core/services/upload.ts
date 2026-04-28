import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

interface UploadResponse {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly uploadUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();

    // ⚠️ "file" precisa ser o mesmo nome que o backend espera
    formData.append('file', file);

    return this.http.post<UploadResponse>(this.uploadUrl, formData);
  }
}
