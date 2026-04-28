import puppeteer from "puppeteer";

export function gerarHtmlRelatorio(data: {
  user: {
    nome: string;
    matricula: string;
    cargo: string | null;
    setor: string | null;
    imageUrl: string | null;
    horario_entrada: string | null;
    horario_saida: string | null;
    carga_horaria_dia: number | null;
  };
  registros: {
    id: string;
    data: string;
    horasTrabalhadas: number;
    horasEsperadas: number;
    horasExtras: number;
    atrasoMinutos: number;
    status: "completo" | "incompleto" | "falta" | "afastamento";
    periodos?: { entrada: string; saida: string }[];
  }[];
  periodoInicio: string;
  periodoFim: string;
  empresa?: string;
  cnpj?: string;
}) {
  const { user, registros, periodoInicio, periodoFim } = data;
  const empresa = data.empresa ?? "EMPRESA";
  const cnpj = data.cnpj ?? "-";
  const agora = new Date().toLocaleString("pt-BR");

  // Totalizadores
  const totalTrabalhado = registros.reduce(
    (acc, r) => acc + r.horasTrabalhadas,
    0,
  );
  const totalExtras = registros.reduce((acc, r) => acc + r.horasExtras, 0);
  const totalAtraso = registros.reduce((acc, r) => acc + r.atrasoMinutos, 0);
  const totalFaltas = registros.filter((r) => r.status === "falta").length;
  const totalDSR = registros.filter(
    (r) => r.status === "incompleto" && r.horasTrabalhadas === 0,
  ).length;
  const totalFolgas = registros.filter(
    (r) => r.status === "afastamento",
  ).length;

const linhas = registros
  .map((r) => {
    const label = statusLabel(r.status, r.horasTrabalhadas, r.atrasoMinutos);
    const p = r.periodos ?? [];
    const isSpecial =
      ["falta", "afastamento"].includes(r.status) ||
      (r.status === "incompleto" && r.horasTrabalhadas === 0);

    // monta as 10 células de período (5 períodos × Ent/Sai)
    let celulasperiodos = "";
    if (isSpecial) {
      // só as 4 primeiras com label, as outras 6 vazias
      celulasperiodos = `
      <td class="center label-${r.status}">${label}</td>
      <td class="center label-${r.status}">${label}</td>
      <td class="center label-${r.status}">${label}</td>
      <td class="center label-${r.status}">${label}</td>
      <td class="center"></td><td class="center"></td>
      <td class="center"></td><td class="center"></td>
      <td class="center"></td><td class="center"></td>
    `;
    } else {
      const cel = (v: string) => `<td class="center">${v}</td>`;
      celulasperiodos = `
      ${cel(p[0]?.entrada ?? "")}${cel(p[0]?.saida ?? "")}
      ${cel(p[1]?.entrada ?? "")}${cel(p[1]?.saida ?? "")}
      <td class="center"></td><td class="center"></td>
      <td class="center"></td><td class="center"></td>
      <td class="center"></td><td class="center"></td>
    `;
    }

    return `
    <tr>
      <td>${formatarData(r.data)}/${diaSemana(r.data)}</td>
      <td class="center">001</td>
      ${celulasperiodos}
      <td class="center">${r.horasTrabalhadas > 0 ? horaDecParaStr(r.horasTrabalhadas) : ""}</td>
      <td class="center ${r.atrasoMinutos > 0 ? "debito" : ""}">${r.atrasoMinutos > 0 ? minParaHora(r.atrasoMinutos) : ""}</td>
      <td class="center ${r.horasExtras > 0 ? "extra" : ""}">${r.horasExtras > 0 ? horaDecParaStr(r.horasExtras) : ""}</td>
    </tr>`;
  })
  .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 9px; color: #000; padding: 8px; }

  /* ── Cabeçalho principal ── */
  .topo { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
  .logo { font-size: 22px; font-weight: 900; color: #cc0000; letter-spacing: -1px; }
  .logo span { font-size: 8px; display: block; color: #555; font-weight: normal; letter-spacing: 0; }
  .titulo { text-align: center; }
  .titulo h1 { font-size: 15px; font-weight: bold; color: #cc0000; }
  .titulo p { font-size: 9px; }
  .data-hora { font-size: 8px; text-align: right; }

  hr { border: none; border-top: 1px solid #000; margin: 2px 0; }

  /* ── Info empresa ── */
  .info-empresa { display: grid; grid-template-columns: 1fr 1fr; font-size: 8px; margin-bottom: 2px; }
  .info-empresa .linha { padding: 1px 0; }

  /* ── Box funcionário ── */
  .box-func { display: flex; gap: 6px; border: 1px solid #999; padding: 4px; margin-bottom: 4px; }
  .foto { width: 64px; height: 72px; object-fit: cover; border: 1px solid #ccc; flex-shrink: 0; }
  .foto-placeholder { width: 64px; height: 72px; border: 1px solid #ccc; background: #eee; flex-shrink: 0; }
  .dados-func { flex: 1; font-size: 8px; }
  .dados-func .linha { margin-bottom: 2px; }
  .dados-func strong { font-size: 9px; }
  .horario-box { border: 1px solid #999; font-size: 7.5px; }
  .horario-box .titulo-box { background: #eee; text-align: center; font-weight: bold; padding: 1px; }
  .horario-box table { width: 100%; border-collapse: collapse; }
  .horario-box td, .horario-box th { border: 1px solid #bbb; padding: 1px 3px; text-align: center; }
  .horario-box th { background: #f5f5f5; font-size: 7px; }

  /* ── Tabela principal ── */
  .tabela-wrap { margin-bottom: 4px; }
  table.main { width: 100%; border-collapse: collapse; font-size: 7.5px; }
  table.main th { background: #e8e8e8; border: 1px solid #999; padding: 2px 3px; text-align: center; font-size: 7px; }
  table.main td { border: 1px solid #bbb; padding: 1px 3px; white-space: nowrap; }
  table.main tr:nth-child(even) td { background: #f9f9f9; }
  .center { text-align: center; }
  .debito { color: #cc0000; font-weight: bold; }
  .extra { color: #0055cc; font-weight: bold; }
  .label-falta { color: #cc0000; font-style: italic; }
  .label-afastamento { color: #555; font-style: italic; }
  .label-incompleto { color: #888; font-style: italic; }

  /* ── Totais ── */
  .totais-linha { font-size: 8px; background: #e8e8e8; border: 1px solid #999; padding: 2px 4px; display: flex; gap: 16px; margin-bottom: 4px; }
  .totais-linha span { font-weight: bold; }

  /* ── Banco de horas ── */
  .banco { border: 1px solid #999; padding: 4px; margin-bottom: 4px; font-size: 8px; display: flex; gap: 16px; }
  .banco .col { flex: 1; }
  .banco .titulo-b { font-weight: bold; font-size: 9px; margin-bottom: 2px; }
  .banco .linha-b { margin-bottom: 1px; }
  .banco .resumo { border-top: 1px solid #ccc; margin-top: 3px; padding-top: 3px; }
  .obs-box { border: 1px solid #999; flex: 1; padding: 4px; font-size: 8px; }

  /* ── Rodapé ── */
  .assinatura { display: flex; justify-content: space-between; font-size: 8px; margin: 6px 0; }
  .assinatura .linha-assin { border-top: 1px solid #000; width: 180px; text-align: center; padding-top: 2px; }
  .rodape-texto { font-size: 6.5px; color: #333; margin-bottom: 4px; border-top: 1px solid #ccc; padding-top: 2px; }
  .sistema { display: flex; justify-content: space-between; font-size: 7px; color: #555; border-top: 1px solid #ccc; padding-top: 2px; }
</style>
</head>
<body>

<!-- TOPO -->
<div class="topo">
  <div class="logo">CII<br/><span>GRUPO<br/>COMERCIAL</span></div>
  <div class="titulo">
    <h1>Cartão de Ponto Calculado</h1>
    <p><strong>Período de referência: de ${new Date(periodoInicio).toLocaleDateString("pt-BR")} &nbsp; à ${new Date(periodoFim).toLocaleDateString("pt-BR")}</strong></p>
  </div>
  <div class="data-hora">${agora}</div>
</div>
<hr/>

<!-- INFO EMPRESA -->
<div class="info-empresa">
  <div>
    <div class="linha"><strong>Empresa:</strong> ${empresa}</div>
    <div class="linha"><strong>Endereço:</strong> -</div>
    <div class="linha"><strong>Bairro:</strong> -</div>
  </div>
  <div>
    <div class="linha"><strong>CNPJ:</strong> ${cnpj} &nbsp;&nbsp; <strong>CEI:</strong></div>
    <div class="linha"><strong>Nº:</strong> - &nbsp;&nbsp; <strong>CEP:</strong> - &nbsp;&nbsp; <strong>Atividade:</strong></div>
    <div class="linha"><strong>Cidade:</strong> - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>UF:</strong></div>
  </div>
</div>
<hr/>

<!-- FUNCIONÁRIO -->
<div class="box-func">
  <div style="flex:1;">
    <table style="width:100%;font-size:8px;border-collapse:collapse;">
      <tr>
        <td style="padding:1px 0;"><strong>Crachá:</strong> ${user.matricula}</td>
        <td style="padding:1px 0;"><strong>PIS:</strong> -</td>
        <td rowspan="5" style="width:180px;vertical-align:top;padding-left:8px;">
          <div class="horario-box">
            <div class="titulo-box">Horário de Trabalho</div>
            <table>
              <tr><th>Dia</th><th colspan="2">1º Período</th><th colspan="2">2º Período</th></tr>
              <tr><th></th><th>Entrada</th><th>Saída</th><th>Entrada</th><th>Saída</th></tr>
              <tr><td>Segunda</td><td>${user.horario_entrada ?? "08:00"}</td><td>12:00</td><td>13:12</td><td>${user.horario_saida ?? "18:00"}</td></tr>
              <tr><td>Terça</td><td>${user.horario_entrada ?? "08:00"}</td><td>12:00</td><td>13:12</td><td>${user.horario_saida ?? "18:00"}</td></tr>
              <tr><td>Quarta</td><td>${user.horario_entrada ?? "08:00"}</td><td>12:00</td><td>13:12</td><td>${user.horario_saida ?? "18:00"}</td></tr>
              <tr><td>Quinta</td><td>${user.horario_entrada ?? "08:00"}</td><td>12:00</td><td>13:12</td><td>${user.horario_saida ?? "18:00"}</td></tr>
              <tr><td>Sexta</td><td>${user.horario_entrada ?? "08:00"}</td><td>12:00</td><td>13:12</td><td>${user.horario_saida ?? "18:00"}</td></tr>
              <tr><td>Sábado</td><td>DUNT</td><td>DUNT</td><td>DUNT</td><td>DUNT</td></tr>
            </table>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:1px 0;"><strong>Nome:</strong> ${user.nome}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:1px 0;"><strong>Cargo:</strong> ${user.cargo ?? "-"}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:1px 0;"><strong>Depart.:</strong> ${user.setor ?? "-"}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:1px 0;"><strong>Setor:</strong> ${user.setor ?? "-"}</td>
      </tr>
    </table>
    <table style="width:60%;font-size:8px;border-collapse:collapse;margin-top:2px;">
      <tr>
        <td><strong>C. de Custo:</strong></td>
        <td><strong>CTPS:</strong> -</td>
        <td><strong>Série:</strong> -</td>
      </tr>
      <tr>
        <td><strong>Admissão:</strong> -</td>
        <td colspan="2"><strong>Registro:</strong> 1</td>
      </tr>
    </table>
  </div>
  ${
    user.imageUrl
      ? `<img src="${user.imageUrl}" class="foto" alt="foto"/>`
      : `<div class="foto-placeholder"></div>`
  }
</div>

<!-- TABELA DE REGISTROS -->
<div class="tabela-wrap">
  <table class="main">
    <thead>
      <tr>
        <th rowspan="2">Data</th>
        <th rowspan="2">Tab.</th>
        <th colspan="2">1º Período</th>
        <th colspan="2">2º Período</th>
        <th colspan="2">3º Período</th>
        <th colspan="2">4º Período</th>
        <th colspan="2">5º Período</th>
        <th rowspan="2">H. Trab.</th>
        <th rowspan="2">H. Débito</th>
        <th rowspan="2">H. Extra</th>
      </tr>
      <tr>
        <th>Ent</th><th>Sai</th>
        <th>Ent</th><th>Sai</th>
        <th>Ent</th><th>Sai</th>
        <th>Ent</th><th>Sai</th>
        <th>Ent</th><th>Sai</th>
      </tr>
    </thead>
    <tbody>
      ${linhas}
    </tbody>
  </table>
</div>

<!-- TOTALIZADORES -->
<div class="totais-linha">
  <div>D. Trab.: <span>${registros.filter((r) => r.status === "completo" || r.status === "incompleto").length}</span></div>
  <div>D. Falt.: <span>${totalFaltas}</span></div>
  <div>DSR: <span>${totalDSR}</span></div>
  <div>DDSR: <span>0</span></div>
  <div>Folgas: <span>${totalFolgas}</span></div>
  <div style="margin-left:auto;">
    <span>${horaDecParaStr(totalTrabalhado)}</span> &nbsp;
    <span class="debito">${minParaHora(totalAtraso)}</span> &nbsp;
    <span class="extra">${horaDecParaStr(totalExtras)}</span>
  </div>
</div>

<!-- BANCO DE HORAS + OBSERVAÇÕES -->
<div style="display:flex;gap:8px;margin-bottom:4px;">
  <div class="banco" style="flex:1.2;">
    <div class="col">
      <div class="titulo-b">Banco de Horas</div>
      <div class="linha-b">Saldo anterior:</div>
      <div class="resumo">
        <div class="titulo-b">Resumo do Cartão de Ponto</div>
        <div class="linha-b"><strong>Crédito: 00:00 &nbsp; Débito: ${minParaHora(totalAtraso)} &nbsp; Saldo: -${minParaHora(totalAtraso)}</strong></div>
        <div class="linha-b" style="font-size:7px;">Período Acumulado de ${new Date(periodoInicio).toLocaleDateString("pt-BR")} à ${new Date(periodoFim).toLocaleDateString("pt-BR")}</div>
        <div class="linha-b"><strong>Crédito: 00:00 &nbsp; Débito: ${minParaHora(totalAtraso)} &nbsp; Saldo: -${minParaHora(totalAtraso)}</strong></div>
      </div>
    </div>
  </div>
  <div class="obs-box">
    <div style="font-weight:bold;margin-bottom:2px;">Observações:</div>
  </div>
</div>

<!-- ASSINATURA -->
<div style="display:flex;justify-content:space-between;align-items:flex-end;font-size:8px;margin:8px 0 4px;">
  <div class="linha-assin" style="border-top:1px solid #000;width:180px;text-align:center;padding-top:2px;">
    Assinatura do Funcionário
  </div>
  <div style="font-size:8px;">
    __________________________________, _____ de ________________________ de _______.
  </div>
</div>

<!-- RODAPÉ LEGAL -->
<div class="rodape-texto">
  De conformidade com as Portarias MTB nº 3626, de 13/11/91, Art. 13, este cartão de ponto substitui, quando mencionado em seu cabeçalho o horário de
  trabalho e o dia do DSR do funcionário, para todos os efeitos legais, o Quadro de Horário de Trabalho e a Ficha de Horário de Trabalho Externo.
</div>
<div class="sistema">
  <span>Sistema de Controle de Ponto — v1.0</span>
  <span>${empresa}</span>
</div>

</body>
</html>`;
}

export async function gerarPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "8mm", bottom: "8mm", left: "6mm", right: "6mm" },
  });
  await browser.close();
  return Buffer.from(pdf);
}

// Versão que recebe a página já aberta (sem abrir/fechar browser)
export async function gerarPdfComPagina(
  html: string,
  page: import("puppeteer").Page,
): Promise<Buffer> {
  await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 60000 });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "8mm", bottom: "8mm", left: "6mm", right: "6mm" },
  });
  return Buffer.from(pdf);
}


function formatarData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function diaSemana(iso: string) {
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  return dias[new Date(iso).getDay()];
}

function minParaHora(min: number): string {
  const h = Math.floor(Math.abs(min) / 60)
    .toString()
    .padStart(2, "0");
  const m = (Math.abs(min) % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function horaDecParaStr(dec: number): string {
  const total = Math.round(dec * 60);
  return minParaHora(total);
}

function statusLabel(
  status: string,
  horasTrabalhadas: number,
  atrasoMinutos: number,
): string {
  if (status === "falta") return "Falta";
  if (status === "afastamento") return "Atestado";
  if (status === "incompleto" && horasTrabalhadas === 0) return "DSR";
  return "";
}
