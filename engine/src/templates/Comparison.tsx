import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { ComparisonProps } from "../lib/schemas";
import { loadBrandFonts } from "../lib/fonts";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp, popIn } from "../lib/anim";
import { BrandBackground } from "../components/BrandBackground";
import { SafeArea } from "../components/SafeArea";

/**
 * Comparison — A vs B em dois painéis (empilhados ou em colunas).
 * Os itens entram em stagger: primeiro o lado A inteiro, depois o B — a ordem
 * de leitura vira ordem de entrada. O vencedor ganha borda + título na cor
 * primary e um selo de check; o outro painel fica levemente apagado.
 */
export const Comparison: React.FC<ComparisonProps> = ({
  brand,
  titulo,
  ladoA,
  ladoB,
  layout,
  vencedor,
}) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colunas = layout === "colunas";
  const delayA = 14;
  // B só começa quando o stagger de A terminou — comparação se lê em ordem
  const delayB = delayA + ladoA.itens.length * 6 + 12;
  const bg2 = brand.colors.bg2 ?? brand.colors.bg;

  const painel = (
    dados: ComparisonProps["ladoA"],
    delayBase: number,
    ganhou: boolean
  ) => {
    const entrada = fadeUp(frame, fps, delayBase - 8, 36);
    return (
    <div
      style={{
        flex: 1,
        borderRadius: 32,
        border: ganhou
          ? `3px solid ${brand.colors.primary}`
          : `2px solid ${brand.colors.accent}55`,
        background: `${bg2}B3`,
        boxShadow: ganhou ? `0 0 60px ${brand.colors.primary}30` : undefined,
        padding: colunas ? "40px 36px" : "44px 52px",
        display: "flex",
        flexDirection: "column",
        gap: 26,
        minHeight: 0,
        transform: entrada.transform,
        // o perdedor fica levemente apagado — multiplica com o fade de entrada
        opacity: entrada.opacity * (vencedor && !ganhou ? 0.82 : 1),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {ganhou ? (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: brand.colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              ...popIn(frame, fps, delayBase - 4),
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24">
              <path
                d="M4.5 12.5l5 5 10-11"
                stroke={brand.colors.onPrimary ?? brand.colors.bg}
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        ) : null}
        <div
          style={{
            fontFamily: fontFamilyCss(brand.fonts.title),
            fontWeight: Number(brand.fonts.title.weight),
            fontSize: colunas ? 46 : 54,
            lineHeight: 1.12,
            color: ganhou ? brand.colors.primary : brand.colors.text,
          }}
        >
          {dados.titulo}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {dados.itens.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              ...fadeUp(frame, fps, delayBase + i * 6, 24),
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                marginTop: colunas ? 14 : 16,
                flexShrink: 0,
                background: ganhou ? brand.colors.primary : brand.colors.accent,
              }}
            />
            <div
              style={{
                fontFamily: fontFamilyCss(brand.fonts.body),
                fontWeight: Number(brand.fonts.body.weight),
                fontSize: colunas ? 34 : 38,
                lineHeight: 1.3,
                color: brand.colors.text,
              }}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  };

  return (
    <AbsoluteFill>
      <BrandBackground brand={brand} />
      <SafeArea brand={brand}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
          <div
            style={{
              fontFamily: fontFamilyCss(brand.fonts.title),
              fontWeight: Number(brand.fonts.title.weight),
              fontSize: 66,
              lineHeight: 1.15,
              color: brand.colors.text,
              textAlign: "center",
              ...fadeUp(frame, fps, 0),
            }}
          >
            {titulo}
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: colunas ? "row" : "column",
              alignItems: "stretch",
              gap: 28,
            }}
          >
            {painel(ladoA, delayA, vencedor === "A")}

            {/* selo "VS" na junção dos painéis */}
            <div style={{ alignSelf: "center", ...popIn(frame, fps, delayB - 8) }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: brand.colors.primary,
                  color: brand.colors.onPrimary ?? brand.colors.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fontFamilyCss(brand.fonts.numbers ?? brand.fonts.title),
                  fontWeight: Number((brand.fonts.numbers ?? brand.fonts.title).weight),
                  fontSize: 38,
                  letterSpacing: 1,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                VS
              </div>
            </div>

            {painel(ladoB, delayB, vencedor === "B")}
          </div>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
