import { ColaboradoreComHistorico } from '@/core/models/interfaces';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { UploadImage } from '@/shared/components/upload-image/upload-image';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { DatePipe, DecimalPipe } from '@angular/common';
import { form, FormField, required, schema, submit } from '@angular/forms/signals';
import { ZardDividerComponent } from '@/shared/components/divider';

type PerfilType = 'colaborador' | 'gestor' | 'rh' | 'administrador';
type TurnoType = '1 turno' | '2 turno' | '3 turno' | 'Comercial' | 'Especial';

interface ColaboradorFormModel {
  imageUrl: File | null | string;
  nome: string;
  perfil: PerfilType;
  cargo: string;
  setor: string;
  turno: TurnoType | '';
  horarioEntrada: string;
  horarioSaida: string;
  cargaHorariaDia: string;
}

@Component({
  selector: 'app-criar-colaborador',
  imports: [
    UploadImage,
    ZardInputDirective,
    ZardSelectImports,
    DatePipe,
    FormField,
    ZardDividerComponent,
    DecimalPipe,
  ],
  templateUrl: './criar-colaborador.html',
  styleUrl: './criar-colaborador.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriarColaborador {
  @ViewChild('uploadImage') uploadImage!: UploadImage;

  colaborador: ColaboradoreComHistorico = inject(Z_MODAL_DATA);
  arquivoSelecionado = signal<File | null>(null);

  readonly turnos: TurnoType[] = ['1 turno', '2 turno', '3 turno', 'Comercial', 'Especial'];
  readonly perfis: PerfilType[] = ['colaborador', 'gestor', 'rh', 'administrador'];

  // 1. Signal com estado inicial
  colaboradorModel = signal<ColaboradorFormModel>({
    imageUrl: this.colaborador.foto ?? '',
    nome: this.colaborador.nome ?? '',
    perfil: (this.colaborador.perfil ?? 'colaborador') as PerfilType,
    cargo: this.colaborador.cargo ?? '',
    setor: this.colaborador.setor ?? '',
    turno: (this.colaborador.turno ?? '') as TurnoType,
    horarioEntrada: this.colaborador.horarioEntrada ?? '',
    horarioSaida: this.colaborador.horarioSaida ?? '',
    cargaHorariaDia: String(this.colaborador.cargaHorariaDia) ?? 480,
  });

  // 2. Signal Form com schema de validação
  colaboradorForm = form(this.colaboradorModel, (path) => {
    required(path.nome, { message: 'Nome é obrigatório.' });
    required(path.perfil, { message: 'Perfil é obrigatório.' });
    required(path.cargo, { message: 'Cargo é obrigatório.' });
    required(path.setor, { message: 'Setor é obrigatório.' });
    required(path.horarioEntrada, { message: 'Hora de Entrada é obrigatório.' });
    required(path.horarioSaida, { message: 'Hora de Saida é obrigatório.' });
  });

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.colaborador.foto && this.uploadImage) {
        this.uploadImage.setPreviewFromUrl(this.colaborador.foto);
      }
    }, 0);
  }

  onFileChange(file: File | null) {
    this.arquivoSelecionado.set(file);
  }

  // campos alterados — compara form atual vs dados originais
  camposAlterados = computed(() => {
    const atual = {
      imageUrl: this.colaborador.foto ?? '',
      nome: this.colaboradorForm.nome().value(),
      perfil: this.colaboradorForm.perfil().value(),
      cargo: this.colaboradorForm.cargo().value(),
      setor: this.colaboradorForm.setor().value(),
      turno: this.colaboradorForm.turno().value(),
      horarioEntrada: this.colaboradorForm.horarioEntrada().value(),
      horarioSaida: this.colaboradorForm.horarioSaida().value(),
      cargaHorariaDia: Number(this.colaboradorForm.cargaHorariaDia().value()),
    };

    const original = {
      imageUrl: this.colaborador.foto ?? '',
      nome: this.colaborador.nome ?? '',
      perfil: (this.colaborador.perfil ?? 'colaborador') as PerfilType,
      cargo: this.colaborador.cargo ?? '',
      setor: this.colaborador.setor ?? '',
      turno: (this.colaborador.turno ?? '') as TurnoType,
      horarioEntrada: this.colaborador.horarioEntrada ?? '',
      horarioSaida: this.colaborador.horarioSaida ?? '',
      cargaHorariaDia: String(this.colaborador.cargaHorariaDia) ?? 480,
    };

    const diff: Partial<typeof atual> = {};

    for (const key of Object.keys(atual) as (keyof typeof atual)[]) {
      if (String(atual[key]) !== String(original[key])) {
        (diff as any)[key] = atual[key];
      }
    }

    return diff;
  });

  temAlteracoes = computed(() => Object.keys(this.camposAlterados()).length > 0);

  // Lê os valores para salvar

  atualizar() {
    submit(this.colaboradorForm, async () => {
      const alteracoes = this.camposAlterados();

      if (Object.keys(alteracoes).length === 0) {
        console.log('Nenhuma alteração detectada.');
        return null;
      }

      console.log('Campos alterados:', alteracoes);
      // this.rhService.atualizarVinculo(this.colaborador.id, alteracoes).subscribe(...)

      return null;
    });
  }

  getFormValues() {
    return {
      nome: this.colaboradorForm.nome().value(),
      perfil: this.colaboradorForm.perfil().value(),
      cargo: this.colaboradorForm.cargo().value(),
      setor: this.colaboradorForm.setor().value(),
      turno: this.colaboradorForm.turno().value(),
      horarioEntrada: this.colaboradorForm.horarioEntrada().value(),
      horarioSaida: this.colaboradorForm.horarioSaida().value(),
      cargaHorariaDia: Number(this.colaboradorForm.cargaHorariaDia().value()),
    };
  }

  get cargaEmHoras(): number {
    return Number(this.colaboradorForm.cargaHorariaDia().value()) / 60;
  }
}
