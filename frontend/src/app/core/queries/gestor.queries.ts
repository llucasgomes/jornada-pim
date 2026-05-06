import { inject } from '@angular/core';
import { injectQuery} from '@tanstack/angular-query-experimental';
import { RhService } from '@/core/services/rh.service';
import { lastValueFrom, forkJoin } from 'rxjs';
import { GestorService } from '../services/gestor.service';

export function useColaboradoresQuery(empresaId: string, setor?: string) {
  const gestorService = inject(GestorService);

  return injectQuery(() => ({
    queryKey: ['colaboradores', empresaId, setor],
    refetchInterval: 10000,
    queryFn: async () => {
      const colaboradores = await lastValueFrom(gestorService.listarColaboradoresPorSetor(empresaId,setor!));

      const enriquecidosPromises = colaboradores.map(async (c) => {
        const detalhes = await lastValueFrom(
          forkJoin({
            usuario: gestorService.getColaboradorPeloId(c.usuarioId),
            historico: gestorService.getHistoricoDoColaboradorNaEmpresa(c.id),
          }),
        );
        return {
          ...c,
          nome: detalhes.usuario.nome,
          foto: detalhes.usuario.imageUrl,
          historico: detalhes.historico,
        };
      });

      return Promise.all(enriquecidosPromises);
    },
  }));
}

