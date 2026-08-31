# Presets de legenda dinâmica (Fase 9)

Cada preset é um JSON com DOIS blocos: `remotion` (props do CaptionOverlay/
LegendaDinamica) e `vectcut` (argumentos do `add_dynamic_captions` do MCP
vectcut-safe). O mesmo contrato de palavras alimenta os dois — gerado por
`engine\scripts\exportar-palavras.mjs` a partir do captions.json do Whisper.

| Preset | Uso |
|---|---|
| `dynamic-clean-v1` | padrão limpo, 3-4 palavras, sombra tripla, sem tarja |
| `keyword-impact-v1` | palavra-chave em cor de destaque, páginas curtas |
| `narrated-story-v1` | narração: páginas maiores (até 5), mais baixo na tela |
| `comparison-v1` | vídeos de comparação: legenda mais alta (libera o rodapé) |
| `accessible-low-motion-v1` | acessibilidade: sem animação de entrada, alto contraste |

Regras herdadas da fábrica (decisões registradas na origem):
- **Nunca tarja preta** atrás da legenda (`background_alpha: 0` sempre).
- Zona segura Meta: legenda acima de y=1248 (35% de rodapé livre).
- Quebra por SENTIDO: pontuação forte fecha página; nunca fechar em conectivo.
- Evidência pública (corpus de origem, não incluído neste repositório): legenda
  palavra-a-palavra é hipótese H4, a testar via Trial Reels — nenhum preset é
  "método oficial" de ninguém.

Origem das escolhas: o corpus de origem (não incluído neste repositório;
etiquetas de evidência) e as decisões de 21-22/07 da fábrica (altura,
contraste, quebra).
