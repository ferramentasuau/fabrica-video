// Quebra de legenda POR SENTIDO — o que decide se a legenda é boa de ler.
//
// O agrupamento antigo era "de 4 em 4 palavras": 88% das páginas terminavam no
// meio da frase ("Você é ótimo no" / "que faz. Então, por" / "caro? A").
// Aqui as regras são de leitura, não de contagem:
//   1. ponto/interrogação/exclamação SEMPRE fecham a página;
//   2. vírgula fecha, desde que a página já tenha corpo;
//   3. página NUNCA termina em palavra de ligação (no, por, que, e, a, de...) —
//      essa palavra é empurrada pra página seguinte;
//   4. palavra sozinha (órfã) volta pra página vizinha, sem atravessar frase.

export type Word = { text: string; startMs: number; endMs: number };
export type PageWord = Word & { deFrame: number; ateFrame: number };
export type Page = { words: PageWord[]; startMs: number; endMs: number };

const FIM_FORTE = /[.!?…]["'”’)\]]?$/;
const FIM_FRACO = /[,;:]["'”’)\]]?$/;

/** minúsculo, sem acento e sem pontuação — pra comparar com a lista de ligação */
const limpa = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Palavras que deixam o leitor pendurado se ficarem no fim da linha. */
const LIGACAO = new Set([
  // artigos
  "a", "o", "as", "os", "um", "uma", "uns", "umas",
  // preposições e contrações
  "de", "do", "da", "dos", "das", "dum", "duma",
  "em", "no", "na", "nos", "nas", "num", "numa", "nesse", "nessa", "neste", "nesta",
  "por", "pelo", "pela", "pelos", "pelas", "pra", "pro", "para", "ao", "aos",
  "com", "sem", "sob", "sobre", "ate", "entre", "apos", "desde", "contra", "durante",
  // conjunções
  "e", "ou", "mas", "que", "se", "porque", "pois", "nem", "quer", "logo", "entao",
  // possessivos e demonstrativos
  "meu", "minha", "seu", "sua", "nosso", "nossa", "teu", "tua",
  "este", "esta", "esse", "essa", "aquele", "aquela",
  // modificadores que pedem complemento
  "mais", "menos", "muito", "tao", "tanta", "tanto", "nao", "bem", "toda", "todo",
  // locativos que abrem locução ("lá em cima", "aqui na frente") — correção de
  // 17/08: "a adrenalina lá | em cima" quebrava a locução; o locativo
  // desce junto com o que ele localiza.
  "la", "aqui", "ali",
]);

// ── Unidade numérica (correções do usuário, 17/08/2026) ─────────────────────
// "N horas", "N anos", "X mil alunos": número NUNCA se separa do que ele
// conta — sozinho na tela ele não significa ("mais de 4"... 4 o quê?).
// Consequência que ele decidiu explicitamente: para proteger a unidade, a
// página anterior PODE terminar em conectivo ("mais de |") — a hierarquia é
// unidade semântica > proibição do conectivo no fim.
const NUMERO = /^\d/;
const ESCALA = new Set(["mil", "milhao", "milhoes", "bilhao", "bilhoes"]);

export type PageOpts = {
  maxWords?: number;
  minWords?: number;
  maxChars?: number;
  maxMs?: number;
  fps?: number;
};

export const buildPages = (
  words: Word[],
  { maxWords = 4, minWords = 2, maxChars = 32, maxMs = 2000, fps = 30 }: PageOpts = {}
): Page[] => {
  const chars = (ws: Word[]) => ws.map((w) => w.text).join(" ").length;
  const grupos: Word[][] = [];
  let cur: Word[] = [];
  const fecha = () => {
    if (cur.length) grupos.push(cur);
    cur = [];
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    cur.push(w);
    if (i === words.length - 1) break;

    if (FIM_FORTE.test(w.text)) {
      fecha();
      continue;
    }
    if (FIM_FRACO.test(w.text) && cur.length >= minWords) {
      fecha();
      continue;
    }

    // Página que COMEÇA com número ganha +1 palavra de folga: a unidade
    // numérica ("X mil alunos já") não cabe em 3 e não pode quebrar (17/08).
    const folgaNumero = NUMERO.test(limpa(cur[0].text)) ? 1 : 0;
    const cheia =
      cur.length >= maxWords + folgaNumero ||
      chars(cur) >= maxChars ||
      w.endMs - cur[0].startMs >= maxMs;
    if (!cheia) continue;

    // regra 3: não fechar em palavra de ligação — ela vai pra próxima página.
    // Em cadeia ("Ser bom no que" → "no" e "que" descem juntos), por isso o laço.
    // regra 5 (17/08): número pendurado desce em cadeia ("30", "mil")
    // e o conectivo anterior FICA fechando a página — "mais de |" é respiro
    // que cria expectativa; a página seguinte paga com a unidade completa.
    const descem: Word[] = [];
    let desceuNumero = false;
    while (cur.length > minWords) {
      const ult = limpa(cur[cur.length - 1].text);
      if (NUMERO.test(ult) || ESCALA.has(ult)) {
        descem.unshift(cur.pop() as Word);
        desceuNumero = true;
        continue;
      }
      if (!desceuNumero && LIGACAO.has(ult)) {
        descem.unshift(cur.pop() as Word);
        continue;
      }
      break;
    }
    fecha();
    cur = descem;
  }
  fecha();

  // regra 4: absorve órfãs (1 palavra) sem atravessar fim de frase
  for (let i = grupos.length - 1; i >= 0; i--) {
    if (grupos[i].length !== 1) continue;
    const ant = grupos[i - 1];
    const prox = grupos[i + 1];
    const cabeAtras =
      ant &&
      !FIM_FORTE.test(ant[ant.length - 1].text) &&
      ant.length < maxWords + 1 &&
      chars([...ant, ...grupos[i]]) <= maxChars + 6;
    if (cabeAtras) {
      grupos[i - 1] = [...ant, ...grupos[i]];
      grupos.splice(i, 1);
      continue;
    }
    const cabeNaFrente =
      prox &&
      !FIM_FORTE.test(grupos[i][0].text) &&
      prox.length < maxWords + 1 &&
      chars([...grupos[i], ...prox]) <= maxChars + 6;
    if (cabeNaFrente) {
      grupos[i + 1] = [...grupos[i], ...prox];
      grupos.splice(i, 1);
    }
  }

  // Destaque em QUADROS, não em milissegundos.
  //
  // O vídeo só é amostrado a cada 1/fps (33ms a 30fps). Palavra mais curta que
  // isso caía entre dois quadros e NUNCA acendia — parecia que a palavra tinha
  // sumido da legenda. Aqui cada início vira quadro e é forçado a ser pelo menos
  // 1 quadro depois do anterior: toda palavra ganha o momento dela.
  //
  // `ateFrame` = quadro em que a próxima começa, então o dourado também não
  // apaga nos silêncios entre palavras.
  const emQuadros = new Map<Word, { de: number; ate: number }>();
  let anterior = -1;
  for (const w of words) {
    const de = Math.max(Math.round((w.startMs / 1000) * fps), anterior + 1);
    emQuadros.set(w, { de, ate: de + 1 }); // `ate` provisório, corrigido abaixo
    anterior = de;
  }
  words.forEach((w, i) => {
    const atual = emQuadros.get(w) as { de: number; ate: number };
    const prox = words[i + 1] ? emQuadros.get(words[i + 1]) : undefined;
    atual.ate = prox ? prox.de : atual.de + Math.round(0.4 * fps);
  });

  return grupos.map((ws) => ({
    words: ws.map((w) => {
      const q = emQuadros.get(w) as { de: number; ate: number };
      return { ...w, deFrame: q.de, ateFrame: q.ate };
    }),
    startMs: ws[0].startMs,
    endMs: ws[ws.length - 1].endMs,
  }));
};
