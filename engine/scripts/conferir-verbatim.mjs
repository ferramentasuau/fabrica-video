// conferir-verbatim.mjs — portão obrigatório entre a locução e o render.
//
// Uso:  cd D:/VIDEO-FACTORY/engine
//       node scripts/conferir-verbatim.mjs ../jobs/<seu-job>/anuncio-avatar.json
//       node scripts/conferir-verbatim.mjs <job.json> --peca 3
//
// POR QUE ELE EXISTE, e a lição que custou caro:
//
// Uma locução de 45 s foi transcrita inteira com o whisper medium, faltava uma frase, e a
// TTS foi acusada de ter pulado conteúdo. NÃO TINHA PULADO. Isolando o bloco, a frase estava
// lá completa — QUEM ENGOLE TRECHO É O TRANSCRITOR, em arquivo longo. A ferramenta certa
// levou a culpa pelo erro do instrumento de medida.
//
// Por isso: janelas de 12 s com 3 s de sobreposição. Nessa duração ele não erra, e a
// sobreposição mostra a costura — se um trecho some numa janela, aparece na vizinha.
//
// E MONOSSÍLABO ÁTONO SOME MESMO DENTRO DA JANELA, se cair no meio. Uma conjunção enfática
// de uma letra só, escrita de propósito no roteiro, desapareceu em duas janelas seguidas e
// só apareceu quando foi reisolada com ela no começo do recorte. Por isso o script reisola
// sozinho toda palavra curta que o job marcar como crítica (campo `criticas` do trecho).
//
// Fluxo completo do módulo: `AVATAR-IA.md` (raiz) · base do HeyGen: `docs/heygen/`

import fs from "node:fs";
import { F, dur, lerJob, transcrever } from "./_anuncio-avatar.mjs";

const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith("--"));
const iPeca = argv.indexOf("--peca");
const soPeca = (argv.find((a) => a.startsWith("--peca=")) ?? "").split("=")[1]
            ?? (iPeca >= 0 ? argv[iPeca + 1] : null);

const JANELA = 12, PASSO = 9;   // 3 s de sobreposição
const job = lerJob(pos[0]);
const marca = job.marca ?? "demo";
const tmp = `${F}/assets/${marca}/audio/_conferencia.wav`;

// normaliza para comparar: minúsculas, sem pontuação
const limpar = (s) => s.toLowerCase()
  .replace(/[.,;:!?…"'—–-]/g, " ")
  .replace(/\s+/g, " ").trim();

let alertas = 0;

for (const peca of job.pecas) {
  if (soPeca && String(peca.id) !== String(soPeca)) continue;
  console.log(`\n######## ${peca.id} · ${peca.titulo} ########`);

  for (const t of peca.trechos) {
    const f = `${F}/assets/${marca}/audio/${peca.pasta}/${t.id}.mp3`;
    if (!fs.existsSync(f)) { console.log(`  ${t.id}  FALTA — rode build-anuncio-avatar primeiro`); alertas++; continue; }

    const total = dur(f);
    let ouvido = "";
    console.log(`\n  --- ${t.id} (${total.toFixed(1)}s) ---`);
    for (let i = 0; i < total; i += PASSO) {
      const txt = transcrever(f, i, JANELA, tmp);
      console.log(`  [${String(Math.round(i)).padStart(2)}s] ${txt}`);
      ouvido += " " + txt;
    }

    // conferência grosseira: que palavras do roteiro não apareceram em lugar nenhum
    const dito = limpar(ouvido);
    const faltando = limpar(t.texto).split(" ")
      .filter((p) => p.length > 3 && !dito.includes(p));
    if (faltando.length) {
      console.log(`  ⚠ não ouvidas: ${[...new Set(faltando)].join(" · ")}`);
      alertas++;
    }

    // reisolamento das palavras críticas (monossílabo some no meio da janela)
    for (const crit of t.criticas ?? []) {
      const achou = dito.includes(limpar(crit));
      if (!achou) {
        // procura de novo, em janelas de 5 s deslizando de 2 em 2
        let confirmou = false;
        for (let i = 0; i < total && !confirmou; i += 2) {
          if (limpar(transcrever(f, i, 5, tmp)).includes(limpar(crit))) confirmou = true;
        }
        console.log(confirmou
          ? `  ✅ "${crit}" confirmada no reisolamento (a janela larga tinha engolido)`
          : `  🔴 "${crit}" NÃO CONFIRMADA nem isolada — conferir o áudio à mão`);
        if (!confirmou) alertas++;
      } else {
        console.log(`  ✅ "${crit}" presente`);
      }
    }
  }
}

console.log(`\n\n${alertas === 0
  ? "OK — nada engolido. Pode renderizar."
  : `⚠ ${alertas} ponto(s) para o seu olho antes de renderizar.`}`);
console.log(`\nLembre: nem todo alerta é erro. O transcritor troca palavras homófonas, junta ou`);
console.log(`separa artigos e escreve número por extenso como dígito. Julgue pelo sentido.`);
