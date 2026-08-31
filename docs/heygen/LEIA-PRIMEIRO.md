# HeyGen — base oficial da fábrica

**Esta pasta é a casa canônica do conhecimento de HeyGen.** Vale para **qualquer marca ou cliente**.
Nada aqui é específico de um projeto.

**Regra da casa: nada entra sem fonte oficial.** Tutorial de YouTube, thread de LinkedIn e wrapper de
terceiro não são documentação do HeyGen. Base montada em 04/08/2026 a partir de **mais de 100 páginas
oficiais lidas na fonte**, cada uma com URL, data e método registrados.

## O que abrir, e quando

| Arquivo | Quando |
|---|---|
| **`TEMPLATES-PRONTOS.md`** | **Vai escrever um prompt agora.** Moldes para preencher, com as armadilhas de cada um |
| `BIBLIOTECA-DE-PROMPTS.md` | Entender a fórmula por trás do molde — vocabulário oficial, DO/DON'T e exemplos comentados |
| `REGRAS-E-LIMITES.md` | Confirmar número: crédito, limite de plano, consentimento, código de erro, formato |
| `INDICE-FONTES.md` | Achar a página oficial de um tema. Catálogo navegável |

> **As transcrições literais das páginas oficiais não acompanham este pacote público** — o texto é do
> HeyGen e não é republicado aqui. O que estes documentos trazem são **citações curtas**, entre aspas
> e com atribuição, mais a nossa análise e os nossos exemplos. Cada afirmação linka direto para a
> página oficial correspondente: quando duas fontes divergirem, abra o link e leia o original.

## As 10 coisas que mais derrubam quem não leu

1. **`motionPrompt` é rejeitado em avatar de vídeo no engine padrão.** Só funciona em photo avatar,
   ou em avatar de vídeo com `engine: {"type": "avatar_v"}`.
2. **Motion prompt dobra o custo.** `Custom Expressive Motion (Avatar IV) = 2x base cost`.
3. **1 crédito = 3 segundos** de Avatar IV/V (= 20/min), arredondado **para cima por render**.
   A resolução **não** muda o preço — usar 1080p sempre.
4. **`aspect_ratio` tem default diferente por superfície:** `16:9` na API crua, `auto` no MCP e na
   CLI. **Sempre passar explícito**, senão sai deitado.
5. **Digital twin exige consent video.** Photo avatar e prompt avatar **não** exigem.
6. **As URLs de download expiram em 7 dias.** Baixar na hora; nunca guardar o link.
7. **Vídeo que falha ou é cancelado não cobra crédito** — *"under any circumstances"*.
8. **`speed` muda de faixa:** 0.5–1.5 no vídeo, 0.5–2.0 no TTS puro.
9. **Áudio pronto substitui o script:** `audioAssetId` é mutuamente exclusivo com `script`+`voiceId`.
10. **O rótulo de "isto é IA" é decisão do cliente**, não da plataforma.

## Pipeline mínimo (validado em conta real)

```
1. list_avatar_looks   → conferir supported_api_engines ANTES de pedir engine
2. list_voices         → language: "Portuguese" devolve pt-BR
3. create_video_from_avatar
      avatarId · audioAssetId (ou script + voiceId)
      engine { "type": "avatar_v" }
      aspectRatio "9:16"   ← sempre explícito
      resolution "1080p"
      fit "cover"
4. get_video até status "completed"   ← medir por (agora − created_at), não por sensação
5. BAIXAR IMEDIATAMENTE
```

**Tempo de fila medido em 12/08/2026 (Avatar V, 1080p, 9:16):**
12,0 s → 2m17s · 13,9 s → 2m22s · 17,3 s → 3m23s · 19,6 s → 2m42s.
Trechos disparados juntos **não terminam na ordem**. **Abaixo de 10 minutos, esperar.**

## Cobrança — a pegadinha que mais custa

⚠️ **`HEYGEN_API_KEY` no ambiente muda quem paga.** A doc é literal: *"If `HEYGEN_API_KEY` is set,
the CLI always wins."* Com a variável setada, o fluxo sai do **crédito da assinatura** e vai para
**faturamento de API**. Por isso a regra da casa é **MCP, nunca CLI**.

⚠️ **Medir custo pela diferença de créditos só vale com UMA operação no intervalo** — a mesma conta
pode estar sendo usada por outra sessão ao mesmo tempo. Numa medição nossa, um treino de look caiu
dentro do intervalo e o resultado saiu **21× errado**. Conferir sempre pela tabela de
`REGRAS-E-LIMITES.md`.

## Onde isso é usado

| Projeto | Documento |
|---|---|
| **Anúncio com avatar falando** (padrão validado em produção real) | [`AVATAR-IA.md`](../../AVATAR-IA.md), na raiz do pacote, com o workflow completo |

O guia de workflow é **a aplicação**; esta pasta é **a fonte**. Quando as duas divergirem, a fonte
manda — e o guia tem que ser corrigido.

## Manutenção

O HeyGen troca engine de avatar rápido. **A cada ~90 dias:**

1. Diffar `https://heygen-1fa696a7.mintlify.site/llms.txt` contra a última leitura — é onde página
   nova aparece antes de virar item de menu.
2. Reler as páginas de **engine** e de **preço**.
3. Atualizar `REGRAS-E-LIMITES.md` e datar a mudança.

Roteiro completo na seção "Rotina de revisão" de `INDICE-FONTES.md`.

**Atalho:** qualquer página de `developers.heygen.com` responde em markdown cru acrescentando `.md`
na URL.

**Última revisão da base:** 04/08/2026 · **Última correção de campo:** 12/08/2026 (tempo de fila,
tarifa por segundo, `verbo + é + complemento` na TTS).

## Divergências registradas

**Seis pontos em que duas páginas oficiais do HeyGen se contradizem** estão marcados com ⚔️ no
`REGRAS-E-LIMITES.md`. Não inventar a resolução — ler o que cada fonte diz e decidir com o contexto.
