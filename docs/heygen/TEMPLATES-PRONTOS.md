# Templates prontos — HeyGen

Moldes para **preencher e usar**. Cada um traz a fonte oficial da fórmula e a armadilha que já
custou crédito de verdade.

🔵 = fórmula oficial do HeyGen · 🟢 = validado em produção, em conta real · ⚠️ = armadilha medida

---

## 1 · Look novo (`create_prompt_avatar`) 🟢

Cria uma variação de cenário/roupa a partir de uma **foto real** da pessoa.

```jsonc
{
  "name": "<nome curto e descritivo>",
  "avatarId": "<id de um look ja existente da MESMA pessoa>",
  "avatarGroupId": "<id do grupo da pessoa>",
  "referenceImages": [
    { "type": "url", "url": "<FOTO REAL da pessoa, ORIENTACAO RETRATO>" }
  ],
  "prompt": "<o bloco abaixo>"
}
```

```text
Keep the exact same face, facial features, skin tone and hair colour as the reference image.
Do not change their age, face shape or complexion. Only the hairstyle, the clothing and the room change.
Avatar seated <MÓVEL>, facing the camera directly, their hair <CABELO>,
wearing a <PEÇA + COR + TECIDO CONCRETOS>, no jacket.
<CÔMODO E OBJETOS>. <LUZ>, nothing brightly lit, deep soft shadows.
Vertical portrait composition, tall 9:16 frame. Wider medium shot from a little further back:
the person is seen from the waist up with <MÓVEL> and a good part of the room visible around them,
and clear space above their head. Not a close-up, not a tight crop.
```

**Os seis eixos, todos obrigatórios** — eixo não declarado é eixo que o gerador decide pelo
lugar-comum: **móvel · roupa · cabelo · cômodo e objetos · luz · enquadramento**.

⚠️ **Referenciar look já gerado acumula desvio.** `create_prompt_avatar` **regenera a pessoa
inteira**, não só o fundo. Geração sobre geração afasta do original a cada volta. **A âncora tem que
ser foto real.** Custo de aprender isso: 8 looks para acertar 4.

⚠️ **A orientação da referência decide a orientação da saída.** Referência deitada → look deitado →
o corte 9:16 fecha demais. **Só referência retrato.**

⚠️ **"Categoria perde para a referência."** `a light blouse` deixou a blusa da referência intacta;
`plain white cotton shirt` trocou. **Nomear peça + cor + tecido.**

⚠️ **Declarar a luz pelo que ela NÃO é.** `strong natural morning light` saiu clínico. O que funciona:
`lit only by a soft yellow lamp` · `nothing brightly lit` · `deep soft shadows`.

💰 **1 crédito por geração.** ⚠️ **Treino de modelo (photo avatar) = 60 créditos** — outra operação,
não confundir na hora de medir custo.

---

## 2 · Render de trecho (`create_video_from_avatar`) 🟢

```jsonc
{
  "avatarId": "<look aprovado>",
  "audioAssetId": "<asset do MP3 ja subido>",
  "engine": { "type": "avatar_v" },
  "aspectRatio": "9:16",
  "resolution": "1080p",
  "fit": "cover",
  "title": "<peca> <trecho>"
}
```

⚠️ **`audioAssetId` é mutuamente exclusivo com `script` + `voiceId`.** Mandar os dois dá erro.

