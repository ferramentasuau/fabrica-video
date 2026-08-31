import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { DataCardProps } from "../lib/schemas";
import { loadBrandFonts } from "../lib/fonts";
import { BrandBackground } from "../components/BrandBackground";
import { SafeArea } from "../components/SafeArea";
import { LogoIntro } from "../components/LogoIntro";
import { TitleBlock } from "../components/TitleBlock";
import { BigNumber } from "../components/BigNumber";
import { BarChart } from "../components/BarChart";
import { CtaOutro } from "../components/CtaOutro";

/**
 * DataCard — "Dado da semana" (vertical 1080x1920).
 * Timeline: LogoIntro → Título → Número grande OU gráfico de barras → CTA.
 */
export const DataCard: React.FC<DataCardProps> = ({
  brand,
  title,
  subtitle,
  data,
  cta,
}) => {
  loadBrandFonts(brand);
  const { durationInFrames } = useVideoConfig();

  const INTRO_END = 50;
  const MAIN_START = 45; // sobrepõe o fade-out da intro
  const CTA_START = Math.max(MAIN_START + 60, durationInFrames - 75);

  return (
    <AbsoluteFill>
      <BrandBackground brand={brand} />

      <Sequence from={0} durationInFrames={INTRO_END} name="LogoIntro">
        <LogoIntro brand={brand} />
      </Sequence>

      <Sequence from={MAIN_START} name="Conteudo">
        <SafeArea brand={brand}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TitleBlock brand={brand} title={title} subtitle={subtitle} />
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {data.kind === "bigNumber" ? (
                <BigNumber
                  brand={brand}
                  value={data.value}
                  label={data.label}
                  delay={22}
                />
              ) : (
                <BarChart
                  brand={brand}
                  bars={data.bars}
                  unit={data.unit}
                  delay={22}
                />
              )}
            </div>
          </div>
        </SafeArea>
      </Sequence>

      <Sequence from={CTA_START} name="CTA">
        <CtaOutro brand={brand} cta={cta} />
      </Sequence>
    </AbsoluteFill>
  );
};
