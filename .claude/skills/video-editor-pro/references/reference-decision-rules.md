# Regras editoriais por evidência — corpus de referência (22 Reels)

> **O que é isto.** Regras de decisão extraídas por engenharia reversa de 22 Reels,
> descobertas em 17 e **testadas às cegas em 5 que o processo nunca tinha visto**.
> Só entra aqui o que passou no teste. Fonte completa e placar:
> corpus de origem (não incluído neste repositório).
>
> **Procedência — três classes que NUNCA se misturam:**
> | classe | o que é | onde vive |
> |---|---|---|
> | `ENSINADO` | o que a fonte **diz** que faz, em material público | corpus de origem (não incluído) |
> | `OBSERVADO_VALIDADO` | o que ela **faz**, medido e testado em conjunto selado | este arquivo |
> | `OBSERVADO_NAO_VALIDADO` | medido, mas reprovado ou não testado | corpus de origem (não incluído) |
>
> Ao citar uma regra para o aprovador, diga de qual classe ela vem. Nunca apresente
> `OBSERVADO` como ensinamento dela.

---


## Índice

- [As 5 regras validadas](#as-5-regras-validadas)
- [O que NÃO pode ser implementado](#o-que-não-pode-ser-implementado)
- [Ritmo — números recalibrados (15/08/2026)](#ritmo--números-recalibrados-15082026)
- [Hipóteses abertas — usar como pergunta, nunca como comportamento automático](#hipóteses-abertas--usar-como-pergunta-nunca-como-comportamento-automático)
- [Anti-overediting](#anti-overediting)
- [Silêncio deliberado sobre som](#silêncio-deliberado-sobre-som)

## As 5 regras validadas

### R1 · Nunca tarja atrás de legenda
`OBSERVADO_VALIDADO` · 22/22 vídeos · zero contraexemplos

Contraste vem de peso, contorno e sombra — nunca de caixa sólida. **Coincide com a regra
da casa** (`references/caption-system.md`), agora confirmada por evidência externa.

É a **única** regra "nunca" que sobreviveu ao corpus inteiro. Todas as outras proibições
que a análise chegou a propor foram falsificadas — trate "nunca" com desconfiança.

### R2 · A transição luminosa marca fronteira de material, não troca de plano
`OBSERVADO_VALIDADO` · presente em 15/22 · confirmada em 5/5 selados

**WHEN** o vídeo alterna entre mundos — estúdio dela ↔ clipe de terceiro, tela, screen-rec,
outra locação, outro registro de voz.
**CONSIDER** vestir essa fronteira com tratamento de imagem (flare, film burn, light leak).
**RANGE** de 2 a 16 usos por vídeo; sempre **um sistema coerente por vídeo**.
**DO NOT** usar transição animada entre planos de fala dentro do mesmo mundo — a troca
normal é corte seco (224 hard cuts + 191 jump cuts no corpus).

**O sistema pode ter dois tokens, e o token codifica direção** (HF_022, medido):
flare = 7/7 entradas de insert · flash = 7/7 saídas · e o aparte P&B usa o par **invertido**,
marcando-se como bloco de natureza diferente.

### R3 · O aparte em P&B marca troca de instância de voz
`OBSERVADO_VALIDADO` · 8 de 8 ocorrências, zero decorativas

**WHEN** a mesma pessoa passa a falar como **outra instância**: o espectador, o cético, a
ironia, o pensamento intrusivo, o comentário lateral.
**CONSIDER** dessaturar o trecho (0,6s a 4,0s observados).
**DO NOT** usar P&B como ambientação ou "estilo de trecho" — no corpus é sempre sintaxe.
**DO NOT** empilhar dois códigos de locutor: ou dessaturação, **ou** cor de legenda, nunca
os dois (`MEDIUM`).

### R4 · A prova mora numa interface ou num objeto, nunca num dado desenhado
`OBSERVADO_VALIDADO` · 22/22 · confirmada em 5/5 selados

**WHEN** o vídeo precisa provar resultado, número ou autoridade.
**CONSIDER** a tela onde o número vive (perfil, Reel, painel do app, screen-rec — filmada
ou recriada) ou o objeto físico em cena.
**DO NOT** gráfico de barras, contador animado, cartela "+500 alunos", print de dashboard.
**Zero ocorrências em 22 vídeos.**

Não confundir com "não mostrar métrica": ela mostra **a própria** métrica sem cerimônia
(HF_004 e HF_011: screen-rec do próprio perfil com a contagem de seguidores). O que ela evita é o
número **fora da interface onde ele existe**.

**Crédito é condicional, não regra.** Terceiro nomeado → @ na tela, e a própria UI serve de
crédito. Clipe genérico ou auto-citação → sem crédito. Não force selo onde ela não põe.

### R5 · O corte de insert cai na palavra que ele ilustra
`OBSERVADO_VALIDADO` na forma semântica · **mecanismo temporal falsificado**

**WHEN** o corte existe para **mostrar aquilo que está sendo dito** — item de lista, nome
citado, número, exemplo.
**CONSIDER** ancorar a troca visual na **palavra-conteúdo** que ela ilustra, e não na
fronteira de frase. Medidos: "palavra A" +0,00s · "palavra B" +0,05s · "palavra C" +0,10s.
**DO NOT** empurrar o corte de prova para o fim da frase "para não picotar a fala" — adiar
desfaz a coincidência que é o efeito inteiro.

⚠️ **Não converta isto em regra de milissegundos.** O teste de nulo em 3 vídeos selados
mostrou que o alinhamento no nível de **palavra** é indistinguível do acaso (p = 0,22 ·
percentil 50,7): a fala dela é contínua demais (zero silêncio, ~186 wpm) e qualquer corte
cai perto de um onset. O que é real é **semântico** — a palavra certa, não o milissegundo.

**Refinamento** (`HYPOTHESIS`, N=2): quando o **rosto** identifica, a imagem pode chegar
antes (1,68s no caso medido); quando a **palavra** nomeia, ela chega junto.

---

## O que NÃO pode ser implementado

Estas foram medidas e **reprovadas no teste cego**. Não as trate como conhecimento.

| regra tentada | destino |
|---|---|
| "nunca zoom digital / punch-in" | **FALSIFICADA** — HF_014 tem 6 punch-ins de +6,4% em 7 quadros com ease-out |
| "nunca mistura dois efeitos de transição" | **FALSIFICADA** — HF_010 e HF_022 usam dois |
| "corta em fronteira de frase por padrão" | **FALSIFICADA** — HF_014 tem 2 de 26; os outros 24 caem no meio da oração, após a primeira palavra da unidade nova |
| "pre-lap: o áudio lidera na virada" | **NÃO GENERALIZA** — HF_014 é 26/26 no sentido oposto (L-cut) |
| faixas de ritmo por formato | **RECALIBRADAS em 15/08** — ver abaixo. As faixas antigas erraram para menos em 3 de 5 selados porque 5 fichas tinham sido medidas com o detector cru |

## Ritmo — números recalibrados (15/08/2026)

As 5 fichas antigas foram remedidas com mapa de score frame a frame. Todas subiram:

| ficha | antes | depois |
|---|---|---|
| HF_001 | 19 cortes · 0,27/s | **28 · 0,40/s** (+48%) |
| HF_002 | 29 · 0,29/s | **32 · 0,32/s** |
| HF_003 | 11 · 0,14/s | **12 · 0,15/s** |
| HF_005 | 21 · 0,23/s | **31 · 0,35/s** (+52%) |
| HF_006 | 18 · 0,20/s | **25 · 0,28/s** (+40%) |

**Faixa do corpus, medida com instrumento único: ~0,15 a 0,42 cortes/s**, com a maioria
entre 0,27 e 0,40. O extremo inferior (0,15) é um único vídeo — esquete de comparação em
câmera travada, onde a construção é por espaço e não por sucessão.

⚠️ **Estes números descrevem a edição dela, não uma meta para o seu vídeo.** Ritmo é
consequência da estrutura: os vídeos mais estruturados do corpus (masterclass com capítulos)
são os mais lentos, e não por terem menos edição. Escolha a estrutura; o ritmo cai dela.

## Hipóteses abertas — usar como pergunta, nunca como comportamento automático

- **H1** · O corte **vestido** antecipa o áudio; o corte **seco** fica atrás.
  N=1, p = 0,0043 (HF_004: 6/6 positivos sob luz vs 5/6 negativos secos).
  Se confirmada, explica por que o pre-lap nunca fechava — não é formato, é o efeito ter duração.
- **H2** · O **punch-in substitui o corte** quando o take precisa durar. N=1 (HF_014): os 6
  punch-ins caem nos takes mais longos, 1,37–2,80s antes do corte que fecha o take.

## Anti-overediting

O corpus descreve uma criadora cuja intervenção é de **montagem e tipografia**, não de
efeito: ela decide *onde cortar* e *o que escrever na tela*. O vídeo de maior alcance
(o de maior alcance do corpus) é o de produção mais simples — locação única, câmera fixa, zero VFX.

⚠️ **Correlação, não causa.** Só há engajamento público de 4 dos 22 vídeos e nenhuma medida
de retenção. Nada aqui prova que a sobriedade causou o alcance, e a skill não deve afirmar
isso ao aprovador.

Na dúvida entre intervir e não intervir: **não intervenha.** Prioridade quando duas regras
competirem: `IDEIA > HOOK > STORY > PERFORMANCE > CLAREZA > PACING > CUTS > COMPOSITION >
TEXT > B-ROLL > SOUND > MOTION > VFX`.

## Silêncio deliberado sobre som

**Música, SFX, ducking e tratamento de voz são `FORA_DO_ALCANCE` em 22 de 22 fichas** — o
pipeline não extrai waveform. **Nenhuma decisão sonora da skill pode se apoiar neste
corpus.** Se uma regra de som for necessária, ela vem de outro lugar e deve dizer de onde.
