# Roteamento de ferramentas

## Os três modos

| Modo | Fluxo | Quando |
|---|---|---|
| Editável | Claude → vectcut-safe → CapCut | timeline/textos/cortes que o aprovador quer continuar editando |
| Híbrido | Claude → Remotion (overlay alpha) → vectcut-safe → CapCut | animação precisa + projeto editável |
| Automático | Claude → Remotion → MP4 | lote, dado/gráfico, sem necessidade de CapCut |

## Quem faz o quê

**vectcut-safe (MCP)** — cortes, posicionamento de mídia, trilhas de áudio,
textos EDITÁVEIS, SRT, efeitos de catálogo, keyframes, draft do CapCut.
Ferramentas: create_draft, add_video_local, add_audio_local, add_image_local,
add_text, add_subtitle_local, add_dynamic_captions, add_effect, add_keyframes,
inspect_media, save_draft_to_staging, validate_draft, publish_draft_to_capcut.

**Remotion (engine\)** — fidelidade visual: legendas palavra-a-palavra
(LegendaDinamica queimada / CaptionOverlay transparente), tipografia cinética,
gráficos (DataCard/DataChart), comparação, mockup WhatsApp, storytelling visual,
CTA endcard, overlay de zona segura. Render determinístico, props por arquivo.
Overlay transparente: `node engine\scripts\render-overlay-alpha.mjs <Comp> <props> <saida.mov>`.
⚠️ **Nunca WebM para o CapCut.** Medido no CapCut 9.1.0.3879 (14/08/2026): o WebM/VP8
tem alpha válido no arquivo mas o CapCut ignora o canal e mostra fundo opaco. O que
entra transparente é `.mov` — ProRes 4444 e QuickTime Animation (qtrle), os dois
confirmados. Padrão da fábrica: qtrle (~65 MB por 15s contra ~105 MB do ProRes).

**CapCut (humano)** — revisão visual, recursos proprietários/premium, ajustes
finos, export final de projeto editável. NUNCA automação de interface.

## Fronteiras que já são decisão registrada da fábrica

- MP4 final de peça corrida continua no pipeline Remotion/ffmpeg existente
  (montar-corte.mjs — script do lote antigo, não incluído neste repositório —
  etc.) — o VectCut entra para RASCUNHO EDITÁVEL (D4, 14/08).
- Transição visual em vídeo final: no Remotion, nunca xfade (28/07).
- SFX de transição: sintetizado local (`sfx-transicao.mjs` — script do lote
  antigo, não incluído; a fábrica atual usa `assets/_biblioteca-som/`), custo
  zero (28/07).
- HDR de iPhone: conferir color_transfer antes de converter (31/07).
