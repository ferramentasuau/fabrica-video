import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Brand } from "../lib/brand";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp, popIn } from "../lib/anim";

/** Fechamento: pill de CTA na cor primária + handle/site embaixo, com pulso sutil. */
export const CtaOutro: React.FC<{ brand: Brand; cta?: string }> = ({ brand, cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const numbersFont = brand.fonts.numbers ?? brand.fonts.title;
  const text = cta ?? brand.cta.text;
  const onPrimary = brand.colors.onPrimary ?? brand.colors.bg;
  const pulse = 1 + 0.015 * Math.sin(frame / 8);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: brand.safeMargins.bottom,
        paddingLeft: brand.safeMargins.sides,
        paddingRight: brand.safeMargins.sides,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ ...popIn(frame, fps, 2) }}>
          <div
            style={{
              transform: `scale(${pulse})`,
              background: brand.colors.primary,
              color: onPrimary,
              fontFamily: fontFamilyCss(numbersFont),
              fontWeight: Number(numbersFont.weight),
              fontSize: 40,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              padding: "28px 64px",
              borderRadius: 999,
              boxShadow: "0 -2px 0 0 rgba(0,0,0,0.16) inset, 0 10px 30px 0 rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        </div>
        {brand.handle ? (
          <div
            style={{
              fontFamily: fontFamilyCss(brand.fonts.body),
              fontWeight: Number(brand.fonts.body.weight),
              fontSize: 32,
              color: brand.colors.textMuted,
              ...fadeUp(frame, fps, 10, 24),
            }}
          >
            {brand.handle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
