// _anuncio-avatar.mjs — módulo compartilhado do pipeline de anúncio com avatar falante.
// Importado por build-anuncio-avatar.mjs, conferir-verbatim.mjs e montar-anuncio-avatar.mjs.
//
// Este é um MÓDULO OPCIONAL da fábrica. O fluxo completo (consentimento, clone de voz,
// roteiro, look, geração, montagem) está em `AVATAR-IA.md`, na raiz; a base de
// conhecimento do HeyGen está em `docs/heygen/`. Ele exige contas de terceiros —
// leia a seção "Módulo Avatar" do `SETUP.md` antes.
//
// DECISÕES QUE VALEM LER ANTES DE MEXER:
//
// 1. TRECHOS LONGOS, NÃO BLOCOS CURTOS. A conclusão dos experimentos controlados que o
//    próprio HeyGen publicou (ver `docs/heygen/REGRAS-E-LIMITES.md`) é que fluxo vence
//    estrutura: roteiro que se lê naturalmente entrega melhor do que roteiro picado em
//    segmentos rígidos — picado, o resultado soa entrecortado. Numa peça de teste a fala
//    foi cortada em 8 blocos e qualquer ouvinte identificava na hora que era voz de IA.
//    Com 4 trechos, as pausas internas nascem da PONTUAÇÃO, dentro do engine, junto com
//    a fala. Teto de ~85 palavras por trecho: acima de ~120 a TTS engole pedaço (falhou
//    duas vezes no mesmo lote de teste).
//
// 2. CACHE POR HASH DO TEXTO. Os trechos finais (oferta e fecho) costumam ser idênticos em
//    todas as peças de um lote. Gerar uma vez e reaproveitar economizou 8 gerações num
//    lote de 5 peças. O hash é do texto normalizado, então mudar uma vírgula regera — que
//    é o correto.
//
// 3. APARO SÓ DAS PONTAS. O silenceremove com start_periods=1 não toca no silêncio
//    INTERNO: as pausas da pontuação ficam intactas. Só as bordas são cortadas, para a
//    cauda entre trechos ser controlada por nós e não pelo humor da TTS.
//
// 4. O VÍDEO É A REFERÊNCIA; O ÁUDIO SE CONSTRÓI EM CIMA DELE. O HeyGen devolve cada render
//    ~20 ms mais curto que o áudio de origem, e normalizar a 25 fps arredonda pro frame.
//    Somando 8 blocos deu 126 ms de deriva; em 4 trechos com fusão, 135 ms — e o acúmulo
//    cai justo no CTA. Encaixar mixagem pronta NÃO fecha. Medir a duração exata de cada
//    plano já processado e reconstruir o áudio contra ela fecha em 0,0000 s (medido no
//    lote de validação inteiro).

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

export const F = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1").replace(/\/$/, "");
export const WHISPER = `${F}/engine/whisper.cpp`;

