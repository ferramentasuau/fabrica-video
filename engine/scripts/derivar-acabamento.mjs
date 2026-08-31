// derivar-acabamento.mjs — escreve a PARTITURA de acabamento de uma peça nova a
// partir do mapa forense de uma peça aprovada.
//
// A ideia: o trecho que tem o MESMO TEXTO (num lote real, dois trechos idênticos
// nas 5 peças) não se re-deriva — os eventos vêm por ÂNCORA DE PALAVRA. Cada evento
// da peça aprovada é amarrado à palavra em que cai; na peça nova ele reaparece na
// mesma palavra. Isso corrige a deriva que um offset fixo acumula (medido: -2,93s
// no começo do T3 e -3,04s nos cartões — 110ms de erro num offset só).
//
// O que NÃO vem por âncora é o que depende das camadas desta peça (punch, passagem
// de abertura): isso vem das regras de references/orquestracao.md, aplicadas aos
// displays/textoAtras que o gerador já produziu.
//
// TRILHAS: as músicas não acompanham o pacote (licença). Coloque as SUAS trilhas
// licenciadas com os nomes canônicos, dentro de assets/_biblioteca-som/13-trilhas/:
//   cama-fundo.wav     — a cama de fundo da peça inteira
//   colchao-intro.mp3  — o colchão que cobre a intro/texto-atrás
// São esses os arquivos que esta partitura referencia. Faltando algum, o
// acabamento.mjs só avisa ("trilha ausente, pulada") e a peça sai sem ele; nada quebra.
//
// Uso:
//   node engine/scripts/derivar-acabamento.mjs <mapa-aprovado.json> <words-aprovado.json> \
//        <words-nova.json> <props-nova.json> <saida.json>

import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith("--"));
const [mapaP, wordsAP, wordsNP, propsP, saida] = argv.filter((a) => !a.startsWith("--"));
if (!saida) {
  console.error("uso: derivar-acabamento.mjs <mapa> <words-aprovado> <words-nova> <props-nova> <saida> [--batida-em=<seg>]");
  process.exit(1);
}
// --batida-em=<seg>: em que segundo da peça a virada rítmica da cama deve cair.
const argBatida = flags.find((f) => f.startsWith("--batida-em="));
const batidaEm = argBatida ? Number(argBatida.split("=")[1]) : null;
if (argBatida && !Number.isFinite(batidaEm)) {
  console.error(`--batida-em inválido: ${argBatida}`);
  process.exit(1);
}
const ler = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const mapa = ler(mapaP);
const wA = ler(wordsAP).words;
const wN = ler(wordsNP).words;
const props = ler(propsP);

const limpa = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

// ── âncora de palavra ───────────────────────────────────────────────────────
// Para um instante t na peça aprovada: acha a palavra em que ele cai e o quanto
// ele está deslocado do onset dela. Na peça nova, procura a MESMA sequência de 3
// palavras (a janela de 3 desambigua "de", "e", "tem", que se repetem) e devolve
// o instante equivalente.
const trigrama = (ws, i) => [ws[i], ws[i + 1], ws[i + 2]].filter(Boolean).map((w) => limpa(w.text)).join("|");

const indiceEm = (ws, t) => {
  let melhor = -1;
  for (let i = 0; i < ws.length; i++) if (ws[i].start <= t + 0.001) melhor = i;
  return melhor;
};

const traduzir = (t) => {
  const i = indiceEm(wA, t);
  if (i < 0) return { t: null, motivo: "antes da primeira palavra" };
  const desloc = t - wA[i].start;
  const alvo = trigrama(wA, i);
  const cands = [];
  for (let j = 0; j < wN.length; j++) if (trigrama(wN, j) === alvo) cands.push(j);
  if (cands.length !== 1) {
    // cai para bigrama, depois para a palavra sozinha, sempre exigindo unicidade
    for (const n of [2, 1]) {
      const a2 = [...Array(n)].map((_, k) => limpa((wA[i + k] || {}).text || "")).join("|");
      const c2 = [];
      for (let j = 0; j < wN.length; j++) {
        const b2 = [...Array(n)].map((_, k) => limpa((wN[j + k] || {}).text || "")).join("|");
        if (b2 === a2) c2.push(j);
      }
      if (c2.length === 1) return { t: Number((wN[c2[0]].start + desloc).toFixed(2)), palavra: wA[i].text };
    }
    return { t: null, motivo: `"${wA[i].text}" não tem correspondente único`, palavra: wA[i].text };
  }
  return { t: Number((wN[cands[0]].start + desloc).toFixed(2)), palavra: wA[i].text };
};

