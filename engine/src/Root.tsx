import React from "react";
import { Composition } from "remotion";
import { DataCard } from "./templates/DataCard";
import { QuotePost } from "./templates/QuotePost";
import { LegendaDinamica } from "./templates/LegendaDinamica";
import { ProvaSocial } from "./templates/ProvaSocial";
import { SafeZoneOverlay } from "./templates/SafeZoneOverlay";
import { CTAEndcard } from "./templates/CTAEndcard";
import { Comparison } from "./templates/Comparison";
import { KineticTypography } from "./templates/KineticTypography";
import { WhatsAppMockup } from "./templates/WhatsAppMockup";
import { DataChart } from "./templates/DataChart";
import { VisualStorytelling } from "./templates/VisualStorytelling";
import { CaptionOverlay } from "./templates/CaptionOverlay";
import {
  dataCardSchema,
  quotePostSchema,
  legendaDinamicaSchema,
  provaSocialSchema,
  safeZoneOverlaySchema,
  ctaEndcardSchema,
  comparisonSchema,
  kineticTypographySchema,
  whatsAppMockupSchema,
  dataChartSchema,
  visualStorytellingSchema,
  captionOverlaySchema,
} from "./lib/schemas";
import type {
  DataCardProps,
  QuotePostProps,
  LegendaDinamicaProps,
  ProvaSocialProps,
  SafeZoneOverlayProps,
  CTAEndcardProps,
  ComparisonProps,
  KineticTypographyProps,
  WhatsAppMockupProps,
  DataChartProps,
  VisualStorytellingProps,
  CaptionOverlayProps,
} from "./lib/schemas";

const FPS = 30;

// defaultProps = marca "demo" + conteúdo de demonstração
// (só pro Studio abrir com algo bonito; renders reais usam --props=<job.json>)
// A marca espelha brands/demo.json e as fontes vêm no pacote (assets/demo/fonts/).
const demoBrand = {
  id: "demo",
  name: "Marca Demo",
  handle: "@marca.demo",
  colors: {
    bg: "#171A21",
    bg2: "#232A36",
    primary: "#FF6B57",
    accent: "#6FA8FF",
    text: "#F4F6FB",
    textMuted: "#9AA3B2",
    onPrimary: "#171A21",
  },
  fonts: {
    title: {
      family: "Playfair Display",
      file: "demo/fonts/playfair-display-700.woff2",
      weight: "700",
      style: "normal",
      fallback: "Georgia, serif",
    },
    body: {
      family: "Inter",
      file: "demo/fonts/inter-400.woff2",
      weight: "400",
      style: "normal",
      fallback: "system-ui, sans-serif",
    },
    numbers: {
      family: "Inter",
      file: "demo/fonts/inter-800.woff2",
      weight: "800",
      style: "normal",
      fallback: "system-ui, sans-serif",
    },
  },
  logo: null,
  cta: { text: "Fale com a gente" },
  safeMargins: { top: 220, bottom: 320, sides: 64 },
};

const defaultDataCardProps: DataCardProps = {
  brand: demoBrand,
  title: "Exemplo — Dado da semana",
  subtitle: "conteúdo de demonstração do template",
  data: { kind: "bigNumber", value: "87%", label: "número de demonstração" },
  durationSeconds: 10,
};

const defaultQuotePostProps: QuotePostProps = {
  brand: demoBrand,
  kicker: "Conteúdo de demonstração",
  parts: [
    { text: "Você não precisa de mais volume. Precisa de um ", gold: false },
    { text: "método", gold: true },
    { text: " que caiba na sua rotina.", gold: false },
  ],
};

// LegendaDinamica — demo com a marca "demo" (renders reais usam --props=<job.json>).
// ⚠️ videoSrc é PLACEHOLDER: o pacote não traz vídeo de exemplo. Registrar a
// composição não abre o arquivo — só o render DESTA composição precisa dele.
// Aponte pro seu vídeo em assets\ via --props antes de renderizar.
const defaultLegendaProps: LegendaDinamicaProps = {
  brand: demoBrand,
  videoSrc: "demo/video/exemplo.mp4",
  captions: [
    { text: "Legenda", startMs: 0, endMs: 500 },
    { text: "dinâmica", startMs: 500, endMs: 1100 },
    { text: "de", startMs: 1100, endMs: 1300 },
    { text: "demonstração", startMs: 1300, endMs: 2200 },
  ],
  durationSeconds: 3,
  wordsPerPage: 4,
  fontSizePx: 76,
  bottomOffsetPx: 360,
  estiloLetra: "vazado",
  intensidade: "reels",
  strokePx: 2,
  caixaAlta: false,
  offsetMs: 200,
  antecipaPaginaMs: 100,
  transicoes: [],
  transicaoMs: 360,
  transicaoBlurPx: 14,
  transicaoZoom: 0.05,
  ativaNaFrente: true,
  palavrasAccent: [],
  dessaturar: [],
  // onda 2 (15/08/2026): defaults preservam os jobs antigos byte a byte
  destaquePalavra: true,
  paginaSeca: false,
  displays: [],
  sfx: [],
  veu: true,
  porFrase: false,
  punches: [],
  punchesResetSegundo: null,
  trilha: null,
  palavrasDestaque: [],
  palavrasDestaqueXL: [],
  textoAtras: [],
  inserts: [],
  textoAtrasFonte: null,
  cutoutSeq: null,
  estiloDestaque: {
    manuscrito: true,
    family: "Caveat",
    file: "demo/fonts/caveat-700.woff2",
    weight: "700",
    escala: 1.35,
    escalaXL: 1.7,
    cor: "primary",
    opacidade: 0.88,
  },
};

