// Contrato do manifest de edição — a ponte entre quem PLANEJA a peça e quem
// RENDERIZA (este engine). Um manifest = um render:
//   npx remotion render <composition> --props=<props extraídos do manifest>
// Os props são validados DUAS vezes: aqui (contra o schema da composição
// escolhida) e de novo pelo Remotion na hora do render.
import { z } from "zod";
import {
  captionOverlaySchema,
  comparisonSchema,
  ctaEndcardSchema,
  dataCardSchema,
  dataChartSchema,
  kineticTypographySchema,
  legendaDinamicaSchema,
  provaSocialSchema,
  quotePostSchema,
  safeZoneOverlaySchema,
  visualStorytellingSchema,
  whatsAppMockupSchema,
} from "./schemas";

// as 4 composições originais + as 8 da Fase 7 (mesmos ids do Root.tsx)
export const compositionIds = [
  "ProvaSocial",
  "QuotePost",
  "DataCard",
  "LegendaDinamica",
  "SafeZoneOverlay",
  "CTAEndcard",
  "Comparison",
  "KineticTypography",
  "WhatsAppMockup",
  "DataChart",
  "VisualStorytelling",
  "CaptionOverlay",
] as const;
export type CompositionId = (typeof compositionIds)[number];

const propsSchemaPorComposicao: Record<CompositionId, z.ZodType> = {
  ProvaSocial: provaSocialSchema,
  QuotePost: quotePostSchema,
  DataCard: dataCardSchema,
  LegendaDinamica: legendaDinamicaSchema,
  SafeZoneOverlay: safeZoneOverlaySchema,
  CTAEndcard: ctaEndcardSchema,
  Comparison: comparisonSchema,
  KineticTypography: kineticTypographySchema,
  WhatsAppMockup: whatsAppMockupSchema,
  DataChart: dataChartSchema,
  VisualStorytelling: visualStorytellingSchema,
  CaptionOverlay: captionOverlaySchema,
};

export const editManifestSchema = z.object({
  composition: z.enum(compositionIds),
  fps: z.literal(30).default(30), // a fábrica inteira roda a 30fps
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920), // QuotePost usa 1350
  durationInFrames: z.number().int().positive(),
  // id da marca (brands\<id>.json) — informativo: o brand REAL vai INTEIRO em
  // props.brand, nunca é carregado do disco em runtime (contrato do brand.ts)
  brandPreset: z.string(),
  // validado contra o schema da composição escolhida em validateManifest()
  props: z.record(z.string(), z.unknown()),
  // true = renderizar TAMBÉM uma passada com o SafeZoneOverlay por cima (conferência)
  safeZones: z.boolean().default(false),
  output: z.string(), // caminho RELATIVO à raiz do VIDEO-FACTORY
});
export type EditManifest = z.infer<typeof editManifestSchema>;

/**
 * Valida o manifest inteiro E os props contra o schema da composição.
 * Devolve o manifest com defaults aplicados; lança ZodError se algo não bater.
 */
export const validateManifest = (json: unknown): EditManifest => {
  const manifest = editManifestSchema.parse(json);
  const schema = propsSchemaPorComposicao[manifest.composition];
  return {
    ...manifest,
    props: schema.parse(manifest.props) as Record<string, unknown>,
  };
};
