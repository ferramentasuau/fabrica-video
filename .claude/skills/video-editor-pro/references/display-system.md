# Sistema de DISPLAY — o segundo trilho de texto

> Sistema APROVADO em 17/08/2026 (`USER_APPROVED`), depois de 5 rodadas
> de correção na peça 1. Vazado e sólido translúcido foram `USER_REJECTED`.

O display é o trilho que carrega a ênfase: caixa alta, blocos 3D, construindo
sincronizado com a fala. A legenda corrida some enquanto ele vive — os dois
trilhos nunca dividem a tela.


O segundo trilho de texto ganhou um modo novo, validado no olho dele na peça 1
depois de 5 rodadas de correção. Registro do que ficou de pé:

### Desenho
- **Fonte: sans PESADA** (`textoAtrasFonte` → Inter 800, asset da casa). Serifa
  fina em bloco/contorno é o anti-padrão — foi o "feio" reprovado 2×.
- **Blocos 3D SÓLIDOS opacos com extrusão** (`estilo: "3d"`): sombras empilhadas
  1px a 1px para baixo-esquerda = lado da letra, do tom claro (perto da face)
  ao escuro, + sombra difusa de contato. Helper `sombraExtrusao()` no template.
  Vazado (só contorno) e sólido translúcido: **USER_REJECTED**.
- **Lados derivam da COR DA FACE**: dourado → lados dourado-escuros; branco →
  lados cinza. Nunca lado de cor alheia à face.
- **Palavra dourada dentro de bloco branco** (`blocos[].douradas: ["EMISSORA"]`):
  o dourado marca a prova/autoridade DENTRO da frase, com o lado da extrusão
  acompanhando. É o mesmo código de cor da legenda corrida.

### Tamanho — MEDIR, nunca estimar
- `ajuste: "fit"` = cada linha PREENCHE a largura útil (linha curta sai maior,
  bordas alinhadas dos dois lados). Referência aprovada: reel com bloco de 4
  linhas curtas, cada uma preenchendo a largura (fit-to-width).
- **A largura vem de tabela MEDIDA da fonte**, não de média por caractere:
  `node engine\scripts\medir-largura-fonte.mjs <fonte.woff2> <saida.json>`
  (fontkit) → `engine\src\lib\larguras-inter-800.json`. Estimar 0,6em/glifo
  errava feio: no Inter 800 o M mede 0,94em, o I 0,29em, o espaço 0,22em —
  duas frases de mesmo nº de letras dão larguras diferentes.
  ⚠️ Fonte nova = rodar o medidor e versionar o JSON antes de usar `fit`.
- Teto 2,0× o corpo base (linha de 1–2 palavras curtas não vira outdoor).
- `ajuste: "fixo"` (default) = corpo único ditado pela linha mais longa.
  **Display já aprovado não muda de modo** — `fit` é opt-in por display.
- **Espaçamento padrão** entre frases: 12% do corpo base no modo fit.
- Linha longa demais: `whiteSpace: nowrap` + encolhimento — cada frase do
  roteiro é UMA linha, nunca quebra no meio.

### Portão obrigatório do modo fit
Medir por PIXEL a largura de cada linha no still (diff com/sem o display
isola o texto do fundo) — as bordas têm que bater dentro de ~2%. O olho engana
em alinhamento; a régua não.

