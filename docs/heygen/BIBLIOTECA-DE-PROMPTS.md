# Biblioteca de Prompts do HeyGen

> **Para que serve.** Parar de inventar prompt na hora. Aqui está a forma oficial de escrever cada
> tipo de prompt que o HeyGen aceita: a fórmula de cada um, uma citação curta da fonte com link, a
> nossa análise do que aquele exemplo ensina, e exemplos escritos por nós no mesmo padrão.
>
> **Criado em:** 04/08/2026 · **Base:** mais de 100 páginas oficiais do HeyGen consultadas — as que
> sustentam cada afirmação estão linkadas aqui, uma a uma ·
> **Índice das fontes:** [INDICE-FONTES.md](INDICE-FONTES.md)

**Regra da casa:** nada entra aqui sem link para a fonte oficial. Prompt de tutorial de YouTube,
thread de LinkedIn ou "eu vi funcionar" não entra.

**Política de citação.** O texto do HeyGen é do HeyGen. Aqui entram **citações curtas** — entre
aspas, com atribuição e link — e a **nossa leitura** do que elas ensinam. Exemplo oficial longo não é
reproduzido: o link leva você ao original, e todo exemplo completo que você lê aqui foi **escrito por
nós**, marcado como tal.

**Legenda:**
`📄` citação curta do HeyGen, entre aspas e com link ·
`🧪` medição própria em render real, 04/08/2026 ·
`🔧` **nosso** — paráfrase, análise ou exemplo escrito por nós a partir das regras oficiais.
Não é texto do HeyGen.

---

## Sumário