// ProvaSocial — retratos placeholder do pacote (renders reais usam --props=<job.json>)
const defaultProvaSocialProps: ProvaSocialProps = {
  brand: demoBrand,
  retratos: [
    { foto: "demo/prova/pessoa-1.jpg", nome: "Nome Sobrenome" },
    { foto: "demo/prova/pessoa-2.jpg", nome: "Outra Pessoa" },
  ],
  durationSeconds: 4,
  pretoEBranco: true,
  zoomFinal: 1.05,
  nomeTopoPx: 560,
  nomeFontSizePx: 72,
  nomeDelayMs: 150,
};

// ── FASE 7 — defaults das composições novas (demo pro Studio; renders reais
// usam --props=<job.json>) ───────────────────────────────────────────────────

const defaultSafeZoneOverlayProps: SafeZoneOverlayProps = {
  width: 1080,
  height: 1920,
  mostrarRotulos: true,
};

const defaultCtaEndcardProps: CTAEndcardProps = {
  brand: demoBrand,
  subTexto: "Oferta de demonstração por tempo limitado",
  durationSeconds: 4,
};

const defaultComparisonProps: ComparisonProps = {
  brand: demoBrand,
  titulo: "Sem método vs. com método",
  ladoA: {
    titulo: "Sem método",
    itens: ["Cada peça sai de um jeito", "Retrabalho a cada revisão", "Prazo imprevisível"],
  },
  ladoB: {
    titulo: "Com método",
    itens: ["Padrão que se repete", "Revisão em um passo", "Prazo que se cumpre"],
  },
  layout: "empilhado",
  vencedor: "B",
  durationSeconds: 8,
};

const defaultKineticTypographyProps: KineticTypographyProps = {
  brand: demoBrand,
  words: [
    { text: "Pare", startMs: 0, endMs: 400, emphasis: false },
    { text: "de", startMs: 400, endMs: 600, emphasis: false },
    { text: "postar", startMs: 600, endMs: 1100, emphasis: false },
    { text: "no", startMs: 1100, endMs: 1300, emphasis: false },
    { text: "escuro", startMs: 1300, endMs: 2000, emphasis: true },
  ],
  fontSizePx: 110,
  caixaAlta: true,
  caudaMs: 800,
};

const defaultWhatsAppMockupProps: WhatsAppMockupProps = {
  mensagens: [
    { texto: "Oi! Vi o tênis no anúncio", lado: "in", delayMs: 0 },
    { texto: "Tem numeração 36?", lado: "in", delayMs: 900 },
    { texto: "Tem sim! E hoje está com R$100 de desconto", lado: "out", delayMs: 2000 },
    { texto: "Quero! Como faço?", lado: "in", delayMs: 3400 },
  ],
  nomeContato: "Loja Demo",
  avatar: null,
  horario: "09:41",
  som: false,
};

const defaultDataChartProps: DataChartProps = {
  brand: demoBrand,
  tipo: "linha",
  pontos: [
    { label: "Jan", valor: 12 },
    { label: "Fev", valor: 18 },
    { label: "Mar", valor: 26 },
    { label: "Abr", valor: 31 },
    { label: "Mai", valor: 44 },
  ],
  titulo: "Clientes atendidos",
  subtitle: "evolução mês a mês",
  durationSeconds: 8,
};

// defaults SÓ com cenas de texto de propósito: default com imagem quebra o
// Studio quando o asset some (aconteceu com as fotos do ProvaSocial)
const defaultVisualStorytellingProps: VisualStorytellingProps = {
  brand: demoBrand,
  cenas: [
    { tipo: "texto", texto: "Era assim que começava todo lançamento", duracaoMs: 2000 },
    { tipo: "texto", texto: "Até o dia em que o método mudou", duracaoMs: 2500 },
    { tipo: "texto", texto: "O resto é história", duracaoMs: 2000 },
  ],
  transicaoMs: 500,
};

