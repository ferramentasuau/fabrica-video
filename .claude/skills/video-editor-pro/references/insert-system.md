# Elementos que entram SOBRE o vídeo — texto atrás e cartão de prova

> Texto-atrás multi-janela APROVADO em 18/08/2026 e cartão de prova social em
> 19/08/2026 (`USER_APPROVED`), ambos na peça 1.

Dois sistemas com a mesma natureza: um elemento visual que nasce, vive uma janela
curta e morre, sincronizado com a fala. Compartilham as regras de zona segura, de
gate contra os outros trilhos e de medição por render.

**Leia quando**: for pôr texto gigante passando atrás de quem fala, ou um print /
imagem de prova entrando na menção de um nome.


O efeito (sanduíche vídeo → texto gigante → recorte da pessoa por cima) deixou
de ser peça única da intro: a peça 1 tem duas janelas — a "FRASE-GANCHO A"
(0→1,55s) e a "FRASE-GANCHO B" (7,49→8,80s), esta aprovada em 18/08.

### A régua da oclusão: ~10% da tinta

É o número que o olho dele aprovou **nas duas** janelas (9,2–10,1% ao longo da
segunda). Serve de alvo para as próximas: abaixo disso o gigante vira texto
flutuando (o defeito reprovado no adendo 4); muito acima, a frase não lê.

**Como medir sem se enganar** — precisa de TRÊS renders do mesmo quadro:
`COM` (texto + recorte) · `SEM` (só texto, recorte fora) · `NADA` (sem texto).
Tinta = `SEM − NADA` (isola do mobiliário e da roupa da cena). Coberta = dentro da
tinta, onde `COM ≠ SEM`. Duas armadilhas que me morderam nessa ordem:
1. detectar tinta por "pixel claro" pega o mobiliário claro junto;
2. ao tirar o texto, **a legenda corrida reaparece** (é o gate) e entra na
   conta — restrinja a faixa vertical ao bloco.

### Múltiplas janelas: `cutoutSeq` é LISTA, com `deSegundo`

Cada janela tem sua sequência de PNG, e `deSegundo` diz onde o `f0001` cai na
composição. O índice tem guarda nas DUAS pontas: sem o piso, antes de
`deSegundo` o índice vira 0 → `f0000.png` → 404 → **render quebrado**; sem o
teto, o último quadro de uma janela **congela por cima da seguinte** (o
fantasma). Objeto único ainda vale (= `deSegundo` 0) para job antigo.

### Gerar o recorte: `--pngseq`, nunca WebM

```
node engine/scripts/cutout-pessoa.mjs <video> --de 7.4 --ate 8.92 --fps 25 \
  --engine rvm --pngseq assets/<...>/<pasta>
```
⚠️ **Posicionais antes das flags** — o parser descarta posicional cujo
antecessor comece com `--`.
O `--pngseq` grava `f0001.png…` com alfa, direto de fgr+pha, e **pula o WebM**:
o alfa do VP9 só existe dentro do libvpx e o recorte saía invisível (diff de
pixels = 0). Até 18/08 essa etapa era um passo manual não registrado — quem
refizesse o efeito ficava sem sequência.
Alinhe a janela a múltiplo de 1/fps do vídeo-fonte (25fps aqui: 7,4 e 8,92) para
não pegar meio quadro de fase. Custo: ~2,4s/quadro e ~2,4 MB/quadro.

### O RVM leva o mobiliário junto — e tudo bem

No recorte de 8s o matting incluiu o mobiliário da cena (52% de área opaca contra
36% do da intro). **Não corrigi de propósito**: o texto vive em y 144–580 e o
mobiliário está abaixo de y 1000, então não toca a oclusão. Se um dia o texto
descer para o meio do quadro, isso vira problema — confira antes.

### Tamanho: a linha que aperta pode não ser a que você acha

A "FRASE-GANCHO B" entrou no MESMO corpo de 215px da "FRASE-GANCHO A" porque a
linha limitante é **a primeira palavra, comum às duas** (4,850 em) — a segunda
palavra (4,777 em) é mais estreita que ela. Meça as duas linhas antes de mexer no corpo.

