import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CaptionOverlayProps } from "../lib/schemas";
import { loadBrandFonts } from "../lib/fonts";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp, springPunch } from "../lib/anim";
import { buildPages } from "../lib/legendas";

/**
 * CaptionOverlay — legenda dinâmica com FUNDO TRANSPARENTE, pra sobrepor num
 * editor externo (CapCut, Premiere, DaVinci).
 *
 * Mesma quebra por sentido e mesmo idioma da LegendaDinamica, mas SEM
 * OffthreadVideo e SEM véu: o contraste é 100% do texto — sombra em TRÊS
 * camadas (perto/média/longe) + contorno na cor `bg` da marca. Nada de tarja
 * preta (proibida no projeto).
 *
 * Render com alpha — use o script, não o comando cru:
 *   node scripts/render-overlay-alpha.mjs CaptionOverlay <props.json> <saida.mov>
 *
 * ⚠️ NÃO use WebM/VP8 se o destino for o CapCut. Testado no CapCut 9.1.0.3879
 * (Fase 6/7, 14/08/2026): o WebM tem alpha válido no arquivo (`alpha_mode=1`,
 * decodifica em `yuva420p`) mas o CapCut IGNORA o canal e mostra fundo opaco.
 * O que funciona lá dentro é `.mov`: ProRes 4444 e QuickTime Animation (qtrle),
 * os dois confirmados transparentes em teste no próprio CapCut.
 */
export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  brand,
  captions,
  wordsPerPage,
  fontSizePx,
  bottomPx,
  caixaAlta,
  strokePx,
  offsetMs,
  antecipaPaginaMs,
}) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // tudo em QUADROS, como na LegendaDinamica (em ms, palavra curta caía entre
  // duas amostras e nunca acendia)
  const qOffset = Math.round((offsetMs / 1000) * fps);
  const qPagina = qOffset + Math.round((antecipaPaginaMs / 1000) * fps);

  const pages = useMemo(
    () => buildPages(captions, { maxWords: wordsPerPage, fps }),
    [captions, wordsPerPage, fps]
  );

  // `emphasis` não existe no tipo PageWord do buildPages — consulta por chave
  // (startMs + texto identifica a palavra com folga)
  const chaveEmphasis = useMemo(() => {
    const s = new Set<string>();
    for (const c of captions) if (c.emphasis) s.add(`${c.startMs}|${c.text}`);
    return s;
  }, [captions]);

  // página vigente: fica no ar até a seguinte começar (não pisca nas pausas)
  const framePagina = frame + qPagina;
  const iPage = pages.findIndex((p, i) => {
    const prox = pages[i + 1];
    const de = p.words[0].deFrame;
    const ate = prox
      ? prox.words[0].deFrame
      : p.words[p.words.length - 1].ateFrame + Math.round(0.6 * fps);
    return framePagina >= de && framePagina < ate;
  });
  const page = iPage >= 0 ? pages[iPage] : undefined;

  if (!page) return <AbsoluteFill />; // transparente — nenhum fundo, nunca

  const capFont = brand.fonts.numbers ?? brand.fonts.title;
  const gap = Math.round(fontSizePx * 0.24);
  const delayPagina = page.words[0].deFrame - qPagina;
  const entrada = fadeUp(frame, fps, delayPagina, 16);

  // sombra TRIPLA — perto (recorte), média (corpo), longe (halo) — segura a
  // leitura sobre qualquer vídeo claro ou movimentado, sem tarja
  const sombra =
    "0 2px 6px rgba(0,0,0,0.85), 0 8px 22px rgba(0,0,0,0.6), 0 18px 48px rgba(0,0,0,0.4)";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottomPx,
        paddingLeft: brand.safeMargins.sides,
        paddingRight: brand.safeMargins.sides,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: gap,
          rowGap: Math.round(fontSizePx * 0.18),
          fontFamily: fontFamilyCss(capFont),
          fontWeight: capFont.weight,
          fontSize: fontSizePx,
          lineHeight: 1.12,
          textAlign: "center",
          paintOrder: "stroke",
          textTransform: caixaAlta ? "uppercase" : "none",
          letterSpacing: caixaAlta ? "-0.015em" : 0,
          ...entrada,
        }}
      >
        {page.words.map((w, i) => {
          const iniF = w.deFrame - qOffset;
          const fimF = w.ateFrame - qOffset;
          const ativa = frame >= iniF && frame < fimF;

          // 0 antes de falar · 1 enquanto fala · decai em 5 frames depois
          const destaque =
            frame < iniF
              ? 0
              : interpolate(frame, [fimF, fimF + 5], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });

          const p = springPunch(frame, fps, iniF);
          const pico = interpolate(p, [0, 1], [1, 1.06]);
          const escala = 1 + (pico - 1) * destaque;
          const emphasis = chaveEmphasis.has(`${w.startMs}|${w.text}`);

          return (
            <span
              key={`${i}-${w.startMs}`}
              style={{
                display: "inline-block",
                color:
                  ativa || emphasis ? brand.colors.primary : brand.colors.text,
                WebkitTextStroke:
                  strokePx > 0 ? `${strokePx}px ${brand.colors.bg}` : undefined,
                textShadow: ativa
                  ? `0 0 18px ${brand.colors.primary}66, ${sombra}`
                  : sombra,
                transform: `scale(${escala.toFixed(4)})`,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
