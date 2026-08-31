// conferir-zona.mjs — desenha a ZONA DE SEGURANÇA do Meta por cima do vídeo e mede quanta
// coisa importante está caindo fora dela.
//
// Uso:  cd D:/VIDEO-FACTORY/engine
//       node scripts/conferir-zona.mjs <arquivo|pasta> [--pct 14,35,6] [--frames 3]
//
// Flags: --pct 14,35,6   topo,base,laterais em % (padrão = o número oficial do Meta)
//        --frames 3      quantos instantes amostrar por vídeo
//        --saida <dir>   onde gravar os PNG (padrão: output/_zona)
//
// POR QUE ISSO EXISTE
//
// O Guia de Anúncios do Meta (vídeo no Instagram Reels) manda deixar 14% do topo, 35% da
// base e 6% de cada lado livres de texto, logo e elementos importantes — é onde entram o @,
// a legenda, a barra de áudio e o botão de CTA. E avisa que em telas MAIS ALTAS que 9:16 ele
// AMPLIA o criativo pra preencher, cortando o que está fora da zona.
//
// Isso não dá pra conferir de cabeça. Medido em brutos reais de um job: uma fileira inteira de
// produtos de um clipe estava na faixa de 35% da base, e um preço escrito à mão noutro caía em
// cima da linha. Nos dois casos a informação que paga o anúncio ficaria embaixo da interface.
//
// DUAS SAÍDAS, COM PESOS DIFERENTES:
//
//  1. O PNG é a PROVA. Vermelho = o Meta cobre ou corta. Verde = o que sobra pra você.
//     Quem julga é o olho; o script só desenha onde é a linha.
//  2. A densidade de detalhe é PISTA, não veredito. É a média do mapa de bordas de cada
//     faixa: texto e produto têm borda, parede e piso não. Faixa vermelha com mais borda que
//     a verde quer dizer "o assunto do plano está na área errada" — mas um produto tem borda
//     igual a uma letra, então serve pra chamar atenção, nunca pra reprovar sozinha.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const F = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1").replace(/\/$/, "");
const VIDEO_EXT = new Set([".mov", ".mp4", ".m4v", ".avi", ".mkv"]);

