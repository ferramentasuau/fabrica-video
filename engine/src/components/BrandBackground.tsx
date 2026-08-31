import React from "react";
import { AbsoluteFill } from "remotion";
import type { Brand } from "../lib/brand";

/** Fundo com gradiente da marca + glow sutil da cor primária. */
export const BrandBackground: React.FC<{ brand: Brand }> = ({ brand }) => {
  const bg2 = brand.colors.bg2 ?? brand.colors.bg;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${brand.colors.bg} 0%, ${bg2} 55%, ${brand.colors.bg} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -420,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1300,
          height: 900,
          borderRadius: "50%",
          background: brand.colors.primary,
          opacity: 0.09,
          filter: "blur(130px)",
        }}
      />
    </AbsoluteFill>
  );
};
