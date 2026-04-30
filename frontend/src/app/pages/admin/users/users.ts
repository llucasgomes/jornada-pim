import { Perfil, Turno, User } from '@/core/models/interfaces';
import { UploadService } from '@/core/services/upload';
import { UserService } from '@/core/services/user.service';
import { UploadImage } from '@/shared/components/upload-image/upload-image';

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [FormsModule, UploadImage],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  @ViewChild('uploadImage') uploadImage!: UploadImage;

  users = signal<User[]>([]);
  filtered = signal<User[]>([]);
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  modalError = signal('');
  editingUser = signal<User | null>(null);
  searchTerm = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  form: any = this.emptyForm();

  constructor(
    private userService: UserService,
    private uploadService: UploadService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.findAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.filterUsers();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setFilter(status: 'all' | 'active' | 'inactive') {
    this.filterStatus = status;
    this.filterUsers();
  }

  filterUsers() {
    let list = this.users();

    if (this.filterStatus === 'active') list = list.filter((u) => u.ativo);
    else if (this.filterStatus === 'inactive') list = list.filter((u) => !u.ativo);

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(
        (u) => u.nome.toLowerCase().includes(term) || u.matricula.toLowerCase().includes(term),
      );
    }

    this.filtered.set(list);
  }

  openModal() {
    this.editingUser.set(null);
    this.form = this.emptyForm();
    this.modalError.set('');
    this.showModal.set(true);
  }

  editUser(user: User) {
    this.editingUser.set(user);
    this.form = {
      nome: user.nome,
      // matricula: user.matricula,
      senha: '',
      perfil: user.perfil,
      cargo: user.cargo || '',
      setor: user.setor || '',
      turno: user.turno || '',
      carga_horaria_dia: user.carga_horaria_dia || null,
      horario_entrada: user.horario_entrada || '',
      horario_saida: user.horario_saida || '',
      imageUrl: user.imageUrl || '',
    };
    this.modalError.set('');
    this.showModal.set(true);

    // 👉 AQUI está o segredo
    setTimeout(() => {
      this.uploadImage?.setPreviewFromUrl(user.imageUrl || null);
    });
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveUser() {
    this.saving.set(true);
    this.modalError.set('');

    if (!this.form.nome || !this.form.senha) {
      this.modalError.set('Nome e senha são obrigatórios');
      this.saving.set(false);
      return;
    }

    const payload: any = { ...this.form };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === null) delete payload[k];
    });

    const imageFile = this.uploadImage?.getFile();

    // 👉 SE TEM IMAGEM → UPLOAD PRIMEIRO
    if (imageFile) {
      this.uploadService.uploadImage(imageFile).subscribe({
        next: (res) => {
          payload.imageUrl = res.url;

          this.userService.create(payload).subscribe({
            next: () => {
              this.saving.set(false);
              this.closeModal();
              this.loadUsers();
            },
            error: (err) => {
              this.saving.set(false);
              this.modalError.set(err.error?.message || 'Erro ao criar usuário');
            },
          });
        },
        error: () => {
          this.saving.set(false);
          this.modalError.set('Erro ao fazer upload da imagem');
        },
      });
    } else {
      // 👉 SEM IMAGEM → CRIA DIRETO
      this.userService.create(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.saving.set(false);
          this.modalError.set(err.error?.message || 'Erro ao criar usuário');
        },
      });
    }
  }

  disableUser(user: User) {
    if (!confirm(`Desativar ${user.nome}?`)) return;
    this.userService.disable(user.matricula).subscribe({
      next: () => this.loadUsers(),
      error: () => {},
    });
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
  }

  perfilBadge(perfil: Perfil): string {
    const map: Record<string, string> = {
      rh: 'badge-danger',
      gestor: 'badge-warning',
      colaborador: 'badge-info',
    };
    return map[perfil] || 'badge-info';
  }

  private emptyForm() {
    return {
      nome: '',
      // matricula: '',
      senha: '',
      perfil: 'colaborador' as Perfil,
      cargo: '',
      setor: '',
      turno: '' as Turno | '',
      carga_horaria_dia: null as number | null,
      horario_entrada: '',
      horario_saida: '',
    };
  }
}
