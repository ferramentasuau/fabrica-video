---
name: video-editor-pro
description: Use esta skill para editar e entregar vídeo vertical 1080x1920 nesta fábrica — talking head com legenda queimada, texto gigante passando atrás da pessoa, pivô em bloco 3D, cartão de prova social e CTA manuscrita, entregue como MP4 e como projeto editável do CapCut. Use sempre que o pedido falar em editar vídeo, legenda dinâmica, Reels, anúncio, corte, transição, efeito de som, prova social, CapCut, Remotion ou VectCut — mesmo que não nomeie a ferramenta. Use também para replicar uma edição aprovada em vídeo novo (há receita pronta), para consertar peça já entregue, e para registrar aprendizado depois de peça aprovada.
metadata:
  version: "2.0"
  atualizado: "2026-08-19"
---

# video-editor-pro

Fábrica de vídeo vertical 1080×1920 @30fps. Três motores, um roteamento: Remotion
para precisão queimada, VectCut seguro para rascunho editável, CapCut para o
acabamento humano.

A peça 1 (19/08/2026) é o **primeiro projeto completo e aprovado**. A
receita que a reproduz está em `presets/receitas/talking-head-v1.json`; o corte
final dele, medido evento a evento, está destilado no bloco `orquestra` da
receita e em `references/orquestracao.md`.

## Onde isso roda

Esta skill é o cérebro da fábrica; o corpo dela é `D:\VIDEO-FACTORY` -- `engine/`,
`presets/`, `assets/`, `jobs/` -- mais Node, Remotion, Whisper local e CapCut
instalados. Todo caminho relativo citado aqui (`engine/scripts/...`,
`presets/receitas/...`, `jobs/...`) parte dessa raiz, e é de lá que a sessão roda.
Sem a fábrica no disco -- em outra máquina, no Cowork ou em sessão na nuvem -- a
skill vale só como referência de método: nenhum script executa.

## Gotchas

Falhas reais, observadas. Ler antes de começar, não depois de errar.

- **Máscara por COR falha quando a cena divide a cor com a marca.** Roupa,
  fundo e dourado da marca podem cair na mesma faixa. Medir por FORMA. Validar todo
  detector novo contra um número medido à mão.
- **Stills escondem defeito de animação.** Para julgar entrada e saída, renderizar
  trecho e olhar quadro a quadro.
- **Elemento sobre talking head tem de liberar a BOCA**, não só os olhos —
  varrido quadro a quadro na janela, não em 3 amostras.
- **`--props` do Remotion sempre por arquivo.** PowerShell 5.1 destrói o quoting
  do JSON inline.
- **O alfa do WebM/VP9 morre fora do libvpx.** Para recorte, PNG-seq; para overlay
  no CapCut, `.mov` qtrle.
- **Render dentro de pasta sincronizada com Drive/OneDrive corrompe.** Nunca.
- **O `output` do manifest vai para `jobs/<job>/renders/`**, nunca para
  `assets/generated/` — o bundle copia vários GB de publicDir a cada render.
- **Trilha do CapCut pode ser MISTA.** Ler o material de cada segmento; nomear a
  trilha pelo primeiro material atribui o som errado ao resto dela.

## Defaults para job NOVO

O engine tem defaults que contradizem decisões aprovadas, mantidos só para não
alterar render antigo. Job novo que esquecer estas flags sai contra o que ele
decidiu, em silêncio:

| prop | default do engine | passar sempre | por quê |
|---|---|---|---|
| `veu` | `true` | **`false`** | `USER_REJECTED` 17/08 |
| `destaquePalavra` | `true` | **`false`** | karaokê não existe na referência, 6/6 |
| `paginaSeca` | `false` | **`true`** | a troca é corte seco, 679 páginas medidas |
| `offsetMs` | `+100` | **`-110`** | a legenda entra DEPOIS da voz (ver abaixo) |
| `antecipaPaginaMs` | `200` | **`0`** | página não se antecipa |
| `estiloDestaque.escala` | `1.35` | **`1.0`** | o destaque é só a COR |
| `estiloDestaque.opacidade` | `0.88` | **`1`** | sem manuscrito, translucidez vira sujeira |

