// acabamento.mjs — aplica a PARTITURA sobre o render e escreve o MP4 FINAL.
//
// O que a fábrica fazia à mão no CapCut e agora sai daqui: punch, rebobinar,
// passagens de luz e a mixagem inteira (voz + riser + cliques + trilha composta).
//
// Uso:
//   node engine/scripts/acabamento.mjs <acabamento.json> <entrada.mp4> <saida.mp4>
//
// DUAS DECISÕES HERDADAS de montar-corte.mjs, que custaram caro para aprender:
//
// 1. ÁUDIO NUM GRAFO SÓ, UM ENCODE SÓ. Encodar AAC por pedaço e concatenar carrega
//    ~42ms de priming POR JUNÇÃO, e o áudio vai crescendo em relação ao vídeo.
//    Aqui tudo — voz, sons, trilhas — entra num `amix` único.
//
// 2. `amix` com `normalize=0`. Com a normalização ligada (o default) o ffmpeg
//    divide tudo pelo número de entradas, e os volumes medidos no projeto
//    aprovado (0,056 na trilha, 1,778 no clique) deixariam de valer.
//
// E uma terceira, desta peça:
//
// 3. O REBOBINAR CORTA VÍDEO E ÁUDIO JUNTOS. No projeto aprovado o stutter está na
//    trilha principal, que carrega a voz — ele é audível de propósito. Aplicar só
//    no vídeo deixaria a boca fora de sincronia com a fala.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [specP, entrada, saida] = process.argv.slice(2);
if (!saida) {
  console.error("uso: node acabamento.mjs <acabamento.json> <entrada.mp4> <saida.mp4>");
  process.exit(1);
}
const F = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const spec = JSON.parse(fs.readFileSync(specP, "utf8"));
const ASSETS = path.join(F, "assets");

const dur = () => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", entrada], { encoding: "utf8" });
  return Number(r.stdout.trim());
};
const D = dur();
const n = (x) => Number(x).toFixed(3);

// ── entradas ────────────────────────────────────────────────────────────────
const inputs = ["-i", entrada];
const leakSrc = path.join(ASSETS, "_biblioteca-visual/transicoes/Light Leak.mp4");
const passagens = spec.passagens || [];
for (const _ of passagens) inputs.push("-i", leakSrc);

const somIdx = [];
for (const s of spec.sons || []) {
  const p = path.isAbsolute(s.src) ? s.src : path.join(ASSETS, s.src);
  if (!fs.existsSync(p)) { console.warn(`  ⚠ som ausente, pulado: ${s.src}`); continue; }
  somIdx.push({ ...s, i: 1 + passagens.length + somIdx.length });
  inputs.push("-i", p);
}
const trIdx = [];
for (const t of spec.trilhas || []) {
  const p = path.isAbsolute(t.src) ? t.src : path.join(ASSETS, t.src);
  if (!fs.existsSync(p)) { console.warn(`  ⚠ trilha ausente, pulada: ${t.src}`); continue; }
  trIdx.push({ ...t, i: 1 + passagens.length + somIdx.length + trIdx.length });
  inputs.push("-i", p);
}

// ── vídeo: rebobinar → punch → passagens ────────────────────────────────────
const fc = [];
let V = "0:v", A = "0:a";

// ⚠️ O REBOBINAR TEM QUE CAIR NA GRADE DE QUADROS.
// O `trim` de vídeo arredonda para o quadro; o `atrim` de áudio é exato na
// amostra. Com pontos fora da grade os dois divergem: medido +35ms de desvio
// depois do rebobinar (contra +5ms de priming antes dele) — quase um quadro,
// e ele se propaga até o fim da peça. Encaixando tudo na grade, o saldo fecha.
const FPS = (() => {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", entrada], { encoding: "utf8" });
  const [a, b] = (r.stdout.trim() || "30/1").split("/").map(Number);
  return b ? a / b : 30;
})();
// O corte do VÍDEO cai no MEIO DO VÃO entre dois quadros; o do ÁUDIO no tempo
// exato do quadro. Cortar os dois no mesmo número decimal foi o que produziu os
// 38ms de desvio: `n()` arredonda para 3 casas e 48.267 > 1448/30 = 48.266667,
// então o quadro 1448 entrava no primeiro segmento E no replay — um quadro a
// mais, que empurra todo o resto da peça.
const emQuadro = (t) => Math.round(t * FPS);
const corteV = (k) => (k - 0.5) / FPS;   // exclusivo/inclusivo sem ambiguidade
const corteA = (k) => k / FPS;           // amostra exata

