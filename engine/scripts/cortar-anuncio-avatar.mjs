// cortar-anuncio-avatar.mjs — remove pedaços de DENTRO de uma peça já montada, sem re-render.
//
// Uso:  cd D:/VIDEO-FACTORY/engine
//       node scripts/cortar-anuncio-avatar.mjs <entrada.mp4> <saida.mp4> "ini:fim" ["ini:fim" ...]
//       node scripts/cortar-anuncio-avatar.mjs <entrada.mp4> --ouvir "ini:fim"     (só transcreve)
//
// PARA QUE SERVE: depois da peça pronta chega o pedido de tirar uma palavra ou encurtar um
// respiro. Regravar + re-renderizar custa crédito (~6) e alguns minutos; cortar custa ZERO
// crédito e ~1 min. A lição que custou um ciclo: quando o pedido é CORTAR, corte — regravar
// "de novo do zero" queima crédito das ferramentas à toa e ainda muda a entonação do resto.
//
// DECISÕES QUE VALEM LER ANTES DE MEXER:
//
// 1. CONFIRMAR O QUE TEM NA JANELA ANTES DE CORTAR, NÃO DEPOIS. Já se cortou uma janela
//    inteira achando que ali estava a palavra a remover — e a palavra estava ANTES da pausa,
//    não depois; o que saiu foi o começo da frase seguinte. Gastou um ciclo inteiro. Rode
//    --ouvir na janela e leia o que realmente está lá antes de cortar de verdade.
//
// 2. PALAVRA SÓ SAI LIMPA SE TIVER VALE DOS DOIS LADOS. Rodar silencedetect em três limiares
//    (-25/-20/-16 dB, d=0.01) revela as fronteiras de sílaba que o -40 dB não vê. Sem vale, a
//    palavra está fundida com a vizinha (vogal final que elide na vogal seguinte) e não dá
//    para separar — aí o caminho honesto é regravar, e DIZER isso, em vez de entregar emenda
//    estalada.
//
// 3. O ÁUDIO SE RECONSTRÓI CONTRA O VÍDEO, IGUAL NA MONTAGEM. Cortar áudio e vídeo juntos com
//    -ss/-to deriva: o AAC corta em bloco, o vídeo em frame. Na 1ª tentativa deu 52 ms.
//    Separar os fluxos e reconstruir o áudio contra a duração exata de cada pedaço já
//    processado fecha em 0,0000 s.
//
// 4. FUSÃO DE 2 FRAMES NA EMENDA. Corte seco no meio de um gesto vira pulo de mão. 0,08 s
//    cobre sem virar transição visível.
//
// Fluxo completo do módulo: `AVATAR-IA.md` (raiz) · base do HeyGen: `docs/heygen/`

// spawnSync, não execFileSync: o silencedetect escreve no STDERR e o execFileSync
// só devolve o stdout. Essa pegadinha já custou duas depurações.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { F, PADRAO, dur, transcrever } from "./_anuncio-avatar.mjs";

const FUSAO = 0.08;                 // 2 frames a 25 fps
const TMP = `${F}/assets/_corte-tmp`;

const argv = process.argv.slice(2);
const ENT = argv[0];
const ouvir = argv.includes("--ouvir");
const janelas = argv.filter((a) => /^[\d.]+:[\d.]+$/.test(a)).map((c) => c.split(":").map(Number));

if (!ENT || !janelas.length) {
  console.error(`falta argumento.
  node scripts/cortar-anuncio-avatar.mjs entrada.mp4 saida.mp4 "10.125:10.377" "12.682:13.400"
  node scripts/cortar-anuncio-avatar.mjs entrada.mp4 --ouvir "9.9:10.4"`);
  process.exit(1);
}

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

