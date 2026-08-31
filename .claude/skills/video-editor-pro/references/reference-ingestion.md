# Ingestão de referência — como medir um vídeo sem se enganar

> Método destilado da engenharia reversa de 22 Reels (agosto/2026). Cada item aqui
> custou um erro real. Use quando o aprovador trouxer uma referência nova e você
> precisar extrair princípio dela — não copie execução, extraia decisão.


## Índice

- [Regra 0 · Escrever incrementalmente, sempre](#regra-0--escrever-incrementalmente-sempre)
- [Regra 1 · Extrair quadro por índice, nunca por `-ss` fracionário](#regra-1--extrair-quadro-por-índice-nunca-por--ss-fracionário)
- [Regra 2 · O score do detector discrimina pela FORMA, não pelo valor](#regra-2--o-score-do-detector-discrimina-pela-forma-não-pelo-valor)
- [As 7 cegueiras catalogadas do detector](#as-7-cegueiras-catalogadas-do-detector)
- [Truques que funcionam](#truques-que-funcionam)
- [Limites do ASR, que valem para qualquer medida de sincronia](#limites-do-asr-que-valem-para-qualquer-medida-de-sincronia)
- [Antes de promover qualquer padrão a regra](#antes-de-promover-qualquer-padrão-a-regra)
- [Classes de conhecimento (rotule sempre)](#classes-de-conhecimento-rotule-sempre)

## Regra 0 · Escrever incrementalmente, sempre

Crie os entregáveis (ficha, timeline, eventos) **como esqueleto no início** e preencha
seção a seção conforme valida. **Duas ondas de agentes morreram no limite de uso com a
análise inteira pronta e nada no disco.** Quadros extraídos sobrevivem à queda; raciocínio
não. Antes de extrair qualquer quadro, **liste o que já existe** na pasta de validação.

## Regra 1 · Extrair quadro por índice, nunca por `-ss` fracionário

```bash
ffmpeg -i <video> -vf "select='eq(n\,<N>)'" -vsync 0 -frames:v 1 saida.png
# t = N / fps    (confira o fps real: 23,976 ≠ 24)
```

`ffmpeg -ss <t>` desloca até 1 quadro e chegou a devolver **o mesmo quadro duas vezes** num
par antes/depois — em 9 de 24 pares num vídeo. O par parece "idêntico", você conclui
"movimento contínuo", e fabrica um falso vídeo calmo. O índice é a âncora de todos os
timestamps.

## Regra 2 · O score do detector discrimina pela FORMA, não pelo valor

Corte real e gesto performático **sobrepõem** na faixa 0,10–0,36 — abaixo do limiar 0,45.
Por isso o detector é cego em câmera travada.

| assinatura | leitura |
|---|---|
| **pico isolado de 1 quadro**, razão ≥ ~6× sobre a mediana local (±1s) | corte |
| **platô de 5–12 quadros** sem pico dominante, razão ≤ ~4× | movimento |
| **platô com dupla borda** | transição luminosa — contar as duas **duplica** o evento |
| mudança espalhada **inclusive em parede/teto estáticos**, resíduo colapsa ao compensar escala | **punch-in**, não corte |

Rode um dump frame a frame a limiar 0,02 (ou MAD entre pares consecutivos) e **confira que
ele reproduz os tempos do `medidas.json`**. Se não reproduzir, o dump está corrompido —
aconteceu uma vez (2.868 quadros fantasmas num vídeo de 95s).

## As 7 cegueiras catalogadas do detector

Ele errou em **22 de 22** vídeos, e nos dois sentidos.

1. **Câmera travada com troca de figurino** — pixel muda pouco; 0 cortes declarados, 11 reais.
2. **Corpo ou dedo indo à lente** — gera platô que parece corte, e o corte real fica escondido.
3. **Corte dentro de moldura que não muda** — tela de celular, mockup de UI: o plano
   seguinte já estava em cena como imagem dentro da imagem.
4. **Quadros de animação inflando "confirmados"** — 4 dos 10 confirmados de um vídeo não
   eram emendas.
5. **Transição luminosa mascarando a emenda** — o pico marca o **efeito**; a emenda real
   está 1–3 quadros **embaixo** dele.
6. **Virada de página de legenda queimada** — gera pico. Rodar o dump num **recorte do terço
   superior** (fora da faixa da legenda) separa os dois.
7. **Fundo pixel-idêntico em tripé** — mesma locação, mesmo prop, figurino e acessórios
   idênticos: o MAD do recorte de parede dá 0 a 2,6 **nos cortes reais**.

**Nunca reporte ritmo a partir do `medidas.json` sozinho.** Erros medidos: 2,2× · 2,7× ·
3,1× · 5,2× · 5,8× · 7,6× · **26×**.

## Truques que funcionam

- **Descontinuidade de acessório** — colar, brinco, pulseira, unha. Em câmera travada,
  denuncia troca de take mesmo com pose e figurino casados. (Cuidado: num vídeo os
  acessórios eram idênticos em todos os 26 cortes — o truque não é universal.)
- **Bisseção ±0,25s** para fixar corte achado por varredura.
- **Varredura visual** (1 quadro a cada 4s) em todo buraco > 15s sem evento.
- **`signalstats`** para assinar transição objetivamente: YAVG e SATAVG saltam de forma
  característica (ex.: SATAVG ~13 → 32–36 num light leak).
- **A legenda queimada corrige o ASR.** Ela é mais confiável que o Whisper para grafia e
  nomes próprios — num vídeo corrigiu 4 erros, incluindo o nome da própria criadora.

## Limites do ASR, que valem para qualquer medida de sincronia

O Whisper local devolve **timestamps contíguos**: em 4 dos 5 vídeos selados, 100% dos
intervalos entre palavras são 0 ms. Consequências que não se contornam:

- **Silêncio é imensurável** pelo ASR. Use `silencedetect` se precisar, e diga o limiar.
- **Fronteira de palavra é quase garantida por acaso.** Com fala contínua a ~186 wpm,
  qualquer corte cai perto de um onset. Testes de nulo em 3 vídeos: p = 0,22 e percentil
  50,7 — indistinguível de sorteio.
- **Fronteira de frase, sim, é mensurável** (p < 0,0001 e p ≈ 0,008 nos mesmos vídeos).
- Antes de afirmar sincronia, **rode um nulo** (alguns milhares de deslocamentos aleatórios)
  e compare. Sem isso você está reportando a densidade da fala, não uma decisão.

## Antes de promover qualquer padrão a regra

1. **Ausência ≠ presença.** Registre o que o vídeo NÃO faz como evento próprio, e mantenha
   fora da contagem de uso. Um agregador que confunde os dois inverte a conclusão.
2. **Canonicalize o vocabulário.** Flare, film burn, light leak, luma flash e tira de filme
   viraram nove nomes para o mesmo fenômeno — e a matriz classificou como raro algo presente
   em metade do corpus.
3. **A matriz mede o que foi ANOTADO, não o que aconteceu.** Legenda queimada está em 22/22
   e a matriz contava 7, porque a maioria das fichas a tratou como propriedade, não evento.
   Propriedades contínuas precisam de campo próprio.
4. **A pergunta que teria evitado o pior erro desta missão:**
   > *"esses N vídeos são independentes, ou é o mesmo tipo de vídeo N vezes?"*

   Quatro regras "nunca" foram escritas com N=5/5 e `VERY_HIGH`. Três caíram — porque os 5
   primeiros vídeos eram todos do mesmo tipo (nunca saíam do estúdio), e a ausência era
   traço **daqueles vídeos**, não da criadora.
5. **Separe descoberta de validação ANTES de olhar os dados.** Sele um conjunto, descubra no
   resto, e só então preveja no selado e conte acertos. Foi o que derrubou 4 das 14 regras —
   nenhuma delas teria sido pega de outro jeito.

## Classes de conhecimento (rotule sempre)

| rótulo | significado |
|---|---|
| `REFERENCE_LEARNED` | veio de análise de referência, validado em conjunto selado |
| `REFERENCE_UNVALIDATED` | medido, mas sem teste de generalização |
| `USER_APPROVED` | o aprovador viu e aprovou numa conversa (com data) |
| `USER_REJECTED` | o aprovador recusou — **não reofereça** |
| `USER_PREFERENCE` | gosto declarado dele, não derivado de evidência |

Regra de precedência: **`USER_*` sempre vence `REFERENCE_*`.** A referência informa; o dono
do vídeo decide.
