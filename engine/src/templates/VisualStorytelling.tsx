import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VisualStorytellingProps } from "../lib/schemas";
import { loadBrandFonts } from "../lib/fonts";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp } from "../lib/anim";
import { BrandBackground } from "../components/BrandBackground";

/**
 * VisualStorytelling — sequência de cenas com cross-fade + zoom lento.
 *
 * A duração total é a SOMA dos duracaoMs: a cena seguinte entra por CIMA da
 * anterior (fade de opacity), então a transição não desloca nada no tempo.
 * Cada cena tem uma aproximação lenta de 1→1.05 — entra e FICA, sem loop
 * (mesma regra de motion da LegendaDinamica). Texto sobre imagem ganha véu na
 * cor `bg` da MARCA (tarja preta é proibida no projeto).
 */
export const VisualStorytelling: React.FC<VisualStorytellingProps> = ({
  brand,
  cenas,
  transicaoMs,
}) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const transF = Math.round((transicaoMs / 1000) * fps);

  // janelas [de, ate) em quadros, acumuladas na ordem das cenas
  let acc = 0;
  const janelas = cenas.map((c) => {
    const de = acc;
    acc += Math.max(1, Math.round((c.duracaoMs / 1000) * fps));
    return { de, ate: acc };
  });

  // véu de legibilidade pro texto sobre imagem — cor da marca, não preto
  const veu = `linear-gradient(to top, ${brand.colors.bg}CC 0%, ${brand.colors.bg}8C 30%, ${brand.colors.bg}40 52%, transparent 70%)`;

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.bg }}>
      {cenas.map((cena, i) => {
        const { de, ate } = janelas[i];
        // a cena fica montada até a SEGUINTE terminar de entrar por cima
        if (frame < de || frame >= ate + transF) return null;

        const opacity =
          i === 0 || transF === 0
            ? 1
            : interpolate(frame, [de, de + transF], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

        // zoom lento 1→1.05 ao longo da cena (smoothstep — sem partida seca)
        const t = Math.min(1, Math.max(0, (frame - de) / Math.max(1, ate - de)));
        const escala = 1 + 0.05 * (t * t * (3 - 2 * t));

        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            <AbsoluteFill style={{ transform: `scale(${escala.toFixed(4)})` }}>
              {cena.tipo === "imagem" ? (
                <Img
                  src={staticFile(cena.src)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <BrandBackground brand={brand} />
              )}
            </AbsoluteFill>

            {cena.tipo === "imagem" && cena.texto ? (
              <>
                <AbsoluteFill style={{ background: veu, pointerEvents: "none" }} />
                <AbsoluteFill
                  style={{
                    justifyContent: "flex-end",
                    alignItems: "center",
                    paddingLeft: brand.safeMargins.sides,
                    paddingRight: brand.safeMargins.sides,
                    paddingBottom: brand.safeMargins.bottom + 90,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: fontFamilyCss(brand.fonts.title),
                      fontWeight: Number(brand.fonts.title.weight),
                      fontSize: 64,
                      lineHeight: 1.2,
                      color: brand.colors.text,
                      textShadow: "0 3px 14px rgba(0,0,0,0.55)",
                      ...fadeUp(frame, fps, de + Math.round(transF * 0.6)),
                    }}
                  >
                    {cena.texto}
                  </div>
                </AbsoluteFill>
              </>
            ) : null}

            {cena.tipo === "texto" ? (
              <AbsoluteFill
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingLeft: brand.safeMargins.sides + 20,
                  paddingRight: brand.safeMargins.sides + 20,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: fontFamilyCss(brand.fonts.title),
                    fontWeight: Number(brand.fonts.title.weight),
                    fontSize: 76,
                    lineHeight: 1.18,
                    color: brand.colors.text,
                    ...fadeUp(frame, fps, de + Math.round(transF * 0.6)),
                  }}
                >
                  {cena.texto}
                </div>
              </AbsoluteFill>
            ) : null}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