⚠️ **Sem `motionPrompt`** a menos que precise de um movimento específico: **dobra o custo** e muda
pouco. A prioridade do Avatar V é **1º áudio, 2º imagem, 3º prompt** — 📄 *"Avatar V is audio-driven.
Your vocal delivery directly controls how expressive your avatar looks"*
[guia da comunidade oficial](https://community.heygen.com/public/resources/how-to-get-the-best-results-with-avatar-v-in-heygen) · [help 15544929](https://help.heygen.com/en/articles/15544929-avatar-voice-faq-troubleshooting-best-practices-and-credits).

⚠️ **`aspectRatio` sempre explícito.** Default é `auto` no MCP e `16:9` na API crua.

💰 **1 crédito = 3 s, arredondado para cima por render.** Um trecho de 17,3 s custa 6.

---

## 3 · Motion prompt 🔵

**Fórmula oficial:** `[Body part] + [Action] + [Emotion or intensity]`

> Exemplo oficial: *"Right arm raises in a wave, enthusiastic and friendly."*
> — [help 12805098](https://help.heygen.com/en/articles/12805098-motion-prompts)

**Vocabulário oficial — usar estas palavras, não sinônimos:**

| | |
|---|---|
| 😀 Expressão | `calm` · `enthusiastic` · `serious` · `warm` · `confident` · `sincere` · `sad` · `intense` |
| 🙌 Gesto | `wave` · `point` · `thumbs up` · `hand on heart` · `crossed arms` · `open arms` · `shrug` |
| 🧍 Postura | `lean in` · `grounded` · `warm and open` · `composed` |
| 👁️ Olhar | `look at camera` · `look away` · `look off-camera` |
| 🤐 Quietude | `no hand gestures` · `hands still` · `barely move` · `less expressive` |

**Regras oficiais:** um gesto por prompt (máx. duas cláusulas) · **não especificar tempo** (*"Avatar IV
automatically handles pacing"*) · teto de 10 s por prompt custom · se não saiu como esperado,
*"Simplify it. Stick to one movement idea."*

❌ `Avatar waves, crosses arms, then points and shrugs` — gestos demais.

**Moldes por momento do vídeo** (montados com o vocabulário oficial, para uma direção contida):

| Momento | Prompt |
|---|---|
| Gancho / abertura baixa | `Composed posture, calm expression, look at camera.` |
| Nomear a dor | `Leans in slightly, sincere expression.` |
| Frase forte respirando | `Hands still, warm expression, look at camera.` |
| Virada / mecanismo | `Open arms in a calm gesture, warm and open.` |
| Fechamento | `Grounded posture, confident expression, look at camera.` |

---

## 4 · Brief de Video Agent 🔵

Três camadas, **nesta ordem**: estilo → roteiro → alavancas.

```text
Style: <NOME DO ESTILO>. <PALETA COM HEX DO BRAND KIT>. Editorial and
<ADJETIVO DE RITMO>. <TIPOGRAFIA>. <TIPO DE TRANSIÇÃO>.

Script:
Scene 1 — <o que aparece>. Voiceover: "<fala literal>"
Scene 2 — <o que aparece>. Voiceover: "<fala literal>"

Format: <9:16 | 16:9>. Duration: <n>s. Captions: <on|off>.
```

⚠️ **O Video Agent não escreve a copy da marca.** O roteiro entra **pronto e já aprovado**.

---

## 5 · Texto falado em pt-BR 🟢

Não é template de prompt — é a régua do que se escreve **para a boca**. Validada num lote real de
peças aprovadas.

**Estrutura: 4 trechos longos, 40 a 85 palavras cada.**
T1 o problema · T2 a virada · T3 a oferta · T4 autoridade e CTA.

⚠️ **Não picar em mais blocos.** 📄 [writing-effective-video-prompts](https://developers.heygen.com/writing-effective-video-prompts.md), 14 experimentos controlados: *"**Flow beats
structure.** Scripts that read naturally deliver better than scripts chopped into rigid segments"* ·
*"Don't over-structure — the result sounds choppy."* Picar a fala em 8 blocos curtos **soa
artificial** — foi a causa nº 1 de reprovação de um lote inteiro.

⚠️ **Teto de ~85 palavras por trecho.** Acima de ~120 a TTS engole pedaço.

**Marcas de oralidade** — descrição do que soa falado, **não tempero para salpicar**:
`é` enfático · negação redundante no fim · complemento inteiro, nunca truncado · reticência para
pausa longa · vírgula no lugar de ponto · `pra` · `tá` · `olha` · `a gente`.

⚠️ **No máximo uma marca por peça, e só onde o dono da marca põe.** Dois reforços na mesma frase
soa caricatura de fala: afirmação enfática seguida de **negação redundante no fim**, do tipo
*"Funciona, sim… não é sorte, não"* (exemplo inventado para este guia). Construção assim já foi
cortada inteira por quem aprova, em dias diferentes — **corte repetido é preferência estável**.

⚠️ **Vírgula vira respiro dentro do engine.** Só onde a boca realmente para. Tirar três vírgulas de
um trecho encurtou ele em **2,1 s de ar morto**.

⚠️ **`verbo + é + complemento` pode perder o "é".** A construção enfática *"Falta **é** treino"* saiu
da síntese como *"Falta treino"*. Ancorar com advérbio: ***"Falta mesmo é treino"***.

⚠️ **Sem pergunta solta.** 📄 [writing-effective-video-prompts](https://developers.heygen.com/writing-effective-video-prompts.md): *"Questions don't work well. Scripts built around questions
felt unnatural with a single speaker."* Exceção que funciona: pergunta **respondida na frase
seguinte**, para marcar uma virada (*"E por que isso funciona? Porque…"* — exemplo inventado para
este guia). Uma por peça, no máximo.

**Antes de gerar, ler em voz alta.** 📄 [writing-effective-video-prompts](https://developers.heygen.com/writing-effective-video-prompts.md): *"If it sounds awkward to read aloud, it'll sound
awkward in the video."*

---

## 6 · Lipsync em cena gerada (`create_lipsync`) 🟢

```jsonc
{
  "video": { "type": "asset_id", "asset_id": "<cena>" },
  "audio": { "type": "asset_id", "asset_id": "<locucao posicionada na duracao do plano>" },
  "mode": "precision",
  "keepTheSameFormat": true,
  "enableDynamicDuration": false     // ⚠️ default e TRUE — ver abaixo
}
```

⚠️ **`enableDynamicDuration` tem default `true` e ESTICA o vídeo.** Em 13/08 uma cena de 12,042 s
voltou com 12,125 s — **83 ms distribuídos ao longo do plano**, e a boca foi se afastando do áudio
conforme a fala avançava. `keepTheSameFormat` **não** protege: ele preserva resolução e bitrate, não o
tempo.

⚠️ **Conferir pelo fim da FALA, não pela duração total.** Sobra no fim do arquivo é padding de
container e é inofensiva; esticada distribuída é o que mata. Rodar `silencedetect` no áudio enviado e
na saída e comparar **o instante em que a fala termina** — tem que ser idêntico.

⚠️ **Rosto de perfil: o lipsync não faz nada e não avisa.** Volta `completed`, cobra 1 crédito e
devolve o vídeo intacto. Precisa de rosto suficientemente frontal.

✅ **Rosto pequeno FUNCIONA.** Medido em 13/08 em duas cenas de reunião com o rosto ocupando ~12% da
largura do quadro: o lipsync redesenhou a boca nas duas. A conclusão anterior era o contrário e
**estava errada** — vinha de uma medição ruim, e quase virou regra aqui.

⚠️ **Como conferir se ele fez alguma coisa — o método certo.** Não basta comparar a variação da boca
antes e depois (foi assim que eu errei: 7,111 → 6,969 parece "não mexeu", mas é ruído de
recompressão). **Diferença entre os dois arquivos, varrida numa grade**, e olhar **onde** ela se
concentra:

```
ffmpeg -i ANTES.mp4 -i DEPOIS.mp4 -filter_complex \
  "[0:v][1:v]blend=all_mode=difference,crop=<cel>,signalstats,metadata=print:key=lavfi.signalstats.YAVG" \
  -f null -
```

Rodar célula a célula. **Razão pico/média ≥ ~2× concentrada na célula do rosto = fez o lipsync.**
Diferença espalhada por igual = só recompressão, não fez nada.

⚠️ **Regerar a cena descarta o lipsync.** Óbvio dito assim, e mesmo assim foi o bug real de 13/08: a
cena boa era a `-LS`, ela foi regerada para corrigir outra coisa, a montagem pegou a versão crua e
se perdeu muito tempo procurando o defeito no lugar errado. **Cena regerada = lipsync de novo.**

💰 **1 crédito por chamada**, independente da duração.

---

## 7 · Gerar CENA (não avatar) — geradores de terceiros

> ⚠️ **Fora do escopo oficial desta pasta.** Higgsfield, Kling e MiniMax são **serviços de
> terceiros**, com documentação, regras e preços próprios — o resto desta pasta é documentação
> oficial do HeyGen. Todos são **pagos**, cada um com o seu plano e a sua moeda de crédito.

Para cena com outras pessoas, movimento de câmera e ambiente — onde a pessoa da marca **não** é o
avatar falante:

| | 9:16, ~10 s | |
|---|---|---|
| HeyGen `cinematic_avatar` | **~170 créditos HeyGen** | preço fixo de 4 a 15 s |
| Higgsfield **Kling 3.0 `std`** | **20 créditos HF** | 704×1304 |
| Higgsfield **Kling 3.0 `pro`** | **25 créditos HF** | **1056×1956** ← o mínimo para anúncio |
| Higgsfield Kling `4k` | 60 créditos HF | |

⚠️ **Crédito de um serviço não é crédito do outro — a tabela acima não é razão de preço.** A
comparação de custo depende do plano contratado em cada serviço: **compare em dinheiro, não em
crédito**, com os preços do seu plano.

**Kling cobra por segundo** (`std` 2,0 · `pro` 2,5 · `4k` 6,0), então **gerar o clipe do tamanho da
fala + ~2 s** economiza e evita o defeito abaixo.

⚠️ **Clipe mais longo que a locução = boca falando sem som.** Um clipe de 10 s com fala de 5,74 s
deixou a pessoa mimicando 4,3 s. Dimensionar pela fala, não pela cena.

**Ancorar com `start_image`** para prender rosto, roupa e composição. Para editar o frame-âncora
(trocar roupa, cabelo), usar **`flux_kontext`** (1,5 crédito) — e **passar `aspect_ratio` sempre**:
o default é `1:1` em todos os modelos de imagem, e sem ele a cena volta reenquadrada em vez de editada.

### 🟢 Tag de pausa do MiniMax FUNCIONA através do Higgsfield — validado 17/08

A doc oficial do MiniMax (`platform.minimax.io/docs/api-reference/speech-t2a-http`) documenta a tag
**`<#x#>`** (x em segundos, 0.01–99.99) — e o Higgsfield **repassa** para o motor. Micro-teste
medido: uma tag `<#0.60#>` colada logo depois de um ponto (`…palavra.<#0.60#>Palavra…`) produziu
pausa de **1,02 s** (0,60 da tag + ~0,4 do ponto), sem ler a tag em voz alta.

**Regras de uso** (docs MiniMax + guia comunitário): tag **entre** trechos falados, nunca duas
coladas · colada no texto, sem espaço · pontuação primeiro, tag só onde a pontuação não alcança.
Os dois pontos de maior valor num anúncio: **o respiro antes de uma lista** e **o freio antes do
carimbo final** (0,6–1,0 s antes do fecho, medido na fala real do apresentador).

⚠️ **Evitar aspas e parênteses no texto da TTS** — parêntese é sintaxe de interjeição no MiniMax
(`(laughs)`) e aspas quebram o agrupamento prosódico (doc de fabricante Knovvu).

---

## 8 · Som de ambiente 🟢

**ElevenLabs `text_to_sound_effects` com `loop: true`.** O teto é 5 s, mas o loop emenda sem costura e
se repete pelo tempo que precisar. O catálogo de SFX do HeyGen só tem drones e chimes — não serve para
cama de ambiente.

**O nível decide se funciona:** o gerado veio a −62,3 LUFS (inaudível). Ganho até pousar **~30-34 dB
abaixo da voz**. Presente no silêncio, invisível sob a fala. Mais alto que isso vira trilha e mata
pausa dramática.

**Cobrir a sequência inteira**, nunca só um buraco: cama que entra e sai no meio tem emenda audível.

---

## Checklist antes de queimar crédito

- [ ] O look já existe? **Reusar look aprovado custa zero** e elimina risco de o rosto drifar
- [ ] O texto desse trecho já foi gerado antes? **Texto igual = áudio do cache = zero**
- [ ] `aspectRatio` explícito?
- [ ] `engine` explícito e compatível com o avatar (`list_avatar_looks` → `supported_api_engines`)?
- [ ] Locução conferida em **janelas de 12 s** antes de renderizar?
- [ ] Vai por **MCP**, não CLI?
- [ ] O cliente **aprovou a copy**, não só o plano?
