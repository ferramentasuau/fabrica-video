// cutout-pessoa.mjs — gera o RECORTE da pessoa (alpha) para o efeito de texto
// atrás da cabeça (sanduíche: vídeo -> texto -> pessoa por cima).
//
// Motores (adendo 4, 17/08/2026):
//   --engine rvm   (default) RobustVideoMatting — matting de PESSOA feito para
//                  VÍDEO, com memória temporal (sem flicker entre quadros) e
//                  cabelo bem resolvido. O rembg/u2net recortava o mobiliário
//                  junto e tremia por ser quadro-a-quadro (medido no magenta).
//   --engine rembg fallback antigo (U2Net human_seg, por quadro).
//
// O RVM vem via torch.hub (repo PeterL1n/RobustVideoMatting): primeiro uso
// baixa código+checkpoint para o cache do torch; depois roda 100% offline.
//
// Uso: node engine/scripts/cutout-pessoa.mjs <video> [saida.webm] [--de 0] [--ate 2]
//                                            [--fps 25] [--engine rvm] [--pngseq <dir>]
//
// ⚠️ Os POSICIONAIS vêm antes de todas as flags — o parser abaixo descarta
// qualquer posicional cujo antecessor comece com "--".
//
// DUAS saídas possíveis:
//
//   --pngseq <dir>  (adendo 27, 18/08) grava f0001.png, f0002.png… com alpha —
//                   é o que o `cutoutSeq` do template consome. Com ele o passo
//                   do WebM é PULADO de propósito: o alfa do VP9 só existe
//                   dentro do decoder libvpx, o extrator do Remotion o ignora,
//                   e o recorte saía INVISÍVEL (provado por diff de pixels = 0,
//                   commit 6c43a43). Gerar esse arquivo seria só custo.
//                   O alphamerge vai direto de fgr+pha para PNG: nada de
//                   round-trip por VP9 com perda.
//
//   <saida.webm>    modo antigo, WebM VP9 alpha (yuva420p). Mantido para não
//                   quebrar chamada de job antigo — mas prefira --pngseq.

import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const argv = process.argv.slice(2);
const pos = argv.filter((a, i) => !a.startsWith("--") && (i === 0 || !argv[i - 1].startsWith("--")));
const flag = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : d;
};
const [video, saida] = pos;
const de = Number(flag("de", 0));
const ate = Number(flag("ate", 2));
const fps = Number(flag("fps", 25));
const engine = flag("engine", "rvm");
const pngseq = flag("pngseq", null);

if (!video || (!saida && !pngseq)) {
  console.error("uso: node cutout-pessoa.mjs <video> [saida.webm] [--de s] [--ate s] [--fps n] [--engine rvm|rembg] [--pngseq dir]");
  console.error("     (posicionais ANTES das flags; --pngseq dispensa a saida.webm)");
  process.exit(1);
}
if (!Number.isFinite(de) || !Number.isFinite(ate) || !Number.isFinite(fps) || ate <= de) {
  console.error(`janela invalida: --de ${de} --ate ${ate} --fps ${fps}`);
  process.exit(1);
}
if (pngseq) fs.mkdirSync(pngseq, { recursive: true });

