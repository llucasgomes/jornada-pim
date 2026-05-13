import type { FastifyInstance } from "fastify";
import userEmpresaController from "./user-empresa.controller";

export default async function userEmpresaRoutes(server: FastifyInstance) {
  server.register(userEmpresaController);
}