const reb = spec.rebobinar;
if (reb && reb.de !== null && reb.retomaEm !== null) {
  reb.kDe = emQuadro(reb.de);
  reb.kReplays = reb.replays.map((d) => Math.max(1, Math.round(d * FPS)));
  reb.kRetoma = reb.kDe + reb.kReplays.reduce((a, b) => a + b, 0);
  reb.de = corteA(reb.kDe);
  reb.retomaEm = corteA(reb.kRetoma);
  // replays SOBREPOSTOS: cada um relê o mesmo ponto, com durações crescentes —
  // toca um pedaço, volta, toca mais um pouco. Depois salta para a retomada,
  // descartando o vão, que é como o corte aprovado reentra em sincronia.
  // ⚠️ SPLIT EXPLÍCITO. Um pad de entrada do ffmpeg só pode ser consumido UMA vez.
  // Referenciar [0:v] em quatro `trim` diferentes não dá erro — e não faz o replay:
  // medido, os quadros que deviam repetir saíram todos distintos. Com `split`/`asplit`
  // cada ramo recebe a sua cópia e o rebobinar acontece de verdade.
  const nb = reb.replays.length + 2;
  fc.push(`[0:v]split=${nb}${[...Array(nb)].map((_, k) => `[sv${k}]`).join("")}`);
  fc.push(`[0:a]asplit=${nb}${[...Array(nb)].map((_, k) => `[sa${k}]`).join("")}`);
  const partes = [];
  const nv = (k) => corteV(k).toFixed(6);
  const na = (k) => corteA(k).toFixed(6);
  fc.push(`[sv0]trim=0:${nv(reb.kDe)},setpts=PTS-STARTPTS[v0]`,
          `[sa0]atrim=0:${na(reb.kDe)},asetpts=PTS-STARTPTS[a0]`);
  partes.push(["v0", "a0"]);
  reb.kReplays.forEach((kd, k) => {
    fc.push(`[sv${k + 1}]trim=${nv(reb.kDe)}:${nv(reb.kDe + kd)},setpts=PTS-STARTPTS[v${k + 1}]`,
            `[sa${k + 1}]atrim=${na(reb.kDe)}:${na(reb.kDe + kd)},asetpts=PTS-STARTPTS[a${k + 1}]`);
    partes.push([`v${k + 1}`, `a${k + 1}`]);
  });
  const kf = reb.kReplays.length + 1;
  fc.push(`[sv${kf}]trim=${nv(reb.kRetoma)},setpts=PTS-STARTPTS[v${kf}]`,
          `[sa${kf}]atrim=${na(reb.kRetoma)},asetpts=PTS-STARTPTS[a${kf}]`);
  partes.push([`v${kf}`, `a${kf}`]);
  fc.push(`${partes.map(([v, a]) => `[${v}][${a}]`).join("")}concat=n=${partes.length}:v=1:a=1[vr][ar]`);
  V = "vr"; A = "ar";
}

// PUNCH: escala PARADA na janela (sem animação, sem clarão — é o que ele usa).
// Feito por overlay de uma cópia ampliada e recortada no centro, ligada só na janela.
if ((spec.punches || []).length) {
  const cond = spec.punches.map((p) => `between(t,${n(p.de)},${n(p.ate)})`).join("+");
  const e = spec.punches[0].escala || 1.15;
  fc.push(`[${V}]split=2[pb][pz]`,
    `[pz]scale=iw*${e}:ih*${e},crop=iw/${e}:ih/${e}[pzc]`,
    `[pb][pzc]overlay=0:0:enable='${cond}'[vp]`);
  V = "vp";
}

