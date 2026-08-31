# SETUP — montar a fábrica num PC novo

> Objetivo: sair de um Windows limpo para a **mesma qualidade de edição** das
> peças aprovadas. Tempo estimado: ~40 min + downloads (~2,5 GB no total).
> Repositório público: use, adapte e compartilhe o link à vontade.

## 0 · O que este repositório é (e o que fica de fora)

Aqui dentro: o engine Remotion (`engine/`), os scripts da fábrica
(`engine/scripts/`), a receita aprovada (`presets/receitas/`)
e os presets de legenda e display (`presets/`), o modelo de marca
(`brands/_MODELO.json`) e a marca de exemplo `demo`, a skill do Claude
(`.claude/skills/video-editor-pro/` — carrega sozinha ao abrir o Claude Code
nesta pasta), as bibliotecas de som, visual e fontes (`assets/_biblioteca-*`),
o job sintético de exemplo (`jobs/2026-08-14-teste-sintetico/`), a estrutura
de evals (`evals/`) e o **módulo Avatar**, opcional (`AVATAR-IA.md` e
`docs/heygen/` — ver passo 11).

Fora do git, de propósito: renders, vídeos brutos, `output/`, `staging/`,
e **trilhas musicais de terceiros** (licença — ver passo 8).

## 1 · Pré-requisitos

| ferramenta | como instalar | conferir |
|---|---|---|
| Git | https://git-scm.com | `git --version` |
| Node.js **≥ 20** (a fábrica roda em v24) | https://nodejs.org | `node -v` |
| Python 3.x | https://python.org | `python --version` |
| ffmpeg/ffprobe **no PATH** | `winget install Gyan.FFmpeg` | `ffmpeg -version` |
| CapCut (só para o acabamento manual/entrega) | capcut.com | abrir o app |
| Claude Code | claude.com/claude-code | `claude --version` |

**Sobre o Python:** os scripts da skill (validador de manifest, QC) usam só a
stdlib — nada a instalar. Duas exceções pedem mais: o VectCut seguro instala as
dependências dele no próprio venv (passo 6), e o **recorte de pessoa**
(`cutout-pessoa.mjs`, que gera o efeito do texto-atrás) precisa de uma engine
de segmentação — `pip install rembg` é o caminho simples; RVM via torch é a
alternativa de mais qualidade (torch exige versão de Python compatível —
confira a matriz de suporte do PyTorch antes).

## 2 · Clonar — PARA `D:\VIDEO-FACTORY`

```bash
git clone https://github.com/ferramentasuau/fabrica-video.git D:/VIDEO-FACTORY
```

⚠️ **Clone nessa raiz mesmo.** Os scripts do engine resolvem a raiz sozinhos
(qualquer pasta funciona para renderizar), mas docs e o `.mcp.json` referem
`D:\VIDEO-FACTORY` — manter a raiz igual elimina uma classe inteira de
surpresas. E **nunca** dentro de pasta sincronizada com Drive/OneDrive (render
corrompe — gotcha medido).

Não tem unidade `D:`? Sem drama: clone em outro caminho — os scripts resolvem
a raiz sozinhos. Só ajuste os caminhos nos comandos de exemplo deste guia (e os
placeholders do `.mcp.json`, no passo 6).

## 3 · Engine Remotion

```bash
cd D:/VIDEO-FACTORY/engine
npm ci
```

(`npm ci` usa o `package-lock.json` rastreado — mesmas versões da máquina de
origem. ~665 MB em `node_modules/`.)

**Fumaça — o still do exemplo sintético** (não precisa de mídia nenhuma: o
props está rastreado no git e só cita as fontes woff2 da marca `demo`, também
rastreadas):

```bash
cd D:/VIDEO-FACTORY/engine && npx remotion still CaptionOverlay --props="D:\VIDEO-FACTORY\engine\exemplos\props-caption-overlay.json" --frame=30 --output="D:\VIDEO-FACTORY\jobs\2026-08-14-teste-sintetico\smoke.png" --overwrite
```

