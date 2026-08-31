import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Brand } from "../lib/brand";
import { fontFamilyCss } from "../lib/brand";
import { springIn } from "../lib/anim";

/**
 * Gráfico de barras animado (2–6 barras). Barras crescem com springs
 * escalonados; a maior barra ganha a cor primária cheia.
 */
export const BarChart: React.FC<{
  brand: Brand;
  bars: { label: string; value: number }[];
  unit?: string;
  delay?: number;
}> = ({ brand, bars, unit, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const numbersFont = brand.fonts.numbers ?? brand.fonts.title;

  const max = Math.max(...bars.map((b) => b.value));
  const chartHeight = 640;
  const barWidth = Math.min(150, 720 / bars.length);

  const fmt = (v: number) =>
    unit === "R$"
      ? `R$ ${v.toLocaleString("pt-BR")}`
      : `${v.toLocaleString("pt-BR")}${unit ?? ""}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 40,
        height: chartHeight + 140,
      }}
    >
      {bars.map((bar, i) => {
        const p = springIn(frame, fps, delay + i * 6);
        const h = Math.max(8, interpolate(p, [0, 1], [0, (bar.value / max) * chartHeight]));
        const isMax = bar.value === max;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              width: barWidth,
            }}
          >
            <div
              style={{
                fontFamily: fontFamilyCss(numbersFont),
                fontWeight: Number(numbersFont.weight),
                fontSize: 40,
                color: isMax ? brand.colors.primary : brand.colors.text,
                opacity: p,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {fmt(bar.value)}
            </div>
            <div
              style={{
                width: "100%",
                height: h,
                borderRadius: "14px 14px 4px 4px",
                background: isMax
                  ? `linear-gradient(180deg, ${brand.colors.primary} 0%, ${brand.colors.accent} 100%)`
                  : brand.colors.accent,
                opacity: isMax ? 1 : 0.65,
              }}
            />
            <div
              style={{
                fontFamily: fontFamilyCss(brand.fonts.body),
                fontWeight: Number(brand.fonts.body.weight),
                fontSize: 30,
                color: brand.colors.textMuted,
                opacity: p,
                textAlign: "center",
              }}
            >
              {bar.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