// A LOCUÇÃO PODE VIR DE DUAS ROTAS — as duas produzem os mesmos MP3, nas mesmas pastas:
//
//   (a) ROTA PRINCIPAL DO PACOTE — pelo MCP da ElevenLabs no Claude Code (é a rota que o
//       SETUP.md §11 instala e documenta): você pede a fala ao Claude, baixa o MP3 e o
//       salva em assets/<marca>/audio/<pasta-da-peça>/T1.mp3 … Tn.mp3.
//       Nessa rota o build-anuncio-avatar.mjs NÃO é usado — vá direto ao conferir-verbatim.
//       É a rota padrão: o pacote não depende de nenhuma outra ferramenta para gerar fala.
//
//   (b) ROTA ALTERNATIVA, OPCIONAL — por uma CLI de TTS EXTERNA já instalada na sua máquina,
//       chamada pelo build-anuncio-avatar.mjs para gerar o lote inteiro de uma vez, com
//       cache por hash. É o que a constante TTS_CLI abaixo aponta.
//
// ⚠️ A CLI da rota (b) NÃO ACOMPANHA ESTE PACOTE e NÃO é a ElevenLabs. É o programa de linha
// de comando de um SERVIÇO DE TERCEIRO, PAGO — o caminho de exemplo abaixo é o da CLI do
// Higgsfield (higgsfield.ai), que foi a usada no lote de validação; a subcomando
// `generate create text2speech_v2` e o `--variant` de PADRAO são a sintaxe DELA, não do
// nosso pipeline. Usá-la significa criar conta, assinar e gastar crédito NESSE terceiro,
// por fora do HeyGen e da ElevenLabs. Nada aqui é patrocinado nem obrigatório.
//
// Sem essa CLI (o caso padrão) a rota (a) resolve, e todo o resto do pipeline — conferência,
// montagem, corte — roda exatamente igual. Se você usa OUTRA CLI de TTS, aponte o caminho
// dela na variável de ambiente TTS_CLI (a sintaxe dos argumentos, aí, é você quem ajusta).
// O valor abaixo é só um EXEMPLO de caminho típico no Windows: troque <usuario> pelo seu
// nome de usuário. Como está, ele não existe na sua máquina — e é assim mesmo: o script
// falha com mensagem explicando a rota (a), em vez de gerar custo escondido.
export const TTS_CLI = process.env.TTS_CLI ?? "C:/Users/<usuario>/.higgsfield/bin/higgsfield.exe";

export const PADRAO = {
  // O ID DA SUA VOZ CLONADA. Nunca escreva o ID (nem chave de API) dentro deste arquivo:
  // ele é versionado. Exporte VOZ_ID no ambiente antes de rodar —
  //   PowerShell:  $env:VOZ_ID = "cole-aqui-o-id"
  // Na ElevenLabs o ID aparece na página da voz clonada (Voices → a sua voz).
  voz: process.env.VOZ_ID ?? "<VOICE_ID>",
  variante: "minimax",                            // só a rota (b): nome de engine da CLI EXTERNA
                                                  // (escolhida num bake-off de 5 candidatas).
                                                  // Não tem efeito na rota da ElevenLabs.
  cauda: 0.30,                                    // silêncio no fim de cada trecho; a fusão come 0,2
  fusao: 0.20,                                    // 5 frames a 25 fps
  fps: 25,
};