Saiu um **PNG 1080×1920** com a legenda do exemplo (palavra ativa em destaque,
inativas apagadas) → o engine está vivo, com as fontes da marca carregando do
git. A CaptionOverlay tem fundo transparente de propósito — visualize o PNG
sobre qualquer fundo; a palavra ativa leva contorno escuro e aparece até no
branco.

## 4 · Whisper (transcrição) — baixa sozinho

Na primeira vez que rodar `node scripts/transcribe.mjs …` (ou
`preparar-peca.mjs`), o `@remotion/install-whisper-cpp` baixa o whisper.cpp
1.5.5 + modelo `medium` (~1,5 GB) para `engine/whisper.cpp/`. Sem passo manual.
Regra da casa: o Whisper é instrumento de **tempo**, não de texto — nomes
próprios se corrigem via `engine/scripts/_remendos.mjs`.

## 5 · Skills e guias do Claude

- **A skill da fábrica carrega sozinha** ao abrir o Claude Code em
  `D:\VIDEO-FACTORY` (vive em `.claude/skills/`). Para valer em todas as pastas
  do PC: `cp -r .claude/skills/video-editor-pro ~/.claude/skills/`.
- **Guias oficiais do Remotion** (best practices, captions, render): instalar o
  plugin Remotion no Claude Code — `claude plugin install remotion` (ou pelo
  marketplace) — que traz as skills `remotion-best-practices`,
  `remotion-captions`, `remotion-render` etc. Se o comando falhar, adicione o
  marketplace oficial do Remotion antes e repita a instalação.

## 6 · VectCut seguro (rascunho editável no CapCut) — opcional, mas é o caminho da entrega

O VectCutAPI é um projeto de terceiro. A fábrica usa uma versão **congelada e
testada** dele + um patch de segurança que acompanha o pacote
(`tools/vectcut-safe.patch`). São quatro movimentos:

**6.1 — clonar o original do autor e congelar na versão testada:**

```bash
git clone https://github.com/sun-guannan/VectCutAPI.git D:/VIDEO-FACTORY/tools/VectCutAPI
cd D:/VIDEO-FACTORY/tools/VectCutAPI
git checkout 7fed5776e6bcc886d615ce07cfec5eaccd547b68
```

O `checkout` prende o clone no commit em que a fábrica foi testada e aprovada.
O autor continua publicando código novo — e código novo não entra aqui sem
revisão.

**6.2 — aplicar o patch seguro** (de dentro de `tools/VectCutAPI`):

```bash
git apply ../vectcut-safe.patch
```

O patch adiciona o que a fábrica de fato executa: o **servidor MCP seguro**
(`mcp_server_safe.py` — stdio, sem porta, sem HTTP), o **kill-switch de rede**
(`safe/no_network.py`: sem as travas de ambiente, o processo recusa subir),
correções de fonte/extensão no código do autor e os testes de `tests_safe/`.
Ele também cria o `UPSTREAM_COMMIT.txt` — com esse arquivo no lugar,
`node tools/checar-upstream.mjs` passa a funcionar: avisa quando o autor
publicar código novo (só avisa; não baixa nem atualiza nada).

