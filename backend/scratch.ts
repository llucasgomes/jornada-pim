import { registroPontoService } from "./src/modules/registro-ponto/registro-ponto.service";

async function run() {
  try {
    const req = {
      query: {
        empresaId: "14631606-6557-4c4e-959e-02ea120acae1",
        setor: "Setor A",
        mes: "2026-05"
      }
    } as any;
    const res = await registroPontoService.relatorioMensalPorSetor(req, {} as any);
    console.log(res);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