// ── o que se traduz do aprovado ─────────────────────────────────────────────
const trilha = (nome) => mapa.trilhas.find((t) => (t.arquivoPrincipal || "").includes(nome));
const principal = mapa.trilhas.filter((t) => t.tipo === "video").sort((a, b) => b.quantos - a.quantos)[0];
const leaks = trilha("Light Leak");

// precisa vir antes do rebobinar, que depende dele
const aparteExiste = ((props.dessaturar || []).length > 0);
const naoTraduzidos = [];
const tr = (t, oq) => {
  const r = traduzir(t);
  if (r.t === null) { naoTraduzidos.push({ t, oq, motivo: r.motivo }); return null; }
  return r.t;
};

// PUNCH: no aprovado as corridas caem sobre camada de texto ou pico emocional.
// Na peça nova, a regra manda: uma corrida por janela de textoAtras e por display
// que não seja a CTA. O pico emocional não se deriva — fica anotado como lacuna.
// O APARTE também é ênfase: no corte aprovado a batida de identidade tem punch,
// rebobinar, P&B, pausa da música e som de fita — cinco camadas no mesmo ponto.
const janelas = [
  ...(props.textoAtras || []).map((t) => ({ de: t.deSegundo, ate: t.ateSegundo, oq: `textoAtras "${t.texto}"` })),
  ...(props.displays || []).slice(0, -1).map((d) => ({ de: d.deSegundo, ate: d.ateSegundo, oq: `display ${d.blocos.map((b) => b.texto).join("/")}` })),
  ...(props.dessaturar || []).map((d) => ({ de: d.deSegundo, ate: d.ateSegundo, oq: "aparte" })),
];
janelas.sort((a, b) => a.de - b.de);
// funde janelas coladas (<0,25s de intervalo): no aprovado uma corrida cobre a
// janela inteira, não cada pedaço dela
const punches = [];
for (const j of janelas) {
  const u = punches[punches.length - 1];
  if (u && j.de - u.ate < 0.25) { u.ate = j.ate; u.oq += ` + ${j.oq}`; }
  else punches.push({ ...j, escala: 1.15 });
}

// PASSAGENS: fronteira de material. Normal ABRE a corrida, invertido FECHA;
// invertido também em cada entrada de cartão.
const passagens = [];
for (const p of punches) {
  passagens.push({ em: Number(p.de.toFixed(2)), invertido: false, porque: `abre ${p.oq}` });
  passagens.push({ em: Number((p.ate - 0.23).toFixed(2)), invertido: true, porque: `fecha ${p.oq}` });
}
for (const i of props.inserts || [])
  passagens.push({ em: Number((i.deSegundo - 0.07).toFixed(2)), invertido: true, porque: `entra ${path.basename(i.src)}` });
passagens.sort((a, b) => a.em - b.em);

// REBOBINAR: os segmentos que releem a MESMA posição de fonte no aprovado
const segs = principal.eventos;
const reb = [];
for (let i = 1; i < segs.length; i++)
  if (segs[i].posicaoNaFonte !== undefined && segs[i].posicaoNaFonte <= segs[i - 1].posicaoNaFonte)
    reb.push(segs[i]);
// O REBOBINAR SÓ EXISTE ONDE EXISTE APARTE. Ele é o gaguejo da batida de
// identidade — as cinco camadas do aparte de apresentação no corte aprovado. Na peça 8,
// que não tem aparte, a âncora de palavra achou um FALSO POSITIVO aos 8,69s e
// punha o gaguejo em cima da palavra-clímax — a mais importante da peça.
// A âncora acha correspondência de texto; ela não sabe o que o evento SIGNIFICA.
const rebobinar = (reb.length && aparteExiste)
  ? {
      de: tr(reb[0].entra, "rebobinar"),
      replays: reb.map((s) => Number(s.duracao.toFixed(2))),
      retomaEm: tr(segs[segs.indexOf(reb[reb.length - 1]) + 1].entra, "retomada do rebobinar"),
      porque: "replay sobreposto do mesmo ponto da fonte — a fita voltando na batida de identidade",
    }
  : null;

// VOZ: o ganho onde a música pausa
const vozGanho = principal.eventos
  .filter((e) => e.volume && Math.abs(e.volume - 1) > 0.05)
  .map((e) => ({ de: tr(e.entra, "ganho de voz"), ate: tr(e.sai, "fim do ganho"), fator: e.volume }))
  .filter((g) => g.de !== null && g.ate !== null);

