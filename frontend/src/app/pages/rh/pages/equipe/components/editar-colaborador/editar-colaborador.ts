import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-editar-colaborador',
  imports: [],
  templateUrl: './editar-colaborador.html',
  styleUrl: './editar-colaborador.css',
})
export class EditarColaborador {
  private fb = inject(FormBuilder);
  data = inject(Z_MODAL_DATA); // Dados vindos do serviço

  // PRECISA SER PUBLIC PARA O DIALOG ACESSAR
  public form = this.fb.group({
    nome: ['', Validators.required],
    cargo: [''],
    setor: [''],
    // ... outros campos
  });

  ngOnInit() {
    this.form.patchValue(this.data); // Preenche o form com os dados recebidos
  }
}
