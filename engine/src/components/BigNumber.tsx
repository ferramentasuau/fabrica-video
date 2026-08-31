import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Brand } from "../lib/brand";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp, popIn, springIn } from "../lib/anim";

/**
 * Número grande com contador animado.
 * Aceita "87%", "R$ 12.400", "3,2x" — anima a parte numérica (formato pt-BR)
 * e preserva prefixo/sufixo.
 */
export const BigNumber: React.FC<{
  brand: Brand;
  value: string;
  label: string;
  delay?: number;
}> = ({ brand, value, label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const numbersFont = brand.fonts.numbers ?? brand.fonts.title;

  // separa prefixo / número / sufixo
  const match = value.match(/-?[\d.,]*\d/);
  let display = value;
  if (match && match[0]) {
    const raw = match[0];
    const prefix = value.slice(0, match.index ?? 0);
    const suffix = value.slice((match.index ?? 0) + raw.length);
    // pt-BR: "." = milhar, "," = decimal
    const decimals = raw.includes(",") ? raw.split(",")[1].length : 0;
    const target = parseFloat(raw.replace(/\./g, "").replace(",", "."));
    const p = springIn(frame, fps, delay + 4);
    const current = target * Math.min(1, p);
    const formatted = current.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    display = `${prefix}${formatted}${suffix}`;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: fontFamilyCss(numbersFont),
          fontWeight: Number(numbersFont.weight),
          fontSize: 220,
          lineHeight: 1,
          color: brand.colors.primary,
          fontVariantNumeric: "tabular-nums",
          ...popIn(frame, fps, delay),
        }}
      >
        {display}
      </div>
      <div
        style={{
          fontFamily: fontFamilyCss(brand.fonts.body),
          fontWeight: Number(brand.fonts.body.weight),
          fontSize: 40,
          lineHeight: 1.35,
          color: brand.colors.text,
          maxWidth: 800,
          ...fadeUp(frame, fps, delay + 12),
        }}
      >
        {label}
      </div>
    </div>
  );
};