export const dur = (f) =>
  parseFloat(execFileSync("ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

export const hash = (texto) =>
  crypto.createHash("sha256").update(texto.trim().replace(/\s+/g, " "), "utf8")
    .digest("hex").slice(0, 16);

// Saldo de crédito da CLI de TTS EXTERNA da rota (b), quando ela existe e sabe responder.
// Devolve null em qualquer outro caso — isto é relatório, não portão: o pipeline não depende
// dele, e na rota (a) (ElevenLabs) ele simplesmente devolve null.
export const saldoTTS = () => {
  try {
    const m = execFileSync(TTS_CLI, ["account", "status"]).toString().match(/([\d.]+)\s*credits/);
    return m ? parseFloat(m[1]) : null;
  } catch { return null; }
};

export function lerJob(caminho) {
  if (!caminho) {
    console.error("falta o caminho do job. ex: node scripts/build-anuncio-avatar.mjs ../jobs/<seu-job>/anuncio-avatar.json");
    process.exit(1);
  }
  const job = JSON.parse(fs.readFileSync(caminho, "utf8"));
  for (const p of job.pecas ?? []) {
    if (!p.look) { console.error(`peça ${p.id}: falta "look" (avatarId aprovado)`); process.exit(1); }
    for (const t of p.trechos) {
      const n = t.texto.trim().split(/\s+/).length;
      if (n > 85) console.warn(`  ⚠ ${p.id}/${t.id}: ${n} palavras — acima do teto de 85. Risco de a TTS engolir trecho.`);
    }
  }
  return job;
}

// Gera um trecho de locução. Cache por hash: texto igual nunca gera duas vezes.
export function gerarTrecho(texto, destino, { cauda = PADRAO.cauda, cache } = {}) {
  const h = hash(texto);
  const noCache = cache ? `${cache}/${h}.mp3` : null;

  if (fs.existsSync(destino)) return { destino, custo: "já existia" };
  if (noCache && fs.existsSync(noCache)) { fs.copyFileSync(noCache, destino); return { destino, custo: "cache" }; }

  if (PADRAO.voz === "<VOICE_ID>") {
    throw new Error(
      "falta o ID da voz. Exporte VOZ_ID no ambiente com o ID da SUA voz clonada\n" +
      "  (PowerShell: $env:VOZ_ID = \"...\"), ou gere as falas pelo MCP da ElevenLabs\n" +
      "  e salve os MP3 à mão nas pastas de áudio — ver SETUP.md, seção Módulo Avatar.");
  }

  let url;
  try {
    const job = execFileSync(TTS_CLI, ["generate", "create", "text2speech_v2",
      "--prompt", texto, "--variant", PADRAO.variante,
      "--voice-id", PADRAO.voz, "--voice-type", "element"])
      .toString().trim().split("\n").pop().trim();
    url = execFileSync(TTS_CLI, ["generate", "wait", job, "--timeout", "10m"])
      .toString().trim().split("\n").pop().trim();
  } catch (e) {
    throw new Error(
      `não consegui gerar pela CLI de TTS EXTERNA em "${TTS_CLI}".\n` +
      `  Essa CLI é de um serviço de TERCEIRO, pago, e NÃO acompanha este pacote — é rota\n` +
      `  alternativa, opcional. A rota principal do pacote é gerar as falas pelo MCP da\n` +
      `  ElevenLabs e salvar os MP3 nas pastas assets/<marca>/audio/<peça>/T*.mp3\n` +
      `  (ver SETUP.md, seção "Módulo Avatar"); depois siga direto para o conferir-verbatim.\n` +
      `  Se você de fato usa uma CLI de TTS, aponte o caminho dela em TTS_CLI.\n` +
      `  detalhe: ${e.message}`);
  }
  if (!url.startsWith("http")) throw new Error(`TTS falhou: ${url}`);

  const bruto = `${destino}.bruto.mp3`;
  execFileSync("curl", ["-s", "-L", "-o", bruto, url]);
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", bruto,
    "-af", "silenceremove=start_periods=1:start_silence=0:start_threshold=-45dB," +
           "areverse,silenceremove=start_periods=1:start_silence=0:start_threshold=-45dB,areverse" +
           (cauda > 0 ? `,apad=pad_dur=${cauda}` : ""),
    "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k", destino]);
  fs.unlinkSync(bruto);
  if (noCache) { fs.mkdirSync(cache, { recursive: true }); fs.copyFileSync(destino, noCache); }
  return { destino, custo: "gerado" };
}

// O whisper.cpp NÃO acompanha este pacote: ele é baixado na primeira vez que você roda
// `node scripts/transcribe.mjs …` (SETUP.md, passo 4), que instala o binário e o modelo em
// engine/whisper.cpp/. Quem faz SÓ o Módulo Avatar pode nunca ter rodado esse passo — e aí
// o conferir-verbatim morreria com um ENOENT cru. Esta checagem troca o erro cru por
// instrução. É verificação de existência apenas: não baixa nada, não executa nada.
export function checarWhisper() {
  const faltando = [`${WHISPER}/main.exe`, `${WHISPER}/ggml-medium.bin`]
    .filter((f) => !fs.existsSync(f));
  if (!faltando.length) return;

  console.error(
    "\n🔴 O Whisper (transcritor local) não está instalado — e este portão depende dele.\n\n" +
    "  não encontrei:\n" + faltando.map((f) => `    ${f}\n`).join("") +
    "\n  POR QUÊ: o whisper.cpp e o modelo NÃO acompanham este pacote (são ~1,5 GB). Eles são\n" +
    "  baixados na primeira vez que você roda o passo 4 do SETUP.md. Quem instalou só o\n" +
    "  Módulo Avatar (§11) costuma nunca ter passado por lá.\n\n" +
    "  COMO RESOLVER — uma vez só, e o download é automático:\n" +
    `    cd ${F}/engine\n` +
    "    node scripts/transcribe.mjs <um-audio.wav> <saida.json>\n\n" +
    "  Serve qualquer áudio curto (até um dos MP3 de locução convertido para .wav). O que\n" +
    "  importa é que a primeira execução instala o whisper.cpp + o modelo `medium` em\n" +
    "  engine/whisper.cpp/. Feito isso, rode este comando de novo.\n");
  process.exit(1);
}