// ---- argumentos ----
const argv = process.argv.slice(2);
const alvo = argv.find((a) => !a.startsWith("--"));
const valorDe = (nome, padrao) => {
  const i = argv.indexOf(`--${nome}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : padrao;
};

if (!alvo) {
  console.error("uso: node scripts/conferir-zona.mjs <arquivo|pasta> [--pct 14,35,6] [--frames 3]");
  process.exit(1);
}
if (!fs.existsSync(alvo)) {
  console.error(`⛔ não existe: ${alvo}`);
  process.exit(1);
}

const [PCT_TOPO, PCT_BASE, PCT_LADO] = String(valorDe("pct", "14,35,6"))
  .split(",")
  .map((n) => parseFloat(n));
if (![PCT_TOPO, PCT_BASE, PCT_LADO].every((n) => Number.isFinite(n) && n >= 0 && n < 50)) {
  console.error("⛔ --pct precisa de três números entre 0 e 50, ex: 14,35,6");
  process.exit(1);
}
const N_FRAMES = Math.max(1, parseInt(valorDe("frames", "3"), 10) || 3);
const SAIDA = valorDe("saida", `${F}/output/_zona`);

// ---- helpers ----
const ff = (args) =>
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "pipe" });
const probe = (f, args) =>
  execFileSync("ffprobe", ["-v", "error", ...args, "-of", "default=nw=1:nk=1", f]).toString().trim();

/** dimensões COMO O FILTRO VÊ — a autorrotação do ffmpeg já aconteceu (mesma regra do montar-corte) */
const dimsDoFiltro = (f) => {
  const [w, h] = probe(f, ["-select_streams", "v:0", "-show_entries", "stream=width,height"])
    .split("\n")
    .map(Number);
  let rot = 0;
  try {
    rot = parseFloat(probe(f, ["-select_streams", "v:0", "-show_entries", "stream_side_data=rotation"]) || "0") || 0;
  } catch {
    rot = 0;
  }
  return Math.abs(rot) === 90 ? { w: h, h: w, rot } : { w, h, rot };
};
const durSeg = (f) => parseFloat(probe(f, ["-show_entries", "format=duration"])) || 0;
const par = (n) => (n % 2 ? n - 1 : n);

/**
 * Média do mapa de bordas de um recorte. É UMA passada de ffmpeg por faixa:
 * edgedetect vira o quadro num mapa preto-e-branco onde só sobra contorno, e o YAVG do
 * signalstats resume isso num número. fps=2 basta — não estamos medindo movimento.
 */
const densidadeDeBorda = (arquivo, crop) => {
  let saida = "";
  try {
    saida = execFileSync(
      "ffmpeg",
      ["-hide_banner", "-loglevel", "error", "-i", arquivo,
        "-vf", `fps=2,crop=${crop},edgedetect=low=0.1:high=0.3,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`,
        "-f", "null", "-"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
  } catch {
    return null;
  }
  const vals = [...saida.matchAll(/YAVG=([\d.]+)/g)].map((m) => parseFloat(m[1])).filter(Number.isFinite);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

// ---- coletar arquivos ----
const arquivos = fs.statSync(alvo).isDirectory()
  ? fs.readdirSync(alvo)
      .filter((n) => VIDEO_EXT.has(path.extname(n).toLowerCase()))
      .sort()
      .map((n) => path.join(alvo, n))
  : [alvo];

if (!arquivos.length) {
  console.error(`⛔ nenhum vídeo em ${alvo}`);
  process.exit(1);
}

fs.mkdirSync(SAIDA, { recursive: true });

console.log(`\nZONA DE SEGURANÇA — topo ${PCT_TOPO}% · base ${PCT_BASE}% · laterais ${PCT_LADO}%`);
console.log("(padrão oficial do Guia de Anúncios do Meta para vídeo no Instagram Reels)\n");

let algumApertado = false;

for (const arquivo of arquivos) {
  const nome = path.basename(arquivo, path.extname(arquivo));
  const { w, h, rot } = dimsDoFiltro(arquivo);
  const dur = durSeg(arquivo);

  // a zona é sempre calculada sobre o quadro COMO SERÁ EXIBIDO
  const topo = Math.round((h * PCT_TOPO) / 100);
  const base = Math.round((h * PCT_BASE) / 100);
  const lado = Math.round((w * PCT_LADO) / 100);
  const zonaY = topo;
  const zonaH = h - topo - base;
  const zonaX = lado;
  const zonaW = w - 2 * lado;

  console.log("─".repeat(72));
  console.log(`${path.basename(arquivo)}  ·  ${w}x${h}${rot ? ` (rotation=${rot})` : ""}  ·  ${dur.toFixed(1)}s`);
  console.log(`  faixa útil:  y ${zonaY} → ${zonaY + zonaH}   ·   x ${zonaX} → ${zonaX + zonaW}`);
  console.log(`  o Meta cobre:  ${topo}px em cima  ·  ${base}px embaixo  ·  ${lado}px de cada lado`);

  // ---- PNG de prova ----
  const instantes = Array.from({ length: N_FRAMES }, (_, i) => (dur * (i + 1)) / (N_FRAMES + 1));
  const png = [];
  for (const [i, t] of instantes.entries()) {
    const dest = `${SAIDA}/${nome}_${String(i + 1).padStart(2, "0")}.png`;
    const vf = [
      `drawbox=x=0:y=0:w=${w}:h=${topo}:color=red@0.45:t=fill`,
      `drawbox=x=0:y=${h - base}:w=${w}:h=${base}:color=red@0.45:t=fill`,
      `drawbox=x=0:y=${topo}:w=${lado}:h=${zonaH}:color=red@0.45:t=fill`,
      `drawbox=x=${w - lado}:y=${topo}:w=${lado}:h=${zonaH}:color=red@0.45:t=fill`,
      `drawbox=x=${zonaX}:y=${zonaY}:w=${zonaW}:h=${zonaH}:color=lime:t=${Math.max(3, Math.round(w / 270))}`,
    ].join(",");
    try {
      ff(["-ss", t.toFixed(2), "-i", arquivo, "-frames:v", "1", "-vf", vf, dest]);
      png.push(dest);
    } catch (e) {
      console.log(`  ⚠️ não consegui extrair o quadro de ${t.toFixed(1)}s`);
    }
  }

  // ---- densidade de borda por faixa ----
  const faixas = {
    "topo (14%)": `${par(w)}:${par(topo)}:0:0`,
    "base (35%)": `${par(w)}:${par(base)}:0:${h - base}`,
    "ZONA ÚTIL": `${par(zonaW)}:${par(zonaH)}:${zonaX}:${zonaY}`,
  };
  const med = {};
  for (const [rot2, crop] of Object.entries(faixas)) med[rot2] = densidadeDeBorda(arquivo, crop);

  const ref = med["ZONA ÚTIL"];
  console.log("");
  for (const [rot2, v] of Object.entries(med)) {
    if (v === null) { console.log(`  ${rot2.padEnd(12)}  —`); continue; }
    const rel = ref ? v / ref : 1;
    const marca =
      rot2 === "ZONA ÚTIL" ? "" : rel >= 1.15 ? "  🔴 mais detalhe que a zona útil" : rel >= 0.85 ? "  ⚠️ detalhe equivalente" : "";
    if (marca.startsWith("  🔴")) algumApertado = true;
    console.log(`  ${rot2.padEnd(12)}  detalhe ${v.toFixed(1).padStart(5)}${ref ? `  (${rel.toFixed(2)}x da zona útil)` : ""}${marca}`);
  }

  if (png.length) console.log(`\n  prova: ${png.map((p) => path.basename(p)).join("  ")}`);
}

console.log("─".repeat(72));
console.log(`\n${arquivos.length} vídeo(s) · PNG em ${SAIDA}`);
console.log("Abra os PNG: o que está no VERMELHO o Instagram cobre ou corta.");
if (algumApertado) {
  console.log("\n🔴 Tem faixa vermelha com mais detalhe que a zona útil — olhe o PNG antes de subir.");
}
