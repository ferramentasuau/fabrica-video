# Loop de refinamento visual — critério antes, revisor de fora

> Método aplicado no cartão de prova social da peça 1 (19/08/2026). Ele achou uma
> bloqueadora que o construtor não tinha visto. Baseado na doc oficial do Claude
> Code sobre verificação visual e no padrão evaluator-optimizer.

## Índice

- [Por que quem constrói não julga](#por-que-quem-constrói-não-julga)
- [O loop, passo a passo](#o-loop-passo-a-passo)
- [A rubrica](#a-rubrica)
- [Quando parar](#quando-parar)
- [O teste de Chanel](#o-teste-de-chanel)
- [Gotchas](#gotchas)

## Por que quem constrói não julga

O agente para quando o trabalho *parece* pronto. Sem um sinal externo, "parece
pronto" é o único critério disponível — e quem escreveu o código está enviesado a
favor dele.

Na peça 1 isso não foi teoria: eu conferi que o cartão não cobria os OLHOS dela,
concluí que o rosto estava livre e parei. Cobria a boca. Um revisor com contexto
zero pegou na primeira passada, e numa talking head isso quebra a ligação com a
fala.

## O loop, passo a passo

**0 · Trave os critérios ANTES de gerar.** Escreva a rubrica e as bloqueadoras num
arquivo. Sem critério externo, o loop não fecha. Aqui também entra: qual é o teste
que devolve passa/falha?

**1 · Fixe o alvo visual.** Cole a referência, ou peça 3-4 direções distintas e
escolha uma. Instrução negativa genérica ("menos poluído") só troca um default
fixo por outro.

**2 · Construa.**

**3 · VEJA o resultado.** Render de trecho, não still — **stills escondem defeito
de animação**. Na peça 1 o cartão chegava translúcido e lia como dissolve; nenhum
still mostrava isso.

**4 · Enumere as diferenças, não julgue.** O prompt canônico da doc: *"implemente,
tire screenshot, compare com o original, liste as diferenças e conserte"*. Saída
obrigatória: lista de deltas + a rubrica preenchida item a item.

**5 · Corrija só o que a rubrica reprova.** Um revisor instruído a achar lacuna
vai achar alguma mesmo em trabalho sólido. Perseguir todo achado leva a
over-engineering.

**6 · Volte ao 3.** O salto grande vem até a 2ª ou 3ª iteração.

**7 · Revisão adversarial, contexto zero.** Subagente que vê só o artefato e os
critérios — nunca o raciocínio de quem construiu. Prompt: "reporte lacunas contra
os critérios, não preferências de estilo".

## A rubrica

Formato: critérios com peso, somando 100. Aprovar com **≥85 e zero bloqueadoras**.

Cada critério precisa de uma **pergunta de julgamento** e de um **instrumento de
medida**. Critério sem instrumento não é portão — é opinião com número.

Bloqueadora reprova sozinha, independente da nota.

## Quando parar

- rubrica ≥85 e zero bloqueadoras; ou
- a rodada nova não mudou nenhum critério de nota; ou
- você corrigiu **o mesmo ponto 2 vezes** sem resolver → não itere a 3ª: pare,
  reescreva o enunciado do problema e comece limpo.

## O teste de Chanel

Antes de entregar, tire **um** acessório. Se a peça piora, você estava no limite
certo. Se não muda nada, ele não devia estar lá.

Na peça 1 saíram dois: o brilho dourado difuso de 60px em volta do cartão (que era
o anti-padrão listado na própria rubrica) e a escala de entrada, que movia 6px numa
peça de 930 e não se via.

## Gotchas

- **Valide todo detector novo contra um número medido à mão** antes de confiar.
  Foi o que pegou os três erros de medição desta peça.
- **Critério sem span definido não é verificável.** "Arroba ≥48px" gerou 35px no
  revisor e 46px em mim — nós dois certos, medindo coisas diferentes.
- **Bater o número pode piorar o desenho.** Exigi selo com caixa alta ≥52px; ao
  bater, o selo ficou maior que o nome da pessoa. Critério errado se corrige com
  o motivo, não se persegue.
- **Achado marcado OPCIONAL ainda é percebido.** A revisão classificou o respiro
  do avatar como cosmético e eu segui a regra anti-over-engineering. O olho dele
  pegou assim mesmo, em 1,4s de tela.
