import React from "react";
import { AbsoluteFill } from "remotion";
import type { SafeZoneOverlayProps } from "../lib/schemas";

/**
 * SafeZoneOverlay — zonas de segurança Meta 9:16 desenhadas como overlay.
 *
 * Vermelho = área que a UI do Reels/Stories COBRE (topo 14%, base 35%,
 * laterais 6%); verde = área útil. Fundo TRANSPARENTE: a peça existe pra ser
 * sobreposta num render ou no editor e conferir enquadramento — não é peça
 * final. Estático de propósito: qualquer frame serve de conferência.
 */

const VERMELHO = "rgba(255, 59, 48, 0.30)";
const LINHA_VERMELHA = "rgba(255, 59, 48, 0.95)";
const VERDE = "rgba(52, 199, 89, 0.14)";
const LINHA_VERDE = "rgba(52, 199, 89, 0.9)";

export const SafeZoneOverlay: React.FC<SafeZoneOverlayProps> = ({
  width,
  height,
  mostrarRotulos,
}) => {
  // percentuais da Meta pra 9:16 — em 1080x1920: y=269, y=1248, x=65/1015
  const topo = Math.round(height * 0.14);
  const base = Math.round(height * 0.65);
  const lado = Math.round(width * 0.06);

  const rotulo: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "system-ui, sans-serif",
    fontWeight: 700,
    fontSize: Math.round(width * 0.03),
    color: "#fff",
    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
    letterSpacing: 1,
  };

  return (
    <AbsoluteFill>
      {/* zonas da UI (vermelho) */}
      <div style={{ position: "absolute", left: 0, top: 0, width, height: topo, background: VERMELHO }} />
      <div style={{ position: "absolute", left: 0, top: base, width, height: height - base, background: VERMELHO }} />
      <div style={{ position: "absolute", left: 0, top: topo, width: lado, height: base - topo, background: VERMELHO }} />
      <div style={{ position: "absolute", left: width - lado, top: topo, width: lado, height: base - topo, background: VERMELHO }} />

      {/* área útil (verde) */}
      <div
        style={{
          position: "absolute",
          left: lado,
          top: topo,
          width: width - 2 * lado,
          height: base - topo,
          background: VERDE,
          border: `2px dashed ${LINHA_VERDE}`,
        }}
      />

      {/* linhas dos limites */}
      <div style={{ position: "absolute", left: 0, top: topo - 2, width, height: 4, background: LINHA_VERMELHA }} />
      <div style={{ position: "absolute", left: 0, top: base - 2, width, height: 4, background: LINHA_VERMELHA }} />
      <div style={{ position: "absolute", left: lado - 2, top: 0, width: 4, height, background: LINHA_VERMELHA }} />
      <div style={{ position: "absolute", left: width - lado - 2, top: 0, width: 4, height, background: LINHA_VERMELHA }} />

      {mostrarRotulos ? (
        <>
          <div style={{ ...rotulo, top: Math.round(topo / 2) - Math.round(width * 0.02) }}>
            UI TOPO 14% · y={topo}
          </div>
          <div style={{ ...rotulo, top: base + Math.round((height - base) / 2) - Math.round(width * 0.02) }}>
            UI BASE 35% · y={base}
          </div>
          <div style={{ ...rotulo, top: topo + 24 }}>ÁREA ÚTIL</div>
          <div style={{ ...rotulo, textAlign: "left", left: lado + 12, right: undefined, top: topo + 90 }}>
            x={lado}
          </div>
          <div style={{ ...rotulo, textAlign: "right", right: lado + 12, left: undefined, top: topo + 90 }}>
            x={width - lado}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
