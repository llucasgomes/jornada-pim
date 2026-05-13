import { inject } from '@angular/core';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { RhService } from '@/core/services/rh.service';
import { SetorService, CriarSetorPayload, AtualizarSetorPayload } from '@/core/services/setor.service';
import { lastValueFrom, forkJoin } from 'rxjs';

export function useColaboradoresQuery(empresaId: string) {
  const rhService = inject(RhService);

  return injectQuery(() => ({
    queryKey: ['colaboradores', empresaId],
    refetchInterval: 10000,
    queryFn: async () => {
      const colaboradores = await lastValueFrom(rhService.listarColaboradores(empresaId));

      const enriquecidosPromises = colaboradores.map(async (c) => {
        const detalhes = await lastValueFrom(
          forkJoin({
            usuario: rhService.getColaboradorPeloId(c.id),
            historico: rhService.getHistoricoDoColaboradorNaEmpresa(c.id),
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

export  function useDesligarColaboradorMutation(empresaId: string) {
  const rhService = inject(RhService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(rhService.desligarColaborador(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores', empresaId] });
    },
  }));
}

export  function useAtualizarColaboradorMutation(empresaId: string) {
 const rhService = inject(RhService);
 const queryClient = inject(QueryClient);

 return injectMutation(() => ({
   mutationFn: ({
     id,
     dados,
   }: {
     id: string;
     dados: Partial<{
       nome: string;
       perfil: string;
       cargo: string;
       setor: string;
       turno: string;
       horarioEntrada: string;
       horarioSaida: string;
       cargaHorariaDia: number;
       imageUrl: string; // ← adicionado
     }>;
   }) => lastValueFrom(rhService.atualizarVinculo(id, dados)),

   onSuccess: () => {
     // Importante: usamos o empresaId que foi passado na criação
     if (empresaId) {
       queryClient.invalidateQueries({ queryKey: ['colaboradores', empresaId] });
     }
   },
 }));
}

export function useListarSetoresDaEmpresaQuery(empresaId:string){
  const rhService = inject(RhService);


  return injectQuery(() => ({
    queryKey: ['setores', empresaId],
    queryFn: async () => {
      const setores = await lastValueFrom(rhService.listarSetores(empresaId));
      return setores;
    },
  }));
}

// ─── Setor Mutations ─────────────────────────────────────────────────────────

export function useCriarSetorMutation(empresaId: string) {
  const setorService = inject(SetorService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (payload: CriarSetorPayload) =>
      lastValueFrom(setorService.criar(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setores', empresaId] });
    },
  }));
}

export function useAtualizarSetorMutation(empresaId: string) {
  const setorService = inject(SetorService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: ({ id, dados }: { id: string; dados: AtualizarSetorPayload }) =>
      lastValueFrom(setorService.atualizar(id, dados)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setores', empresaId] });
    },
  }));
}

export function useDeletarSetorMutation(empresaId: string) {
  const setorService = inject(SetorService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(setorService.deletar(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setores', empresaId] });
    },
  }));
}
