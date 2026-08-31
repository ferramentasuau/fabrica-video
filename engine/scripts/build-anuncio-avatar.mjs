// build-anuncio-avatar.mjs — gera as locuções de um lote de anúncios com avatar falante.
//
// Uso:  cd D:/VIDEO-FACTORY/engine
//       node scripts/build-anuncio-avatar.mjs ../jobs/<seu-job>/anuncio-avatar.json
//       node scripts/build-anuncio-avatar.mjs <job.json> --peca 3      (só uma peça)
//       node scripts/build-anuncio-avatar.mjs <job.json> --seco        (não gera, só relata)
//
// O QUE ELE FAZ: lê o job, gera cada trecho na SUA voz clonada usando a CLI de TTS
// configurada (ver TTS_CLI e VOZ_ID em _anuncio-avatar.mjs), apara as pontas e salva em
// assets/<marca>/audio/<peça>/T*.mp3. Trecho com texto idêntico entre peças NÃO gera duas
// vezes — o cache é por hash do texto (os trechos de oferta e fecho costumam ser iguais no
// lote inteiro; isso economizou 8 gerações num lote de 5 peças).
//
// SEM CLI DE TTS? Este script é a rota automatizada, e é opcional. Dá para gerar as falas
// pelo MCP da ElevenLabs no Claude Code e salvar os MP3 à mão nas mesmas pastas
// (assets/<marca>/audio/<peça>/T1.mp3 …) — o resto do pipeline não muda. Ver SETUP.md,
// seção "Módulo Avatar".
//
// DEPOIS DELE, SEMPRE: node scripts/conferir-verbatim.mjs <job.json>
// Gerar sem conferir é como render sem preview. A TTS engole trecho em prompt longo.
//
// Fluxo completo do módulo: `AVATAR-IA.md` (raiz) · base do HeyGen: `docs/heygen/`

import fs from "node:fs";
import { F, PADRAO, dur, lerJob, gerarTrecho, saldoTTS } from "./_anuncio-avatar.mjs";

const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith("--"));
const pos = argv.filter((a) => !a.startsWith("--"));
const seco = flags.includes("--seco");
// aceita --peca=3 e --peca 3. Sem a flag, soPeca fica null (indexOf -1 pegaria argv[0], que é o job).
const i = argv.indexOf("--peca");
const soPeca = (flags.find((f) => f.startsWith("--peca=")) ?? "").split("=")[1]
            ?? (i >= 0 ? argv[i + 1] : null);

const job = lerJob(pos[0]);
const marca = job.marca ?? "demo";
const CACHE = `${F}/assets/${marca}/audio/_cache-tts`;

const antes = seco ? null : saldoTTS();
if (antes !== null) console.log(`saldo da CLI de TTS antes: ${antes}\n`);

let gerados = 0, reaproveitados = 0;

for (const peca of job.pecas) {
  if (soPeca && String(peca.id) !== String(soPeca)) continue;
  const OUT = `${F}/assets/${marca}/audio/${peca.pasta}`;
  if (!seco) fs.mkdirSync(OUT, { recursive: true });
  console.log(`${peca.id} · ${peca.titulo}`);

  let total = 0;
  for (const t of peca.trechos) {
    const dst = `${OUT}/${t.id}.mp3`;
    const palavras = t.texto.trim().split(/\s+/).length;
    if (seco) { console.log(`  ${t.id}  ${String(palavras).padStart(3)} palavras`); continue; }

    const ultimo = t === peca.trechos[peca.trechos.length - 1];
    const r = gerarTrecho(t.texto, dst, { cauda: ultimo ? 0 : PADRAO.cauda, cache: CACHE });
    if (r.custo === "gerado") gerados++; else reaproveitados++;
    total += dur(dst);
    console.log(`  ${t.id}  ${String(palavras).padStart(3)} palavras  ${dur(dst).toFixed(1)}s  [${r.custo}]`);
  }
  if (!seco) {
    const comFusao = total - PADRAO.fusao * (peca.trechos.length - 1);
    console.log(`  => ${total.toFixed(1)}s  (montada com as fusões: ${comFusao.toFixed(1)}s)\n`);
  }
}

if (!seco) {
  const depois = saldoTTS();
  console.log(`\n${gerados} trechos gerados · ${reaproveitados} reaproveitados do cache`);
  if (antes !== null && depois !== null) {
    console.log(`saldo depois: ${depois}  (custo: ${(antes - depois).toFixed(2)})`);
  }
  console.log(`\nPRÓXIMO PASSO OBRIGATÓRIO:`);
  console.log(`  node scripts/conferir-verbatim.mjs ${pos[0]}`);
}
