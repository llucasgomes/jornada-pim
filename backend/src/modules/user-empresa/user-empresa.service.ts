
import { AppError } from "@/shared/errors/AppError";
import { gerarMatricula } from "@/shared/utils/gerar-matricula";

import { userRepository } from "../user/user.repository";
import { gerarHashSenha } from "@/shared/utils/auth";
import { userEmpresaRepository } from "./user-empresa.repository";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { createUsuarioEmpresaDto } from "./user-empresa.dto";
import { empresaRepository } from "../empresa/empresa.repository";

export const userEmpresaService = {
  async contratar(req: FastifyRequest, reply: FastifyReply) {
    const data = createUsuarioEmpresaDto.parse(req.body);

    // 🔥 1. empresa existe
    const empresa = await empresaRepository.findById(data.empresaId);
    if (!empresa) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // 🔎 2. usuário
    let usuario = await userRepository.findByCpf(data.cpf);

    if (!usuario) {
      const senhaHash = await gerarHashSenha(data.password);

      usuario = await userRepository.create({
        nome: data.nome ?? "Sem nome",
        cpf: data.cpf,
        senha: senhaHash,
        imageUrl: data.imageUrl,
      });
    }

    // 🚨 3. vínculo ativo geral
    const vinculoAtivo = await userEmpresaRepository.findActiveByUser(
      usuario.id,
    );

    if (vinculoAtivo.length > 0) {
      throw new AppError(
        "Usuário já possui vínculo ativo com outra empresa",
        409,
      );
    }

    // 🚨 4. vínculo na mesma empresa
    const vinculoMesmaEmpresa =
      await userEmpresaRepository.findByUserAndEmpresa(
        usuario.id,
        data.empresaId,
      );

    if (vinculoMesmaEmpresa) {
      throw new AppError("Usuário já pertence a esta empresa", 409);
    }
    // 🔥 5. validações de jornada
    // if (data.turno && (data.horarioEntrada || data.horarioSaida)) {
    //   throw new AppError(
    //     "Não é permitido enviar turno e horários juntos",
    //     400
    //   );
    // }
    if (
      (data.horarioEntrada && !data.horarioSaida) ||
      (!data.horarioEntrada && data.horarioSaida)
    ) {
      throw new AppError(
        "Horário de entrada e saída devem ser informados juntos",
        400,
      );
    }

    if (data.cargaHorariaDia && data.cargaHorariaDia < 240) {
      throw new AppError("Carga horária inválida", 400);
    }
    // 🔢 6. matrícula
    const matricula = await gerarMatricula(data.empresaId);

    // 🏢 7. vínculo
    const vinculo = await userEmpresaRepository.create({
      usuarioId: usuario.id,
      empresaId: data.empresaId,
      matricula,
      cargo: data.cargo,
      setor: data.setor,
      perfil: data.perfil,
      turno: data.turno,
      cargaHorariaDia: data.cargaHorariaDia,
      horarioEntrada: data.horarioEntrada,
      horarioSaida: data.horarioSaida,
    });

    // ✅ resposta HTTP correta
    return reply.status(201).send({
      message: "Colaborador contratado com sucesso",
      data: vinculo,
    });
  },

  async desligar(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    if (!id) {
      throw new AppError("ID do vínculo é obrigatório", 400);
    }

    const vinculo = await userEmpresaRepository.deactivate(id);

    if (!vinculo) {
      throw new AppError("Vínculo não encontrado", 404);
    }

    return reply.status(200).send({
      message: "Colaborador desligado com sucesso",
      data: vinculo,
    });
  },

  async listarPorEmpresa(req: FastifyRequest, reply: FastifyReply) {
    const { empresaId } = req.params as any;

    if (!empresaId) {
      throw new AppError("ID da empresa é obrigatório", 400);
    }

    return userEmpresaRepository.findByEmpresa(empresaId);
  },
  async listarPorEmpresaporSetor(req: FastifyRequest, reply: FastifyReply) {
    const { empresaId, setor } = req.params as any;

    if (!empresaId) {
      throw new AppError("ID da empresa é obrigatório", 400);
    }

    return userEmpresaRepository.findUsersByEmpresaAndSetor(empresaId, setor);
  },
};
