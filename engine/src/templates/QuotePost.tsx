import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { QuotePostProps } from "../lib/schemas";
import { fontFamilyCss } from "../lib/brand";
import { loadBrandFonts } from "../lib/fonts";
import { fadeUp } from "../lib/anim";

/**
 * QuotePost — post de feed 4:5 (1080x1350) com tipografia editorial.
 * Kicker pequeno em cima → frase grande na serifada (trechos gold em itálico
 * dourado) → autor + rodapé. Fundo com o arco-assinatura da marca.
 * Feito pra still (PNG), mas anima — também rende como vídeo curto.
 */
export const QuotePost: React.FC<QuotePostProps> = ({
  brand,
  kicker,
  parts,
  author,
  footer,
}) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentFont = brand.fonts.accent ?? brand.fonts.title;
  const bg2 = brand.colors.bg2 ?? brand.colors.bg;
  const authorText = author ?? brand.name;
  const footerText = footer ?? brand.handle;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(155deg, ${brand.colors.bg} 0%, ${bg2} 60%, ${brand.colors.bg} 100%)`,
      }}
    >
      {/* glow sutil da cor primária */}
      <div
        style={{
          position: "absolute",
          top: -380,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1200,
          height: 800,
          borderRadius: "50%",
          background: brand.colors.primary,
          opacity: 0.07,
          filter: "blur(120px)",
        }}
      />

      {/* arco-assinatura (dourado→escuro) no rodapé, estilo da marca */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 760,
          height: 300,
          borderRadius: "300px 0 0 0",
          background: `linear-gradient(270deg, ${brand.colors.accent} 0%, ${brand.colors.bg} 92%)`,
          opacity: 0.35,
        }}
      />

      {/* conteúdo */}
      <AbsoluteFill style={{ padding: 96, display: "flex", flexDirection: "column" }}>
        {/* kicker */}
        {kicker ? (
          <div style={{ ...fadeUp(frame, fps, 0, 24) }}>
            <div
              style={{
                fontFamily: fontFamilyCss(brand.fonts.numbers ?? brand.fonts.body),
                fontWeight: Number((brand.fonts.numbers ?? brand.fonts.body).weight),
                fontSize: 27,
                letterSpacing: 7,
                textTransform: "uppercase",
                color: brand.colors.primary,
              }}
            >
              {kicker}
            </div>
            <div
              style={{
                width: 72,
                height: 4,
                background: brand.colors.primary,
                marginTop: 26,
                borderRadius: 2,
              }}
            />
          </div>
        ) : null}

        {/* frase */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontFamily: fontFamilyCss(brand.fonts.title),
              fontWeight: Number(brand.fonts.title.weight),
              fontSize: 88,
              lineHeight: 1.22,
              color: brand.colors.text,
              ...fadeUp(frame, fps, 8),
            }}
          >
            {parts.map((p, i) =>
              p.gold ? (
                <span
                  key={i}
                  style={{
                    fontFamily: fontFamilyCss(accentFont),
                    fontStyle: accentFont.style,
                    color: brand.colors.primary,
                  }}
                >
                  {p.text}
                </span>
              ) : (
                <span key={i}>{p.text}</span>
              )
            )}
          </div>
        </div>

        {/* autor + rodapé */}
        <div style={{ ...fadeUp(frame, fps, 18, 24) }}>
          <div
            style={{
              fontFamily: fontFamilyCss(accentFont),
              fontStyle: accentFont.style,
              fontWeight: Number(accentFont.weight),
              fontSize: 40,
              color: brand.colors.primary,
            }}
          >
            {authorText}
          </div>
          {footerText ? (
            <div
              style={{
                fontFamily: fontFamilyCss(brand.fonts.body),
                fontWeight: Number(brand.fonts.body.weight),
                fontSize: 28,
                letterSpacing: 1,
                color: brand.colors.textMuted,
                marginTop: 12,
              }}
            >
              {footerText}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
