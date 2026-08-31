import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CTAEndcardProps } from "../lib/schemas";
import { loadBrandFonts } from "../lib/fonts";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp, popIn } from "../lib/anim";
import { BrandBackground } from "../components/BrandBackground";
import { SafeArea } from "../components/SafeArea";

/**
 * CTAEndcard — cartão final de CTA pra fechar qualquer peça.
 * Fundo da marca, logo (ou nome como logo-texto), chamada grande na fonte de
 * título e linha de apoio opcional. Tudo entra com spring escalonado e FICA —
 * endcard não pisca nem faz loop.
 */
export const CTAEndcard: React.FC<CTAEndcardProps> = ({ brand, ctaText, subTexto }) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const texto = ctaText ?? brand.cta.text;

  return (
    <AbsoluteFill>
      <BrandBackground brand={brand} />
      <SafeArea brand={brand}>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 52,
            textAlign: "center",
          }}
        >
          {brand.logo ? (
            <Img
              src={staticFile(brand.logo)}
              style={{ width: 300, maxHeight: 300, objectFit: "contain", ...popIn(frame, fps, 2) }}
            />
          ) : (
            <div
              style={{
                fontFamily: fontFamilyCss(brand.fonts.title),
                fontWeight: Number(brand.fonts.title.weight),
                fontSize: 60,
                lineHeight: 1.1,
                color: brand.colors.text,
                ...popIn(frame, fps, 2),
              }}
            >
              {brand.name}
            </div>
          )}

          <div
            style={{
              fontFamily: fontFamilyCss(brand.fonts.title),
              fontWeight: Number(brand.fonts.title.weight),
              fontSize: 104,
              lineHeight: 1.08,
              color: brand.colors.primary,
              maxWidth: 900,
              ...fadeUp(frame, fps, 10),
            }}
          >
            {texto}
          </div>

          {subTexto ? (
            <div
              style={{
                fontFamily: fontFamilyCss(brand.fonts.body),
                fontWeight: Number(brand.fonts.body.weight),
                fontSize: 42,
                lineHeight: 1.35,
                color: brand.colors.text,
                maxWidth: 820,
                ...fadeUp(frame, fps, 18),
              }}
            >
              {subTexto}
            </div>
          ) : null}

          {brand.handle ? (
            <div
              style={{
                fontFamily: fontFamilyCss(brand.fonts.body),
                fontWeight: "600",
                fontSize: 32,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: brand.colors.textMuted,
                ...fadeUp(frame, fps, 26, 24),
              }}
            >
              {brand.handle}
            </div>
          ) : null}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
