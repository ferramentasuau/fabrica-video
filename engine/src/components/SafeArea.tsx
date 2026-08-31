import React from "react";
import { AbsoluteFill } from "remotion";
import type { Brand } from "../lib/brand";

/**
 * Mantém todo o conteúdo dentro das margens de segurança da marca —
 * a UI do Reels/TikTok/Shorts (username, botões, legenda) não cobre nada.
 */
export const SafeArea: React.FC<{ brand: Brand; children: React.ReactNode }> = ({
  brand,
  children,
}) => (
  <AbsoluteFill
    style={{
      paddingTop: brand.safeMargins.top,
      paddingBottom: brand.safeMargins.bottom,
      paddingLeft: brand.safeMargins.sides,
      paddingRight: brand.safeMargins.sides,
    }}
  >
    {children}
  </AbsoluteFill>
);
