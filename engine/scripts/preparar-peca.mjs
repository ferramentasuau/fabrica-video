// preparar-peca.mjs — do MP4 bruto ao CONTRATO DE PALAVRAS, num comando.
//
// Encadeia o que era feito à mão em quatro passos por peça: extrair o WAV,
// transcrever, corrigir contra o roteiro-verdade e exportar o contrato.
//
// O PORTÃO QUE IMPORTA: no fim ele compara a legenda corrigida com o roteiro e
// IMPRIME AS DIVERGÊNCIAS. O Whisper é instrumento de TEMPO, não de TEXTO — e
// erra diferente a cada transcrição, então a lista de remendos de uma peça nunca
// cobre a seguinte inteira. O relatório é onde o erro novo aparece antes de
// custar render.
//
// Uso:
//   node engine/scripts/preparar-peca.mjs <job> <peca> <video.mp4> <roteiro.txt>
//     [--remendos <extra.json>]

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { corrigir } from "./_corrigir-legenda.mjs";
import { REMENDOS, CORRECOES, EXIGIDAS, PROIBIDAS } from "./_remendos.mjs";

const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--remendos");
const [job, peca, video, roteiroP] = pos;
if (!roteiroP) {
  console.error("uso: node preparar-peca.mjs <job> <peca> <video.mp4> <roteiro.txt> [--remendos extra.json]");
  process.exit(1);
}
const iX = argv.indexOf("--remendos");
const extra = iX >= 0 && argv[iX + 1] ? JSON.parse(fs.readFileSync(argv[iX + 1], "utf8")) : { remendos: [], correcoes: [] };

const T = path.join(job, "transcript");
fs.mkdirSync(T, { recursive: true });
const wav = path.join(T, `${peca}.wav`);
const capCru = path.join(T, `captions-${peca}.json`);
const capOk = path.join(T, `captions-${peca}-corrigido.json`);
const words = path.join(T, `words-${peca}.json`);
const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

const passo = (rot, cmd, args, opts = {}) => {
  console.log(`\n[${rot}]`);
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) { console.error(`  ✗ falhou em: ${rot}`); process.exit(1); }
};

// 1 · WAV 16k mono — o formato que o whisper.cpp quer
if (!fs.existsSync(wav))
  passo("1/4 extraindo o áudio", "ffmpeg",
    ["-v", "error", "-y", "-i", video, "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav]);
else console.log("\n[1/4 áudio já extraído]");

// 2 · transcrição. ⚠️ CAMINHO ABSOLUTO: com caminho relativo o `-f` chega VAZIO
// no whisper.cpp e ele imprime o help em vez de transcrever, sem erro visível.
if (!fs.existsSync(capCru))
  passo("2/4 transcrevendo (whisper medium)", "node",
    [path.join(AQUI, "transcribe.mjs"), path.resolve(wav), path.resolve(capCru), "medium"],
    { cwd: path.join(AQUI, "..") });
else console.log("\n[2/4 transcrição já existe]");

// 3 · correções: as compartilhadas do lote + as específicas desta peça
console.log("\n[3/4 corrigindo contra o roteiro]");
const bruto = JSON.parse(fs.readFileSync(capCru, "utf8"));
const lista = Array.isArray(bruto) ? bruto : bruto.words ?? bruto.captions;
const { words: novas, resumo } = corrigir(structuredClone(lista), {
  remendos: [...REMENDOS, ...(extra.remendos || [])],
  correcoes: [...CORRECOES, ...(extra.correcoes || [])],
});
console.log("  " + resumo);
fs.writeFileSync(capOk, JSON.stringify(Array.isArray(bruto) ? novas : { ...bruto, words: novas }, null, 2), "utf8");

// 4 · contrato de palavras
passo("4/4 exportando o contrato de palavras", "node",
  [path.join(AQUI, "exportar-palavras.mjs"), path.resolve(capOk), path.resolve(words)],
  { cwd: path.join(AQUI, "..") });

// ── PORTÃO: o que ainda diverge do roteiro ─────────────────────────────────
const limpa = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
// numerais que a locução fala por extenso e a legenda mostra em dígito — não são
// divergência, são decisão de edição. Preencha com os números DA SUA peça; os
// compostos entram inteiros, senão "vinte"+"oito" contra "28" vira alarme falso.
const NUM = {}; // ex.: { quinze: "15", quatro: "4" }
const COMPOSTO = []; // ex.: ["vinte", "oito"] — partes de números compostos falados por extenso
const eq = (a, b) => a === b || NUM[a] === b || NUM[b] === a ||
  (a === "para" && b === "pra") || (a === "pra" && b === "para");

const asr = novas.map((w) => limpa(w.text)).filter(Boolean);
const rot = fs.readFileSync(roteiroP, "utf8").replace(/…/g, " ").split(/\s+/).map(limpa).filter(Boolean);

// só as palavras que o roteiro tem e a legenda não (e vice-versa), por multiconjunto
const conta = (xs) => xs.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
const cA = conta(asr), cR = conta(rot);
const faltando = [], sobrando = [];
for (const [w, n] of cR) {
  let d = n - (cA.get(w) || 0);
  if (d > 0 && !COMPOSTO.includes(w) && ![...cA.keys()].some((k) => eq(k, w))) faltando.push(`${w}${d > 1 ? `×${d}` : ""}`);
}
for (const [w, n] of cA) {
  let d = n - (cR.get(w) || 0);
  if (d > 0 && !/^\d+$/.test(w) && ![...cR.keys()].some((k) => eq(k, w))) sobrando.push(`${w}${d > 1 ? `×${d}` : ""}`);
}

console.log(`\n${"─".repeat(66)}`);
console.log(`PORTÃO — legenda ${asr.length} palavras · roteiro ${rot.length}`);
const falhas = [];
const txt = novas.map((w) => w.text).join(" ");
for (const e of EXIGIDAS) if (!txt.includes(e)) falhas.push(`FALTA na tela: "${e}"`);
for (const p of PROIBIDAS) if (txt.includes(p)) falhas.push(`AINDA PRESENTE: "${p}"`);
if (faltando.length) console.log(`  o roteiro tem e a legenda NÃO: ${faltando.slice(0, 20).join(" · ")}`);
if (sobrando.length) console.log(`  a legenda tem e o roteiro NÃO: ${sobrando.slice(0, 20).join(" · ")}`);
if (!faltando.length && !sobrando.length) console.log("  nenhuma divergência de palavra");
for (const f of falhas) console.log(`  ✗ ${f}`);
console.log(`${"─".repeat(66)}`);
if (falhas.length) {
  console.error("\n✗ a legenda não passou no portão. Escreva os remendos que faltam num JSON e");
  console.error("  rode de novo com --remendos, ou apague o captions-*-corrigido.json para refazer.\n");
  process.exit(1);
}
console.log(`\npronto: ${words}\n`);
