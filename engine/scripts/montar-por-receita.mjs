// montar-por-receita.mjs — monta o manifest E os props de uma peça a partir de
// uma RECEITA, derivando os tempos da fala. Substitui o `montar-manifest-*.mjs`
// escrito à mão por peça (o da peça 1 tinha 358 linhas).
//
// Uso:
//   node engine/scripts/montar-por-receita.mjs <pasta-do-job> <receita.json> [--peca nome]
//
// O que ele NÃO faz, de propósito:
//   - não renderiza (o portão do still continua sendo humano)
//   - não inventa: quando a regra não acha âncora, ele FALHA ALTO em vez de chutar
//   - não mede print de prova social (isso precisa de olho no arquivo) — ele diz
//     exatamente o que falta medir e como
//
// Ele imprime um MAPA DE DECISÕES. Leia antes de renderizar: é onde a regra
// automática se explica, e é o único lugar onde um erro de regra aparece antes
// de custar 79s de render.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const F = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const argv = process.argv.slice(2);
const [pastaJob, caminhoReceita] = argv.filter((a) => !a.startsWith("--"));
const flag = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};
if (!pastaJob || !caminhoReceita) {
  console.error("uso: node montar-por-receita.mjs <pasta-do-job> <receita.json> [--peca nome]");
  process.exit(1);
}
const job = path.resolve(F, pastaJob);
const peca = flag("peca", "peca1");

