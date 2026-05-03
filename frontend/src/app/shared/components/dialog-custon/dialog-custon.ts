import { ChangeDetectionStrategy, Component, inject, input, output, Type } from '@angular/core';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [ZardDialogImports],
  templateUrl: './dialog-custon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialogComponent<T = any, U = any> {
  private dialogService = inject(ZardDialogService);

  // inputs obrigatórios
  zTitle = input<string>('');
  zDescription = input<string>('');

  // inputs do conteúdo dinâmico
  zContent = input<Type<T> | undefined>(undefined);
  zData = input<U | undefined>(undefined);

  // inputs dos botões
  zOkText = input<string | null>('Confirmar');
  zCancelText = input<string | null>('Cancelar');
  zOkDestructive = input<boolean>(false);
  zHideFooter = input<boolean>(false);
  zWidth = input<string>('min(480px, calc(100vw - 2rem))');

  // callbacks
  zOnOk = input<(instance: T) => void>(() => {});
  zOnCancel = input<(instance: T) => void>(() => {});

  // evento para o pai saber que abriu
  opened = output<void>();

  open() {
    this.opened.emit();
    this.dialogService.create<T, U>({
      zTitle: this.zTitle(),
      zDescription: this.zDescription(),
      zContent: this.zContent(),
      zData: this.zData(),
      zOkText: this.zOkText(),
      zCancelText: this.zCancelText(),
      zOkDestructive: this.zOkDestructive(),
      zHideFooter: this.zHideFooter(),
      zWidth: this.zWidth(),
      zOnOk: this.zOnOk(),
      zOnCancel: this.zOnCancel(),
    });
  }
}
