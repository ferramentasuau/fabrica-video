# Avatar de IA com voz clonada — o workflow completo

> **Módulo opcional da fábrica.** Como produzir um anúncio vertical 9:16 falado por um avatar de IA
> com voz clonada, do consentimento à entrega. Destilado de um lote real de peças aprovadas.
>
> ⚠️ **As ferramentas deste módulo são pagas.** Na qualidade descrita aqui, o avatar (HeyGen) e a voz
> clonada (ElevenLabs) são serviços por assinatura — não há equivalente gratuito com este resultado.
> Ligar essas ferramentas ao Claude é assunto do **`SETUP.md`, seção do Módulo Avatar**; aqui está só
> o método.

**Sumário:** 1. [Consentimento](#1--consentimento--a-regra-que-vem-antes-de-tudo) ·
2. [Matéria-prima](#2--matéria-prima) · 3. [Clone de voz e locução](#3--clone-de-voz-e-locução) ·
4. [Roteiro](#4--o-roteiro--escrito-para-a-boca-não-para-a-página) · 5. [Look](#5--o-look-do-avatar) ·
6. [Geração](#6--geração--os-parâmetros-travados) · 7. [Montagem e QC](#7--montagem-e-qc) ·
8. [Ajuste depois de pronto](#8--ajuste-depois-de-pronto--cortar-não-regravar) · 9. [Custo](#9--custo) ·
10. [O que não repetir](#10--o-que-não-repetir)

---

## 1 · Consentimento — a regra que vem antes de tudo

**Clone só a si mesmo, ou quem autorizou você por escrito para este uso.** Isso vale acima de
qualquer parâmetro técnico deste documento.

- **Digital twin exige vídeo de consentimento.** Para um avatar treinado a partir de vídeo, a
  plataforma obriga a pessoa a gravar um clipe curto lendo um roteiro **fornecido por ela, palavra
  por palavra**, e a soletrar um código de quatro letras no fim — é assim que se prova que não é
  gravação preexistente. Quando o avatar é de outra pessoa, **essa pessoa** grava o próprio
  consentimento; consentimento e footage sobem juntos.
- **Avatar de tipo `photo` e `prompt` não exigem esse vídeo.** Isso não te libera de nada: a
  autorização de quem aparece é responsabilidade de quem produz, não da plataforma.
- **Rosto de terceiro sem permissão é barrado** — rosto conhecido cai em moderação humana, e **três
  footages rejeitadas geram bloqueio de avatar** na conta, removível só pelo suporte.
- **Rotular a peça como gerada por IA é decisão sua.** A plataforma diz com todas as letras: quem
  publica é o *deployer*, e a declaração ao público é dele.

📄 [gravar o consentimento](https://help.heygen.com/en/articles/12092609-recording-your-consent-video) ·
[docs/avatar-consent](https://developers.heygen.com/docs/avatar-consent.md)

---

## 2 · Matéria-prima

| item | exigência |
|---|---|
| **Fotos reais da pessoa** | orientação **retrato**, boa luz, rosto frontal — são a âncora de identidade do look (§5) |
| **Amostra de voz limpa** | sem música, sem eco, sem corte no meio de palavra |
| **O produto lido de verdade** | leia/assista o material que a peça vende **antes** de escrever a copy |
| **Copy aprovada por quem aprova** | aprovação do plano não é aprovação da copy — nada pago antes do texto fechado |

A terceira linha parece óbvia e é o erro mais caro da lista: escrever a copy sem abrir o produto
produziu, num lote real, **um número inventado** que não existia em nenhuma aula e **um mecanismo
batizado por conta própria** — os dois foram parar em vários anúncios antes de alguém notar. Quem
batiza o mecanismo é o dono do produto.

---

## 3 · Clone de voz e locução

A voz é gerada **fora** do gerador de vídeo e entra nele como **áudio pronto**.

```jsonc
{
  "audioAssetId": "<AUDIO_ASSET_ID>"   // ✅ o MP3/WAV já gerado, subido como asset
  // "script": "…", "voiceId": "<VOICE_ID>"   // ❌ mutuamente exclusivo com o de cima
}
```

1. **Vídeo e voz saem casados de fábrica** — o engine anima em cima do áudio enviado, e a duração do
   vídeo segue o seu áudio, não o contrário.
2. **Você controla a locução** — refazer uma entonação não custa render.
3. **Cota.** Voz de terceiro *importada* para dentro da plataforma de vídeo tem cota própria,
   separada dos créditos de render — e ela estoura no meio do lote.

⚠️ **A integração com o serviço de voz não sobe áudio pronto.** Ela **importa a voz** para o gerador
de vídeo sintetizar internamente. Para usar um MP3 que você já gerou, o caminho é o `audioAssetId`
acima. Aceita **MP3 e WAV, até 32 MB** por asset. 📄 [audio-to-video](https://developers.heygen.com/audio-to-video.md)

**Conferir o verbatim — o instrumento que mente.** Em **janelas de 12 s com 3 s de sobreposição,
nunca no arquivo inteiro**: o modelo `medium` do Whisper **engole trecho em arquivo de 45 s ou mais**
— já rendeu um relatório de "a locução pulou uma frase" que era falso; isolando o bloco, a frase
estava lá inteira. E **monossílabo átono some mesmo dentro da janela**, se cair no meio dela: um
reforço de uma sílaba sumiu de duas janelas seguidas e só apareceu reisolado no início de uma
terceira. **Achado que é palavra curta: reisolar antes de acusar.**

---

## 4 · O roteiro — escrito para a boca, não para a página

### 4.1 · Estrutura: 4 trechos longos, nunca picado

| | função |
|---|---|
| **T1** | o problema — gancho + cena |
| **T2** | a virada — o mecanismo |
| **T3** | a oferta — o que é, quanto dura ([N] aulas, [N] horas) |
| **T4** | autoridade e chamada para ação |

**40 a 85 palavras por trecho.** Acima de ~120 a síntese começa a engolir pedaço de frase — falhou
duas vezes em produção. **Por que 4 e não 8:** o único documento oficial construído sobre experimento
controlado (14 testes) é categórico —

> *"**Flow beats structure.** Scripts that read naturally deliver better than scripts chopped into
> rigid segments."* · *"Don't over-structure (…) the result sounds choppy."*
> — guia oficial de roteiro para vídeo com avatar

Picar a fala em oito blocos curtos e colar com silêncio digital **soa artificial** — foi a causa nº 1
de reprovação num lote inteiro. Com 4 trechos, as pausas internas passam a ser **geradas pela
pontuação, dentro do engine, junto com a fala**: não existe emenda dentro do trecho. Os trechos de
oferta e de fecho costumam ser **idênticos entre as peças** do mesmo lote — o áudio se reaproveita
(arquivo igual, custo zero); só o vídeo precisa de render novo, porque o look muda.

### 4.2 · As marcas da fala

O que separa um texto lido de um texto falado. Os exemplos são **inventados para este guia**, só para
mostrar a construção:

| marca | exemplo ilustrativo |
|---|---|
| **"é" enfático** | *Ninguém erra no começo, todo mundo erra **é** na hora de fechar.* |
| **complemento inteiro, nunca truncado** | *a plateia **te** percebe* (não "a plateia percebe") · ***chama** isso de treino* (não "Treino.") |
| **reticência = pausa longa** | *não é sorte… é repetição* — 📄 oficial: *"ellipses for longer pauses"* |
| **vírgula no lugar de ponto** | ponto demais = tom descendente a cada frase = enterro |
| **contração e marca oral** | `pra` · `tá` · `olha` · `e aí` · `a gente aprende` (não "se aprende") |
| **"tem" existencial** | *tem muita gente boa que passa por isso* (não "muitas pessoas boas passam por isso") |
| **singular coloquial** | *tem até gerente com dez anos de casa* (não "gerentes") |

**Régua de tradução:** se a palavra cabe num slide mas não cabe num boteco, não entra na fala.
*"Nível de estresse elevado"* é laudo → *"o coração acelera"*.

### 4.3 · ⛔ As marcas são DA PESSOA. Aplicar como molde vira tique.

A tabela acima é **descrição do que alguém escreveu**, não tempero para salpicar. Duas lições que
custaram rodada de aprovação: **dois reforços na mesma frase soa caricatura de fala** (cortado
inteiro por quem aprova, sem discussão); e **a negação redundante no fim** (*"…, não"*) foi cortada
duas vezes, em dias diferentes — na segunda, contra o argumento de defesa *"só mantive onde já
estava"*. **Origem não justifica permanência:** corte repetido em dias diferentes é **preferência
estável**, não ajuste pontual.

A regra que sobrou: **nenhuma marca de fala entra por iniciativa de quem escreve.** Se o dono da voz
escrever uma, fica. Se você escrever, sai.

**Vírgula só onde a boca realmente para.** Ela não é enfeite — vira **respiro dentro do engine**.
Tirar três vírgulas de um trecho encurtou ele em **2,1 s de ar morto**, e a diferença foi ouvida
antes de ser medida.

### 4.4 · ⚠️ `verbo + é + complemento` pode perder o "é"

A construção enfática *"Falta **é** treino"* saiu da síntese como *"Falta treino"* — o "é" sumiu.
Confirmado em quatro isolamentos curtos; **não era artefato da transcrição**. **Conserto: ancorar com
um advérbio** — *"Falta **mesmo é** treino"*: o "mesmo" dá apoio prosódico e o "é" para de ficar
solto entre dois verbos. Sempre marque essa construção como ponto crítico de conferência do job.

### 4.5 · Sem pergunta solta, e leia em voz alta

> *"**Questions don't work well.** Scripts built around questions felt unnatural with a single
> speaker."* · *"If it sounds awkward to read aloud, it'll sound awkward in the video."* — guia oficial

A exceção que funciona é a pergunta **respondida na frase seguinte**, para marcar uma virada (*"E por
que isso funciona? Porque…"*). Uma por peça, no máximo. E ler o roteiro inteiro em voz alta antes de
gerar áudio é o teste mais barato que existe.

---

## 5 · O look do avatar

**Passe sempre uma FOTO REAL da pessoa como referência.** Referenciar um look já gerado acumula
desvio: a geração recria a pessoa inteira, não só o fundo, e geração em cima de geração afasta do
original a cada volta. Custo de aprender isso, em produção: **oito looks para acertar quatro**.

```jsonc
{
  "avatarId":      "<AVATAR_ID>",        // um look já existente da MESMA pessoa
  "avatarGroupId": "<AVATAR_GROUP_ID>",
  "referenceImages": [
    { "type": "url", "url": "<FOTO REAL, ORIENTAÇÃO RETRATO>" }
  ],
  "prompt": "<o bloco abaixo>"
}
```

⚠️ **A orientação da referência decide a orientação da saída.** Uma referência deitada passada junto
fez três looks saírem deitados — e o corte 9:16 em cima disso fecha demais o enquadramento. **Só
referência retrato.**

```text
Keep the exact same face, facial features, skin tone and hair colour as the
reference image. Do not change their age, face shape or complexion.
Only the hairstyle, the clothing and the room change.
Avatar seated <MÓVEL>, facing the camera directly, their hair <CABELO>,
wearing a <PEÇA + COR + TECIDO CONCRETOS>, no jacket.
<CÔMODO E OBJETOS>. <LUZ>, nothing brightly lit, deep soft shadows.
Vertical portrait composition, tall 9:16 frame. Wider medium shot from a little
further back: the person is seen from the waist up with <MÓVEL> and a good part
of the room visible around them, and clear space above their head.
Not a close-up, not a tight crop.
```

**Seis eixos, todos declarados** — eixo não declarado é eixo que o gerador decide pelo lugar-comum:
**móvel · roupa · cabelo · cômodo e objetos · luz · enquadramento**.

- **Categoria perde para a referência.** `a light blouse` deixou a blusa da foto intacta; `plain
  white cotton shirt` trocou. **Nomeie peça + cor + tecido.**
- **Declare a luz pelo que ela NÃO é.** `strong natural morning light` + `plain off-white wall` saiu
  clínico e quebrou a unidade estética do lote. O que funciona: `lit only by a soft yellow lamp` ·
  `nothing brightly lit` · `deep soft shadows`.
- **O ambiente sai do CONTEÚDO do roteiro**, não de um sistema de luz fixo. A regra: leia o trecho,
  pergunte de que assunto ele trata e escolha o cômodo e os objetos que aquele assunto pediria — um
  por peça, sem repetir o mesmo cenário no lote inteiro. Exemplos hipotéticos: um trecho sobre
  estudar pede uma mesa com livros ao fundo; um sobre cozinhar, uma bancada de cozinha; um sobre
  organizar a rotina, um quadro de anotações na parede. **Cenário genérico é oportunidade
  desperdiçada; cenário que expõe lugar real de alguém é problema de privacidade** — invente o
  ambiente, não fotografe a vida da pessoa.

**Portão obrigatório:** gerar **um** look (1 crédito) → abrir **lado a lado com a referência-ouro** →
quem aprova julga a identidade → só então renderizar. **Teto de 3 tentativas por peça.** Passou
disso, o problema é o prompt, não a sorte.

---

## 6 · Geração — os parâmetros travados

```jsonc
{
  "avatarId":     "<AVATAR_ID>",          // o look aprovado no portão do §5
  "engine":       { "type": "avatar_v" },
  "audioAssetId": "<AUDIO_ASSET_ID>",     // NUNCA script + voiceId
  "aspectRatio":  "9:16",                 // sempre explícito
  "resolution":   "1080p",
  "fit":          "cover",
  "title":        "<peça> <trecho>"
}
```

⚠️ **`aspectRatio` sempre explícito.** O default muda conforme a superfície de chamada — pela API
crua sai `16:9`, pelo MCP e pela CLI sai `auto`. É o tipo de detalhe que faz um vídeo sair deitado
sem ninguém entender por quê.

**Sem `motionPrompt`.**

> *"Avoid using a custom motion prompt unless you need a specific movement or style."* · *"**Avatar V
> is audio-driven. Your vocal delivery directly controls how expressive your avatar looks.**"*
> — documentação oficial do Avatar V

A ordem de prioridade dos sinais é **1º áudio, 2º expressão da imagem de origem, 3º prompt**. E o
prompt custom **dobra o custo** (`Custom Expressive Motion = 2× base cost`): paga o dobro para mudar
pouco. **Rosto parado é sintoma de fala plana, não de falta de prompt** — conserta-se no áudio.

**Fila de render — não cancele antes da hora.** Trechos de 12 a 20 s levam tipicamente **2 a 3
minutos** cada em 1080p 9:16, e trechos disparados juntos **não terminam na ordem**: o mais longo
pode sair por último com folga. ⚠️ **Meça o tempo pelo relógio, nunca pela soma das esperas** —
`sleep` em segundo plano **não bloqueia**, e somar essas esperas como tempo decorrido já fez cancelar
um render que tinha só ~6 minutos de fila e estava saudável. A conta certa é **`agora −
created_at`**, com os dois campos vindos do próprio retorno da API (o relógio da máquina pode estar
minutos defasado do servidor). **Abaixo de 10 minutos, esperar.**

---

## 7 · Montagem e QC

- **Sem zoom.** Enquadramento único do início ao fim, dentro de cada peça.
- **Fusão de 5 frames (0,2 s) em cada emenda.** Sem mudança de enquadramento, corte seco vira *jump
  cut* no gesto das mãos.

**O vídeo é a referência; o áudio se constrói em cima dele.** Cada render volta **~20 ms mais curto**
que o áudio de origem, e a normalização a 25 fps arredonda para o frame. Somando oito blocos, deu
**126 ms** de atraso acumulado; em quatro trechos com fusão, **135 ms**. E o acúmulo cai justo no fim
— onde está a chamada para ação.

**Não tente encaixar um áudio pré-mixado num vídeo já montado.** Meça a duração exata de cada plano
**já processado** e **reconstrua o áudio contra ela**, trecho por trecho. A sincronia vira exata por
construção — nas peças aprovadas, **deriva 0,0000 s**.

---

## 8 · Ajuste depois de pronto — cortar, não regravar

Quando o pedido for tirar uma palavra ou encurtar um respiro numa peça **já montada**, o caminho é
**cortar o arquivo**. Regravar e re-renderizar custa créditos e minutos para entregar o mesmo
resultado.

```bash
# 1) OUVIR primeiro, sempre — transcreve a janela e lista os vales de energia
node engine/scripts/cortar-anuncio-avatar.mjs <peca.mp4> --ouvir "9.8:11.6"

# 2) CORTAR — só o intervalo escolhido, para um arquivo NOVO
node engine/scripts/cortar-anuncio-avatar.mjs <peca.mp4> <saida.mp4> "10.128:10.316"
```

O script vem junto com o pacote (`engine/scripts/cortar-anuncio-avatar.mjs`). O que ele automatiza,
e é o que realmente importa, é o método: **transcrever a janela e listar os vales de energia em três
limiares (−25 / −20 / −16 dB)** antes de escolher o intervalo.

- **Ouvir antes de cortar não é opcional.** Sem isso já se cortou a palavra errada: a palavra-alvo
  estava **antes** da pausa, não depois. Um ciclo inteiro perdido por não olhar.
- **Palavra só sai limpa se tiver vale dos dois lados.** Palavras que elidem com a vizinha viram um
  bloco só e não se separam. Sem vale, o honesto é dizer que não dá e regravar — não entregar emenda
  estalada.
- **A trava de sincronia vale aqui também.** Cortar áudio e vídeo juntos com `-ss/-to` deu **52 ms**
  de deriva: o AAC corta em bloco, o vídeo em frame. Separe os fluxos e reconstrua o áudio contra a
  duração exata de cada pedaço → **0,0000 s**.
- **Nunca sobrescreva a versão aprovada.** Saída em arquivo novo, sempre. Já aconteceu de remontar
  por cima e ser pedida a versão anterior para comparação; deu para reconstruir de graça, mas por
  sorte, não por método.

---

## 9 · Custo

| recurso | custo |
|---|---|
| **Render de avatar (engines IV / V)** | **1 crédito = 3 segundos** (= 20/min), arredondado **para cima por render** |
| Custom Expressive Motion (motion prompt) | **2× o custo base** |
| Gerar look | **1 crédito** por geração |
| Treino de modelo (photo avatar) | **60 créditos** |

📄 [tabela oficial de créditos](https://help.heygen.com/en/articles/15126059-how-to-use-credits-on-heygen)

- **A resolução não muda o preço.** A tarifa é por segundo e independe de 720p ou 1080p. **Use 1080p
  sempre.**
- **Render cancelado ou falho não debita.** 📄 *"if a video is cancelled mid-way or failed - you will
  not be charged any Credits under any circumstances."* Deletar um render errado enquanto ele
  processa é grátis.
- ⚠️ **Medir custo por diferença de saldo só vale com UMA operação no intervalo.** Uma medição feita
  com o treino de um look novo (60 créditos) rodando no mesmo intervalo produziu uma projeção **21×
  maior que o real**, e um susto desnecessário. Antes de reportar conta que assuste, confira a tabela.

**Custo real de uma peça de ~75 s:** ~25 créditos de render + ~2 de locução + 1 a 3 de look — ou
seja, **25 a 30 créditos** por peça.

**Antes de queimar crédito, cheque:** o look já existe (reusar custa zero)? o texto deste trecho já
foi gerado antes (texto igual = áudio do cache = zero)? `aspectRatio` explícito? `engine` compatível
com o look? locução conferida em janelas de 12 s? **a copy está aprovada, e não só o plano?**

---

## 10 · O que não repetir

- ❌ **Escrever a copy antes de ler o produto.** Rende número inventado e mecanismo batizado por quem
  não é o dono dele.
- ❌ **Picar a fala em blocos curtos.** É a causa documentada do "som de IA".
- ❌ **Colar trechos com silêncio digital absoluto.** Toda pausa que soa natural é gerada **dentro**
  do engine, junto com a fala.
- ❌ **Referenciar look gerado em vez de foto real.**
- ❌ **Passar referência deitada** quando a saída precisa ser 9:16.
- ❌ **`motionPrompt` no Avatar V** sem motivo específico — paga o dobro e muda pouco.
- ❌ **Salpicar marcas de oralidade** que você não ouviu da pessoa. Vira tique.
- ❌ **Sobrescrever a versão aprovada.**
- ❌ **Usar a CLI onde o MCP resolve.** 📄 *"CLI mode bills against your HeyGen API usage. MCP mode
  consumes your existing HeyGen plan credits."* — em conta de assinatura, a CLI abre uma segunda
  fatura.