// ── entradas ────────────────────────────────────────────────────────────────
const ler = (p, oq) => {
  if (!fs.existsSync(p)) {
    console.error(`\n✗ falta ${oq}:\n  ${p}\n`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
};

const receita = ler(path.resolve(F, caminhoReceita), "a receita");

// ÂNCORAS À MÃO — o caminho que as mensagens de falha prometem.
// Nem toda peça tem a forma que a regra automática procura. A peça 3 abre em
// "Você" (pronome, 7 ocorrências), então a anáfora não acha gancho nenhum; e a
// escolha de QUAL momento vira texto gigante é editorial, não derivável.
// Quando o arquivo traz uma camada, ela VENCE a regra — e o mapa de decisões
// diz que veio da mão, para ninguém confundir derivado com escolhido.
const ancoras = flag("ancoras", null)
  ? ler(path.resolve(F, flag("ancoras", null)), "o arquivo de âncoras")
  : {};
const brand = ler(path.join(F, "brands", `${receita.marca}.json`), `a marca ${receita.marca}`);
const esqueleto = ler(path.join(job, "edit-manifest.json"), "o esqueleto edit-manifest.json");

// legenda: prefere a corrigida à mão (o Whisper é instrumento de TEMPO, não de TEXTO)
const capCorrigida = path.join(job, "transcript", `captions-${peca}-corrigido.json`);
const capCrua = path.join(job, "transcript", `captions-${peca}.json`);
const captions = ler(fs.existsSync(capCorrigida) ? capCorrigida : capCrua, "a transcrição");
if (!fs.existsSync(capCorrigida)) {
  console.warn(`⚠ usando a transcrição CRUA — sem passar por captions-${peca}-corrigido.json.`);
  console.warn("  O Whisper acerta o tempo e erra o nome próprio. Confira antes de renderizar.\n");
}
const words = ler(path.join(job, "transcript", `words-${peca}.json`), "o words.json").words;

// ── utilidades de texto ─────────────────────────────────────────────────────
const limpa = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const FIM_FRASE = /[.!?…]["'”’)\]]?$/;
const CONECTIVO = new Set(
  ("a o e ou de da do das dos em no na nos nas por para com que se ja mais mas muito muitos " +
   "muita ao aos as um uma uns umas eu voce ele ela isso isto esse essa este esta la aqui")
    .split(" ")
);

// frases, na ordem, com as palavras que as compõem
const frases = [];
{
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (FIM_FRASE.test(w.text.trim())) { frases.push(cur); cur = []; }
  }
  if (cur.length) frases.push(cur);
}
const textoDaFrase = (f) => f.map((w) => w.text).join(" ");
const frped = (i) => frases.findIndex((f) => f.includes(words[i]));

const ocorrencias = (chave) =>
  words.map((w, i) => (limpa(w.text) === chave ? i : -1)).filter((i) => i >= 0);

const decisoes = [];
const marcar = (o, oq, porque) => decisoes.push({ o, oq, porque });
const falhar = (oq, comoResolver) => {
  console.error(`\n✗ REGRA SEM ÂNCORA: ${oq}`);
  console.error(`  ${comoResolver}\n`);
  process.exit(1);
};

// ── 1 · GANCHO por ANÁFORA → textoAtras ─────────────────────────────────────
// A palavra que ABRE a peça e volta é o gancho retórico do orador. Cada
// ocorrência dela + a palavra seguinte vira o texto gigante; a janela vai do
// início dessa palavra até o FIM DA FRASE em que ela está.
// Medido na peça 1: a palavra de abertura ocorre 2x (0,02 e 7,49) — exatamente
// as duas janelas aprovadas na revisão, a segunda exata ao centésimo.
const est = receita.estilo.texto_atras;

const textoAtrasManual = (ancoras.textoAtras ?? []).map((t) => {
  marcar(`${t.deSegundo}→${t.ateSegundo}s`, `texto atrás "${t.texto}"`,
    `À MÃO — ${t._por_que ?? "escolha editorial, não derivada"}`);
  return {
    texto: t.texto.toUpperCase(),
    deSegundo: t.deSegundo, ateSegundo: t.ateSegundo,
    yPct: t.yPct ?? est.yPct,
    fontSizePx: t.fontSizePx ?? est.fontSizePx,
    estilo: t.estilo ?? est.estilo,
  };
});

// LISTA VAZIA é uma DECISÃO, não ausência de decisão. A peça 6B não tem T1 nem T2
// — começa na oferta —, então não há dor para nomear e ela fica SEM texto-atrás.
// Sem esta distinção a regra de anáfora derivava um falso gancho da primeira palavra da oferta e,
// como não há recorte, o gigante apareceria NA FRENTE dela (o defeito do adendo 4).
const decidiuTextoAtras = Array.isArray(ancoras.textoAtras);
const chaveAnafora = limpa(words[0].text);
const ocsAnafora = decidiuTextoAtras ? [] : ocorrencias(chaveAnafora);
if (!decidiuTextoAtras) {
  if (ocsAnafora.length < 1) falhar("a anáfora do gancho", "roteiro sem palavra de abertura utilizável.");
  if (ocsAnafora.length > 4) {
    falhar(
      `a palavra de abertura "${words[0].text}" ocorre ${ocsAnafora.length}x`,
      `anáfora demais vira ruído. Passe as janelas à mão com --ancoras <arquivo.json>
  (bloco "textoAtras": [{texto, deSegundo, ateSegundo, _por_que}]), ou reveja se a
  primeira palavra é mesmo o gancho.`
    );
  }
}

const textoAtrasDerivado = ocsAnafora.map((i) => {
  const f = frases[frped(i)];
  const dupla = words.slice(i, i + 2);
  const texto = dupla.map((w) => w.text).join(" ").replace(/[.,!?;:]+$/, "").toUpperCase();
  const de = i === 0 ? 0 : Number(words[i].start.toFixed(2));
  const ate = Number(f[f.length - 1].end.toFixed(2));
  marcar(`${de}→${ate}s`, `texto atrás "${texto}"`,
    `anáfora "${words[0].text}" (${ocsAnafora.length}x no roteiro); janela até o fim da frase`);
  return { texto, deSegundo: de, ateSegundo: ate, yPct: est.yPct, fontSizePx: est.fontSizePx, estilo: est.estilo };
});
const textoAtras = decidiuTextoAtras ? textoAtrasManual : textoAtrasDerivado;
if (decidiuTextoAtras && !textoAtrasManual.length)
  marcar("—", "SEM texto atrás", "decisão explícita nas âncoras: a peça não tem dor para nomear");

// ── 2 · TESE → pivô ─────────────────────────────────────────────────────────
// A assinatura do pivô NÃO é paralelismo de início de frase — na peça aprovada
// ele tem a forma "Isso é [A], não é [B]. E também não é [C]." (exemplo
// ilustrativo): uma oração com
// vírgula mais outra frase. O que marca é a estrutura retórica AFIRMAÇÃO seguida
// de NEGAÇÕES: um "é X" sem negação, e logo depois 2+ "não é Y".
// Sem isso o detector achava o primeiro "não é" do roteiro (3,90s), que é outro
// trecho — foi o erro da primeira versão desta regra.
const acharTese = () => {
  const neg = [];
  for (let i = 0; i < words.length - 1; i++)
    if (limpa(words[i].text) === "nao" && limpa(words[i + 1].text) === "e") neg.push(i);

  const grupos = [];
  for (let i = 0; i < neg.length; i++) {
    const g = [neg[i]];
    while (i + 1 < neg.length && words[neg[i + 1]].start - words[neg[i]].start <= 6) g.push(neg[++i]);
    if (g.length >= 2) grupos.push(g);
  }
  // Discriminador que faltava: no pivô a negação NOMEIA e FECHA ("não é
  // [B]." / "não é [C]."), enquanto uma negação que segue frase adentro
  // ("não é porque…") continua.
  // Sem isso o detector pegava o primeiro "não é" do roteiro, que é outro trecho.
  const terminal = (i) => {
    for (let k = i + 2; k <= i + 3 && k < words.length; k++)
      if (/[,.!?]$/.test(words[k].text.trim())) return true;
    return false;
  };
  grupos.sort((a, b) => b.filter(terminal).length - a.filter(terminal).length);

  // exige a AFIRMAÇÃO antes: um "é" nos ~3s anteriores, fora de negação
  for (const g of grupos) {
    if (g.filter(terminal).length < 2) continue;
    const t0 = words[g[0]].start;
    const afirm = words.findIndex(
      (w, k) => limpa(w.text) === "e" && w.start < t0 && w.start > t0 - 3 &&
                limpa(words[k - 1]?.text || "") !== "nao"
    );
    if (afirm < 0) continue;
    // blocos: da afirmação até o fim da última negação, quebrando em vírgula e ponto
    const ini = frped(afirm) >= 0 ? frases[frped(afirm)].indexOf(words[afirm]) : 0;
    const fimIdx = g[g.length - 1] + 3;
    const trecho = words.slice(Math.max(0, afirm - ini), Math.min(words.length, fimIdx));
    const blocos = [];
    let cur = [];
    for (const w of trecho) {
      cur.push(w);
      if (/[,.!?]$/.test(w.text.trim())) { blocos.push(cur); cur = []; }
    }
    if (cur.length) blocos.push(cur);
    const uteis = blocos.filter((b) => b.length >= 2);
    if (uteis.length >= 2) return uteis;
  }
  return null;
};
// --sem-pivo: a peça não tem a forma que o detector procura, e o pivô (se
// houver) vem do arquivo de âncoras. Medido na peça 3: a tese dela fecha em
// TRÊS AFIRMAÇÕES paralelas ("tem [A], tem [B], e tem [C]"), não em
// afirmação + negações. O detector é peça-1-shaped; até ele generalizar, a
// escolha vem à mão.
const semPivo = argv.includes("--sem-pivo");
const tese = semPivo ? null : acharTese();
if (!tese && !semPivo) {
  falhar(
    "a tese do pivô",
    `não achei a estrutura AFIRMAÇÃO + 2 negações ('é X... não é Y... não é Z').
  Se a peça fecha de outro jeito (ex.: três afirmações paralelas), rode com --sem-pivo
  e passe o pivô no bloco "displays" do --ancoras.`
  );
}
const displaysManuais = (ancoras.displays ?? []).map((d) => {
  marcar(`${d.deSegundo}→${d.ateSegundo}s`, `display à mão com ${d.blocos.length} blocos`,
    `À MÃO — ${d._por_que ?? "escolha editorial"}: ${d.blocos.map((b) => b.texto).join(" / ")}`);
  const { _por_que, ...limpo } = d;
  return limpo;
});

const pv = receita.estilo.pivo;
const primeiraPalavraUtil = (b) => b.find((w) => !CONECTIVO.has(limpa(w.text))) || b[0];
const displayPivo = !tese ? null : {
  deSegundo: Number((tese[0][0].start - 0.12).toFixed(2)),
  ateSegundo: Number((tese[tese.length - 1][tese[tese.length - 1].length - 1].end - 0.12).toFixed(2)),
  blocos: tese.map((b, k) => ({
    texto: b.map((w) => w.text).join(" ").replace(/^[eE]\s+/, "").toUpperCase(),
    emSegundo: Number(primeiraPalavraUtil(b).start.toFixed(2)),
    cor: k === 0 ? "primary" : "text",
  })),
  cor: pv.cor, fontSizePx: pv.fontSizePx, estilo: pv.estilo, ajuste: pv.ajuste,
};
if (displayPivo)
  marcar(`${displayPivo.deSegundo}→${displayPivo.ateSegundo}s`,
    `pivô com ${tese.length} blocos`,
    `afirmação + negações: ${displayPivo.blocos.map((b) => b.texto).join(" / ")}`);

// ── 3 · APARTE → dessaturar ─────────────────────────────────────────────────
// Marca TROCA DE INSTÂNCIA DE VOZ: a pergunta retórica é a assinatura mais
// segura (o orador vira o cético por um instante). Entrada e saída SECAS.
// ⚠️ NEM TODA PERGUNTA É APARTE. A peça 2 tem, aos 20,5s, uma pergunta
// retórica de verdade — mas dirigida AO ESPECTADOR. O aparte marca
// a troca de instância de voz, que num lote real é sempre o aparte de apresentação. Preferir a
// pergunta que apresenta QUEM FALA; só então cair na primeira pergunta qualquer.
const APRESENTACAO = /quem\s+sou\s+eu/i;
const iApresenta = frases.findIndex((f) => APRESENTACAO.test(textoDaFrase(f)));
const iAparte = ancoras.dessaturar
  ? -1
  : iApresenta >= 0
    ? iApresenta
    : frases.findIndex((f) => /\?$/.test(f[f.length - 1].text.trim()));
const dessaturar = (ancoras.dessaturar || []).map((d) => {
  marcar(`${d.deSegundo}→${d.ateSegundo}s`, "aparte em P&B",
    `À MÃO — ${d._por_que ?? "escolha editorial"}`);
  const { _por_que, ...limpo } = d;
  return limpo;
});
if (iAparte >= 0) {
  const f = frases[iAparte];
  const prox = frases[iAparte + 1];
  const janela = {
    deSegundo: Number(f[0].start.toFixed(2)),
    ateSegundo: Number((prox ? prox[0].start : f[f.length - 1].end).toFixed(2)),
  };
  dessaturar.push(janela);
  marcar(`${janela.deSegundo}→${janela.ateSegundo}s`, "aparte em P&B",
    `pergunta retórica "${textoDaFrase(f)}" — troca de instância de voz`);
}

// ── 4 · DOURADAS ────────────────────────────────────────────────────────────
// Autoridade/prova: número + sua unidade, e nomes próprios de 2 palavras.
const sequencias = [];
for (let i = 0; i < words.length; i++) {
  const t = words[i].text.replace(/[.,!?;:]+$/, "");
  if (/^\d/.test(t) && words[i + 1]) {
    const n = /^(mil|milh|bilh)/i.test(words[i + 1].text) ? 3 : 2;
    sequencias.push(words.slice(i, i + n).map((w) => w.text.replace(/[.,!?;:]+$/, "")).join(" "));
  }
  const maiuscula = (w) => w && /^[A-ZÀ-Ý]/.test(w.text);
  // e o par não pode ter pontuação forte NO MEIO: 'Emissora. Então' não é um nome
  const abre = (w) => w && !FIM_FRASE.test(w.text.trim());
  if (i > 0 && maiuscula(words[i]) && abre(words[i - 1]) && abre(words[i])) {
    if (maiuscula(words[i + 1])) sequencias.push(`${words[i].text} ${words[i + 1].text}`.replace(/[.,!?;:]+$/, ""));
    else if (limpa(words[i + 1]?.text || "") === "de" && maiuscula(words[i + 2]))
      sequencias.push(`${words[i].text} ${words[i + 1].text} ${words[i + 2].text}`.replace(/[.,!?;:]+$/, ""));
  }
}
const seqUnicas = [...new Set(sequencias)];
const palavrasDestaque = new Set();
const temposDestaque = [];
const vazamentos = [];
for (const seq of seqUnicas) {
  const alvo = seq.split(" ").map(limpa);
  let achou = -1;
  for (let i = 0; i <= words.length - alvo.length; i++)
    if (alvo.every((a, j) => limpa(words[i + j].text) === a)) { achou = i; break; }
  if (achou < 0) continue;
  temposDestaque.push({ seq, t: words[achou].start });
  // fora o nome de quem fala: a prova social é sobre os OUTROS
  // o nome de quem fala vem do handle da marca (ex.: "@marca.demo"), não do
  // name ("Marca Demo"). A prova social é sobre os OUTROS, nunca sobre quem fala.
  const donoDaVoz = new Set([
    ...(brand.name || "").split(/\s+/).map(limpa),
    limpa(brand.handle || ""),
  ].filter(Boolean));
  const ehDono = (a) => [...donoDaVoz].some((d) => d.includes(a) || a.includes(d));
  if (alvo.some((a) => a.length > 3 && ehDono(a))) continue;
  for (const p of alvo) {
    if (CONECTIVO.has(p)) continue;            // "de" pintaria todo "de" do vídeo
    if (p.length > 3 && ehDono(p)) continue;
    const n = ocorrencias(p).length;
    if (n > 1) { vazamentos.push({ p, n, seq }); continue; }
    palavrasDestaque.add(p);
  }
}
if (vazamentos.length) {
  console.warn("⚠ palavras de destaque DESCARTADAS por vazamento (o template pinta TODA ocorrência):");
  for (const v of vazamentos) console.warn(`    "${v.p}" aparece ${v.n}x no roteiro (veio de "${v.seq}")`);
  console.warn("  Se alguma é essencial, o caminho é mudar o contrato para intervalos de tempo.\n");
}

// ── 5 · CTA → display final ─────────────────────────────────────────────────
// ⚠️ A CHAMADA É FRASE FIXA, não "a última frase". Na peça 4 o ASR não pontuou
// antes de "Toca em", então a última frase virou 20 palavras e o CTA saiu como um
// parágrafo em bloco 3D. Ancorar na CHAMADA da receita; a última frase é só o
// fallback para peça que não tenha chamada declarada.
const chamada = (receita.estilo.cta && receita.estilo.cta.chamada) || "toca em saiba mais";
const alvoCta = chamada.split(/\s+/).map(limpa).filter(Boolean);
const acharCta = () => {
  for (let i = words.length - alvoCta.length; i >= 0; i--)
    if (alvoCta.every((t, k) => limpa(words[i + k].text) === t)) return words.slice(i, i + alvoCta.length);
  return null;
};
const ultima = acharCta() || frases[frases.length - 1];
const cta = receita.estilo.cta;
const meio = Math.ceil(ultima.length / 2);
const linhas = [ultima.slice(0, meio), ultima.slice(meio)];
const displayCta = {
  deSegundo: Number((ultima[0].start - 0.16).toFixed(2)),
  ateSegundo: Number(ultima[ultima.length - 1].end.toFixed(2)),
  blocos: [
    {
      texto: linhas[0].map((w) => w.text.replace(/[.,!?;:]+$/, "")).join(" "),
      emSegundo: Number((ultima[0].start - 0.06).toFixed(2)),
      cor: "text",
      encaixarEntre: cta.encaixe_do_bloco_0,
      escalaLinha: 1.0,
    },
    {
      texto: linhas[1].map((w) => w.text.replace(/[.,!?;:]+$/, "")).join(" "),
      emSegundo: Number(linhas[1][0].start.toFixed(2)),
      cor: "primary",
    },
  ],
  cor: "text", fontSizePx: cta.fontSizePx, estilo: cta.estilo, ajuste: cta.ajuste,
  fonte: cta.fonte, caixa: cta.caixa, espacoPalavraEm: cta.espacoPalavraEm,
  espacoTintaEm: cta.espacoTintaEm, profundidade: cta.profundidade,
};
marcar(`${displayCta.deSegundo}→${displayCta.ateSegundo}s`,
  `CTA "${displayCta.blocos[0].texto} / ${displayCta.blocos[1].texto}"`,
  "última frase do roteiro, partida em duas linhas");
console.warn(`⚠ o encaixe da CTA usa âncoras de TEXTO ("${cta.encaixe_do_bloco_0.de}" / "${cta.encaixe_do_bloco_0.ate}").`);
console.warn(`  Se a chamada mudou, reescreva-as: são PREFIXOS da linha de baixo. Ver presets/displays/cta-manuscrito-encaixado-v1.json\n`);

// ── 6 · props ───────────────────────────────────────────────────────────────
const lc = receita.estilo.legenda_corrida;
const dur = Number((words[words.length - 1].end + 0.08).toFixed(2));
const mortos = Object.fromEntries(
  Object.entries(receita.mortos).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, v.valor])
);