1. [Onde cada tipo de prompt funciona (leia antes)](#1-onde-cada-tipo-de-prompt-funciona)
2. [Motion prompt — gesto, expressão e olhar](#2-motion-prompt)
3. [Prompt de movimento generativo — Consistent vs Expressive](#3-prompt-de-movimento-generativo)
4. [Prompt de Video Agent — vídeo inteiro a partir de texto](#4-prompt-de-video-agent)
5. [Camada de roteiro e voz](#5-camada-de-roteiro-e-voz)
6. [Prompt de look — roupa e cenário](#6-prompt-de-look)
7. [O que nenhum prompt do HeyGen faz](#7-o-que-nenhum-prompt-do-heygen-faz)

---

## 1. Onde cada tipo de prompt funciona

**Esta é a tabela que evita o erro mais caro.** O artigo da Central de Ajuda sobre motion prompt fala
de "Avatar IV e V" e dá a impressão de que funciona em tudo. O contrato executável da API diz outra
coisa.

| Situação | `motionPrompt` | `expressiveness` |
|---|---|---|
| **Photo avatar**, engine padrão (Avatar IV) | ✅ funciona | ✅ `high`/`medium`/`low`, default `low` |
| **Photo avatar**, `engine: avatar_v` | ✅ funciona | ❌ rejeitado |
| **Avatar de vídeo / digital twin**, engine padrão (Avatar IV) | ❌ **rejeitado** | ❌ só photo avatar |
| **Avatar de vídeo / digital twin**, `engine: avatar_v` | ✅ funciona | ❌ rejeitado |

🔧 A tabela acima é a nossa leitura do schema da ferramenta MCP `create_video_from_avatar`.
`motionPrompt` vale para photo avatar nos dois engines e, em avatar de vídeo, só no `avatar_v` —
📄 o schema fecha a porta em uma linha: *"Rejected for video avatars on the default Avatar IV
engine."* Já `expressiveness` é exclusivo de photo avatar no Avatar IV, cai para `low` quando
omitido e é recusado quando o engine é `avatar_v`.
Confirmado em [models](https://developers.heygen.com/models.md) e [avatar-iv](https://developers.heygen.com/avatar-iv.md).

> **Consequência prática.** Dirigir a atuação de um digital twin de pessoa real por motion prompt
> **obriga** a passar `engine: {"type": "avatar_v"}`. E o Avatar V só aceita looks que
> declarem `avatar_v` em `supported_api_engines` — pedir engine não listado devolve `400`
> 📄 [models](https://developers.heygen.com/models.md).

⚠️ **E tem um teto de eficácia.** No Avatar V a ordem de prioridade dos sinais é **1º o áudio, 2º a
expressão da imagem de origem, 3º o prompt** — por isso o prompt muda menos o gesto do que se espera
📄 [help 15544929](https://help.heygen.com/en/articles/15544929-avatar-voice-faq-troubleshooting-best-practices-and-credits). Motion prompt é ajuste
fino, não direção de ator.

---

## 2. Motion prompt

Controla **rosto, corpo e gesto**. Nada além disso.

### A fórmula oficial

📄 **`[Body part] + [Action] + [Emotion or intensity]`**

📄 O exemplo de uma linha que a página usa para ilustrar:
*"Right arm raises in a wave, enthusiastic and friendly."*
🔗 [help 12805098](https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v)

🔧 **O que essa linha ensina.** Repare que ela nomeia a **parte do corpo** antes da ação (`right
arm`, não "ele acena"), usa **um verbo só** no presente, e fecha com **dois termos de emoção**
separados por vírgula — nunca uma frase explicando o sentimento. É esse formato que você replica:
parte do corpo, o que ela faz, com que carga. Sem sujeito, sem "por favor", sem segundos.

### O vocabulário oficial — use estas palavras, não sinônimos

O HeyGen publica um vocabulário fechado de termos que o motion prompt reconhece. **Os termos são os
oficiais** — não traduza nem troque por sinônimo, porque o motor foi treinado nessas palavras. A
leitura de cada linha é **nossa**, para você escolher rápido
🔗 [help 12805098](https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v).

| Categoria | Termos oficiais | 🔧 Como escolher (nossa leitura) |
|---|---|---|
| 😀 Expressão facial | `calm` · `enthusiastic` · `serious` · `warm` · `confident` · `sincere` · `sad` · `intense` | Define o clima do rosto. Em peça de venda, `warm` e `confident` cobrem quase tudo; `intense` e `sad` só valem para virada dramática |
| 🙌 Gesto de mão | `wave` · `point` · `thumbs up` · `hand on heart` · `peace sign` · `crossed arms` · `OK sign` · `namaste` · `open arms` · `fist pump` · `salute` · `clapping` · `shrug` | Um por prompt. `open arms` e `hand on heart` acolhem · `point` dirige a atenção · `fist pump` e `clapping` sobem a energia · `crossed arms` fecha |
| 🧍 Postura | `lean in` · `grounded` · `warm and open` · `composed` | Ajusta a distância emocional: `lean in` aproxima; `grounded` e `composed` dão autoridade parada |
| 👁️ Olhar | `look at camera` · `look away` · `look off-camera` | `look at camera` é o padrão de talking head. Desviar o olhar serve para marcar pensamento ou preparar um corte |
| 🤐 Quietude | `no hand gestures` · `hands still` · `barely move` · `less expressive` | O freio — é o que salva o take que saiu gesticulando demais |

### As regras

🔧 Resumo nosso das regras da mesma página
[help 12805098](https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v):

- **Um gesto de corpo por prompt**, que pode vir acompanhado de uma expressão facial — e só. Duas
  cláusulas é o teto prático. 📄 No original: *"Stick to one body gesture per prompt."*
- **Não escreva tempo.** O Avatar IV decide o ritmo sozinho; pedir segundos não ajuda e ainda
  consome espaço do prompt.
- **Se não saiu como esperado, simplifique** em vez de detalhar mais: tire uma cláusula e fique com
  uma ideia de movimento só.
- 🔧 Exemplos nossos, no formato certo: ✅ `Warm expression while raising a hand` ·
  ✅ `Nods confidently, then looks at camera` · ❌ `Waves, crosses arms, then points and shrugs`
  — quatro gestos numa frase: o motor escolhe um e ignora o resto.
- **Teto de 10 s por prompt** de motion custom; acima disso, alternar com o motion padrão
  [guia da comunidade oficial](https://community.heygen.com/public/resources/prompt-like-a-pro-how-to-create-better-ai-avatars-voices-and-motion-in-heygen)

### 🔧 Exemplo trabalhado — traduzir direção de performance em motion prompt

Estes **não são do HeyGen**. Foram montados com o vocabulário oficial acima para executar uma
direção de performance de exemplo — *"conversa individual, não palestra · fazer pausas, começar
mais baixo, olhar direto para a câmera, deixar a frase forte respirar"*.

| Momento do vídeo | Prompt | O que da direção ele atende |
|---|---|---|
| Gancho (abertura baixa) | `Composed posture, calm expression, look at camera.` | "começar mais baixo", "olhar direto" |
| Nomear a dor do público | `Leans in slightly, sincere expression.` | "de dentro, não de cima" |
| Frase forte respirando | `Hands still, warm expression, look at camera.` | "deixar a frase forte respirar" |
| Virada / mecanismo | `Open arms in a calm gesture, warm and open.` | acolhimento sem euforia |
| Fechamento | `Grounded posture, confident expression, look at camera.` | autoridade sem venda dura |
| Conversa de podcast | `Barely move, calm expression, look at camera.` | estética de conversa de podcast |

> **Por que todos são contidos.** Esta marca de exemplo pede acolhimento e zero espalhafato. Os termos
> `enthusiastic`, `fist pump`, `thumbs up` e `clapping` existem no vocabulário oficial e estão
> deliberadamente fora desta lista.

🧪 Medição própria em render real: `Hands open in a calm, welcoming gesture.` foi aceito em photo
avatar público com engine padrão.

---

## 3. Prompt de movimento generativo

Usado quando o HeyGen anima uma **imagem** (não um avatar treinado). Dois modos, com fórmulas
diferentes.

🔧 Como escolher entre os dois — resumo nosso da tabela de comparação do
[guia da comunidade oficial](https://community.heygen.com/public/resources/prompting-best-practices-for-adding-motion):

| | Consistent | Expressive |
|---|---|---|
| O que prioriza | Estabilidade — a imagem de origem sofre pouco | Realismo e dinamismo do movimento |
| Como o movimento sai | Suave e previsível | Mais natural e detalhado, com micro-variação |
| Quanto obedece ao prompt | Obedece em parte | Obedece bem — o prompt manda mais |
| Onde cabe melhor | Clipe cinematográfico, apresentação institucional | Animação realista, cena com carga emocional |

**A regra prática por trás da tabela** (🔧 nossa): se a **imagem** é a estrela — produto, pessoa
reconhecível, arte já aprovada —, vá de Consistent. Se o **movimento** é a estrela, vá de Expressive
e aceite que a imagem vai mexer mais do que você planejou.

### Fórmulas oficiais

📄 Básica: **`Main Subject in the First Frame + Motion/Change`**
📄 Precisa: **`Main Subject in the First Frame + Motion/Change + Camera Movement + Aesthetic Atmosphere`**
🔗 [guia da comunidade oficial](https://community.heygen.com/public/resources/prompting-best-practices-for-adding-motion)
— os exemplos completos do HeyGen estão lá, íntegros.

**🔧 O que os exemplos oficiais ensinam** (análise nossa): a fórmula é lida da esquerda para a
direita como **uma frase só**, com `+` separando os blocos, e **cada bloco aparece uma única vez**.
O sujeito é descrito **como ele já está no primeiro quadro** — não como você gostaria que ele fosse.
O movimento é **um verbo contínuo**, não uma sequência de acontecimentos. A câmera ganha bloco
próprio (no motion prompt de avatar ela nem existe). E o último bloco é **atmosfera** — luz, clima,
profundidade —, nunca mais movimento.

🔧 Exemplos nossos, escritos no formato oficial:

```text
A woman standing in a bright kitchen + turning toward the camera and starting to speak + slow push-in + soft morning light with a shallow depth of field.
```

```text
Subtle shoulder movement, occasional blinks, and a slow drift to the right.
```

### DO / DON'T — as duas regras que mais quebram prompt

🔧 Paráfrase nossa das duas tabelas de correção do
[guia da comunidade oficial](https://community.heygen.com/public/resources/prompting-best-practices-for-adding-motion),
com pares de exemplo escritos por nós:

**1 · Prompt negativo não existe.** O motor não processa "não", "sem" nem "nada de" — ele lê as
palavras e tende a gerar justamente o que você negou. Toda proibição precisa virar **descrição
afirmativa do estado desejado**: em vez de negar o movimento, declare a cena parada.

| ❌ Não faça | ✅ Faça |
|---|---|
| `No camera movement. Nothing in the background.` | `Fixed camera. The shot stays steady. A plain, empty background.` |
| `don't let her hands move` | `her hands rest still on the table` |

**2 · Não converse com o modelo.** Pedido educado, pergunta e ordem ("faça", "adicione") ocupam o
prompt sem descrever nada. O prompt é **legenda da cena**, não mensagem para alguém: escreva o que se
vê, em substantivo e verbo contínuo.

| ❌ Não faça | ✅ Faça |
|---|---|
| `could you please make a video of a dog running through a field?` | `a dog running through a field` |
| `add rain to the image` | `rain falling across the street, headlights reflected on the wet asphalt` |

**3 · No modo Consistent, descreva só o movimento.** Redescrever o que já está na imagem faz o motor
reinterpretar — e mudar — justamente o que deveria ficar igual. 📄 O guia é direto:
*"Over-describing the input image may lead to unintended results."*

---

## 4. Prompt de Video Agent

O prompt é a interface inteira. 📄 *"The agent makes every decision you leave open."*
🔗 [docs/prompting-guide](https://developers.heygen.com/docs/prompting-guide.md)

### As três camadas, nesta ordem

**1 · Duração primeiro.** O agente distribui as cenas dentro da duração que você pedir — por isso ela
abre o prompt, antes de qualquer coisa. 📄 O guia resume em três palavras: *"Lead with it."*

**2 · Parágrafo de estilo.** 🔧 A anatomia que o guia descreve, na nossa redação: **nome** do estilo
(dar nome faz o agente tratar aquilo como um estilo, não como uma lista solta de adjetivos) ·
**paleta exata, com os hex** · **direção de arte** (tipografia, textura, tratamento de imagem) ·
**como as coisas se movem** · **quais são as transições** · e uma frase final de clima.
📄 O tamanho recomendado é explícito: *"Five or six sentences."*

**3 · Roteiro colado.** Cole o roteiro inteiro e o agente segue cena a cena, montando o visual em
volta das suas palavras — ele **não** reescreve a sua copy.
🔗 [docs/prompting-guide](https://developers.heygen.com/docs/prompting-guide.md)

### Os dois exemplos oficiais — e o que copiar deles

O guia oficial traz dois prompts completos: um **só de estilo** (vídeo vertical de 45 s
apresentando um app para a Geração Z, num estilo de fliperama) e um **de estilo + roteiro cena a
cena** (boletim vertical de 30 s sobre mercado imobiliário, num estilo de luxo discreto). Os dois
estão íntegros na página oficial — vale abrir e ler:
📄 [docs/prompting-guide](https://developers.heygen.com/docs/prompting-guide.md).
Abaixo está **a nossa leitura** do que eles ensinam.

**🔧 O que copiar do exemplo só-estilo:**

1. **O estilo ganha nome próprio, em dois termos.** O oficial abre com um nome no formato
   `<Cenário> – <Promessa>` — 📄 *"Arcade Cabinet – Pixel Power-Up"*. O nome amarra tudo o que vem
   depois: cada decisão seguinte precisa caber dentro dele.
2. **A paleta vem com apelido E com hex.** Cada cor é batizada antes do código. O apelido é o que faz
   o agente entender a **função** da cor; o hex é o que garante a marca.
3. **A direção de arte é uma frase de substantivos** — tipografia, textura, tratamento de superfície
   —, não uma pilha de adjetivos vagos ("moderno", "clean", "premium").
4. **O movimento é descrito por elemento**, não pelo vídeo inteiro: o que faz a tipografia, o que
   fazem os números, o que fazem os gráficos.
5. **As transições são listadas à parte**, três no máximo, e todas coerentes com o nome do estilo.
6. **Fecha com uma linha de clima**, em três adjetivos. É o desempate que o agente usa para tudo o
   que você deixou em aberto.

**🔧 O que o segundo exemplo acrescenta (estilo + roteiro):**

1. **A primeira frase declara duração, orientação, tema e apresentador** — nessa ordem, tudo numa
   frase só.
2. **Manda seguir o roteiro cena a cena, com todas as letras** (📄 *"Follow the script below
   exactly"*). Sem essa instrução, o agente parafraseia a sua copy.
3. **Dá a regra de imagem antes do roteiro**: o que vira motion graphic e o que vira footage de
   apoio. É isso que impede o agente de ilustrar tudo do mesmo jeito.
4. **Cada cena tem três partes:** número (com a faixa de tempo, quando houver) · descrição visual ·
   fala entre aspas.
5. **Número falado por extenso na fala e em dígito na descrição visual.** O TTS lê a fala; o motion
   graphic desenha o dígito. Trocar isso produz avatar lendo "15 min" em voz alta, literalmente.

**🔧 Exemplo completo escrito por nós**, no mesmo padrão — produto e marca são fictícios, e nada
aqui é texto do HeyGen. Serve para você ver a forma inteira de uma vez:

```text
Make a 30-second portrait video about our new weekly planner, presented by Marina.
Follow the script below exactly, scene by scene. Use motion graphics for the two
numbers, and stock footage of a quiet desk at night between them.

Style: Night Shelf - Slow Hour. Ink Navy #12182B, Warm Linen #EFE7DA, Muted Clay
#C08A6B, Sage Paper #9FB3A0, Amber Lamp #E8A33D. Soft-focus still life, lowercase
rounded sans headlines, grainy paper texture, and a single lamp lighting the page.
Pages turn slowly, numbers fade up instead of counting, and the photography
breathes in a slow scale. Transitions are long dissolves and lamp-light wipes.
Calm, warm, and unhurried.

Script:

Scene 1 (0-6s) - Marina at a desk at night, one lamp on, planner open in front of her.
"You don't have a time problem. You have a Sunday night problem."

Scene 2 (6-16s) - Motion graphic: 52 fades up over the page, then 15 min below it.
"Fifty-two weeks, one page each, and fifteen minutes on Sunday to lay them out."
```

### Formato alternativo de cena

A Central de Ajuda ensina um segundo formato, em **campos rotulados** em vez de parágrafo corrido —
útil quando mais de uma pessoa revisa o mesmo prompt. 🔧 Na nossa redação, mantendo os rótulos em
inglês, que é como o agente os reconhece:

```text
Scene 1: [tipo de cena]
Visual: [o que aparece na tela, descrito como se vê]
VO/Script: "[a fala, entre aspas]"
Duration: [duração aproximada]
```

Cena recomendada: **5 a 10 segundos**
🔗 [help 13566094](https://help.heygen.com/en/articles/13566094-video-agent-prompting-guide).

### ⚠️ Contradição registrada entre duas fontes oficiais

- 📄 `docs/prompting-guide.md` e a Central de Ajuda **usam timestamps** (`Scene 2 (5-12s)`) nos
  exemplos oficiais.
- 📄 `writing-effective-video-prompts.md` diz o contrário: *"Timestamps per scene (0-5s, 5-12s) make
  the delivery sound robotic"* [writing-effective-video-prompts](https://developers.heygen.com/writing-effective-video-prompts.md).

Não resolvido pelo HeyGen. Sugestão de uso: timestamp quando o corte precisa bater com trilha ou
legenda; sem timestamp quando a naturalidade da fala importa mais — que é o caso de talking head conversacional.

### Mais alavancas oficiais

📄 `files` (anexar referências) · `avatar_id` e `voice_id` (fixar) · `brand_kit_id` (marca) ·
`orientation` (`"portrait"` para social) · `"mode": "chat"` para revisar o plano antes de produzir
🔗 [docs/prompting-guide](https://developers.heygen.com/docs/prompting-guide.md).

🔧 **Revisão cirúrgica de uma cena só.** O padrão que o guia oficial ensina é dizer o que muda **e
listar o que não muda** — sem essa segunda metade, o agente refaz o vídeo inteiro. Molde nosso:
`"Update scene 2 by changing the background to a quiet office. Keep the avatar, the voice, the
script and every other scene unchanged."`

**Não restrinja.** Listar o que você *não* quer ("nada de B-roll, nada de stock footage") é
contraproducente: o agente lê os termos e tende a puxá-los para dentro. Descreva o que deve
aparecer. 📄 O guia proíbe a construção com todas as letras: *"Don't use restrictive language"*
🔗 [docs/prompting-guide](https://developers.heygen.com/docs/prompting-guide.md).
E 📄 abra **chat novo por projeto** — conversa longa degrada a precisão
[help 16007192](https://help.heygen.com/en/articles/16007192-video-agent-faq).

### 🔧 Molde de brief — talking head vertical

Preencher `<ASSIM>`. O roteiro entra pronto e já aprovado — o
Video Agent não escreve a copy da marca.

```text
Make a <45>-second portrait video, presented by <AVATAR>. Follow the script
below exactly, scene by scene. Talking head as the spine; use B-roll only for
texture between beats. No on-screen numbers, no charts, no before/after imagery.

Style: <NOME DO ESTILO>. <PALETA COM HEX DO BRAND KIT>. Editorial and
warm, generous whitespace, soft natural light, shallow depth of field. Motion is
slow and calm: gentle drifts, no bounce, no counters. Transitions are soft
crossfades only. Intimate, unhurried, like a conversation across a table.

Script:

Scene 1 - <descrição visual>
"<fala aprovada>"
```

---

## 5. Camada de roteiro e voz

Antes de qualquer prompt visual, é aqui que a entrega se decide.

| Recurso | Regra oficial | Fonte |
|---|---|---|
| Pausa no roteiro (Studio) | Barra `/` → **Add Pause**, duração em segundos; incrementos de **0,5 s** | [academy pt-BR](https://www.heygen.com/pt-br/academy/scripting) · [help 11202248](https://help.heygen.com/en/articles/11202248-using-voices-in-the-ai-studio) |
| Pausa na API de TTS | Tag `<break time="1s"/>` — **única tag suportada** | [voices/speech](https://developers.heygen.com/docs/voices/speech.md) |
| Pontuação | 📄 *"Commas create short breaks, periods add longer pauses with a natural downward tone, and hyphens can help separate syllables"* | [academy pt-BR](https://www.heygen.com/pt-br/academy/scripting) |
| Pronúncia | Duplo clique na palavra → **Pronunciation** → escrever como deve soar | [academy pt-BR](https://www.heygen.com/pt-br/academy/scripting) |
| Velocidade (vídeo) | `speed` **0.5 – 1.5** | [voices/overview](https://developers.heygen.com/docs/voices/overview.md) |
| Velocidade (TTS puro) | `speed` **0.5 – 2.0** — faixa **diferente** da de vídeo | [voices/speech](https://developers.heygen.com/docs/voices/speech.md) |
| Tom | `pitch` **−50 a +50** semitons | [voices/overview](https://developers.heygen.com/docs/voices/overview.md) |
| Tamanho do texto (TTS) | **1 a 5.000 caracteres** | [voices/speech](https://developers.heygen.com/docs/voices/speech.md) |
| Tamanho por cena (Studio) | recomendado **menos de 2.000 caracteres** | [help 11049837](https://help.heygen.com/en/articles/11049837-create-your-first-video-in-our-studio) |
| Voice Director | Presets `Excited` `Casual` `Calm` `Cool` `Serious` `Funny` `Angry` `Sarcastic` + instrução em texto. **Exige engine Panda** | [help 11408956](https://help.heygen.com/en/articles/11408956-how-to-use-voice-mirroring-and-voice-director) |
| Voice Doctor | Precisa de **mínimo 30 s** de gravação | [help 14010178](https://help.heygen.com/en/articles/14010178-voice-doctor-tips-how-to-improve-your-voice) |

🔧 Para tom acolhedor, o preset coerente é **`Calm`** — nunca `Excited`.

---

## 6. Prompt de look

Gera roupa e cenário novos para um photo avatar, só com texto.

📄 Fórmula oficial: **`Avatar [pose or action], [outfit], [setting or background]`**
🔗 [guia da comunidade oficial](https://community.heygen.com/public/resources/prompt-like-a-pro-how-to-create-better-ai-avatars-voices-and-motion-in-heygen) ·
[guia Generate Looks](https://community.heygen.com/public/resources/generate-looks-photo-avatars)

📄 Custos e limites relacionados: Personal Model exige **mínimo 10 fotos** (30+ para melhor
resultado), custa **60 créditos**, leva **10–15 minutos** e só existe em plano pago. Teto de **500
looks por slot** de avatar [help 14896977](https://help.heygen.com/en/articles/14896977-personal-model-train-your-model-to-create-better-looks).

---

## 7. O que nenhum prompt do HeyGen faz

🔧 O que fica de fora do motion prompt, na nossa redação — cada item é um tipo de pedido que a
página oficial marca como não suportado:

- ❌ **Movimento de câmera** — zoom, pan, dolly. A câmera é fixa, ponto.
- ❌ **Trocar de lugar ou de cena** — mandar o avatar ir para a cozinha, sair de casa, mudar de sala.
- ❌ **Objetos e ações com objeto** — pegar um copo, mexer no celular, acender alguma coisa.
- ❌ **Levantar, andar, sair do enquadramento.**
- ❌ **Mudar fundo ou iluminação.**

📄 A própria página resume em uma linha: *"This tool is for face + body + gestures, not scene
direction."*
🔗 [help 12805098](https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v)

Para movimento de câmera existe o **Cinematic Avatar** (`type: "cinematic_avatar"`, duração de
**4 a 15 s**, com `references`, `auto_duration` e `enhance_prompt`)
[cinematic-avatar](https://developers.heygen.com/cinematic-avatar.md).

E 📄 **Avatar Shots / Seedance2 não aceita áudio:** *"Audio cannot be uploaded — describe the audio
you want in your prompt instead."* [help 14448006](https://help.heygen.com/en/articles/14448006-avatar-shots-powered-by-seedance2).

---

## Relacionados

- [INDICE-FONTES.md](INDICE-FONTES.md) — onde cada fonte mora
- [REGRAS-E-LIMITES.md](REGRAS-E-LIMITES.md) — créditos, planos, consentimento