// --ouvir: portão obrigatório antes de cortar. Diz o que tem na janela e onde estão os vales.
if (ouvir) {
  for (const [ini, fim] of janelas) {
    console.log(`\n=== ${ini.toFixed(3)}s -> ${fim.toFixed(3)}s ===`);
    console.log(`  "${transcrever(ENT, ini, fim - ini, `${TMP}/o.wav`)}"`);
    for (const db of [-25, -20, -16]) {
      const r = spawnSync("ffmpeg", ["-hide_banner", "-ss", String(ini), "-t", String(fim - ini),
        "-i", ENT, "-af", `silencedetect=noise=${db}dB:d=0.01`, "-f", "null", "-"],
        { encoding: "utf8" });
      const vales = [...(r.stderr ?? "").matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)]
        .map((m) => `${(+m[1] + ini).toFixed(3)}-${(+m[2] + ini).toFixed(3)}`);
      console.log(`  ${String(db).padStart(3)}dB: ${vales.join(" · ") || "(sem vale)"}`);
    }
  }
  console.log(`\nPalavra sem vale dos dois lados está fundida na vizinha — não dá para cortar limpo.`);
  process.exit(0);
}

const SAI = argv[1];
const total = dur(ENT);
janelas.sort((a, b) => a[0] - b[0]);

// os pedaços que FICAM
const pedacos = [];
let cursor = 0;
for (const [ini, fim] of janelas) { pedacos.push([cursor, ini]); cursor = fim; }
pedacos.push([cursor, total]);

console.log(`entrada ${total.toFixed(3)}s`);
janelas.forEach(([i, f]) => console.log(`  corta ${i.toFixed(3)} -> ${f.toFixed(3)}  (${(f - i).toFixed(3)}s)`));

// vídeo e áudio separados; o áudio se ajusta ao plano já processado (ver decisão 3)
const segs = [], auds = [];
pedacos.forEach(([ini, fim], i) => {
  const v = `${TMP}/s${i}.mp4`, a = `${TMP}/a${i}.wav`;
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
    "-ss", ini.toFixed(4), "-to", fim.toFixed(4), "-i", ENT,
    "-vf", `fps=${PADRAO.fps},setsar=1`, "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", v]);
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
    "-ss", ini.toFixed(4), "-to", fim.toFixed(4), "-i", ENT,
    "-vn", "-af", "apad", "-t", dur(v).toFixed(4),
    "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", a]);
  segs.push(v); auds.push(a);
});

let filtro = "", entradas = [], offset = 0, corrente = "[0:v]";
segs.forEach((s) => entradas.push("-i", s));
for (let i = 1; i < segs.length; i++) {
  offset += dur(segs[i - 1]) - (i > 1 ? FUSAO : 0);
  const out = i === segs.length - 1 ? "[v]" : `[x${i}]`;
  filtro += `${corrente}[${i}:v]xfade=transition=fade:duration=${FUSAO}:offset=${(offset - FUSAO).toFixed(4)}${out};`;
  corrente = out;
}
const mudo = `${TMP}/_mudo.mp4`;
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...entradas,
  "-filter_complex", filtro.replace(/;$/, ""), "-map", "[v]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", mudo]);

let entA = [], filtA = "", corA = "[0:a]";
auds.forEach((f) => entA.push("-i", f));
for (let i = 1; i < auds.length; i++) {
  const out = i === auds.length - 1 ? "[a]" : `[y${i}]`;
  filtA += `${corA}[${i}:a]acrossfade=d=${FUSAO}:c1=tri:c2=tri${out};`;
  corA = out;
}
const trilha = `${TMP}/_trilha.wav`;
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...entA,
  "-filter_complex", filtA.replace(/;$/, ""), "-map", "[a]",
  "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", trilha]);

execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
  "-i", mudo, "-i", trilha, "-map", "0:v:0", "-map", "1:a:0",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", SAI]);

const deriva = dur(mudo) - dur(trilha);
console.log(`saída   ${dur(SAI).toFixed(3)}s  (encurtou ${(total - dur(SAI)).toFixed(3)}s)  deriva ${deriva.toFixed(4)}s`);
if (Math.abs(deriva) > 0.005) console.log(`  🔴 DERIVA ACIMA DE 5 ms — não entregar assim.`);
console.log(`\nCONFERIR DEPOIS: rode --ouvir na região do corte e leia o que sobrou.`);
