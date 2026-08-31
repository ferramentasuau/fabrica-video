import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Brand } from "../lib/brand";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp } from "../lib/anim";

/** Título (fonte de título da marca) + subtítulo opcional, entrando em fade-up. */
export const TitleBlock: React.FC<{
  brand: Brand;
  title: string;
  subtitle?: string;
}> = ({ brand, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          fontFamily: fontFamilyCss(brand.fonts.title),
          fontWeight: Number(brand.fonts.title.weight),
          fontSize: 76,
          lineHeight: 1.15,
          color: brand.colors.text,
          ...fadeUp(frame, fps, 0),
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            fontFamily: fontFamilyCss(brand.fonts.body),
            fontWeight: Number(brand.fonts.body.weight),
            fontSize: 38,
            lineHeight: 1.35,
            color: brand.colors.textMuted,
            ...fadeUp(frame, fps, 8),
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
