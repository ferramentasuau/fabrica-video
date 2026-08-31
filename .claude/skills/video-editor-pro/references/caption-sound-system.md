# Sistema legenda + som — corpus de referência, onda 2 (6 vídeos, 15/08/2026)

> **Fonte**: forense frame-exata de HF_023–HF_028 (679 páginas de legenda medidas,
> ~150 eventos de som alinhados, cores por conta-gotas de pixel). Dados brutos
> no corpus de origem (não incluídos neste repositório).
>
> **Época**: os 6 são posteriores aos 22 da onda 1 e têm outro desenho de som
> (a onda 1 não tinha silêncio; aqui há até 35 janelas por vídeo). N máximo = 6,
> mesma época — recorrência aqui descreve a fase atual dela, não "o estilo eterno".
>
> **PI**: o que está aqui é o SISTEMA (timing, estrutura, papéis). O texto dela fica
> na pesquisa e NUNCA entra num vídeo nosso. Cores são dado medido — a paleta dos
> NOSSOS vídeos vem do preset de marca, não daqui.


## Índice

- [A arquitetura: dois trilhos de texto com papéis fixos — N=6/6](#a-arquitetura-dois-trilhos-de-texto-com-papéis-fixos--n66)
- [A legenda corrida, em números (679 páginas)](#a-legenda-corrida-em-números-679-páginas)
- [O display/cartela, o palco da ênfase](#o-displaycartela-o-palco-da-ênfase)
- [O som — a resposta à pergunta "que efeito entra em cada palavra?"](#o-som--a-resposta-à-pergunta-que-efeito-entra-em-cada-palavra)
- [O que isso muda no nosso template (LegendaDinamica)](#o-que-isso-muda-no-nosso-template-legendadinamica)
- [Divergências internas (não virar regra)](#divergências-internas-não-virar-regra)
- [Regras de INDÚSTRIA (pesquisa web 17/08/2026 — procedência: fóruns/guias profissionais, NÃO medida na referência)](#regras-de-indústria-pesquisa-web-17082026--procedência-fórunsguias-profissionais-não-medida-na-referência)

## A arquitetura: dois trilhos de texto com papéis fixos — N=6/6

| trilho | papel | comportamento |
|---|---|---|
| **legenda corrida** (branca, pequena, 1 linha) | transcrição da fala | troca de página em **corte seco** (1 quadro), sem animação, sem karaoke |
| **display/cartela** (creme, caixa alta, grande) | títulos, estrutura, segunda voz, mantra | **constrói palavra a palavra ou bloco a bloco, sincronizada com a fala**; é ela que carrega animação e som |

**Os dois nunca dividem a tela** (6/6): quando o display entra, a legenda corrida some.
A ênfase mora na ARQUITETURA (qual trilho está falando), não em enfeitar a legenda.

## A legenda corrida, em números (679 páginas)

- **Cadência**: 0,86–1,52 páginas/s (mediana por página 0,60–0,90s)
- **Palavras por página**: 1,9–3,1 (faixa 1–8; páginas de 1 palavra existem e duram até 0,125s)
- **1 linha sempre**, sentence case; caps só como grito pontual (1–2 páginas por vídeo)
- **Posição**: centro vertical a 56,8–58,6% da altura
- **Karaoke por palavra: NÃO EXISTE** — 6/6. A página aparece inteira, estática, e troca seca
- **Cor**: branco quase puro (#F4F9F8…#FEF9F7), **sombra difusa leve, sem contorno duro,
  sem tarja** (confirma NR-01 pela 28ª vez)
- **Timing**: a página entra ~110ms DEPOIS do onset da fala (mediana, medido em 62 páginas
  do HF_027) — a legenda segue a voz, não antecipa
- **Fidelidade**: transcreve a fala real, com disfluências ("vui", "plo") — verbatim da boca,
  não do roteiro. E EDITA quando precisa (corta palavra redundante) — o texto é curado
- **Oclusão aceita**: quando um insert cobre a legenda, ela não é reposicionada

## O display/cartela, o palco da ênfase

- Constrói **em estágios sincronizados com a fala** (typewriter por bloco, pop por palavra —
  46 pops medidos num vídeo, deltas de ±20–30ms contra a palavra falada)
- **Entra como overlay sobre o take corrente** (sem corte na entrada) e **sai colada num
  corte forte** (7/7 no HF_028) — entra suave, sai batendo
- Serve de esqueleto numerado ("PASSO 1–5") nos vídeos estruturados
- Cor creme/pêssego consistente entre vídeos (#F4DBBD…#F8DAB8 — família única)

## O som — a resposta à pergunta "que efeito entra em cada palavra?"

**Nenhum, na legenda corrida.** Viradas de página NÃO são sonorizadas: 3/93 no HF_028,
4/95 no HF_026, e teste de nulo no HF_023 (3.000 deslocamentos) dá p=0,20 — acaso.

O princípio medido, com significância:

> **O som pontua o RARO e ignora o FREQUENTE.**

- No HF_023 (155s, só 15 jump cuts): cortes sonorizados (p=0,010), cartelas (p=0,033),
  overlays (p=0,018) — o corte é raro ali, então ganha som
- No HF_024 (cortes frequentes): **zero SFX em corte de câmera** — o som vai para headline
  (Δ20ms) e troca de clipe em insert (Δ13ms)
- 4/4 SFX fortes do HF_026 cravados em evento visual (Δ3–30ms); 3/3 no HF_025
- **Duck-then-hit**: o padrão de pivô é silêncio curto (0,1–0,3s) → batida com rampa
  gigante (até 807×) → palavra/cartela. O beat-drop do HF_025: silêncio → batida →
  palavra do mantra, 4× seguidas (Δ −32/0/+38/−10ms)
- **O whoosh antecipa o visual em 100–400ms** nas saídas de headline e transições de
  oclusão (HF_024) — o som chega primeiro, a imagem confirma
- Melhor alinhamento medido no corpus: entrada de clipe PiP com SFX a **2ms** (HF_027)

### Regras práticas para os nossos vídeos

1. **NÃO sonorizar virada de página de legenda.** É a tentação óbvia e é exatamente o que
   ela não faz (p=0,20). Um pop por página soaria como metralhadora: são ~1,2 páginas/s.
2. **Sonorizar o raro**: entrada de display/cartela, entrada de insert/prova, o pivô
   narrativo. Poucos momentos por vídeo (3–8 SFX fortes em 60–155s).
3. **Duck-then-hit nos pivôs**: respiro de silêncio → batida → palavra-chave.
4. **Som um respiro antes do visual** nas saídas (100–400ms).
5. **Corte de câmera default é MUDO** — só ganha som se corte for raro no vídeo.

## O que isso muda no nosso template (LegendaDinamica)

| recurso atual | veredito do corpus |
|---|---|
| karaoke (palavra acende) | **ela não faz** na legenda corrida — 6/6. Manter como opção, não como default |
| fade de página (0,36s) | **ela não faz** — troca é corte seco 6/6 |
| 5 palavras/página | fora da faixa dela (1,9–3,1) — chunking mais curto |
| um trilho de texto | falta o **segundo trilho** (display que constrói com a fala) |
| sem ganchos de som | falta camada de SFX ancorada em eventos (não em páginas) |

## Divergências internas (não virar regra)

- Acoplamento página↔corte: no HF_027 todo corte é virada de página; no HF_026/028 os
  trilhos são independentes (páginas atravessam cortes). **Decisão por vídeo.**
- Cadência de página varia 1,8× entre vídeos — ritmo de página é escolha editorial.
- P&B: moldura de piada/esquete no HF_026 (4×) — consistente com R3, registro cômico.

## Regras de INDÚSTRIA (pesquisa web 17/08/2026 — procedência: fóruns/guias profissionais, NÃO medida na referência)

Pesquisa pedida pelo aprovador (texto-atrás + momentos de som/transição/destaque).
Fontes: guias de text-behind-effect (FlexClip/CapCut/overlay-tools), guias de
tipografia de contorno, guias públicos de sound design, guias
de caption profissional (OpusClip/SendShort). Classe separada das regras MEDIDAS
acima — quando conflitarem, a referência medida e o USER_* vencem.

### Texto-atrás-da-pessoa

> ⚠️ O estilo VAZADO descrito abaixo foi `USER_REJECTED` em 17/08. O vigente é
> `estilo: "3d"` (bloco sólido com extrusão). As regras de tamanho e de oclusão
> continuam valendo; o tratamento do contorno, não.

- **Sans PESADA obrigatória** (Anton/Bebas/Impact-like). Serifa fina + contorno =
  frágil/ilegível — foi exatamente o "feio" do primeiro still (USER_REJECTED).
- Glifo grosso aguenta contorno; **stroke o mais leve possível** (o nosso:
  fontSize/40, mín. 4px). Stroke grosso achata a letra.
- **A cabeça precisa COBRIR ~1/3 do bloco** — sobreposição zero mata o efeito
  (bug medido do primeiro still: texto 30px ACIMA da cabeça).
- GIGANTE, passando dos dois lados da pessoa · 1–4 palavras · CAIXA ALTA ·
  alto contraste · sombra sutil se o fundo for cheio.
- Implementação na fábrica: props `textoAtras` + `textoAtrasFonte` + `cutoutSrc`
  (RVM via `engine/scripts/cutout-pessoa.mjs --engine rvm`).

### Momentos de som (bate com o medido na referência)
- Riser: o PICO alinha com o momento-chave; riser-para-drop com a trilha
  entrando na resolução. Whoosh: transiente NO hit visual, duração ≈ transição.
- Impact no fim do whoosh = ponto de aterrissagem.
- **Mesmo sample 2× em <2s = metralhadora** — variar ou omitir o segundo
  (aplicado: o som do segundo cartão de prova removido, 1,4s após o do primeiro).
- Motivated cut: transição que você não sabe explicar o que faz pela história
  não entra. Talking head de take único → sem wipes.
- Talking head corta em QUEBRA DE PENSAMENTO, não em compasso da música.

<details>
<summary>Destaque de palavra na legenda (pesquisa de indústria — NÃO vigente)</summary>

Regras de mercado levantadas em 17/08. O karaokê está DESLIGADO nesta fábrica
(`destaquePalavra: false`) — a referência não faz, 6/6. Mantido como contexto.

- Destacar o que carrega significado: **números, nomes próprios (prova),
  verbos/palavras de emoção**. Conectivo nunca.
- Pop no ritmo da fala; animação nunca pode atrapalhar a leitura.
- Se tudo destaca, nada destaca — manter esparso.
