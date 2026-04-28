import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, signal, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCamera, lucideUpload, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-upload-image',
  imports: [NgIcon],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css',
  viewProviders: [provideIcons({ lucideUpload, lucideCamera, lucideX })],
})
export class UploadImage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isDragging = signal(false);

  @Output() fileChange = new EventEmitter<File | null>();

  private http = inject(HttpClient);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.setFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  setPreviewFromUrl(url: string | null) {
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }

    this.selectedFile.set(null);
    this.previewUrl.set(url);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) this.setFile(file);
  }

  removeFile() {
    if (this.previewUrl()) URL.revokeObjectURL(this.previewUrl()!);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.fileInput.nativeElement.value = '';
    this.fileChange.emit(null);
  }

  onUpload() {
    const file = this.selectedFile();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post('http://localhost:3000/upload', formData).subscribe({
      next: (res) => console.log('Upload success!', res),
      error: (err) => console.error('Upload error', err),
    });
  }

  getFile(): File | null {
    return this.selectedFile();
  }

  private setFile(file: File) {
    if (this.previewUrl()) URL.revokeObjectURL(this.previewUrl()!);
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
    this.fileChange.emit(file);
  }
}
