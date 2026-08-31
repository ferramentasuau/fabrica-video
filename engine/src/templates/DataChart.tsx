import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { DataChartProps } from "../lib/schemas";
import { loadBrandFonts } from "../lib/fonts";
import { fontFamilyCss } from "../lib/brand";
import { springIn } from "../lib/anim";
import { BrandBackground } from "../components/BrandBackground";
import { SafeArea } from "../components/SafeArea";
import { TitleBlock } from "../components/TitleBlock";

/**
 * DataChart — gráfico de barras OU linha, até 8 pontos, cores da marca.
 * Mesmo idioma do BigNumber/BarChart do DataCard (contador preso na mola,
 * maior valor na cor primary), mas como peça SOLTA, pra entrar em edição.
 * Na linha, a revelação é por clip que cresce no eixo x — determinístico e
 * sem medir path no DOM.
 */
export const DataChart: React.FC<DataChartProps> = ({
  brand,
  tipo,
  pontos,
  titulo,
  subtitle,
  unit,
}) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const numbersFont = brand.fonts.numbers ?? brand.fonts.title;
  const delay = titulo ? 16 : 4;

  const valores = pontos.map((p) => p.valor);
  const vMax = Math.max(...valores);

  const decimais = (v: number) => (Number.isInteger(v) ? 0 : 1);
  const fmt = (v: number, dec: number) => {
    const s = v.toLocaleString("pt-BR", {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });
    return unit === "R$" ? `R$ ${s}` : `${s}${unit ?? ""}`;
  };
  // contador preso na mola (mesmo idioma do BigNumber)
  const contador = (alvo: number, d: number) =>
    fmt(alvo * Math.min(1, springIn(frame, fps, d)), decimais(alvo));

  const barras = () => {
    const chartHeight = 600;
    const barWidth = Math.min(140, 820 / pontos.length);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: pontos.length > 6 ? 22 : 36,
          height: chartHeight + 150,
        }}
      >
        {pontos.map((ponto, i) => {
          const p = springIn(frame, fps, delay + i * 5);
          const h = Math.max(8, interpolate(p, [0, 1], [0, (ponto.valor / vMax) * chartHeight]));
          const isMax = ponto.valor === vMax;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                width: barWidth,
              }}
            >
              <div
                style={{
                  fontFamily: fontFamilyCss(numbersFont),
                  fontWeight: Number(numbersFont.weight),
                  fontSize: pontos.length > 6 ? 32 : 38,
                  color: isMax ? brand.colors.primary : brand.colors.text,
                  opacity: p,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {contador(ponto.valor, delay + i * 5)}
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
                  fontSize: 28,
                  color: brand.colors.textMuted,
                  opacity: p,
                  textAlign: "center",
                }}
              >
                {ponto.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const linha = () => {
    const svgW = width - brand.safeMargins.sides * 2;
    const svgH = 620;
    const padX = 50;
    const padTop = 100;
    const padBot = 70;
    const vMin = Math.min(0, ...valores);
    const range = vMax - vMin || 1;
    const px = (i: number) => padX + (i * (svgW - 2 * padX)) / (pontos.length - 1);
    const py = (v: number) => padTop + (1 - (v - vMin) / range) * (svgH - padTop - padBot);

    const caminho = pontos
      .map((p, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(p.valor).toFixed(1)}`)
      .join(" ");
    const area = `${caminho} L ${px(pontos.length - 1).toFixed(1)} ${svgH - padBot} L ${padX} ${svgH - padBot} Z`;

    const pLinha = Math.min(1, springIn(frame, fps, delay));

    return (
      <svg width={svgW} height={svgH}>
        <defs>
          {/* clip que cresce no eixo x revela linha E área juntas */}
          <clipPath id="dataChartClip">
            <rect x={0} y={0} width={svgW * pLinha} height={svgH} />
          </clipPath>
        </defs>
        <g clipPath="url(#dataChartClip)">
          <path d={area} fill={brand.colors.primary} opacity={0.1} />
          <path
            d={caminho}
            stroke={brand.colors.primary}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        {pontos.map((ponto, i) => {
          const dp = Math.min(1, springIn(frame, fps, delay + 6 + i * 4));
          const isMax = ponto.valor === vMax;
          return (
            <g key={i}>
              <circle
                cx={px(i)}
                cy={py(ponto.valor)}
                r={(isMax ? 16 : 11) * dp}
                fill={isMax ? brand.colors.primary : brand.colors.accent}
                stroke={brand.colors.bg}
                strokeWidth={4}
              />
              <text
                x={px(i)}
                y={py(ponto.valor) - (isMax ? 40 : 32)}
                textAnchor="middle"
                fill={isMax ? brand.colors.primary : brand.colors.text}
                opacity={dp}
                style={{
                  fontFamily: fontFamilyCss(numbersFont),
                  fontWeight: Number(numbersFont.weight),
                  fontSize: isMax ? 40 : 32,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {contador(ponto.valor, delay + 6 + i * 4)}
              </text>
              <text
                x={px(i)}
                y={svgH - 18}
                textAnchor="middle"
                fill={brand.colors.textMuted}
                opacity={dp}
                style={{
                  fontFamily: fontFamilyCss(brand.fonts.body),
                  fontWeight: Number(brand.fonts.body.weight),
                  fontSize: 28,
                }}
              >
                {ponto.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <AbsoluteFill>
      <BrandBackground brand={brand} />
      <SafeArea brand={brand}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {titulo ? <TitleBlock brand={brand} title={titulo} subtitle={subtitle} /> : null}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {tipo === "barras" ? barras() : linha()}
          </div>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