### Portão de regressão ao mexer no `cutoutSeq`

Still do quadro 24 (janela 1) tem de sair **byte-idêntico** antes e depois. Foi
o que provou que a lista não encostou no que já estava aprovado.


## Índice

- [Cartão de PROVA SOCIAL — print de perfil na fala (aprovado em 19/08/2026) `USER_APPROVED`](#cartão-de-prova-social--print-de-perfil-na-fala-aprovado-em-19082026-user_approved)

## Cartão de PROVA SOCIAL — print de perfil na fala (aprovado em 19/08/2026) `USER_APPROVED`

Print do Instagram de quem é citado, entrando na sílaba do nome. Aprovado na peça
1 depois de um loop de refinamento com duas revisões adversariais.

### Geometria — ancorar no ANEL, nunca no arroba

O recorte vai do cabeçalho até **o pé do círculo do avatar + 26px**. Ancorar pela
linha do arroba parece certo e não é: o vão arroba→avatar muda de print para
print (16px de diferença entre os quatro prints da peça 1), e o círculo sai cortado —
defeito que o aprovador pegou de imediato.

**A largura de cada cartão é CALCULADA para todos darem a mesma ALTURA na tela**
(`larguraPx = alturaAlvo × origW / h`). Altura constante importa mais que largura:
os cartões entram em sequência no mesmo lugar, e é o pulo vertical que o olho
denuncia.

### Máscara na cor do painel, abaixo do anel

Descer o recorte até o pé do círculo traz a bio junto, cortada no meio. Uma faixa
na cor exata do painel (`#0B0E17` no Instagram escuro, medida no próprio print)
resolve os dois problemas de uma vez: mata a bio e vira o respiro que o círculo
precisava. Sem ela o anel encosta na moldura e "aperta" — 1px embaixo contra
20px do lado.

### Posição: abaixo da BOCA, não do queixo

Cartão em `yPct` que garanta folga da **linha da boca** de quem fala, varrida
quadro a quadro na janela inteira (não em 3 amostras). Numa talking head, cobrir
a boca quebra a ligação com a fala — foi a única bloqueadora do loop, e eu tinha
conferido só os olhos.

### Movimento: opacidade e deslocamento SEPARADOS

Na mesma rampa, o cartão passa translúcido com o vídeo aparecendo através dele e
lê como dissolve barato. Opacidade resolve em **2 quadros**; o deslocamento
assenta em **7** (233ms, dentro dos 150–250ms da referência de motion). Saída em
**corte seco** — fade que não chega a zero lê como falha, e corte seco é a língua
do `paginaSeca` já aprovado.

### Legibilidade tem TETO no asset

Print de 591px de largura não entrega texto grande: para o arroba chegar a 48px
de caixa alta o cartão precisaria de ~1290px, mais largo que o quadro. Se o dado
precisa ser lido, **recapture o print num aparelho de tela maior** — não é ajuste
de código. Redigitar o número ao lado só serve se ele disser algo que o print NÃO
diz; repetir "X mil seguidores" embaixo de um print que já mostra isso recria a
duplicação que o adendo 30 foi tirar.

### A armadilha que me pegou 4x nesta peça

**Máscara por COR nesta cena não funciona.** A roupa de quem fala, o fundo da
cena e o dourado da marca caem todos na mesma faixa. Nesta rodada
o erro foi pior: o emoji da bio de um dos prints fica na MESMA COLUNA do avatar e
entrou na medição do anel, inflando o valor em 33px. Resultado: construí duas
rodadas de geometria variável para compensar "escalas diferentes entre os prints"
que não existiam — os quatro anéis têm 149–150px.

**Meça o anel pela LARGURA da faixa saturada, não pela presença dela.** O círculo
tem 150px de largura por linha; o emoji tem 7. E **valide todo detector novo
contra um número medido à mão** antes de confiar nele.