const defaultCaptionOverlayProps: CaptionOverlayProps = {
  brand: demoBrand,
  captions: [
    { text: "Legenda", startMs: 0, endMs: 500, emphasis: false },
    { text: "transparente", startMs: 500, endMs: 1200, emphasis: true },
    { text: "para", startMs: 1200, endMs: 1450, emphasis: false },
    { text: "editor", startMs: 1450, endMs: 1900, emphasis: false },
    { text: "externo", startMs: 1900, endMs: 2500, emphasis: false },
  ],
  durationSeconds: 3,
  wordsPerPage: 4,
  fontSizePx: 76,
  bottomPx: 680,
  caixaAlta: false,
  strokePx: 2,
  offsetMs: 100,
  antecipaPaginaMs: 200,
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ProvaSocial"
        component={ProvaSocial}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={4 * FPS}
        schema={provaSocialSchema}
        defaultProps={defaultProvaSocialProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationSeconds * FPS),
        })}
      />
      <Composition
        id="QuotePost"
        component={QuotePost}
        width={1080}
        height={1350}
        fps={FPS}
        durationInFrames={120}
        schema={quotePostSchema}
        defaultProps={defaultQuotePostProps}
      />
      <Composition
        id="DataCard"
        component={DataCard}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={10 * FPS}
        schema={dataCardSchema}
        defaultProps={defaultDataCardProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationSeconds * FPS),
        })}
      />
      <Composition
        id="LegendaDinamica"
        component={LegendaDinamica}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={3 * FPS}
        schema={legendaDinamicaSchema}
        defaultProps={defaultLegendaProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationSeconds * FPS),
        })}
      />

      {/* ── FASE 7 — composições novas ──────────────────────────────────── */}
      <Composition
        id="SafeZoneOverlay"
        component={SafeZoneOverlay}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={60}
        schema={safeZoneOverlaySchema}
        defaultProps={defaultSafeZoneOverlayProps}
        calculateMetadata={({ props }) => ({
          width: props.width,
          height: props.height,
        })}
      />
      <Composition
        id="CTAEndcard"
        component={CTAEndcard}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={4 * FPS}
        schema={ctaEndcardSchema}
        defaultProps={defaultCtaEndcardProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationSeconds * FPS),
        })}
      />
      <Composition
        id="Comparison"
        component={Comparison}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={8 * FPS}
        schema={comparisonSchema}
        defaultProps={defaultComparisonProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationSeconds * FPS),
        })}
      />
      <Composition
        id="KineticTypography"
        component={KineticTypography}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={3 * FPS}
        schema={kineticTypographySchema}
        defaultProps={defaultKineticTypographyProps}
        // sem durationSeconds: dura até a última palavra + caudaMs
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(
            1,
            Math.round(
              ((props.durationSeconds != null
                ? props.durationSeconds * 1000
                : Math.max(...props.words.map((w) => w.endMs)) +
                  (props.caudaMs ?? 800)) /
                1000) *
                FPS
            )
          ),
        })}
      />
      <Composition
        id="WhatsAppMockup"
        component={WhatsAppMockup}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={6 * FPS}
        schema={whatsAppMockupSchema}
        defaultProps={defaultWhatsAppMockupProps}
        // sem durationSeconds: dura até a última bolha + 2,5s de leitura
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(
            1,
            Math.round(
              ((props.durationSeconds != null
                ? props.durationSeconds * 1000
                : Math.max(...props.mensagens.map((m) => m.delayMs)) + 2500) /
                1000) *
                FPS
            )
          ),
        })}
      />
      <Composition
        id="DataChart"
        component={DataChart}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={8 * FPS}
        schema={dataChartSchema}
        defaultProps={defaultDataChartProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationSeconds * FPS),
        })}
      />
      <Composition
        id="VisualStorytelling"
        component={VisualStorytelling}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={6 * FPS}
        schema={visualStorytellingSchema}
        defaultProps={defaultVisualStorytellingProps}
        // duração = soma das cenas (o cross-fade sobrepõe, não desloca)
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(
            1,
            Math.round(
              (props.cenas.reduce((soma, c) => soma + c.duracaoMs, 0) / 1000) * FPS
            )
          ),
        })}
      />
      <Composition
        id="CaptionOverlay"
        component={CaptionOverlay}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={3 * FPS}
        schema={captionOverlaySchema}
        defaultProps={defaultCaptionOverlayProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationSeconds * FPS),
        })}
      />
    </>
  );
};
