import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ProvaSocialProps } from "../lib/schemas";
import { fontFamilyCss } from "../lib/brand";
import { loadBrandFonts } from "../lib/fonts";

/**
 * ProvaSocial — sequência de retratos REAIS para a batida de prova social.
 *
 * Um retrato por card, tela cheia, corte SECO entre eles (dissolvência foi
 * justamente o defeito que uma ferramenta de IA produziu num job real — não repetir aqui).
 * Dentro de cada card a câmera se aproxima devagar: a pessoa não se mexe,
 * quem se mexe é o enquadramento.
 *
 * O nome fica no terço superior porque a faixa de baixo pertence à legenda
 * queimada (680px do rodapé) e à UI do Reels.
 */
export const ProvaSocial: React.FC<ProvaSocialProps> = ({
  brand,
  retratos,
  durationSeconds,
  pretoEBranco,
  zoomFinal,
  nomeTopoPx,
  nomeFontSizePx,
  nomeDelayMs,
}) => {
  loadBrandFonts(brand);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const totalFrames = Math.round(durationSeconds * fps);
  const framesPorCard = totalFrames / retratos.length;

  // qual card está no ar agora
  const idx = Math.min(
    retratos.length - 1,
    Math.floor(frame / framesPorCard)
  );
  const atual = retratos[idx];
  const frameNoCard = frame - idx * framesPorCard;

  // aproximação lenta dentro do card
  const escala = interpolate(frameNoCard, [0, framesPorCard], [1, zoomFinal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // o nome entra logo depois do corte, pra não competir com ele
  const delayFrames = (nomeDelayMs / 1000) * fps;
  const fadeFrames = 0.2 * fps;
  const opacidadeNome = interpolate(
    frameNoCard,
    [delayFrames, delayFrames + fadeFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // sobe 14px enquanto aparece — movimento mínimo, só pra não "piscar" na tela
  const subidaNome = interpolate(
    frameNoCard,
    [delayFrames, delayFrames + fadeFrames],
    [14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: brand.colors.bg, overflow: "hidden" }}>
      {/* retrato */}
      <AbsoluteFill>
        <Img
          src={staticFile(atual.foto)}
          style={{
            width,
            height,
            objectFit: "cover",
            objectPosition: "center 32%", // rosto costuma ficar acima do centro
            transform: `scale(${escala})`,
            filter: pretoEBranco
              ? "grayscale(1) contrast(1.06) brightness(0.94)"
              : "contrast(1.03)",
          }}
        />
      </AbsoluteFill>

      {/* véu no topo: garante contraste do nome sobre qualquer foto */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: nomeTopoPx + nomeFontSizePx * 2.2,
          background: `linear-gradient(180deg, ${brand.colors.bg} 0%, ${brand.colors.bg}CC 42%, transparent 100%)`,
        }}
      />

      {/* véu inferior discreto: assenta o retrato e devolve a cor da marca */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 620,
          background: `linear-gradient(0deg, ${brand.colors.bg}E6 0%, transparent 100%)`,
        }}
      />

      {/* nome */}
      <div
        style={{
          position: "absolute",
          top: nomeTopoPx,
          left: brand.safeMargins.sides,
          right: brand.safeMargins.sides,
          opacity: opacidadeNome,
          transform: `translateY(${subidaNome}px)`,
        }}
      >
        <div
          style={{
            width: 64,
            height: 4,
            borderRadius: 2,
            background: brand.colors.primary,
            marginBottom: 22,
          }}
        />
        <div
          style={{
            fontFamily: fontFamilyCss(brand.fonts.title),
            fontWeight: Number(brand.fonts.title.weight),
            fontSize: nomeFontSizePx,
            lineHeight: 1.1,
            color: brand.colors.primary,
            textShadow: `0 2px 24px ${brand.colors.bg}`,
          }}
        >
          {atual.nome}
        </div>
      </div>
    </AbsoluteFill>
  );
};