const props = {
  brand,
  videoSrc: flag("video", `${receita.marca}/video/${peca}.mp4`),
  captions,
  durationSeconds: dur,
  wordsPerPage: lc.wordsPerPage, fontSizePx: lc.fontSizePx, bottomOffsetPx: lc.bottomOffsetPx,
  estiloLetra: lc.estiloLetra, intensidade: lc.intensidade, strokePx: lc.strokePx,
  caixaAlta: lc.caixaAlta, offsetMs: lc.offsetMs, antecipaPaginaMs: lc.antecipaPaginaMs,
  destaquePalavra: lc.destaquePalavra, paginaSeca: lc.paginaSeca, porFrase: lc.porFrase, veu: lc.veu,
  ...mortos,
  dessaturar,
  displays: [...displaysManuais, displayPivo, displayCta]
    .filter(Boolean)
    .sort((a, b) => a.deSegundo - b.deSegundo),
  // As douradas podem vir das âncoras. Serve para o caso do LOTE: quando um
  // trecho é o MESMO TEXTO de uma peça já aprovada (num lote real, dois trechos
  // eram idênticos nas 5 peças), a lista aprovada vale mais que a re-derivação —
  // re-derivar marcou palavras comuns como douradas e perdeu os nomes próprios
  // citados. O que já foi aprovado não se re-deriva.
  palavrasDestaque: ancoras.palavrasDestaque ?? [...palavrasDestaque],
  estiloDestaque: receita.estilo.destaque_dourado.estiloDestaque,
  textoAtras,
  textoAtrasFonte: receita.estilo.texto_atras.textoAtrasFonte,
  inserts: [],
  // o recorte da pessoa vem do arquivo de âncoras: cada janela de texto-atrás
  // precisa da sua PNG-seq, e quem gera é o cutout-pessoa.mjs (passo humano,
  // ~2 min de CPU por janela). Sem ele o texto gigante fica NA FRENTE dela.
  cutoutSeq: ancoras.cutoutSeq ?? null,
  // CARTÕES de prova social. Vêm das âncoras porque exigem MEDIR o print (recorte,
  // linha da máscara) e MEDIR a boca de quem fala na janela — o gerador não tem olho.
  // A geometria do recorte se copia entre peças (o print é o mesmo arquivo);
  // o yPct NÃO: ele depende de onde a boca dela está NESTA peça.
  inserts: (ancoras.inserts ?? []).map(({ _por_que, ...i }) => i),
};

