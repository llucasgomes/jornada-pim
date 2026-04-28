import { Perfil, Turno, User } from '@/core/models/interfaces';
import { UserService } from '@/core/services/user.service';
import { Component, signal, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UploadImage } from "@/shared/components/upload-image/upload-image";
import { UploadService } from '@/core/services/upload';


@Component({
  selector: 'app-users',
  imports: [FormsModule, UploadImage],
  template: `
    <div class="max-w-[1100px]">
      <header
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top duration-500"
      >
        <div>
          <h1 class="text-3xl font-bold text-white">Gestão de Colaboradores</h1>
          <p class="text-slate-400 text-sm mt-1">{{ users().length }} colaboradores cadastrados</p>
        </div>
        <button class="btn-primary" (click)="openModal()">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Colaborador
        </button>
      </header>

      <!-- Filtros -->
      <div class="card mb-6 animate-in fade-in duration-700" style="animation-delay: 0.1s">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <div class="relative flex-1 w-full">
            <svg
              class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              class="input pl-12 py-2.5"
              placeholder="Buscar por nome ou matrícula..."
              [(ngModel)]="searchTerm"
              name="search"
              (input)="filterUsers()"
            />
          </div>
          <div class="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              [class]="
                filterStatus === 'all'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:text-slate-300'
              "
              (click)="setFilter('all')"
            >
              Todos
            </button>
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              [class]="
                filterStatus === 'active'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:text-slate-300'
              "
              (click)="setFilter('active')"
            >
              Ativos
            </button>
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              [class]="
                filterStatus === 'inactive'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:text-slate-300'
              "
              (click)="setFilter('inactive')"
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div
        class="card p-0 overflow-hidden animate-in fade-in duration-700"
        style="animation-delay: 0.2s"
      >
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <div
              class="w-10 h-10 border-4 border-slate-800 border-t-primary rounded-full animate-spin"
            ></div>
            <p>Carregando colaboradores...</p>
          </div>
        } @else if (filtered().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              class="opacity-20"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p class="text-sm italic">Nenhum colaborador encontrado</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-800/50">
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border"
                  >
                    Colaborador
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border"
                  >
                    Matrícula
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border"
                  >
                    Perfil
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border"
                  >
                    Setor
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border"
                  >
                    Turno
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border text-center"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border text-right"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                @for (user of filtered(); track user.id) {
                  <tr class="hover:bg-primary/5 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        @if (user.imageUrl) {
                          <img
                            [src]="user.imageUrl"
                            [alt]="user.nome"
                            class="w-8 h-8 rounded-lg object-cover"
                          />
                        } @else {
                          <div
                            class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-lg shadow-primary/20"
                          >
                            {{ getInitials(user.nome) }}
                          </div>
                        }
                        <span class="text-sm font-medium text-slate-200">{{ user.nome }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-xs font-mono text-slate-400">{{ user.matricula }}</td>
                    <td class="px-6 py-4">
                      <span class="badge" [class]="perfilBadge(user.perfil)">{{
                        user.perfil
                      }}</span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-400">{{ user.setor || '—' }}</td>
                    <td class="px-6 py-4 text-sm text-slate-400 capitalize">
                      {{ user.turno || '—' }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="badge" [class]="user.ativo ? 'badge-success' : 'badge-danger'">
                        {{ user.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex justify-end gap-2">
                        <button
                          class="p-2 text-slate-400 hover:text-primary-light hover:bg-primary/10 rounded-lg transition-all"
                          (click)="editUser(user)"
                          title="Editar"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        @if (user.ativo) {
                          <button
                            class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            (click)="disableUser(user)"
                            title="Desativar"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
          (click)="closeModal()"
        >
          <div
            class="card w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-2xl border-slate-700/50 animate-in zoom-in-95 duration-300"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-white">
                {{ editingUser() ? 'Editar Colaborador' : 'Novo Colaborador' }}
              </h2>
              <button
                class="p-2 text-slate-500 hover:text-white transition-colors"
                (click)="closeModal()"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form (ngSubmit)="saveUser()" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-2 col-span-2">
                  <div>
                    <label
                      class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                      >Nome Completo *</label
                    >
                    <input
                      class="input"
                      [(ngModel)]="form.nome"
                      name="nome"
                      required
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                  @if (!editingUser()) {
                    <div class="space-y-1.5">
                      <label
                        class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                        >Senha Inicial *</label
                      >
                      <input
                        class="input"
                        type="password"
                        [(ngModel)]="form.senha"
                        name="senha"
                        required
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  }
                </div>
                <app-upload-image #uploadImage></app-upload-image>
                <!-- <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Matrícula *</label>
                  <input class="input" [(ngModel)]="form.matricula" name="matricula" required placeholder="PIM-0000" [disabled]="!!editingUser()" />
                </div> -->
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                    >Perfil de Acesso</label
                  >
                  <select
                    class="input appearance-none cursor-pointer"
                    [(ngModel)]="form.perfil"
                    name="perfil"
                  >
                    <option value="colaborador">Colaborador</option>
                    <option value="gestor">Gestor</option>
                    <option value="rh">RH</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                    >Turno de Trabalho</label
                  >
                  <select
                    class="input appearance-none cursor-pointer"
                    [(ngModel)]="form.turno"
                    name="turno"
                  >
                    <option value="">Nenhum</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                    >Cargo</label
                  >
                  <input
                    class="input"
                    [(ngModel)]="form.cargo"
                    name="cargo"
                    placeholder="Ex: Analista de Produção"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                    >Setor</label
                  >
                  <input
                    class="input"
                    [(ngModel)]="form.setor"
                    name="setor"
                    placeholder="Ex: Montagem"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                    >Horário Entrada</label
                  >
                  <input
                    class="input"
                    [(ngModel)]="form.horario_entrada"
                    name="horario_entrada"
                    placeholder="08:00"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                    >Horário Saída</label
                  >
                  <input
                    class="input"
                    [(ngModel)]="form.horario_saida"
                    name="horario_saida"
                    placeholder="17:00"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1"
                    >Carga Diária (min)</label
                  >
                  <input
                    class="input"
                    type="number"
                    [(ngModel)]="form.carga_horaria_dia"
                    name="carga_horaria_dia"
                    placeholder="480"
                  />
                </div>
              </div>

              @if (modalError()) {
                <div
                  class="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl animate-in shake duration-300"
                >
                  {{ modalError() }}
                </div>
              }

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  class="btn-outline border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                  (click)="closeModal()"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn-primary" [disabled]="saving()">
                  @if (saving()) {
                    <div
                      class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></div>
                  }
                  {{ editingUser() ? 'Salvar Alterações' : 'Cadastrar Colaborador' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class UsersComponent implements OnInit {
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