// PASSAGENS: Light Leak a 3x. Normal ABRE, invertido FECHA. Overlay normal a 41%
// de opacidade — no projeto aprovado `blend` é null e `clip.alpha` 0.41 nas 12.
// ⚠️ A ALFA DO VAZAMENTO VEM DA LUMINÂNCIA DELE, não é uma opacidade fixa.
// Medido no asset: ele é um FLASH, não um brilho — quadros de luminância 4 → 255 → 9.
// Composto com opacidade fixa de 41%, os quadros pretos ESCURECEM a cena 35% por
// 3-4 quadros (medido: base 69-78 caindo para 43-45). Derivando a alfa da própria
// luminância, o preto vira transparente e sobra só a luz, que é o que o efeito é.
passagens.forEach((p, k) => {
  const i = 1 + k;
  const inv = p.invertido ? ",reverse" : "";
  const base = `[${i}:v]trim=0:0.72,setpts=PTS-STARTPTS${inv},setpts=PTS/3+${n(p.em)}/TB,` +
               `scale=1080:1920:flags=lanczos`;
  fc.push(`${base},split=2[lc${k}][lm${k}]`);
  fc.push(`[lm${k}]format=gray,lut=y='val*0.41'[la${k}]`);
  fc.push(`[lc${k}]format=yuva420p[lcc${k}]`);
  fc.push(`[lcc${k}][la${k}]alphamerge[lk${k}]`);
  fc.push(`[${V}][lk${k}]overlay=0:0:eof_action=pass:enable='between(t,${n(p.em)},${n(p.em + 0.24)})'[vk${k}]`);
  V = `vk${k}`;
});

// ── áudio: voz com o ganho da janela + sons + trilhas, num amix só ──────────
const gain = (spec.vozGanho || [])[0];
const voz = gain
  ? `[${A}]volume=${gain.fator}:enable='between(t,${n(gain.de)},${n(gain.ate)})'[voz]`
  : `[${A}]anull[voz]`;
fc.push(voz);
const mix = ["[voz]"];

for (const s of somIdx) {
  fc.push(`[${s.i}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,` +
          `volume=${s.volume},adelay=${Math.round(s.em * 1000)}|${Math.round(s.em * 1000)}[s${s.i}]`);
  mix.push(`[s${s.i}]`);
}
for (const t of trIdx) {
  const fi = t.fadeIn ? `,afade=t=in:st=0:d=${n(t.fadeIn)}` : "";
  const fo = t.fadeOut ? `,afade=t=out:st=${n(Math.max(0, t.duracao - t.fadeOut))}:d=${n(t.fadeOut)}` : "";
  fc.push(`[${t.i}:a]atrim=start=${n(t.posicaoNaFonte)}:duration=${n(t.duracao)},asetpts=PTS-STARTPTS,` +
          `aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,` +
          `volume=${t.volume}${fi}${fo},adelay=${Math.round(t.em * 1000)}|${Math.round(t.em * 1000)}[t${t.i}]`);
  mix.push(`[t${t.i}]`);
}
// ⚠️ `alimiter` COM level=disabled. O padrão do ffmpeg é `level=enabled`, que não
// só limita: NORMALIZA o sinal até o teto. Com limit=0.97 a peça 5 saiu de -4,3 dB
// no render para -0,0 dB no final e o qc_video reprovou por clipping; a peça 4
// ficou em -0,5, na borda exata do portão. Com level desligado o limitador só
// segura o pico, e 0.89 (~-1 dB) deixa folga para o overshoot do encode AAC.
fc.push(`${mix.join("")}amix=inputs=${mix.length}:normalize=0:dropout_transition=0,` +
        `atrim=0:${n(D)},alimiter=limit=0.89:level=disabled[aout]`);

// ── encode ──────────────────────────────────────────────────────────────────
const args = [
  "-y", ...inputs,
  "-filter_complex", fc.join(";"),
  "-map", `[${V}]`, "-map", "[aout]",
  "-c:v", "libx264", "-preset", "medium", "-crf", "17",
  "-pix_fmt", "yuv420p", "-color_range", "tv",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
  "-movflags", "+faststart", saida,
];

// --debug imprime o grafo montado. Sem isso, um erro de montagem do
// filter_complex é invisível: o ffmpeg aceita e produz um vídeo plausível.
if (process.argv.includes("--debug")) {
  console.log("--- filter_complex ---");
  for (const c of fc) console.log("  " + c);
  console.log("--- fim ---");
}
console.log(`acabamento: ${path.basename(entrada)} -> ${path.basename(saida)}`);
console.log(`  ${(spec.punches || []).length} corridas de punch · ${passagens.length} passagens · ` +
  `${somIdx.length} sons · ${trIdx.length} pedaços de trilha` + (reb ? " · rebobinar" : ""));
const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "inherit", "pipe"], encoding: "utf8" });
if (r.status !== 0) {
  console.error(r.stderr.split("\n").slice(-25).join("\n"));
  process.exit(1);
}
console.log(`pronto: ${saida}`);