const manifest = {
  ...esqueleto,
  durationInFrames: Math.round(dur * (esqueleto.fps || 30)),
  output: `jobs/${path.basename(job)}/renders/${peca}-legendada.mp4`,
  props,
  _meta: { ...esqueleto._meta, receita: receita.id, gerado_em: new Date().toISOString(), decisoes },
};

fs.writeFileSync(path.join(job, `edit-manifest-${peca}.json`), JSON.stringify(manifest, null, 2), "utf8");
fs.mkdirSync(path.join(job, "generated"), { recursive: true });
fs.writeFileSync(path.join(job, "generated", `props-${peca}.json`), JSON.stringify(props, null, 2), "utf8");

// ── 7 · MAPA DE DECISÕES ────────────────────────────────────────────────────
console.log(`\n${"═".repeat(72)}`);
console.log(`MAPA DE DECISÕES — ${receita.id} · ${path.basename(job)} · ${peca}`);
console.log("═".repeat(72));
for (const d of decisoes) console.log(`  ${d.o.padEnd(18)} ${d.oq}\n${" ".repeat(20)}↳ ${d.porque}`);
// o mapa de decisões é o PORTÃO: mostra o que FOI para os props, não o que a
// regra teria escolhido. Imprimir a lista derivada quando as âncoras venceram
// faz o portão mentir — e o portão é a última chance de pegar erro de graça.
const douradasFinais = ancoras.palavrasDestaque ?? [...palavrasDestaque];
console.log(`\n  douradas: ${douradasFinais.join(" · ") || "(nenhuma)"}${ancoras.palavrasDestaque ? "   <- A MAO" : ""}`);
console.log(`  duração : ${dur}s (${manifest.durationInFrames} quadros)`);

