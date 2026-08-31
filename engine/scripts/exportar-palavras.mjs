// Ponte da Fase 9: converte o captions.json da fábrica (Whisper local,
// [{text,startMs,endMs}]) para o CONTRATO DE PALAVRAS da SPEC
// ({words:[{text,start,end,confidence,emphasis}]}, tempos em segundos) —
// o formato que os DOIS motores de legenda entendem:
//   · vectcut  → ferramenta add_dynamic_captions do MCP vectcut-safe
//   · remotion → props do CaptionOverlay / LegendaDinamica
//
// Uso:  node scripts/exportar-palavras.mjs <captions.json> <saida.json> [--srt <saida.srt>]
//       [--enfase palavra1,palavra2]   marca emphasis:"keyword" nessas palavras
import fs from "node:fs";

const [entrada, saida, ...resto] = process.argv.slice(2);
if (!entrada || !saida) {
  console.error("uso: node scripts/exportar-palavras.mjs <captions.json> <saida.json> [--srt <arquivo>] [--enfase a,b,c]");
  process.exit(1);
}

const enfIdx = resto.indexOf("--enfase");
const enfases = enfIdx >= 0 ? new Set(resto[enfIdx + 1].split(",").map(p => p.trim().toLowerCase())) : new Set();
const srtIdx = resto.indexOf("--srt");
const srtPath = srtIdx >= 0 ? resto[srtIdx + 1] : null;

const bruto = JSON.parse(fs.readFileSync(entrada, "utf8"));
const lista = Array.isArray(bruto) ? bruto : bruto.words;
if (!Array.isArray(lista)) { console.error("formato não reconhecido"); process.exit(1); }

// filtra marcações de música do Whisper — decisão registrada de 28/07 e 06/08
const ehRuido = t => /^[\[\(♪]/.test(t.trim()) || /música de fundo/i.test(t);

const words = lista
  .filter(w => w.text && !ehRuido(w.text))
  .map(w => ({
    text: String(w.text).trim(),
    start: Math.round((w.startMs ?? w.start * 1000) ) / 1000,
    end: Math.round((w.endMs ?? w.end * 1000)) / 1000,
    confidence: w.confidence ?? 1.0,
    emphasis: enfases.has(String(w.text).trim().toLowerCase().replace(/[.,!?…]+$/, "")) ? "keyword" : "normal",
  }));

// PALAVRA DE DURAÇÃO ZERO — não pode ser descartada.
//
// O whisper.cpp às vezes colapsa um token e devolve start === end. Antes, o
// filtro `end > start` jogava a palavra fora em silêncio: "mas eu te digo: é
// mais do que suficiente" saía como "mas eu te é mais do que suficiente".
// Aconteceu na MESMA palavra nas peças 1 e 3 (o trecho T3 é o mesmo texto nas
// cinco peças do lote), então é reprodutível, não azar.
//
// Perder texto é pior que ter uma palavra curta demais: quem lê a legenda vê
// uma frase quebrada. Então a palavra ganha um mínimo, tirado da folga do
// VIZINHO ANTERIOR — que é quem tem sobra, já que o colapso empurra o tempo
// todo para trás. Só é descartado o que não tem letra nem dígito.
const MIN_S = 0.08;
const temConteudo = (t) => /[\p{L}\p{N}]/u.test(t);
const consertadas = [];
for (const w of words) {
  if (w.end > w.start) { consertadas.push(w); continue; }
  if (!temConteudo(w.text)) continue;
  const ant = consertadas[consertadas.length - 1];
  if (ant && ant.end - ant.start > MIN_S * 2) {
    ant.end = Number((ant.end - MIN_S).toFixed(3));
    w.start = ant.end;
  }
  w.end = Number((w.start + MIN_S).toFixed(3));
  consertadas.push(w);
  console.warn(`  aviso: "${w.text}" veio com duração zero do ASR — recebeu ${MIN_S}s emprestados do vizinho`);
}

fs.writeFileSync(saida, JSON.stringify({ words: consertadas }, null, 2), "utf8");
console.log(`${consertadas.length} palavras -> ${saida}`);


if (srtPath) {
  // agrupamento por sentido (mesma régua do motor vectcut): fecha em pontuação
  // forte, máx. 4 palavras, nunca fecha em conectivo
  const CONECT = new Set(["e","de","da","do","das","dos","que","para","pra","com","em","a","o","as","os","um","uma","na","no","mas","ou","se","por"]);
  const paginas = [];
  let atual = [];
  for (const w of consertadas) {
    atual.push(w);
    const puro = w.text.toLowerCase().replace(/[.,!?…]+$/, "");
    const fechaPont = /[.!?…]$/.test(w.text);
    const cheia = atual.length >= 4 && !CONECT.has(puro);
    if (fechaPont || cheia) { paginas.push(atual); atual = []; }
  }
  if (atual.length === 1 && paginas.length) paginas[paginas.length - 1].push(atual[0]);
  else if (atual.length) paginas.push(atual);

  const ts = s => {
    const ms = Math.round(s * 1000);
    const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const m = String(Math.floor(ms / 60000) % 60).padStart(2, "0");
    const seg = String(Math.floor(ms / 1000) % 60).padStart(2, "0");
    return `${h}:${m}:${seg},${String(ms % 1000).padStart(3, "0")}`;
  };
  const srt = paginas.map((p, i) =>
    `${i + 1}\n${ts(p[0].start)} --> ${ts(p[p.length - 1].end)}\n${p.map(w => w.text).join(" ")}\n`
  ).join("\n");
  fs.writeFileSync(srtPath, srt, "utf8");
  console.log(`${paginas.length} páginas -> ${srtPath}`);
}
