# Contrato de job

## Estrutura de diretório (novo fluxo — NÃO mexe em jobs\<marca>\ da produção antiga)

```
jobs/AAAA-MM-DD-nome-do-video/
  brief.yaml          ← briefing (campos abaixo)
  raw/                ← brutos autorizados (ou referência a media\)
  transcript/         ← captions.json (Whisper) + words.json (contrato)
  references/         ← referências autorizadas do job
  generated/          ← saídas do Remotion para este job
  draft/              ← ids e relatórios dos drafts VectCut
  renders/            ← MP4 finais
  qc/                 ← relatórios de QC técnico + rubrica preenchida
  analytics/          ← hipótese registrada ANTES + métricas em 24h e 7d
```

## Campos do brief.yaml

```yaml
cliente: demo             # marca em brands\
objetivo: alcance         # alcance | relacionamento | venda
audiencia: "..."
ideia_central: "..."
oferta_cta: "..."
plataforma: instagram-reels
duracao_desejada_s: 20
formato_criativo: telepatia   # nome livre do formato criativo
preset_marca: demo
engine_legenda: remotion      # vectcut | remotion
modo_saida: hibrida           # capcut-editavel | hibrida | mp4-final
referencias: []
restricoes: ["sem música (ads)"]
prazo: 2026-08-20
aprovador: SeuNome
```

## edit-manifest.json

Contrato validado por `engine\src\lib\manifest.ts` (zod) e pelo
`scripts/validate_edit_manifest.py`:

```json
{
  "composition": "CaptionOverlay",
  "fps": 30, "width": 1080, "height": 1920,
  "durationInFrames": 900,
  "brandPreset": "demo",
  "props": { },
  "safeZones": true,
  "output": "assets/generated/<job>/captionoverlay.mov"
}
```

## Métricas (registrar por conteúdo publicado)

retenção 3s · tempo médio · % conclusão · replays · compartilhamentos/alcance ·
salvamentos/alcance · comentários · visitas ao perfil · seguidores · cliques CTA.
Hipótese ANTES de publicar (uma linha em analytics/hipotese.md); janelas de 24h
e 7d; comparar semelhante com semelhante; nada de causalidade com n=1.
