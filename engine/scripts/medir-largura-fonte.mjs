// medir-largura-fonte.mjs — gera o JSON de larguras REAIS de uma fonte
// (avanço por caractere, em unidades em), para o fit-to-width dos displays
// acertar o tamanho por MEDIÇÃO em vez de média chutada (adendo 12, 17/08 —
// pedido do usuário: "faça um json para você acertar o tamanho").
//
// Uso: node engine/scripts/medir-largura-fonte.mjs <fonte.woff2> <saida.json>
// Ex.:  node engine/scripts/medir-largura-fonte.mjs assets/demo/fonts/inter-800.woff2 engine/src/lib/larguras-inter-800.json

import fs from "node:fs";
import * as fontkit from "fontkit";

const [arquivo, saida] = process.argv.slice(2);
if (!arquivo || !saida) {
  console.error("uso: node medir-largura-fonte.mjs <fonte.woff2> <saida.json>");
  process.exit(1);
}

const fonte = fontkit.openSync(arquivo);
const upm = fonte.unitsPerEm;

// caixa alta + números + acentuação PT + pontuação usada em display
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  "abcdefghijklmnopqrstuvwxyz" +
  "0123456789" +
  "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ" +
  "áàâãäéèêëíìîïóòôõöúùûüç" +
  " .,!?-–—:;'\"()%R$";

const larguras = {};
// TINTA (adendo 20, 18/08): onde o desenho da letra comeca e termina DENTRO da
// caixa. A caixa (advance) tem folga interna (side bearing) — por isso
// "encostar as caixas" nunca encosta o que o olho ve.
const tinta = {};
const tintaY = {};
for (const ch of CHARS) {
  const run = fonte.layout(ch);
  if (!run.glyphs.length) continue;
  larguras[ch] = Number((run.advanceWidth / upm).toFixed(4));
  const bbox = run.glyphs[0].bbox;
  if (bbox && Number.isFinite(bbox.minX) && bbox.maxX > bbox.minX) {
    tinta[ch] = [Number((bbox.minX / upm).toFixed(4)), Number((bbox.maxX / upm).toFixed(4))];
    // tinta VERTICAL (adendo 21): topo e base do desenho, relativos a
    // linha de base (positivo = acima). A caixa da linha e bem mais alta
    // que isso — por isso mexer em % do corpo nao movia o vao visivel.
    tintaY[ch] = [Number((bbox.minY / upm).toFixed(4)), Number((bbox.maxY / upm).toFixed(4))];
  }
}

fs.writeFileSync(
  saida,
  JSON.stringify({ fonte: arquivo.split(/[\\/]/).pop(), unitsPerEm: upm,
    ascent: Number((fonte.ascent / upm).toFixed(4)),
    descent: Number((fonte.descent / upm).toFixed(4)),
    larguras,
    tinta,
    tintaY,
  }, null, 2)
);
console.log(`ok: ${Object.keys(larguras).length} caracteres → ${saida}`);
console.log("amostra:", ["M", "I", " ", ".", "É"].map((c) => `${JSON.stringify(c)}=${larguras[c]}`).join(" "));
