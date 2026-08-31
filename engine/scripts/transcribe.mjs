// Transcrição LOCAL (Whisper.cpp) → legendas com tempo por palavra.
// SEM serviço de transcrição em nuvem (decisão de projeto: tudo local).
// Uso: node scripts/transcribe.mjs <entrada.wav> <saida.json> [modelo]
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import path from "node:path";
import fs from "node:fs";

const input = process.argv[2];
const out = process.argv[3];
// medium é o padrão desde 21/07: o `small` COMEU palavras ("mais, sendo") num
// vídeo real e ainda esticou as vizinhas pra cobrir o buraco, errando os
// tempos do trecho em ~500ms. Baixa 1,5 GB na 1ª vez e vale cada mega.
const model = process.argv[4] ?? "medium";
const WHISPER_VERSION = "1.5.5";
const whisperPath = path.join(process.cwd(), "whisper.cpp");

if (!input || !out) {
  console.error("uso: node scripts/transcribe.mjs <entrada.wav> <saida.json> [modelo]");
  process.exit(1);
}

console.log("1/4 instalando whisper.cpp em", whisperPath);
await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });

console.log("2/4 baixando modelo:", model);
await downloadWhisperModel({ model, folder: whisperPath });

console.log("3/4 transcrevendo (pt) com timestamp por palavra…");
// transcribe() devolve o objeto whisperCppOutput INTEIRO (não desestruturar aqui)
const whisperCppOutput = await transcribe({
  inputPath: input,
  whisperPath,
  model,
  language: "pt",
  tokenLevelTimestamps: true,
  whisperCppVersion: WHISPER_VERSION,
  printOutput: false,
});

const { captions } = toCaptions({ whisperCppOutput });

// Whisper com tokenLevelTimestamps devolve SUB-TOKENS ("ót"+"imo", "comun"+"icação").
// Convenção do whisper.cpp: token que começa com ESPAÇO inicia palavra nova.
const juntarTokensEmPalavras = (caps) => {
  const palavras = [];
  for (const c of caps) {
    const texto = String(c.text ?? "");
    const iniciaPalavra = /^\s/.test(texto) || palavras.length === 0;
    const limpo = texto.trim();
    if (limpo.length === 0) continue;
    if (iniciaPalavra) {
      palavras.push({ text: limpo, startMs: c.startMs, endMs: c.endMs });
    } else {
      const ult = palavras[palavras.length - 1];
      ult.text += limpo;
      ult.endMs = c.endMs;
    }
  }
  return palavras;
};

const palavras = juntarTokensEmPalavras(captions);
fs.writeFileSync(out, JSON.stringify(palavras, null, 2), "utf8");
console.log("4/4 OK —", captions.length, "tokens →", palavras.length, "palavras →", out);
