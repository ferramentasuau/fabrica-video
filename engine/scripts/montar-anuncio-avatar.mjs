// montar-anuncio-avatar.mjs — monta as peças finais a partir dos renders do HeyGen.
//
// Uso:  cd D:/VIDEO-FACTORY/engine
//       node scripts/montar-anuncio-avatar.mjs ../jobs/<seu-job>/anuncio-avatar.json
//       node scripts/montar-anuncio-avatar.mjs <job.json> --peca 3
//
// ENTRADA ESPERADA: os renders já baixados em
//   assets/<marca>/trechos/<peca.pasta>/T1.mp4 ... T4.mp4
// (baixar NA HORA — o link assinado do HeyGen expira em 7 dias; a nuvem é entrega, não
// arquivo. O que você não baixou hoje pode não existir mais na semana que vem.)
//
// DECISÕES QUE VALEM LER ANTES DE MEXER:
//
// 1. SEM ZOOM. Enquadramento único do início ao fim, dentro de cada peça. A versão com
//    variação de plano foi reprovada em revisão: o zoom entre trechos denuncia a emenda e
//    tira a atenção da fala. Padrão da casa: o vídeo inteiro igual ao começo.
//
// 2. FUSÃO DE 5 FRAMES, NÃO CORTE SECO. Sem mudança de enquadramento, corte seco vira jump
//    cut no gesto das mãos — os trechos são renders separados e as mãos não continuam.
//    0,2 s de dissolve cobre sem chamar atenção. A transição da família estética desse look
//    é um dissolve suave e quente (o vocabulário de movimento está em
//    `docs/heygen/BIBLIOTECA-DE-PROMPTS.md`).
//
// 3. O ÁUDIO SE AJUSTA AO VÍDEO, NUNCA O CONTRÁRIO. Ver o cabeçalho de _anuncio-avatar.mjs.
//    Resultado no lote de validação: deriva 0,0000 s em todas as peças.
//
// Fluxo completo do módulo: `AVATAR-IA.md` (raiz) · base do HeyGen: `docs/heygen/`

import fs from "node:fs";
import { F, lerJob, montarPeca } from "./_anuncio-avatar.mjs";

const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith("--"));
const iPeca = argv.indexOf("--peca");
const soPeca = (argv.find((a) => a.startsWith("--peca=")) ?? "").split("=")[1]
            ?? (iPeca >= 0 ? argv[iPeca + 1] : null);

const job = lerJob(pos[0]);
const marca = job.marca ?? "demo";
const OUT = `${F}/output/${marca}/${job.lote}`;
fs.mkdirSync(OUT, { recursive: true });

const relatorio = [];

for (const peca of job.pecas) {
  if (soPeca && String(peca.id) !== String(soPeca)) continue;

  const videos = peca.trechos.map((t) => `${F}/assets/${marca}/trechos/${peca.pasta}/${t.id}.mp4`);
  const audios = peca.trechos.map((t) => `${F}/assets/${marca}/audio/${peca.pasta}/${t.id}.mp3`);

  const faltando = [...videos, ...audios].filter((f) => !fs.existsSync(f));
  if (faltando.length) {
    console.log(`\n${peca.id} · PULADA — falta:`);
    faltando.forEach((f) => console.log(`    ${f}`));
    relatorio.push({ peca: peca.id, estado: "PAROU — arquivo faltando" });
    continue;
  }

  console.log(`\n===== ${peca.id} · ${peca.titulo} =====`);
  const r = montarPeca({
    videos, audios,
    saida: `${OUT}/${peca.saida}`,
    tmp: `${F}/assets/${marca}/trechos/${peca.pasta}/_tmp`,
  });
  console.log(`  ${peca.saida}  ${r.duracao.toFixed(2)}s  ${r.dimensoes}  ${r.mb} MB  deriva ${r.deriva.toFixed(4)}s`);
  if (Math.abs(r.deriva) > 0.005) console.log(`  🔴 DERIVA ACIMA DE 5 ms — não entregar assim.`);
  relatorio.push({ peca: peca.id, estado: "pronta", ...r });
}

console.log(`\n\n========== RESUMO ==========`);
for (const r of relatorio) {
  if (r.estado !== "pronta") { console.log(`${String(r.peca).padEnd(4)} ${r.estado}`); continue; }
  console.log(`${String(r.peca).padEnd(4)} ${r.duracao.toFixed(2)}s  ${r.dimensoes}  deriva ${r.deriva.toFixed(4)}s`);
}
console.log(`\nsaída: ${OUT}`);
console.log(`\nANTES DE CHAMAR DE PRONTA: assista à peça INTEIRA (não só o começo) e passe a`);
console.log(`régua de qualidade: .claude/skills/video-editor-pro/references/quality-rubric.md`);
console.log(`Deriva acima de 5 ms, pulo de mão na emenda ou boca fora de sincronia = volta.`);
