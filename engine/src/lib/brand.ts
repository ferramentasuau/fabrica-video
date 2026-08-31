// Contrato multi-marca do VIDEO-FACTORY.
// Toda marca é um JSON em D:\VIDEO-FACTORY\brands\<id>.json validado por este schema.
// A marca entra INTEIRA nos props do render (nunca carregada do disco em runtime).
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Uma fonte: family = nome da família; file = caminho relativo a assets\ (null = usa fallback do sistema)
export const fontSpec = z.object({
  family: z.string(),
  file: z.string().nullable(),
  weight: z.string().default("700"),
  style: z.string().default("normal"), // "normal" | "italic"
  fallback: z.string().default("sans-serif"),
});
export type FontSpec = z.infer<typeof fontSpec>;

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  // handle: @ da marca OU site — vira a linha pequena no final do vídeo (null = mostra só o CTA)
  handle: z.string().nullable().default(null),
  colors: z.object({
    bg: zColor(), // fundo principal
    bg2: zColor().optional(), // segunda cor do gradiente de fundo (opcional)
    primary: zColor(), // cor de destaque principal (números, CTA)
    accent: zColor(), // cor de apoio (barras secundárias, detalhes)
    text: zColor(), // texto claro principal
    textMuted: zColor(), // texto secundário
    onPrimary: zColor().optional(), // texto SOBRE a cor primária (ex.: texto escuro no botão dourado)
  }),
  fonts: z.object({
    title: fontSpec, // títulos
    body: fontSpec, // corpo / labels
    numbers: fontSpec.optional(), // números grandes e CTA (se faltar, usa title)
    accent: fontSpec.optional(), // destaque editorial (ex.: itálico serifado; se faltar, usa title)
  }),
  // logo: caminho relativo a assets\ (ex.: "minha-marca/logo.png"); null = renderiza o nome como logo-texto
  logo: z.string().nullable().default(null),
  cta: z.object({ text: z.string() }),
  // margens de segurança pra UI do Reels/TikTok/Shorts não cobrir o conteúdo
  safeMargins: z
    .object({ top: z.number(), bottom: z.number(), sides: z.number() })
    .default({ top: 220, bottom: 320, sides: 64 }),
});
export type Brand = z.infer<typeof brandSchema>;

export const fontFamilyCss = (f: FontSpec) => `"${f.family}", ${f.fallback}`;