// SONS PONTUAIS e TRILHAS: tudo por âncora de palavra
const sons = [];
const trilhas = [];
for (const t of mapa.trilhas) {
  if (t.tipo !== "audio") continue;
  for (const e of t.eventos) {
    const em = tr(e.entra, e.arquivo);
    if (em === null) continue;
    const alvo = e.duracao > 3 ? trilhas : sons;
    alvo.push({
      arquivo: e.arquivo,
      em,
      volume: e.volume ?? 1,
      ...(e.duracao > 3 ? { duracao: e.duracao, posicaoNaFonte: e.posicaoNaFonte ?? 0 } : {}),
      ...(e.fadeIn ? { fadeIn: e.fadeIn } : {}),
      ...(e.fadeOut ? { fadeOut: e.fadeOut } : {}),
    });
  }
}

// ── COMPLETAR POR REGRA o que a âncora de palavra não alcança ──────────────
// T3/T4 vêm por âncora (mesmo texto). T1/T2 mudam a cada peça, então os eventos
// que caem neles não têm correspondente e precisam das regras de
// references/orquestracao.md aplicadas às camadas DESTA peça.
const BIB = "_biblioteca-som/";
const displays = props.displays || [];
const cta = displays[displays.length - 1];
const tese = displays.length >= 2 ? displays[displays.length - 2] : null;
const aparte = (props.dessaturar || [])[0] || null;
const DUR = props.durationSeconds;
const r2 = (x) => Number(Number(x).toFixed(2));

// A intro é o COMEÇO da peça. Sem texto-atrás o fim dela vinha de `displays[0]`
// cegamente — e a 6B, única peça sem texto-atrás, tem um display só: o CTA, em
// 38,73→39,80 de uma peça de 39,88. Dava introFim=39,8: o colchão de intro virava
// a peça inteira e o RISER ia parar nos últimos segundos. Um display que começa
// depois da metade da peça é o fecho, não a abertura — e o teto em DUR/2 segura
// qualquer outro caso que a gente não previu.
const displayIntro = displays.find((d) => d.deSegundo < DUR / 2);
const introFim = Math.min(
  (props.textoAtras || []).length
    ? props.textoAtras[props.textoAtras.length - 1].ateSegundo
    : (displayIntro ? displayIntro.ateSegundo : 5),
  DUR / 2,
);

// 1 · a voz sobe onde a música pausa — a janela do pivô da tese
if (tese) vozGanho.length = 0, vozGanho.push({
  de: tese.deSegundo, ate: tese.ateSegundo, fator: 1.413,
  porque: "regra: onde a música pausa, a voz perde referência de nível. Tirar a cama e subir a voz é UM gesto.",
});

// 2 · o RISER resolve NO CORTE do fim da intro
const semRiser = sons.filter((x) => !/RISER/i.test(x.arquivo));
sons.length = 0;
sons.push({ arquivo: "RISER.wav", src: BIB + "efeitos-originais/RISER.wav",
  em: r2(introFim - 3.53), volume: 0.5,
  porque: `regra: entrada = corte do fim da intro (${r2(introFim)}s) - a duração do riser (3,53s)` });

// 3 · flash-click: um por bloco da tese, +0,17s depois do visual; os dos cartões
//     vêm por âncora e ficam. DECISÃO 19/08: TODOS os cartões levam stinger.
for (const b of (tese ? tese.blocos : []))
  sons.push({ arquivo: "flash-click-05s.wav", src: BIB + "efeitos-originais/flash-click-05s.wav",
    em: r2(b.emSegundo + 0.17), volume: 1.778,
    porque: `regra: o som segue o bloco '${b.texto}' em 0,17s — confirma, não anuncia` });
for (const ins of props.inserts || [])
  sons.push({ arquivo: "flash-click-05s.wav", src: BIB + "efeitos-originais/flash-click-05s.wav",
    em: r2(ins.deSegundo + 0.10), volume: 1.778,
    porque: `stinger do cartão ${path.basename(ins.src)} — decisão dele 19/08, a prova social é sonorizada inteira` });
sons.sort((a, b) => a.em - b.em);

