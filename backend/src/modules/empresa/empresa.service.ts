import { FastifyReply, FastifyRequest } from 'fastify';
import {  CreateUserDtoTypes } from './empresa.dto';
import { empresaRepository } from './empresa.repository';




type UpdateEmpresaDto = Partial<CreateUserDtoTypes>;

export const empresaService = {
  // ✅ CREATE
  async create(req: FastifyRequest, reply: FastifyReply) {
    const data = req.body as CreateUserDtoTypes;

    // 🔒 validação básica
    if (!data.nome || !data.cnpj) {
      throw new Error("Nome e CNPJ são obrigatórios");
    }

    // 🔒 evitar duplicidade
    const empresaExistente = await empresaRepository.findByCnpj(data.cnpj);
    if (empresaExistente) {
      throw new Error("Já existe uma empresa com esse CNPJ");
    }

    return empresaRepository.create(data);
  },

  // ✅ LISTAR TODAS
  async findAll() {
    return empresaRepository.findAll();
  },

  // ✅ LISTAR ATIVAS
  async findAllActive() {
    return empresaRepository.findAllActive();
  },

  // ✅ LISTAR INATIVAS
  async findAllInactive() {
    return empresaRepository.findAllInactive();
  },

  // ✅ BUSCAR POR ID
  async findById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const empresa = await empresaRepository.findById(id);

    if (!empresa) {
      throw new Error("Empresa não encontrada");
    }

    return empresa;
  },

  // ✅ BUSCAR POR CNPJ
  async findByCnpj(req: FastifyRequest, reply: FastifyReply) {
    const { cnpj } = req.params as { cnpj: string };
    const empresa = await empresaRepository.findByCnpj(cnpj);

    if (!empresa) {
      throw new Error("Empresa não encontrada");
    }

    return empresa;
  },

  // ✅ UPDATE
  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const data = req.body as UpdateEmpresaDto;

    const empresaExistente = await empresaRepository.findById(id);

    if (!empresaExistente) {
      throw new Error("Empresa não encontrada");
    }

    // 🔒 valida CNPJ duplicado (se vier no update)
    if (data.cnpj) {
      const cnpjEmUso = await empresaRepository.findByCnpj(data.cnpj);

      if (cnpjEmUso && cnpjEmUso.id !== id) {
        throw new Error("CNPJ já está em uso por outra empresa");
      }
    }

    return empresaRepository.update(id, data);
  },

  // ✅ DELETE (soft delete)
  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const empresaExistente = await empresaRepository.findById(id);

    if (!empresaExistente) {
      throw new Error("Empresa não encontrada");
    }

    if (!empresaExistente.ativo) {
      throw new Error("Empresa já está inativa");
    }

    return empresaRepository.delete(id);
  },

  // ✅ RESTORE
  async restore(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const empresaExistente = await empresaRepository.findById(id);

    if (!empresaExistente) {
      throw new Error("Empresa não encontrada");
    }

    if (empresaExistente.ativo) {
      throw new Error("Empresa já está ativa");
    }

    return empresaRepository.restore(id);
  },
};
