import { db } from "@/config/database";
import { usuario, usuarioEmpresa } from "@/database/schemas/sqlite";
import { and, eq } from "drizzle-orm";

export const cartaoDePontoPdfRepository = {
  async findActiveBySetor(setor: string) {
    return db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        imageUrl: usuario.imageUrl,
        ativo: usuario.ativo,
        // campos do vínculo
        vinculoId: usuarioEmpresa.id,
        matricula: usuarioEmpresa.matricula,
        cargo: usuarioEmpresa.cargo,
        setor: usuarioEmpresa.setor,
        perfil: usuarioEmpresa.perfil,
        turno: usuarioEmpresa.turno,
        cargaHorariaDia: usuarioEmpresa.cargaHorariaDia,
        horarioEntrada: usuarioEmpresa.horarioEntrada,
        horarioSaida: usuarioEmpresa.horarioSaida,
      })
      .from(usuario)
      .innerJoin(usuarioEmpresa, eq(usuarioEmpresa.usuarioId, usuario.id))
      .where(
        and(
          eq(usuario.ativo, true),
          eq(usuarioEmpresa.ativo, true),
          eq(usuarioEmpresa.setor, setor),
        ),
      );
  },
};
