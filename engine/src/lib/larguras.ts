// Tabelas de largura por FAMÍLIA de fonte (adendos 12 e 14, 17/08/2026).
//
// O fit-to-width dos displays precisa da largura REAL de cada caractere, não
// de média — no Inter 800 o M mede 0,94em e o I 0,29em. Cada JSON aqui é
// gerado (e versionado) por:
//   node engine/scripts/medir-largura-fonte.mjs <fonte.woff2> <saida.json>
//
// Fonte nova em uso no modo `fit` = medir e registrar no mapa abaixo, senão
// ela cai no fallback e as bordas desalinham.

import inter800 from "./larguras-inter-800.json";
import inter400 from "./larguras-inter-400.json";
import caveatBrush from "./larguras-caveat-brush-400.json";

type Tabela = Record<string, number>;

const POR_FAMILIA: Record<string, Tabela> = {
  Inter: inter800.larguras,
  // O texto de mockup de conversa é Inter 400, e o 400 é bem mais estreito
  // que o 800 (M mede 0,903em contra 0,94em). Medir com a tabela errada faria a
  // guarda de largura das bolhas aprovar linha que estoura.
  "Inter 400": inter400.larguras,
  "Caveat Brush": caveatBrush.larguras,
};

// Largura da linha em unidades EM. Caractere não medido cai em 0,6 (média
// grosseira) — degrada o alinhamento, nunca quebra o render.
export const larguraEmDaLinha = (
  texto: string,
  familia: string,
  letterSpacingEm = 0,
  // adendo 15: o espaço entre palavras muda a largura DESENHADA — sem entrar
  // aqui, o fit mede uma linha que não é a da tela e as bordas desalinham.
  wordSpacingEm = 0
): number => {
  const tabela = POR_FAMILIA[familia] ?? POR_FAMILIA.Inter;
  let total = 0;
  let espacos = 0;
  for (const ch of texto) {
    total += tabela[ch] ?? 0.6;
    if (ch === " ") espacos++;
  }
  return total + letterSpacingEm * Math.max(0, texto.length - 1) + wordSpacingEm * espacos;
};

// ── TINTA (adendo 20, 18/08) ────────────────────────────────────────────────
// Onde o desenho da letra realmente começa/termina dentro da caixa. Alinhar
// CAIXAS deixa folga visível (side bearing); "quase encostar" só existe se a
// conta for feita na TINTA — foi o que a régua mostrou (5px e 9px sobrando).
type Tinta = Record<string, [number, number]>;

const TINTA_POR_FAMILIA: Record<string, Tinta> = {
  Inter: ((inter800 as unknown) as { tinta?: Tinta }).tinta ?? {},
  "Caveat Brush": ((caveatBrush as unknown) as { tinta?: Tinta }).tinta ?? {},
};

// deslocamento da tinta dentro da caixa do caractere, em em
export const tintaDoChar = (ch: string, familia: string): [number, number] => {
  const t = TINTA_POR_FAMILIA[familia] ?? TINTA_POR_FAMILIA.Inter;
  const largura = (POR_FAMILIA[familia] ?? POR_FAMILIA.Inter)[ch] ?? 0.6;
  return t[ch] ?? [0, largura]; // sem medida: assume tinta = caixa inteira
};

// tinta VERTICAL da linha (adendo 21): topo e base do desenho, em em,
// relativos à linha de base. É com isso que se mede o vão que o olho vê —
// a caixa da linha é muito mais alta que a tinta em fontes manuscritas.
type TintaY = Record<string, [number, number]>;

const TINTAY_POR_FAMILIA: Record<string, TintaY> = {
  Inter: ((inter800 as unknown) as { tintaY?: TintaY }).tintaY ?? {},
  "Caveat Brush": ((caveatBrush as unknown) as { tintaY?: TintaY }).tintaY ?? {},
};

const METRICAS: Record<string, { ascent: number; descent: number }> = {
  Inter: { ascent: (inter800 as { ascent?: number }).ascent ?? 0.97, descent: (inter800 as { descent?: number }).descent ?? -0.24 },
  "Caveat Brush": { ascent: (caveatBrush as { ascent?: number }).ascent ?? 0.96, descent: (caveatBrush as { descent?: number }).descent ?? -0.3 },
};

export const metricasDaFonte = (familia: string) => METRICAS[familia] ?? METRICAS.Inter;

// [base, topo] da tinta da linha inteira, em em
export const tintaVerticalDaLinha = (texto: string, familia: string): [number, number] => {
  const t = TINTAY_POR_FAMILIA[familia] ?? TINTAY_POR_FAMILIA.Inter;
  let min = Infinity;
  let max = -Infinity;
  for (const ch of texto) {
    const v = t[ch];
    if (!v) continue;
    min = Math.min(min, v[0]);
    max = Math.max(max, v[1]);
  }
  return Number.isFinite(min) ? [min, max] : [0, 0.7];
};

/**
 * O OBSTÁCULO (adendo 22): dentro de um intervalo horizontal (em em, a partir
 * do início da linha), qual é o ponto mais ALTO da tinta e qual glifo manda.
 * É isso que limita a descida da linha de cima — na CTA, o risco do "b" na
 * entrada e a bolinha do "i" de "mais" na saída. Usar o máximo da linha
 * inteira mantém o texto mais alto do que precisa.
 */
export const obstaculoNoIntervalo = (
  texto: string,
  familia: string,
  x0Em: number,
  x1Em: number,
  letterSpacingEm = 0,
  wordSpacingEm = 0
): { topo: number; char: string } => {
  const larg = POR_FAMILIA[familia] ?? POR_FAMILIA.Inter;
  const tX = TINTA_POR_FAMILIA[familia] ?? TINTA_POR_FAMILIA.Inter;
  const tY = TINTAY_POR_FAMILIA[familia] ?? TINTAY_POR_FAMILIA.Inter;
  let cursor = 0;
  let topo = -Infinity;
  let char = "";
  for (const ch of texto) {
    const avanco = larg[ch] ?? 0.6;
    const [xi, xf] = tX[ch] ?? [0, avanco];
    const ini = cursor + xi;
    const fim = cursor + xf;
    // espaço não é obstáculo (o bbox dele vem sujo em algumas fontes)
    if (ch.trim() && fim > x0Em && ini < x1Em) {
      const yMax = (tY[ch] ?? [0, 0.7])[1];
      if (yMax > topo) {
        topo = yMax;
        char = ch;
      }
    }
    cursor += avanco + letterSpacingEm + (ch === " " ? wordSpacingEm : 0);
  }
  return { topo: Number.isFinite(topo) ? topo : 0.7, char };
};
