// checar-trilhas.mjs — o portão da regra que já estava escrita e ninguém garantia.
//
// references/orquestracao.md:229 — "Duas músicas ao mesmo tempo competem. Se as duas
// precisam existir no mesmo trecho, uma sai e a outra entra no vão."
//
// Este script lê uma partitura de acabamento e falha se duas CAMAS se sobrepuserem.
// Cama é trilha longa: acima de 2s. Abaixo disso é revezamento (o `Cassette tape,
// rewind` do aparte tem 1,06s e entra encostando no pedaço seguinte de propósito).
//
// Uso:
//   node engine/scripts/checar-trilhas.mjs <acabamento.json> [mais.json ...]
//
// Sai com código 1 se qualquer arquivo tiver sobreposição — serve de portão antes
// de gastar um render.

import fs from "node:fs";
import path from "node:path";

const alvos = process.argv.slice(2);
if (!alvos.length) {
  console.error("uso: node checar-trilhas.mjs <acabamento.json> [mais.json ...]");
  process.exit(1);
}

const MINIMO_CAMA = 2; // segundos
const r2 = (x) => Number(Number(x).toFixed(2));
let falhou = false;

for (const alvo of alvos) {
  const nome = path.basename(alvo);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(alvo, "utf8"));
  } catch (e) {
    console.error(`✗ ${nome}: não deu para ler — ${e.message}`);
    falhou = true;
    continue;
  }

  const camas = (spec.trilhas || [])
    .map((t, i) => ({ i, nome: t.arquivo, de: t.em, ate: r2(t.em + t.duracao) }))
    .filter((t) => t.ate - t.de > MINIMO_CAMA)
    .sort((a, b) => a.de - b.de);

  const choques = [];
  for (let a = 0; a < camas.length; a++)
    for (let b = a + 1; b < camas.length; b++) {
      const de = Math.max(camas[a].de, camas[b].de);
      const ate = Math.min(camas[a].ate, camas[b].ate);
      if (ate > de) choques.push({ de: r2(de), ate: r2(ate), a: camas[a], b: camas[b] });
    }

  const total = r2(choques.reduce((s, c) => s + (c.ate - c.de), 0));

  if (!choques.length) {
    console.log(`✓ ${nome}: ${camas.length} camas, sobreposição 0,00s`);
    continue;
  }

  falhou = true;
  console.error(`✗ ${nome}: ${total}s de duas camas ao mesmo tempo`);
  for (const c of choques)
    console.error(`    ${c.de}s → ${c.ate}s  ·  "${c.a.nome}" (${c.a.de}→${c.a.ate}) x "${c.b.nome}" (${c.b.de}→${c.b.ate})`);
}

process.exit(falhou ? 1 : 0);
