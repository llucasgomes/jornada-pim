import type { FastifyInstance } from 'fastify'
import cartaoDePontoPdfController from './cartao-de-ponto-pdf.controller';

export default async function cartaoDePontoPdfRoutes(server: FastifyInstance) {
  server.register(cartaoDePontoPdfController, { prefix: "/relatorio" });
}