// alphamerge de fgr+pha direto para f%04d.png — sem passar por VP9 (onde o
// alfa morre). É a etapa que faltava: até aqui a PNG-seq era feita à mão.
const gravarPngSeq = (fgrDir, phaDir) => {
  execSync(
    `ffmpeg -v error -framerate ${fps} -i "${path.join(fgrDir, "%04d.png")}" ` +
    `-framerate ${fps} -i "${path.join(phaDir, "%04d.png")}" ` +
    `-filter_complex "[0][1]alphamerge" -start_number 1 "${path.join(pngseq, "f%04d.png")}" -y`
  );
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cutout-"));
const inDir = path.join(tmp, "in");
fs.mkdirSync(inDir);

console.log(`1/3 extraindo quadros ${de}s..${ate}s @${fps}fps`);
execSync(
  `ffmpeg -v error -ss ${de} -i "${video}" -t ${ate - de} -vf fps=${fps} "${path.join(inDir, "%04d.png")}" -y`
);
const n = fs.readdirSync(inDir).length;
console.log(`   ${n} quadros`);

if (engine === "rvm") {
  console.log("2/3 matting RVM (mobilenetv3, temporal, CPU)...");
  const fgrDir = path.join(tmp, "fgr");
  const phaDir = path.join(tmp, "pha");
  // fgr = foreground previsto (cores limpas na borda) · pha = alpha.
  const py = `
import sys, torch
model = torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3", trust_repo=True).eval()
convert_video = torch.hub.load("PeterL1n/RobustVideoMatting", "converter", trust_repo=True)
convert_video(
    model,
    input_source=sys.argv[1],
    output_type="png_sequence",
    output_foreground=sys.argv[2],
    output_alpha=sys.argv[3],
    downsample_ratio=None,  # auto (~512/lado maior)
    seq_chunk=4,
    device="cpu",
)
`;
  const pyFile = path.join(tmp, "_rvm.py");
  fs.writeFileSync(pyFile, py);
  execSync(`python "${pyFile}" "${inDir}" "${fgrDir}" "${phaDir}"`, { stdio: "inherit" });

  if (pngseq) {
    console.log(`3/3 gravando PNG-seq com alpha em ${pngseq}...`);
    gravarPngSeq(fgrDir, phaDir);
  } else {
    console.log("3/3 montando WebM VP9 alpha (fgr + alphamerge)...");
    execSync(
      `ffmpeg -v error -framerate ${fps} -i "${path.join(fgrDir, "%04d.png")}" ` +
      `-framerate ${fps} -i "${path.join(phaDir, "%04d.png")}" ` +
      `-filter_complex "[0][1]alphamerge" ` +
      `-c:v libvpx-vp9 -pix_fmt yuva420p -b:v 3M -auto-alt-ref 0 "${saida}" -y`
    );
  }
} else {
  console.log("2/3 segmentando a pessoa (rembg u2net_human_seg, API python)...");
  const outDir = path.join(tmp, "out");
  fs.mkdirSync(outDir);
  // API direto em vez do CLI: o `rembg p` puxa dependências de servidor (gradio)
  // que não interessam aqui. Uma sessão só para todos os quadros (mais rápido).
  const py = `
import os, sys
from rembg import remove, new_session
sess = new_session("u2net_human_seg")
ind, outd = sys.argv[1], sys.argv[2]
files = sorted(f for f in os.listdir(ind) if f.endswith(".png"))
for i, f in enumerate(files):
    with open(os.path.join(ind, f), "rb") as fh:
        data = fh.read()
    with open(os.path.join(outd, f), "wb") as fh:
        fh.write(remove(data, session=sess))
    if (i + 1) % 10 == 0:
        print(f"   {i+1}/{len(files)}", flush=True)
print(f"   {len(files)}/{len(files)} ok")
`;
  const pyFile = path.join(tmp, "_seg.py");
  fs.writeFileSync(pyFile, py);
  execSync(`python "${pyFile}" "${inDir}" "${outDir}"`, { stdio: "inherit" });

  if (pngseq) {
    // o rembg já devolve PNG com alpha: só renomear para o contrato f%04d.png
    console.log(`3/3 gravando PNG-seq com alpha em ${pngseq}...`);
    for (const [i, f] of fs.readdirSync(outDir).sort().entries()) {
      fs.copyFileSync(path.join(outDir, f), path.join(pngseq, `f${String(i + 1).padStart(4, "0")}.png`));
    }
  } else {
    console.log("3/3 montando WebM VP9 alpha...");
    execSync(
      `ffmpeg -v error -framerate ${fps} -i "${path.join(outDir, "%04d.png")}" ` +
      `-c:v libvpx-vp9 -pix_fmt yuva420p -b:v 3M -auto-alt-ref 0 "${saida}" -y`
    );
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
if (pngseq) {
  const arquivos = fs.readdirSync(pngseq).filter((f) => /^f\d{4}\.png$/.test(f));
  const bytes = arquivos.reduce((s, f) => s + fs.statSync(path.join(pngseq, f)).size, 0);
  console.log(`pronto: ${pngseq} (${arquivos.length} PNGs, ${(bytes / 1048576).toFixed(1)} MB, engine=${engine})`);
  console.log(`  no manifest: { dir: "<relativo ao publicDir>", fps: ${fps}, frames: ${arquivos.length}, deSegundo: ${de} }`);
} else {
  const mb = (fs.statSync(saida).size / 1048576).toFixed(1);
  console.log(`pronto: ${saida} (${mb} MB, ${n} quadros, engine=${engine})`);
}