// Transcreve UMA janela. Janela curta é o único jeito confiável: o whisper medium engole
// trecho em arquivo de 45 s+ (custou um ciclo inteiro: a TTS foi acusada de pular uma frase
// que estava lá — quem tinha engolido era o transcritor).
export function transcrever(arquivo, inicio, duracao, tmp) {
  checarWhisper();
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
    "-ss", String(inicio), "-t", String(duracao), "-i", arquivo,
    "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", tmp]);
  return execFileSync(`${WHISPER}/main.exe`,
    ["-m", `${WHISPER}/ggml-medium.bin`, "-l", "pt", "-nt", "-f", tmp],
    { stdio: ["ignore", "pipe", "ignore"] }).toString().replace(/\s+/g, " ").trim();
}

// Monta uma peça: normaliza os planos, encadeia as fusões, e reconstrói o áudio contra a
// duração EXATA de cada plano já processado. Devolve o relatório de deriva.
export function montarPeca({ videos, audios, saida, tmp, fusao = PADRAO.fusao }) {
  fs.mkdirSync(tmp, { recursive: true });

  const norm = videos.map((src, i) => {
    const dst = `${tmp}/n${i}.mp4`;
    execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", src,
      "-vf", `fps=${PADRAO.fps},setsar=1`, "-an",
      "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", dst]);
    return dst;
  });

  let filtro = "", entradas = [], offset = 0, corrente = "[0:v]";
  norm.forEach((v) => entradas.push("-i", v));
  for (let i = 1; i < norm.length; i++) {
    offset += dur(norm[i - 1]) - (i > 1 ? fusao : 0);
    const out = i === norm.length - 1 ? "[v]" : `[x${i}]`;
    filtro += `${corrente}[${i}:v]xfade=transition=fade:duration=${fusao}:offset=${(offset - fusao).toFixed(4)}${out};`;
    corrente = out;
  }
  const mudo = `${tmp}/_mudo.mp4`;
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...entradas,
    "-filter_complex", filtro.replace(/;$/, ""), "-map", "[v]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", mudo]);

  // <- a trava de sincronia: o áudio se ajusta ao plano, nunca o contrário
  const aud = audios.map((a, i) => {
    const dst = `${tmp}/a${i}.wav`;
    execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", a,
      "-af", "apad", "-t", dur(norm[i]).toFixed(4),
      "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", dst]);
    return dst;
  });
  let entA = [], filtA = "", corA = "[0:a]";
  aud.forEach((f) => entA.push("-i", f));
  for (let i = 1; i < aud.length; i++) {
    const out = i === aud.length - 1 ? "[a]" : `[y${i}]`;
    filtA += `${corA}[${i}:a]acrossfade=d=${fusao}:c1=tri:c2=tri${out};`;
    corA = out;
  }
  const trilha = `${tmp}/_trilha.wav`;
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...entA,
    "-filter_complex", filtA.replace(/;$/, ""), "-map", "[a]",
    "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", trilha]);

  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
    "-i", mudo, "-i", trilha, "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", saida]);

  const dv = dur(mudo), da = dur(trilha);
  const wh = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-of", "csv=p=0", saida]).toString().trim();
  return { duracao: dur(saida), deriva: dv - da, dimensoes: wh,
           mb: (fs.statSync(saida).size / 1048576).toFixed(0) };
}
