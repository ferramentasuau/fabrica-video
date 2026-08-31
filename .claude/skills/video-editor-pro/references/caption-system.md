# Sistema de legendas dinâmicas

## Contrato de palavras (formato único dos dois motores)

```json
{"words": [{"text": "Você", "start": 0.12, "end": 0.38, "confidence": 0.98, "emphasis": "normal"}]}
```

Gerado por `node engine\scripts\exportar-palavras.mjs <captions.json> <words.json>
[--srt <arquivo>] [--enfase palavra1,palavra2]` a partir do Whisper local
(modelo medium, pt). O script filtra `[Música]`/`♪ MÚSICA DE FUNDO ♪` — o
Whisper marca trecho sem fala nos dois formatos (decisões 28/07 e 06/08).

## Regras (herdadas da fábrica + SPEC)

- Agrupar por SENTIDO: pontuação forte fecha página; vírgula fecha se a página
  tem corpo; nunca fechar em conectivo; órfã de 1 palavra é absorvida.
- **Unidade numérica — `USER_APPROVED` (aprovado em 17/08/2026, corrigindo o mapa
  da peça 1 no chat).** Número NUNCA se separa do que ele conta: "mais de | N
  horas assistidas", nunca "mais de N | horas". Sozinho na tela o número não
  significa. Em cadeia com escala ("X mil alunos"). E a exceção que ele
  decidiu: para proteger a unidade, a página anterior PODE terminar em
  conectivo ("mais de |") — unidade semântica vence a regra do conectivo.
  Locativos ("lá em cima") também não quebram. Implementado no `buildPages`
  (engine\src\lib\legendas.ts, regra 5) — vale para TODOS os presets.
- Paginação: **3 palavras**, faixa 2–4, **1 linha**. Medido em 679 páginas da
  referência (1,9–3,1 palavras; 1 linha sempre).
- Três mecanismos DIFERENTES, nunca confundir:
  `destaquePalavra` = karaokê (palavra acende ao ser falada) — **desligado**, a
  referência não faz, 6/6.
  `palavrasDestaque` = lista de palavras que saem em dourado o tempo todo — é o
  código de autoridade/prova.
  `--enfase` do `exportar-palavras.mjs` = marca `emphasis:"keyword"` no contrato
  de palavras, consumido pelo motor vectcut.
- NUNCA tarja preta; contraste = sombra tripla + stroke (`paintOrder: stroke`).
- **SEM véu de legibilidade — `USER_REJECTED` (17/08/2026).** O degradê
  na cor `bg` da marca atrás da legenda foi rejeitado ("prefiro sem"): sobre cena
  clara ele mancha a metade de baixo com a cor `bg` da marca.
  Job novo passa `veu: false` no LegendaDinamica; o contraste vem da sombra
  reforçada no texto — que é também a solução da referência (onda 2, 6/6 sem véu).
  O default `veu: true` existe SÓ para não alterar renders antigos.
- Zona segura: legenda acima de y=1248 (35% da base é UI do Instagram).
- Destaque em QUADROS, não ms (30fps amostra a cada 33ms — decisão 22/07).
- Timing de entrada: ver a tabela de defaults no `SKILL.md` (o número vigente é
  `offsetMs: -110` — a legenda entra DEPOIS do onset da voz).
  ⚠️ Régua em teste: a onda 2 mediu a referência entrando ~110ms DEPOIS da voz.
  O A/B v1×v2 da peça 1 decide.
- Modo acessível: preset `accessible-low-motion-v1` (sem animação).
- Sistema legenda+som da referência (onda 2): `references/caption-sound-system.md` —
  dois trilhos de texto, karaoke inexistente na legenda corrida, som só no raro.

## Motor `vectcut` (editável no CapCut)

Ferramenta MCP `add_dynamic_captions` (words + preset). Limitação documentada:
o destaque palavra-a-palavra DENTRO da página não fica editável como texto
nativo — o que fica editável é a página. Não fingir fidelidade pixel-perfect.

## Motor `remotion` (precisão)

- `LegendaDinamica` — queima a legenda no vídeo (produção atual da fábrica).
- `CaptionOverlay` — SÓ a legenda, fundo transparente, para sobrepor no CapCut
  (modo híbrido). Texto deixa de ser editável como texto.
  **Formato obrigatório: `.mov` qtrle** — `node engine\scripts\render-overlay-alpha.mjs`.
  WebM/VP8 está PROIBIDO aqui: o CapCut 9.1.0.3879 ignora o alpha dele e mostra
  fundo opaco (testado no próprio CapCut em 14/08/2026).

## Presets (versionados)

`presets\legendas\*.json` — cada um com bloco `remotion` + `vectcut`:
dynamic-clean-v1 · keyword-impact-v1 · narrated-story-v1 · comparison-v1 ·
accessible-low-motion-v1. Nenhum é "método oficial" de ninguém — as evidências
que inspiraram cada escolha estão no corpus de origem (não incluído).

