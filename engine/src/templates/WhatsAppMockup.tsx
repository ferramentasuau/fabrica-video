import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { WhatsAppMockupProps } from "../lib/schemas";
import { springIn } from "../lib/anim";

/**
 * WhatsAppMockup — conversa de WhatsApp (visual dark) legível em 1080x1920.
 *
 * Todas as bolhas já existem no layout desde o frame 0 (ancoradas no rodapé,
 * como no app) e cada uma só APARECE no seu delayMs — assim nada re-flui
 * quando uma bolha nova entra. Ícones são SVG inline: emoji/glifo de sistema
 * muda de máquina pra máquina e quebraria o determinismo do render.
 */

// paleta do WhatsApp dark (a identidade aqui é a do app, não a da marca)
const BG = "#0B141A";
const PAINEL = "#1F2C34";
const BOLHA_OUT = "#005C4B";
const TEXTO = "#E9EDEF";
const META = "#8696A0";
const TICK = "#53BDEB";
const VERDE = "#00A884";
const ICONE = "#AEBAC1";

const FONTE = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

const HEADER_H = 168;
const INPUT_H = 152;

export const WhatsAppMockup: React.FC<WhatsAppMockupProps> = ({
  mensagens,
  nomeContato,
  avatar,
  horario,
  som,
  somSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONTE }}>
      {/* header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_H,
          background: PAINEL,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 28px",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24">
          <path d="M15 5l-7 7 7 7" stroke={ICONE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        {avatar ? (
          <Img
            src={staticFile(avatar)}
            style={{ width: 92, height: 92, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              background: "#3B4A54",
              color: TEXTO,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 600,
            }}
          >
            {nomeContato.trim().charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: TEXTO,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {nomeContato}
          </div>
          <div style={{ fontSize: 28, color: META, marginTop: 2 }}>online</div>
        </div>
        <svg width="46" height="46" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
          <path
            d="M15 8.5v7H6a1.5 1.5 0 0 1-1.5-1.5V10A1.5 1.5 0 0 1 6 8.5h9zm1.5 2.2 3.5-2.2v7l-3.5-2.2v-2.6z"
            fill={ICONE}
          />
        </svg>
        <svg width="42" height="42" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
          <path
            d="M6.6 10.8c1.5 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"
            fill={ICONE}
          />
        </svg>
        <svg width="40" height="40" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" fill={ICONE} />
          <circle cx="12" cy="12" r="2" fill={ICONE} />
          <circle cx="12" cy="19" r="2" fill={ICONE} />
        </svg>
      </div>

      {/* bolhas — ancoradas no rodapé, como no app */}
      <div
        style={{
          position: "absolute",
          top: HEADER_H,
          bottom: INPUT_H,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 18,
          padding: "28px 32px",
        }}
      >
        {mensagens.map((m, i) => {
          const de = Math.round((m.delayMs / 1000) * fps);
          const p = springIn(frame, fps, de);
          const out = m.lado === "out";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: out ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "76%",
                  background: out ? BOLHA_OUT : PAINEL,
                  borderRadius: 26,
                  // canto "de origem" mais seco, como a cauda do app
                  borderTopLeftRadius: out ? 26 : 8,
                  borderTopRightRadius: out ? 8 : 26,
                  padding: "20px 28px 14px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
                  opacity: p,
                  transformOrigin: out ? "bottom right" : "bottom left",
                  transform: `translateY(${(1 - p) * 26}px) scale(${0.92 + 0.08 * p})`,
                }}
              >
                <div style={{ fontSize: 40, lineHeight: 1.32, color: TEXTO }}>
                  {m.texto}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 25,
                      color: out ? "rgba(233,237,239,0.62)" : META,
                    }}
                  >
                    {horario}
                  </div>
                  {out ? (
                    <svg width="34" height="22" viewBox="0 0 18 12">
                      <path d="M2 6.5l2.6 2.6L10.2 3.5" stroke={TICK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <path d="M7.4 6.5 10 9.1l5.7-5.6" stroke={TICK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* barra de mensagem */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: INPUT_H,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 24px 20px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: 96,
            background: PAINEL,
            borderRadius: 48,
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            fontSize: 36,
            color: META,
          }}
        >
          Mensagem
        </div>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: VERDE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24">
            <path
              d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"
              fill="#fff"
            />
          </svg>
        </div>
      </div>

      {/* som de notificação por bolha — desligado por padrão */}
      {som && somSrc
        ? mensagens.map((m, i) => (
            <Sequence key={`som-${i}`} from={Math.round((m.delayMs / 1000) * fps)} name={`Som ${i + 1}`}>
              <Audio src={staticFile(somSrc)} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