A receita já traz todos. Usar a receita evita esta tabela inteira.

<details>
<summary>Regras revogadas (histórico — não aplicar)</summary>

- **"Legenda entra ~300ms antes da fala" (22/07)** — estimativa nunca medida,
  derrubada pela medição de 62 páginas da onda 2: entra ~110ms DEPOIS do onset.
- **"Nunca zoom", em qualquer forma** — falsificada duas vezes: pela referência
  (HF_014 tem 6 punch-ins) e pelo corte aprovado dele (5 corridas a 1,15×). O que
  segue vetado é só o punch ANIMADO do motor (ver Comportamento).
- **Fade de página** — a troca é seca, 6/6 na referência.
- **"2–5 palavras por página"** — o teto de 5 está fora da faixa medida.
</details>

## Fluxo

1. **Identificar o job** em `jobs/AAAA-MM-DD-nome/`. Ler `references/job-contract.md`
   quando a estrutura de pasta ou o `brief.yaml` estiver em questão.
2. **Transcrever**: `transcribe.mjs` (Whisper local, modelo `medium`) e
   `exportar-palavras.mjs`. O Whisper é instrumento de TEMPO, não de TEXTO —
   corrigir nome próprio à mão antes de seguir.
3. **Montar pela receita**:
   `node engine/scripts/montar-por-receita.mjs <job> presets/receitas/<receita>.json`
   Ler o **mapa de decisões** que ele imprime. É onde erro de regra aparece de
   graça, antes de custar render.
4. **Validar**: `validate_edit_manifest.py`. Inválido não renderiza.
5. **Portão do still** — PNG para o olho dele antes do render cheio. Regra da casa.
6. **Renderizar** e passar `qc_video.py` e `conferir-zona.mjs`.
7. **Entregar no CapCut** — ver `references/entrega-capcut.md`.
8. **Colher o aprendizado** quando ele aprovar (abaixo).

## Quando ler o quê

Não carregar tudo. Cada arquivo tem um gatilho:

| leia | quando |
|---|---|
| `references/caption-system.md` | for mexer na legenda corrida — contrato de palavras, paginação, presets |
| `references/display-system.md` | for criar ou ajustar pivô, cartela ou CTA em bloco 3D |
| `references/insert-system.md` | for pôr texto gigante atrás da pessoa, ou cartão/print entrando na fala |
| `references/typography-measurement.md` | for usar `fit`, `encaixarEntre` ou trocar fonte de display |
| `references/orquestracao.md` | for decidir corte, punch, transição, Light Leak ou onde cada som entra |
| `references/entrega-capcut.md` | for publicar, trocar vídeo de projeto publicado ou montar trilhas |
| `references/loop-refinamento.md` | quando ele reprovar um desenho e for preciso iterar com método |
| `references/quality-rubric.md` | antes de declarar peça pronta |
| `references/reference-decision-rules.md` | for decidir transição, aparte em P&B ou forma de prova |
| `references/caption-sound-system.md` | for desenhar o mapa de som ou revisar os dois trilhos |
| `references/reference-ingestion.md` | quando ele mandar analisar referência nova |
| `references/tool-routing.md` | quando estiver em dúvida entre Remotion, VectCut e CapCut |

## Scripts disponíveis

- `scripts/qc_video.py` — QC técnico (exit 1 reprova). **Executar.**
- `scripts/validate_edit_manifest.py` — portão de forma do manifest. **Executar.**
- `scripts/build_edit_manifest.py` — esqueleto a partir do brief. **Executar.**

