# Medição tipográfica — CAIXA ≠ TINTA

> Régua APROVADA em 18/08/2026 (`USER_APPROVED`) — a lição que custou
> 11 rodadas de ajuste no encaixe da CTA.

Toda conta de largura, encaixe e vão nesta fábrica é feita na TINTA do glifo, não
na caixa de avanço. Este arquivo é a régua e as ferramentas.

**Leia quando**: for usar `ajuste: "fit"`, `encaixarEntre`, `espacoTintaEm`, ou
trocar a fonte de qualquer display.


Montando a CTA da peça 1 eu errei o MESMO erro em três eixos seguidos, e o
aprovador teve que apontar os três. A regra que sai disso:

> **Tudo que o olho julga (encostar, alinhar, espaçar) tem que ser calculado na
> TINTA do glifo. A caixa é ficção tipográfica.**

Toda fonte deixa folga interna (side bearing) e, em manuscrito, ar enorme acima
e abaixo do desenho. Alinhar caixas produz buracos que o cliente vê e a régua
não acusa.

### Os três erros, na ordem em que aconteceram

1. **Horizontal**: aproximei as CAIXAS; sobraram 5px de um lado e 9px do outro.
   Corrigido medindo `tinta` (xMin/xMax por glifo).
2. **Vertical**: mexi em `espacoLinhaPct` (% do corpo). Na Caveat Brush a caixa
   da linha tem ~60px de ar — −12% (≈10px) sumia dentro dele. O feedback — de
   que visualmente nada tinha diminuído — estava correto. Corrigido com `espacoTintaEm`
   (vão entre as tintas, resolvido via ascent/descent + lineHeight).
3. **2D**: o vizinho é um RETÂNGULO só na tabela. Na altura da outra linha, o
   "b" é só o risco fino — a barriga fica embaixo. Daí `puxaEsquerdaEm`, que
   invade a caixa do vizinho de propósito.

### Ferramenta

`engine/scripts/medir-largura-fonte.mjs` grava por glifo: avanço, `tinta`
(xMin/xMax) e `tintaY` (yMin/yMax) + `ascent`/`descent` da fonte.
**Fonte nova = rodar o medidor e registrar em `larguras.ts` ANTES de usar
`fit`/`encaixarEntre`.** Sem isso o encaixe cai no fallback e desalinha.

### Armadilhas de medição (ambas me morderam)

- **Isolar uma linha muda o layout** da outra (o flex recolhe) — medir vão
  vertical assim dá número inventado. Meça no quadro real.
- Glifo de ESPAÇO pode ter bbox sujo (115px de "altura") — ignorar whitespace
  em qualquer conta de obstáculo.

### Preset pronto

`presets/displays/cta-manuscrito-encaixado-v1.json` — CTA aprovada, com os
números e o passo a passo para trocar o texto em qualquer projeto. Fontes
transversais em `assets/_biblioteca-fontes/`.

