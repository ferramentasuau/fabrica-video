import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { KineticTypographyProps } from "../lib/schemas";
import { loadBrandFonts } from "../lib/fonts";
import { fontFamilyCss } from "../lib/brand";
import { springPunch } from "../lib/anim";
import { BrandBackground } from "../components/BrandBackground";
import { SafeArea } from "../components/SafeArea";

/**
 * KineticTypography — a frase entra palavra a palavra, no timing dos props.
 *
 * A frase INTEIRA já ocupa o lugar dela desde o frame 0 (invisível): cada
 * palavra só acende no seu instante. Sem isso o layout re-flui a cada entrada
 * e as palavras já visíveis pulam de linha — o pior defeito do gênero.
 * Palavra com `emphasis` sai na cor primary, maior e com brilho.
 */
export const KineticTypography: React.FC<KineticTypographyProps> = ({
  brand,
  words,
  fontSizePx,
  caixaAlta,
}) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleFont = brand.fonts.title;

  return (
    <AbsoluteFill>
      <BrandBackground brand={brand} />
      <SafeArea brand={brand}>
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "baseline",
              columnGap: Math.round(fontSizePx * 0.26),
              rowGap: Math.round(fontSizePx * 0.22),
              fontFamily: fontFamilyCss(titleFont),
              fontWeight: Number(titleFont.weight),
              fontSize: fontSizePx,
              lineHeight: 1.1,
              textAlign: "center",
              textTransform: caixaAlta ? "uppercase" : "none",
              letterSpacing: caixaAlta ? "-0.01em" : 0,
            }}
          >
            {words.map((w, i) => {
              const deFrame = Math.round((w.startMs / 1000) * fps);
              // entrada com soco: passa do tamanho e assenta (springPunch)
              const p = springPunch(frame, fps, deFrame);
              const emphasis = w.emphasis === true;
              const escalaBase = emphasis ? 1.12 : 1;
              return (
                <span
                  key={`${i}-${w.startMs}`}
                  style={{
                    display: "inline-block",
                    // a escala do emphasis não entra no layout (transform) —
                    // a margem compensa pra não colar na palavra vizinha
                    margin: emphasis ? `0 ${Math.round(fontSizePx * 0.08)}px` : 0,
                    color: emphasis ? brand.colors.primary : brand.colors.text,
                    opacity: Math.min(1, p * 1.6),
                    transform: `scale(${((0.5 + 0.5 * p) * escalaBase).toFixed(4)})`,
                    textShadow: emphasis
                      ? `0 0 40px ${brand.colors.primary}55`
                      : "none",
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