No `engine/scripts/`: `montar-por-receita.mjs` (monta manifest e props),
`mapear-projeto-capcut.mjs` (mapa forense de um projeto finalizado — o insumo do
loop de colheita),
`transcribe.mjs`, `exportar-palavras.mjs`, `cutout-pessoa.mjs --pngseq` (recorte
da pessoa), `medir-largura-fonte.mjs` (tabela de tinta de uma fonte),
`conferir-zona.mjs` (PNG de prova da zona segura),
`render-overlay-alpha.mjs` (overlay `.mov` para o CapCut).

## O loop de COLHEITA (pós-aprovação)

> Não confundir com `references/loop-refinamento.md`, que é o loop de ITERAÇÃO
> visual, usado antes de entregar. Este aqui roda depois que ele aprova.

Dispara **a cada peça aprovada**, enquanto a razão de cada decisão ainda está
fresca. Aprendizado colhido depois esfria e se perde.

**Medir antes de colher.** Rodar
`node engine/scripts/mapear-projeto-capcut.mjs <projeto> <words.json> <saida.json> [notas.json]`
sobre o projeto que ele fechou. O mapa traz cada corte, punch, passagem e som com
o tempo e a palavra da fala em que cai. Colher de memória produz o que eu *acho*
que ele fez; o mapa produz o que ele fez — e as duas coisas divergiram três vezes
na peça 1.

**Colher**, nesta ordem: o que ele REJEITOU e por quê · o que foi MEDIDO (número,
não impressão) · o que CONTRADIZ regra existente.

**Destinar por tipo:**

| tipo | vai para |
|---|---|
| correção de erro real | `## Gotchas` deste arquivo |
| número aprovado | a receita, com o `_por_que` |
| regra derrubada | `<details>` de revogadas, uma linha com data e o que derrubou |
| lição de método | o reference do domínio |

**Teto de 15 gotchas.** Ao estourar: promover o recorrente, arquivar o
situacional, deletar o que virou default do modelo. Conteúdo que não puxa o
próprio peso sai.

**Nunca duas regras vigentes para o mesmo comportamento.** Contradição se resolve
com o valor que a peça aprovada usa; o perdedor vira uma linha em revogadas.

**Portão de tamanho**: recontar linhas. Passou de 500, o depósito está se
reformando — quebrar por domínio.

**Revisão adversarial da própria skill**: subagente com contexto zero lê só a
skill e reporta contradição, lacuna e caminho morto.

## Comportamento

- Não decorar: intervenção é montagem e tipografia. A ordem de prioridade é
  IDEIA > HOOK > ESTRUTURA > RITMO > LEGENDA > SOM > VFX.
- **`USER_APPROVED` e `USER_REJECTED` vencem evidência de referência**, sempre.
  Decisão mais nova e mais específica vence a mais antiga.
- **Zoom automático do motor: não.** `USER_REJECTED` em 12/08 (zoom lento no
  avatar) e 18/08 (punch-zoom animado com clarão). `punches` fica vazio.
  Mas ele **usa** punch-in próprio no CapCut — 1,15× parado, sem movimento e sem
  flash, nas corridas de ênfase. O rejeitado é o movimento, não a aproximação.
- Sem tarja atrás de legenda: 22 de 22 vídeos da referência, zero exceção. Tarja
  resolve contraste matando a imagem — a sombra no texto resolve sem matar.
- Zona segura Meta: topo 14%, base 35%, laterais 6% (x 65→1015, y 269→1248).
- Nunca prometer viralização.
- Manifest inválido não vira render.
- Nunca publicar no CapCut sem confirmação dele na conversa.
- Trilha licenciada; sem música em Reels Ads sem conferir licença.
- O que continua manual: abrir o CapCut, exportar o final, publicar.

## Limites do VectCut seguro

Só mídia local em `media\`, `jobs\`, `presets\` e `assets\generated\`. Escrita só
em `staging\`. IDs `VF_*`. Kill-switch de rede ativo. Nunca executar o
`capcut_server.py` nem o `mcp_server.py` original.
