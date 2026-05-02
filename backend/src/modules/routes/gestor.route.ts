import type { FastifyInstance } from "fastify";
import gestorController from "../controllers/gestor.controller";

export default async function gestorRoutes(server: FastifyInstance) {
  server.register(gestorController, { prefix: "/gestor" });
}
