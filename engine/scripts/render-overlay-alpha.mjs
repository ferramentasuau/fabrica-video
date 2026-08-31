// Renderiza uma composição do Remotion como OVERLAY TRANSPARENTE que o CapCut aceita.
//
// Por que este script existe (e por que não é só um comando):
// O caminho óbvio — WebM/VP8 com alpha — NÃO FUNCIONA no CapCut. Testado no
// CapCut 9.1.0.3879 em 14/08/2026: o arquivo tem alpha válido (`alpha_mode=1` no
// contêiner, decodifica em `yuva420p` com libvpx), mas o CapCut ignora o canal e
// mostra o overlay com fundo opaco. Quem passa é `.mov`.
//
// Dois formatos confirmados transparentes em teste dentro do CapCut:
//   · ProRes 4444          — nativo do Remotion, 1 passo, ~105 MB / 15s
//   · QuickTime Animation  — lossless, ~82 MB / 15s (22% menor), exige 1 passo a mais
//
// Padrão daqui: qtrle. O ProRes fica como opção para overlay com gradiente ou
// imagem complexa, onde RLE para de compensar.
//
// Uso:
//   node scripts/render-overlay-alpha.mjs <Composicao> <props.json> <saida.mov> [--prores]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const [comp, props, saida, ...resto] = process.argv.slice(2);
if (!comp || !props || !saida) {
  console.error(
    "uso: node scripts/render-overlay-alpha.mjs <Composicao> <props.json> <saida.mov> [--prores]"
  );
  process.exit(1);
}
if (path.extname(saida).toLowerCase() !== ".mov") {
  console.error(`saída precisa ser .mov (o CapCut recusa o alpha do WebM) — veio: ${saida}`);
  process.exit(1);
}

const soProRes = resto.includes("--prores");

// Chamamos o CLI do Remotion pelo JS, não por `npx`. Dois motivos, os dois reais:
// · `shell: true` faz o Node concatenar argumentos sem escapar — e aqui eles são
//   caminhos com espaço; o próprio Node emite DEP0190 avisando disso.
// · sem shell, o Node 24 recusa spawn de `.cmd` no Windows com EINVAL (mitigação
//   de injeção de argumentos). Ou seja: npx não tem saída boa aqui.
// O entrypoint abaixo é o `bin.remotion` do pacote @remotion/cli.
const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const REMOTION_CLI = path.resolve(AQUI, "..", "node_modules", "@remotion", "cli", "remotion-cli.js");
if (!fs.existsSync(REMOTION_CLI)) {
  console.error(`CLI do Remotion não encontrado em ${REMOTION_CLI} — rode npm install em engine/`);
  process.exit(1);
}

const roda = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });

// Passo 1 — Remotion em ProRes 4444. --image-format=png é obrigatório: sem ele o
// Remotion recusa qualquer pixel format com alpha.
const intermediario = soProRes
  ? saida
  : path.join(os.tmpdir(), `overlay-prores-${Date.now()}.mov`);

roda(process.execPath, [
  REMOTION_CLI, "render", comp,
  `--props=${props}`,
  "--codec=prores",
  "--prores-profile=4444",
  "--image-format=png",
  "--pixel-format=yuva444p10le",
  `--output=${intermediario}`,
]);

if (soProRes) {
  console.log(`ProRes 4444 pronto: ${saida}`);
  process.exit(0);
}

// Passo 2 — converte para QuickTime Animation (lossless, alpha em ARGB).
roda("ffmpeg", ["-y", "-v", "error", "-i", intermediario, "-c:v", "qtrle", "-pix_fmt", "argb", saida]);
fs.unlinkSync(intermediario);

const mb = (fs.statSync(saida).size / (1024 * 1024)).toFixed(1);
console.log(`QuickTime Animation pronto: ${saida} (${mb} MB)`);
console.log("importe no CapCut como qualquer vídeo — o alpha é respeitado.");
