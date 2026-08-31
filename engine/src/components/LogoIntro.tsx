import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Brand } from "../lib/brand";
import { fontFamilyCss } from "../lib/brand";
import { fadeOutAtEnd, popIn } from "../lib/anim";

/** Abertura: logo da marca (ou logo-texto) entra com pop e sai em fade. */
export const LogoIntro: React.FC<{ brand: Brand }> = ({ brand }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const entry = popIn(frame, fps, 3);
  const exit = fadeOutAtEnd(frame, durationInFrames);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity: exit }}
    >
      {brand.logo ? (
        <Img
          src={staticFile(brand.logo)}
          style={{ width: 460, maxHeight: 460, objectFit: "contain", ...entry }}
        />
      ) : (
        <div
          style={{
            fontFamily: fontFamilyCss(brand.fonts.title),
            fontWeight: Number(brand.fonts.title.weight),
            fontSize: 96,
            color: brand.colors.primary,
            textAlign: "center",
            padding: `0 ${brand.safeMargins.sides}px`,
            lineHeight: 1.1,
            ...entry,
          }}
        >
          {brand.name}
        </div>
      )}
    </AbsoluteFill>
  );
};