console.log(`\n${"─".repeat(72)}\nAINDA FALTA — o que a regra não faz sozinha:\n`);
console.log("  1. RECORTE da pessoa, uma janela por texto-atrás:");
for (const t of textoAtras) {
  const de = Math.max(0, t.deSegundo - 0.1), ate = t.ateSegundo + 0.12;
  console.log(`     node engine/scripts/cutout-pessoa.mjs <video> --de ${de.toFixed(2)} --ate ${ate.toFixed(2)} \\`);
  console.log(`       --fps 25 --engine rvm --pngseq assets/${receita.marca}/video/${peca}-cutout-${limpa(t.texto).slice(0, 12)}`);
}
console.log("     depois cole a linha que ele imprime em props.cutoutSeq (é uma LISTA).\n");
if (temposDestaque.length) {
  console.log("  2. CARTÕES de prova social — candidatos achados na fala:");
  for (const t of temposDestaque.filter((x) => /[A-ZÀ-Ý]/.test(x.seq[0]))) {
    console.log(`     ${t.t.toFixed(2)}s  ${t.seq}`);
  }
  console.log("     Para cada um: print do perfil em assets/<marca>/prova/, e medir no arquivo");
  console.log("     y (topo) e anel (última linha do círculo, pela LARGURA da faixa saturada —");
  console.log("     medir só por cor pega o emoji da bio e infla ~30px). Ver a receita.\n");
}
console.log("  3. Portão do still antes do render cheio. Depois: qc_video.py e conferir-zona.mjs.\n");
console.log(`escrito: edit-manifest-${peca}.json e generated/props-${peca}.json`);