// 4 · a trilha como COMPOSIÇÃO: colchão de intro + fundo em pedaços com PAUSA nos
//     picos. O pedaço seguinte entra na posição de fonte que a música teria se
//     nunca tivesse parado — MUTE, não recomeço.
// nome CANÔNICO do colchão da intro (ver o cabeçalho deste arquivo)
const COLCHAO = BIB + "13-trilhas/colchao-intro.mp3";
// nome CANÔNICO da cama de fundo (ver o cabeçalho deste arquivo): a trilha
// licenciada do usuário entra com este nome; ausente, o acabamento avisa e pula.
const FUNDO = BIB + "13-trilhas/cama-fundo.wav";
// O "Cassette tape, rewind" vem da biblioteca do CapCut e vive no cache dele por
// hash — que só existe no PC onde o som foi usado. O padrão do cache é
// C:/Users/<usuario>/AppData/Local/CapCut/User Data/Cache/music/<hash>.mp3 —
// ajuste CASS_CACHE abaixo para o SEU usuário/hash, ou (mais simples) exporte o
// som para assets/_biblioteca-som/13-trilhas/cassette-rewind.mp3 (fica fora do git
// por licença, como as trilhas). Se nenhum dos dois existir, o acabamento.mjs
// avisa e pula o revezamento do aparte — a peça sai sem a fita, não quebra.
const CASS_LOCAL = "_biblioteca-som/13-trilhas/cassette-rewind.mp3";
const CASS_CACHE = "C:/Users/<usuario>/AppData/Local/CapCut/User Data/Cache/music/<hash>.mp3";
const CASS = fs.existsSync(path.join(path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../.."), "assets", CASS_LOCAL))
  ? CASS_LOCAL
  : CASS_CACHE;

// O menor vão medido entre o colchão e a cama nas peças aprovadas: na peça 2 o
// colchão acaba em 4,92 e a cama entra em 6,54. É o silêncio mínimo que separa
// uma música da outra — sem ele as duas competem (references/orquestracao.md:229).
const FOLGA_ENTRE_CAMAS = 1.62;

// Onde a cama de fundo da peça APROVADA vira. Medido na banda 35-110 Hz do próprio arquivo:
// até ~10,5s é pad puro; de 10,75 a 23,0 há acentos isolados; de 23,30 a 25,09 entra
// um sub quieto (-45 a -50 dB, que ninguém chama de batida); e em 25,22s vem o golpe
// de -31,4 dB — 15 dB acima de tudo que veio antes, e daí em diante o grave só some
// numa quebra de 0,25s. É esse o instante em que a batida entra.
// Serve para alinhar a batida a um momento da peça (--batida-em).
// ⚠️ Os dois números abaixo são DA TRILHA aprovada — com a sua cama-fundo.wav
// licenciada, refaça a medição (mesmo método) antes de usar --batida-em.
const VIRADA_FONTE = 25.22;
const FUNDO_DURACAO = 60.79;
trilhas.length = 0;
trilhas.push({ arquivo: "colchao-intro.mp3", src: COLCHAO, em: 0, duracao: r2(introFim + 0.07),
  posicaoNaFonte: 0, volume: 0.1, fadeIn: 3.03, fadeOut: 3.67,
  porque: "colchão da intro: cobre a janela de texto-atrás e resolve junto com o riser" });

// A TRILHA COMO COMPOSIÇÃO, generalizada.
// A regra medida no aprovado é: a música PAUSA nos picos dramáticos, e o pedaço
// seguinte entra na posição de fonte que ela teria se nunca tivesse parado (mute,
// não recomeço). Os picos são a tese e o aparte — mas nem toda peça tem os dois:
// a 6B não tem tese (começa na oferta), a 7 e a 8 não têm aparte. Montar a lista
// de pausas e derivar os pedaços dela cobre os quatro casos sem ramificação.
//
// ⚠️ A trilha NÃO PODE começar antes do vídeo. A conta "17,03s acabando no pivô"
// veio da peça 1, onde a tese cai aos 32s; na peça 6 ela cai aos 13s e dava -4,02s.
// O `adelay` recusa tempo negativo e o ffmpeg aborta o grafo inteiro, escrevendo
// um MP4 truncado que só o QC pega.
const pausas = [tese, aparte].filter(Boolean)
  .map((p) => ({ de: p.deSegundo, ate: p.ateSegundo }))
  .sort((a, b) => a.de - b.de);

if (pausas.length) {
  const fimPeca = r2(DUR - 0.76);
  // A cama NÃO PODE entrar enquanto o colchão de intro ainda toca. Quando a pausa
  // cai cedo a conta dos 17,03s dá negativo, e o clamp antigo em `0` fazia as duas
  // começarem juntas — 5,12s na peça 6, 10,17s na 8, a peça inteira na 6B.
  let em = Math.max(r2(introFim + 0.07 + FOLGA_ENTRE_CAMAS), r2(pausas[0].de - 17.03));
  let fonte = 0;
  pausas.forEach((p, k) => {
    // o pedaço vai de `em` até o começo desta pausa; o da tese acaba NELA, o do
    // aparte 0,57s antes (é a folga medida no corte aprovado)
    const ate = k === 0 && tese && p.de === tese.deSegundo ? p.de : r2(p.de - 0.57);
    const dur = r2(ate - em);
    if (dur > 0.5) {
      const fade = k === 0 ? Math.min(10, r2(dur * 0.6)) : 0;
      trilhas.push({
        arquivo: "cama-fundo.wav", src: FUNDO, em, duracao: dur,
        posicaoNaFonte: r2(fonte), volume: 0.056, ...(fade ? { fadeIn: fade } : {}),
        porque: k === 0
          ? `pedaço ${k + 1}: fade-in de ${fade}s — a trilha não entra, materializa. Acaba na pausa.`
          : `pedaço ${k + 1}: MUTE, não recomeço — entra na fonte ${r2(fonte)}`,
      });
      fonte += dur;
    }
    fonte += r2(p.ate - ate); // a música corre por baixo durante a pausa
    em = p.ate;
  });
  const durFim = r2(fimPeca - em);
  if (durFim > 0.5)
    trilhas.push({ arquivo: "cama-fundo.wav", src: FUNDO, em, duracao: durFim,
      posicaoNaFonte: r2(fonte), volume: 0.056, fadeOut: 0.8,
      porque: `pedaço final: depois da última pausa, fonte ${r2(fonte)} — sai em fade, o fecho não leva corte seco` });

  // ── alinhar a VIRADA da cama a um momento da peça ────────────────────────
  // A batida tem de confirmar o momento de prova, não anunciá-lo. Em vez de
  // recortar o pedaço final (o que quebraria o "mute, não recomeço"), desloco a
  // FONTE INTEIRA pelo mesmo delta: a continuidade entre os pedaços fica intacta,
  // só muda o ponto de partida da leitura.
  if (batidaEm != null) {
    const fundos = trilhas.filter((t) => t.src === FUNDO);
    const ultimo = fundos[fundos.length - 1];
    if (!ultimo) {
      console.warn("⚠ --batida-em ignorado: a peça não tem pedaço de cama");
    } else {
      const alvoNaFonte = r2(VIRADA_FONTE - (batidaEm - ultimo.em));
      const delta = r2(alvoNaFonte - ultimo.posicaoNaFonte);
      const estoura = fundos.some((t) => t.posicaoNaFonte + delta < 0
        || t.posicaoNaFonte + delta + t.duracao > FUNDO_DURACAO);
      if (estoura) {
        console.warn(`⚠ --batida-em=${batidaEm} ignorado: o deslocamento de ${delta}s sai dos ${FUNDO_DURACAO}s da fonte`);
      } else {
        for (const t of fundos) {
          t.posicaoNaFonte = r2(t.posicaoNaFonte + delta);
          t.porque += ` · fonte deslocada ${delta > 0 ? "+" : ""}${delta}s para a virada cair em ${batidaEm}s`;
        }
      }
    }
  }
}

// o rebobinar de fita só existe onde existe aparte — é o som da batida de identidade
if (aparte)
  trilhas.push({ arquivo: "Cassette tape, rewind", src: CASS, em: aparte.deSegundo,
    duracao: r2(aparte.ateSegundo - aparte.deSegundo + 0.10), posicaoNaFonte: 0, volume: 0.056,
    porque: "revezamento: entra no vão da trilha, NO MESMO VOLUME dela — fita voltando na batida de identidade" });

const spec = {
  _o_que_e: "Partitura de acabamento derivada do corte aprovado por ÂNCORA DE PALAVRA. " +
    "Consumida por engine/scripts/acabamento.mjs.",
  _derivado_de: path.basename(mapaP),
  punches,
  rebobinar,
  passagens,
  vozGanho,
  sons,
  trilhas,
  _regras_aplicadas: "T3/T4 por ÂNCORA DE PALAVRA; T1/T2 pelas regras de references/orquestracao.md " +
    "aplicadas às camadas desta peça. O que a âncora não achou está listado abaixo e foi SUBSTITUÍDO por regra.",
  _nao_traduzidos: naoTraduzidos,
};

fs.writeFileSync(saida, JSON.stringify(spec, null, 2), "utf8");
console.log(`partitura escrita: ${saida}`);
console.log(`  ${punches.length} corridas de punch · ${passagens.length} passagens · ` +
  `${sons.length} sons pontuais · ${trilhas.length} pedaços de trilha`);
if (rebobinar) console.log(`  rebobinar em ${rebobinar.de}s (${rebobinar.replays.length} replays)`);
if (naoTraduzidos.length) {
  console.log(`\n  ⚠ ${naoTraduzidos.length} evento(s) sem âncora — precisam de decisão à mão:`);
  for (const n of naoTraduzidos) console.log(`     ${n.t}s ${n.oq}: ${n.motivo}`);
}