**6.3 — venv e dependências:**

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
```

**6.4 — configurar o `.mcp.json`:** copie o modelo na raiz da fábrica —
`copy .mcp.json.example .mcp.json` — e troque os placeholders `<RAIZ>` e
`<USUARIO>`. O exemplo **já vem com `NETWORK_DISABLED=1` e `UPLOAD_DISABLED=1`**
(falha fechada: sem as travas, o servidor recusa subir).

### ⚠️ Regras de segurança da casa — leia ANTES de rodar qualquer coisa

O projeto original traz mais de um modo de execução. **A fábrica só usa o modo
MCP seguro, sem rede.** A configuração segura é responsabilidade de quem
instala:

1. **Nunca execute `capcut_server.py` nem o `mcp_server.py` original** — são
   servidores HTTP que abrem porta e escutam a rede. O único servidor da casa
   é o `mcp_server_safe.py` que o patch instala.
2. **Só o modo MCP seguro, sem rede**: sem URL como mídia, sem upload/OSS, sem
   porta aberta, sem listener. Mídia entra por caminho local, e só das raizes
   de leitura configuradas (`media\`, `jobs\`, `presets\`, `assets\generated\`);
   escrita só em `staging\`.
3. **Cinto e suspensório** — bloqueie a saída de rede do Python do VectCut no
   firewall (PowerShell admin):
   `New-NetFirewallRule -DisplayName "vectcut-safe block" -Direction Outbound -Program "D:\VIDEO-FACTORY\tools\VectCutAPI\.venv\Scripts\python.exe" -Action Block`
4. E a regra da casa que nenhuma configuração substitui: **nunca escrever na
   pasta de projetos do CapCut sem confirmação humana** na conversa.

## 7 · O fluxo de uma peça (o mapa está na skill)

```
bruto  →  preparar-peca.mjs  →  ancoras (à mão)  →  montar-por-receita.mjs
→ validate_edit_manifest.py → STILL (portão humano) → render Remotion
→ derivar-acabamento.mjs → checar-trilhas.mjs (portão) → acabamento.mjs → QC → entrega
```

Cada passo, seus portões e os gotchas: `.claude/skills/video-editor-pro/SKILL.md`
e os 13 `references/`. A régua de qualidade: `references/quality-rubric.md`.
A receita-modelo (aprovada, com a orquestra medida evento a evento) está em
`presets/receitas/` — é o único arquivo da pasta.

## 8 · Trilhas musicais — cada um obtém as suas (ficam fora do git)

**As camas musicais não acompanham o pacote:** música de terceiro não se
redistribui num repositório, e a licença do que você publica é sua
responsabilidade. O que viaja no git é só o que é nosso (os efeitos de
`efeitos-originais/`).

Obtenha as suas em **fonte gratuita**: primeiro a **biblioteca de músicas e
sons do próprio CapCut** — você já o instalou no passo 1, é o caminho natural —
e, como alternativa, um banco gratuito (Pixabay, Free Music Archive). Escolha
pelo **papel** de cada cama, não por nome de música. Os papéis da peça aprovada
estão descritos no `assets/_biblioteca-som/13-trilhas/_origem.txt`; em resumo:

- **trilha de fundo** — a cama única da peça: instrumental calmo, volume
  baixíssimo, cortada em pedaços com pausas de propósito sobre o pivô e o
  aparte;
- **colchão da intro** — cobre as duas janelas de texto-atrás do começo, com
  fades longos;
- **som do aparte** — este tem procedência certa e gratuita: exporte o
  **"Cassette tape, rewind"** da biblioteca do próprio CapCut para
  `assets/_biblioteca-som/13-trilhas/cassette-rewind.mp3`
  (o `derivar-acabamento.mjs` procura aí primeiro).

**Faltar trilha é aviso, não erro** — a peça renderiza sem a cama musical e o
`checar-trilhas.mjs` lista o que ficou faltando. Antes de usar qualquer trilha
em anúncio: **confira a licença** — trilha sem licença não sobe.

## 9 · Criar a SUA marca

A marca `demo` existe para o pacote funcionar de ponta a ponta. Para produzir
com a sua identidade:

1. Copie `brands/_MODELO.json` para `brands/<sua-marca>.json` e preencha os
   tokens (cores, fontes) — o arquivo modelo explica campo a campo.
2. Coloque as fontes `.woff2` da marca em `assets/<sua-marca>/fonts/`.
3. Se a marca usa fonte **nova** em display com ajuste `fit`, MEÇA antes
   (senão o encaixe cai no fallback de 0,6em/glifo e as bordas desalinham):
   ```bash
   node engine/scripts/medir-largura-fonte.mjs <fonte.woff2> engine/src/lib/larguras-<slug>.json
   ```
   e registre a família em `engine/src/lib/larguras.ts`.

## 10 · Prints de prova social — capture os seus

**Nenhum print de pessoa real acompanha o pacote.** Os
`assets/demo/prova/pessoa-*.jpg` são mocks de cor sólida, só para o fluxo
rodar. Para uma peça de verdade, capture os seus próprios prints de perfil
(com autorização de quem aparece) e meça a geometria do recorte — o método
está em `.claude/skills/video-editor-pro/references/insert-system.md`.

## 11 · Módulo Avatar (opcional) — falar sem gravar

> ### ⚠️ Aviso honesto, antes de qualquer clique
>
> Este módulo é **opcional**. Tudo o que está nos passos 1 a 10 — o engine, a
> receita, a legenda, os displays, o acabamento, a entrega — **funciona sem
> ele**. Você grava no celular e edita normalmente.
>
> Ele existe para quem quer produzir a fala **sem gravar**: um avatar de IA
> falando com a sua própria voz clonada. Para isso ele depende de **serviços de
> terceiros**, cada um com conta, painel e preço próprios — dois na rota
> principal, e um terceiro que aparece só numa rota alternativa que você pode
> ignorar:
>
> | serviço | para quê | plano |
> |---|---|---|
> | **ElevenLabs** (elevenlabs.io) | clonar a sua voz e gerar a locução | clone de voz com qualidade de anúncio é recurso de **plano pago** |
> | **HeyGen** (heygen.com) | criar o avatar e renderizar o vídeo falando | tem **plano gratuito, mas limitado** (minutos, resolução e marca d'água); a qualidade descrita aqui exige **plano pago** |
> | **Higgsfield** (higgsfield.ai) — *rota alternativa, dispensável* | uma CLI de TTS que o `build-anuncio-avatar.mjs` pode chamar para gerar as locuções do lote inteiro de uma vez | **pago, à parte**, com conta e crédito próprios — **não acompanha o pacote** |
>
> ⚠️ **Atenção ao terceiro da lista, porque o nome engana.** O script
> `build-anuncio-avatar.mjs` tem uma rota automatizada que "gera as locuções do
> lote inteiro". Ela **não usa a ElevenLabs**: ela chama a CLI do **Higgsfield**,
> um serviço de terceiro, pago, que **não vem neste pacote** e que você teria de
> assinar por fora. É **rota alternativa e opcional** — a rota principal, a que
> este guia instala e documenta, é gerar as falas pelo **MCP da ElevenLabs** e
> salvar os MP3 nas pastas esperadas (`assets/<marca>/audio/<peça>/T1.mp3` …).
> Nessa rota o `build-anuncio-avatar.mjs` nem é usado: você vai direto ao
> `conferir-verbatim.mjs`, e conferência, montagem e corte rodam exatamente
> igual. Não instale nada por causa dele: sem a CLI configurada, o script para
> com uma mensagem apontando a rota da ElevenLabs.
>
> Traduzindo sem rodeio: **a qualidade descrita neste guia custa assinatura na
> ElevenLabs e no HeyGen.** O plano gratuito do HeyGen serve para experimentar e
> entender o fluxo — não para entregar peça de cliente. Nada aqui é patrocinado
> nem obrigatório: se você não quiser assinar, pule esta seção inteira e siga
> gravando. A fábrica continua sua.

### 11.1 · Conectar o HeyGen ao Claude Code (MCP remoto oficial)

O HeyGen publica um **servidor MCP remoto oficial** — é por ele que o Claude
Code passa a conversar com a sua conta. Dois fatos da documentação do próprio
HeyGen que valem dinheiro:

- **o MCP remoto está disponível em todos os planos** do HeyGen; e
- **não é preciso chave de API** para usá-lo — a conexão autentica com a sua
  própria conta.

Isso importa no bolso: pelo **MCP**, o que você gera consome os **créditos da
sua assinatura**. Pela CLI ou por chave de API, o mesmo trabalho é faturado como
**uso de API** — mais caro. Prefira o MCP.

**Como conectar:** siga a página oficial. Ela é a fonte da verdade e muda junto
com o produto:

- **https://developers.heygen.com/mcp/claude-code** — o passo a passo específico
  para o Claude Code
- **https://developers.heygen.com/mcp/overview** — a visão geral do MCP do HeyGen

Pegue o comando **na página acima**, não em tutorial de terceiro (nem neste
guia): endpoint e sintaxe mudam, e comando velho só rende erro confuso.

**O que esperar:** o Claude Code abre uma autorização no navegador para você
**entrar na sua conta HeyGen e autorizar o acesso**. Autorizado, o Claude passa
a listar seus avatares e vozes, gerar novos looks, disparar render e consultar o
status do vídeo — tudo sem você sair do terminal.

### 11.2 · Conectar a ElevenLabs ao Claude Code (MCP stdio oficial)

A ElevenLabs tem um **servidor MCP oficial em stdio** — roda na sua própria
máquina, executado pelo `uvx`.

**Requisito — `uv`/`uvx` instalado:**

```bash
winget install astral-sh.uv
```

Confira com `uvx --version` (se não achar o comando, feche e reabra o terminal).

**Gerar a chave:** entre em **elevenlabs.io** → seu **perfil** → **API Keys** →
crie uma chave. Copie na hora: o painel normalmente mostra a chave uma vez só.
Antes de clicar em criar, **restrinja os escopos e ponha um teto de crédito** —
o passo 11.3 diz exatamente quais permissões bastam.

**Conectar** (no PowerShell, três linhas — e a chave nunca aparece na linha de
comando que você digita):

```powershell
$env:ELEVENLABS_API_KEY = Read-Host "cole a chave da ElevenLabs"
claude mcp add elevenlabs --env ELEVENLABS_API_KEY=$env:ELEVENLABS_API_KEY -- uvx elevenlabs-mcp
Remove-Item Env:ELEVENLABS_API_KEY
```

⚠️ **Não digite a chave literal no lugar de `$env:ELEVENLABS_API_KEY`.** Se
fizer isso, ela fica gravada em texto puro no histórico do PowerShell, que
persiste entre sessões. O porquê, o remédio e como limpar caso já tenha
acontecido estão logo abaixo, no **11.3**.

A chave fica guardada na **configuração local do MCP** do Claude Code, na sua
máquina — **fora deste repositório**. Confira a conexão com `claude mcp list`.

### 11.3 · 🔐 Regra de segurança — leia duas vezes

**Chave de API é senha.** Ela sai do seu controle no segundo em que escapa do
lugar certo, e quem a tiver gasta o seu crédito.

- ❌ **nunca no chat** — não cole a chave numa mensagem para o Claude nem para
  ninguém. O servidor MCP já a recebe pela configuração; o modelo não precisa
  vê-la para trabalhar.
- ❌ **nunca em arquivo versionado** — nada de chave dentro de `.js`, `.json`,
  `.md` ou README. Se ela entrou num commit, considere-a vazada mesmo depois de
  apagada: o histórico do Git guarda.
- ❌ **nunca colada num prompt**, num print de tela, num vídeo de aula ou numa
  mensagem de suporte.
- ✅ **só na configuração do MCP** (o comando do 11.2) ou numa variável de
  ambiente da sua sessão.

O `.gitignore` do pacote já bloqueia `.env`, `*.env`, `*.key`, `*.pem` e
`.mcp.json` — mas isso é rede de proteção, não permissão para arriscar.

#### ⚠️ O comando do 11.2 grava a sua chave no histórico do PowerShell

Este é o furo que quase ninguém enxerga. Se você digitar a **chave literal** no
comando do passo 11.2, ela vai parar em dois lugares que você não pediu:

- **no histórico do PowerShell, em texto puro**, no arquivo
  `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt` —
  que **persiste entre sessões**: sobrevive a fechar o terminal e a reiniciar o
  PC, e continua lá meses depois (no Git Bash o equivalente é o
  `~/.bash_history`);
- **na linha de comando do processo**, visível para qualquer programa que liste
  os processos da máquina enquanto o comando roda.

**O jeito certo — é a forma que o 11.2 já usa. A chave nunca é digitada na linha
de comando:**

```powershell
$env:ELEVENLABS_API_KEY = Read-Host "cole a chave da ElevenLabs"
claude mcp add elevenlabs --env ELEVENLABS_API_KEY=$env:ELEVENLABS_API_KEY -- uvx elevenlabs-mcp
Remove-Item Env:ELEVENLABS_API_KEY
```

O `Read-Host` recebe a chave pelo teclado, **fora** da linha de comando: o que o
histórico guarda é o texto `Read-Host "cole a chave da ElevenLabs"`, não a chave.
A terceira linha apaga a variável da sessão assim que o MCP já a guardou. Confira
a conexão com `claude mcp list`.

E a parte honesta do que isso **não** resolve: durante os segundos em que o
`claude mcp add` roda, o valor ainda aparece na linha de comando daquele processo.
O remédio para isso não é um comando — é não fazer essa etapa em máquina
compartilhada ou com a tela sendo gravada.

**Se você já rodou com a chave literal**, o remédio, nesta ordem:

1. **revogue a chave** no painel da ElevenLabs e gere outra — é o único passo que
   de fato fecha a porta; o resto é faxina;
2. apague a linha do arquivo de histórico:

```powershell
$hist = (Get-PSReadLineOption).HistorySavePath
(Get-Content $hist) -notmatch 'ELEVENLABS_API_KEY' | Set-Content $hist -Encoding utf8
```

3. feche e reabra o terminal — o PSReadLine mantém em memória o histórico da
   sessão corrente e regravaria o arquivo ao sair.

#### 🔒 Crie a chave com o MENOR privilégio possível

Chave nova nasce podendo tudo. Na hora de criá-la (**elevenlabs.io → perfil → API
Keys**), aperte os dois parafusos que o próprio painel oferece:

- **restrinja os escopos.** As permissões que este fluxo de fato usa estão
  documentadas em `docs/heygen/REGRAS-E-LIMITES.md`: **Text to Speech, Voices,
  Voice Generation, Models, History e User**. Deixe ligadas só essas — o que
  estiver desligado, uma chave vazada não consegue fazer.
- **defina um teto de crédito para a chave.** O painel permite limitar quanto
  crédito aquela chave específica pode gastar. Teto baixo transforma um vazamento
  em prejuízo pequeno e visível, em vez de conta zerada.

Uma chave por finalidade, também: a que vive no seu Claude Code não é a mesma que
você usaria em qualquer outra integração.

#### O que a autorização do HeyGen concede na sua conta

Antes de clicar em "autorizar" no passo 11.1, saiba o tamanho do que você está
concedendo: a conexão **não é somente leitura** — ela permite **listar, criar e
também APAGAR** vídeos, avatares (grupos e looks), vozes, kits de marca e
traduções da sua conta HeyGen. Ou seja, a mesma autorização que gera a sua peça
pode remover um avatar que levou horas para ficar pronto. Não é motivo para não
usar; é motivo para decidir com consciência e para ler com atenção qualquer
proposta que venha com "apagar/delete" no nome antes de confirmar.

**Se vazar:** vá ao painel do serviço (ElevenLabs → API Keys; HeyGen →
configurações da conta), **revogue a chave na hora** e gere outra. Revogar é
grátis e leva dez segundos; chave viva na mão errada, não.

### 11.4 · Como usar depois de conectado

Conectado, o mapa é este:

- **`AVATAR-IA.md`** (na raiz) — o **workflow completo**, de ponta a ponta:
  consentimento, clone de voz, roteiro, escolha do look, geração e montagem.
  É o guia que você lê primeiro.
- **`docs/heygen/`** — a **base de conhecimento** do HeyGen, montada só a partir
  de fontes oficiais: `LEIA-PRIMEIRO.md`, os templates e fórmulas de prompt
  (`TEMPLATES-PRONTOS.md`, `BIBLIOTECA-DE-PROMPTS.md`), o placar de regras,
  limites e custo em crédito (`REGRAS-E-LIMITES.md`) e o índice das fontes
  (`INDICE-FONTES.md`). Antes de afirmar "o HeyGen faz X", procure aqui.
- **os scripts do pipeline**, em `engine/scripts/` — a automação da montagem,
  com sincronia exata (deriva medida: 0,0000 s):

| script | o que faz |
|---|---|
| `build-anuncio-avatar.mjs` | **rota alternativa, dispensável** — gera as locuções do lote inteiro de uma vez, com cache por hash do texto, chamando a **CLI externa e paga do Higgsfield** (ver o aviso de custo acima). Na rota principal do pacote você nem o usa: gera as falas pelo MCP da ElevenLabs, salva os MP3 nas mesmas pastas e vai direto ao próximo |
| `conferir-verbatim.mjs` | **portão obrigatório** — transcreve o que a locução realmente falou, em janelas curtas, e acusa o que foi engolido **antes** de você gastar render. ⚠️ **exige o Whisper instalado** — ver o aviso logo abaixo |
| `montar-anuncio-avatar.mjs` | junta os renders do HeyGen com o áudio, com fusão de 5 frames, reconstruindo o áudio contra a duração real de cada plano. **Escreve as peças prontas em `output/<marca>/<lote>/`** (fora do git, como todo render) |
| `cortar-anuncio-avatar.mjs` | tira uma palavra ou um respiro de DENTRO da peça pronta, sem re-render e sem gastar crédito |

Os quatro trazem o porquê de cada decisão no próprio cabeçalho — abra e leia
antes de rodar.

**⚠️ O portão de verbatim depende do passo 4 deste guia.** O
`conferir-verbatim.mjs` (e o `--ouvir` do `cortar-`) transcreve com o
**whisper.cpp**, que **não acompanha o pacote**: ele é baixado na primeira
execução do passo 4 (`transcribe.mjs`), junto com o modelo `medium` (~1,5 GB).
Se você instalou só o Módulo Avatar e pulou o passo 4, **rode-o uma vez** antes —
serve qualquer áudio curto:

```bash
cd D:/VIDEO-FACTORY/engine
node scripts/transcribe.mjs <um-audio.wav> <saida.json>
```

Sem isso o portão para com uma mensagem explicando exatamente isto (não é erro
críptico) — mas parar no meio do lote custa tempo, e o passo 4 é download longo.

**O formato do job — `jobs/_MODELO-anuncio-avatar.json`.** Os três primeiros
scripts leem um arquivo `anuncio-avatar.json` que descreve o lote: a marca, as
peças, o look aprovado de cada uma e os trechos de fala. O **modelo completo e
preenchível** está em `jobs/_MODELO-anuncio-avatar.json` — copie-o para
`jobs/<seu-job>/anuncio-avatar.json` e substitua o conteúdo. Ele explica campo a
campo (em chaves `_comentario`, que os scripts ignoram) e já traz duas peças de
exemplo com a marca `demo`. O caminho dele é o primeiro argumento de todos:

```bash
cd D:/VIDEO-FACTORY/engine
node scripts/conferir-verbatim.mjs ../jobs/<seu-job>/anuncio-avatar.json
node scripts/montar-anuncio-avatar.mjs ../jobs/<seu-job>/anuncio-avatar.json
```

E o mapa de pastas que o job pressupõe — os nomes **não** são livres, o trecho de
id `T1` procura `T1.mp3` e `T1.mp4`:

| o quê | onde |
|---|---|
| locuções (você põe aqui) | `assets/<marca>/audio/<peca.pasta>/T*.mp3` |
| renders baixados do HeyGen | `assets/<marca>/trechos/<peca.pasta>/T*.mp4` |
| peças montadas (a saída) | `output/<marca>/<lote>/<peca.saida>` |

### 11.5 · O fluxo inteiro em 6 linhas

```
1. gravar as amostras da sua voz — áudio limpo, sem música, sem eco
2. clonar a voz na ElevenLabs a partir dessas amostras
3. criar o avatar no HeyGen — digital twin (clone de vídeo) exige vídeo de consentimento; photo e prompt avatar, não
4. gerar as falas do roteiro na voz clonada e baixar os MP3
5. renderizar o avatar no HeyGen JÁ COM o áudio pronto (não deixe o serviço falar por cima)
6. montar com montar-anuncio-avatar.mjs e seguir para o acabamento da fábrica
```

**Sobre o passo 3, com exatidão.** O vídeo de consentimento é exigido pela
plataforma **só para o digital twin** — o avatar treinado a partir de vídeo de uma
pessoa real: ela grava um clipe curto lendo o roteiro que o próprio HeyGen
fornece, palavra por palavra. Avatar de tipo **`photo`** (a partir de foto) e
**`prompt`** (gerado por descrição) **não exigem** esse vídeo. Isso é regra de
plataforma, não permissão: a autorização de quem aparece continua sendo
responsabilidade de quem produz — clone só a si mesmo, ou quem autorizou você por
escrito para este uso. A regra completa está em `AVATAR-IA.md` §1 e em
`docs/heygen/REGRAS-E-LIMITES.md`.
