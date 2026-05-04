import type { FastifyInstance } from "fastify";
import rhController from "../controllers/rh.controller";

export default async function rhRoutes(server: FastifyInstance) {
  server.register(rhController, { prefix: "/rh" });
}
