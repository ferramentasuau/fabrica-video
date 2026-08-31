# Índice de Fontes Oficiais do HeyGen

> **Para que serve.** Antes de produzir vídeo com o HeyGen, ou quando bater a dúvida
> *"o HeyGen faz isso mesmo ou é achismo de tutorial de YouTube?"*, consultar **aqui** e ir direto
> na fonte do próprio HeyGen. Nada de responder de memória tendo este índice do lado.
>
> **Criado em:** 04/08/2026 · **Origem:** o HeyGen já estava em uso no dia a dia, mas não havia
> nenhuma documentação própria sobre ele — nenhuma spec, nenhuma decisão, nenhum processo. Tudo o
> que se aprendia morria na sessão.
>
> **Como foi levantado:** as páginas foram lidas na fonte e as medições de custo e de fila foram
> feitas em conta real, num plano pago. O que vale aqui não é a conta usada — é a **fonte oficial
> linkada em cada linha**, que você pode reabrir e conferir a qualquer momento.

---

## Como usar (o ritual de 4 passos)

1. **Ache o tema** na navegação abaixo.
2. **Abra a fonte** e leia o texto oficial — não o resumo de ninguém, nem o deste índice.
3. **Cheque a superfície.** O HeyGen mantém **duas gerações de documentação ao mesmo tempo**:
   `developers.heygen.com` é a **v3, a atual**; `docs.heygen.com` é legado v1/v2 e ainda aparece em
   buscador. Na dúvida sobre API, a v3 manda.
4. **Registre o veredito** em [REGRAS-E-LIMITES.md](REGRAS-E-LIMITES.md) se for algo
   que vai voltar a ser perguntado.

**Legenda de confiança:**
`✅` conteúdo lido e conferido em 04/08/2026 ·
`○` URL confirmada existente, conteúdo ainda não lido

> **Regra prática que vale mais que a marcação linha a linha:** **mais de 100 das páginas abaixo
> foram lidas na fonte** em 04/08/2026, com registro de proveniência (URL, data, método). Os `○`
> são as páginas catalogadas mas fora do escopo de leitura (enterprise, SSO, SCORM, LiveAvatar).
>
> **As transcrições não acompanham este pacote público** — o texto capturado é do HeyGen e não é
> republicado aqui. Estes documentos usam **citações curtas**, entre aspas e com atribuição, e
> apontam sempre para o **link oficial**: é nele que você lê o original, na versão de hoje.

> **Atalho que economiza tempo.** Toda página de `developers.heygen.com` responde em markdown cru
> se você acrescentar `.md` no fim da URL — ex.: `/avatar-iv` → `/avatar-iv.md`. É a forma limpa de
> ler a doc sem passar por renderização.

---

## As 8 fontes-raiz

| # | Fonte | Responde | Quando ir aqui |
|---|---|---|---|
| 1 | [developers.heygen.com](https://developers.heygen.com) | **A v3 — a documentação atual.** Contrato de API, engines de avatar, Video Agent, MCP, CLI, limites | Qualquer dúvida técnica. É a fonte que reflete o produto de hoje |
| 2 | [llms.txt da v3](https://heygen-1fa696a7.mintlify.site/llms.txt) | O índice completo da v3 em texto puro, já legível por máquina | Ponto de partida de qualquer varredura. Mostra páginas que a navegação esconde |
| 3 | [help.heygen.com](https://help.heygen.com/en/) | Como fazer na interface. **7 coleções, 111 artigos** | Dúvida operacional de quem opera pelo Studio, não pela API |
| 4 | [community.heygen.com/public/resources](https://community.heygen.com/public/resources) | Guias oficiais em prosa. É onde mora o melhor material de **prompt** | Quando a doc técnica for seca demais e você quiser o "como pensar" |
| 5 | [heygen.com/academy](https://www.heygen.com/academy) · [trilha pt-BR](https://www.heygen.com/pt-br/academy/welcome-to-academy) | Curso estruturado, **com versão em português** | Estudo do zero, ou quando precisar ensinar alguém |
| 6 | [docs.heygen.com](https://docs.heygen.com) + [llms.txt legado](https://movio-api.readme.io/llms.txt) | Legado v1/v2. Guias que a v3 ainda não reescreveu | Só quando a v3 não cobrir: WebM transparente, templates antigos, vídeo personalizado |
| 7 | [heygen.com/model-context-protocol](https://www.heygen.com/model-context-protocol) · [/integrations/claude](https://www.heygen.com/integrations/claude) | A integração oficial com o Claude, do lado do produto | Antes de decidir MCP vs API key |
| 8 | Schema das ferramentas MCP conectadas | O contrato **executável** — nomes de parâmetro reais, validados na chamada | Quando a doc e a ferramenta divergirem. A ferramenta é a verdade |

---

## Navegação por tema

### 🎭 Avatar, digital twin e semelhança

| Página | Link | ✔ |
|---|---|---|
| **Recording your Consent Video** | [12092609](https://help.heygen.com/en/articles/12092609-recording-your-consent-video) | ✅ |
| **Avatar Consent (API — 3 níveis)** | [docs/avatar-consent](https://developers.heygen.com/docs/avatar-consent.md) | ○ |
| Models — engines Avatar III / IV / V | [models](https://developers.heygen.com/models.md) | ○ |
| Avatar V (maior fidelidade, opt-in por look) | [avatar-v](https://developers.heygen.com/avatar-v.md) | ○ |
| **Avatar IV (engine padrão da v3, tem `motion_prompt`)** | [avatar-iv](https://developers.heygen.com/avatar-iv.md) | ○ |
| Avatar III (pipeline foto-para-vídeo) | [avatar-iii](https://developers.heygen.com/avatar-iii.md) | ○ |
| Create Avatar (footage, imagem ou texto) | [docs/create-avatar](https://developers.heygen.com/docs/create-avatar.md) | ○ |
| Avatar Groups / Avatar Looks | [docs/avatars](https://developers.heygen.com/docs/avatars.md) · [docs/avatar-looks](https://developers.heygen.com/docs/avatar-looks.md) | ○ |
| Digital Twin (API) | [generate-avatar-video](https://developers.heygen.com/generate-avatar-video.md) | ○ |
| Photo Avatar (API) | [photo-avatar](https://developers.heygen.com/photo-avatar.md) | ○ |
| Image to Video (anima pessoa em qualquer imagem) | [image-to-video](https://developers.heygen.com/image-to-video.md) | ○ |
| Create your first Digital Twin com Avatar IV | [12089286](https://help.heygen.com/en/articles/12089286-create-your-first-digital-twin-video-avatar-with-avatar-iv) | ○ |
| Avatar IV Photo-to-Video | [12623520](https://help.heygen.com/en/articles/12623520-how-to-create-an-avatar-using-the-avatar-iv-photo-to-video) | ○ |
| HeyGen Avatar IV Complete Guide | [11269603](https://help.heygen.com/en/articles/11269603-heygen-avatar-iv-complete-guide) | ○ |
| Avatar V is now available | [14602974](https://help.heygen.com/en/articles/14602974-avatar-v-is-now-available-on-heygen) | ○ |
| **How to get the best results with Avatar V** | [14602997](https://help.heygen.com/en/articles/14602997-how-to-get-the-best-results-with-avatar-v-in-heygen) | ○ |
| Avatar Looks Explained | [9964694](https://help.heygen.com/en/articles/9964694-avatar-looks-explained) | ○ |
| **Digital Twin: Filming Tips** | [8389138](https://help.heygen.com/en/articles/8389138-digital-twin-video-avatar-filming-tips) | ○ |
| How to Get Started with Photo Avatars | [10034438](https://help.heygen.com/en/articles/10034438-how-to-get-started-with-photo-avatars) | ○ |
| Personal Model — treinar para looks melhores | [14896977](https://help.heygen.com/en/articles/14896977-personal-model-train-your-model-to-create-better-looks) | ○ |
| Remove the Background of any avatar | [11371315](https://help.heygen.com/en/articles/11371315-how-to-remove-the-background-of-any-avatar) | ○ |
| Digital Twin Creation Error Codes | [9824740](https://help.heygen.com/en/articles/9824740-digital-twin-creation-error-codes) | ○ |
| Digital Twin FAQ | [9380615](https://help.heygen.com/en/articles/9380615-digital-twin-faq) | ○ |
| Walking (motion) Avatar: Advanced Instructions | [9378124](https://help.heygen.com/en/articles/9378124-walking-motion-avatar-advanced-instructions) | ○ |
| Public Avatars Going Offline | [10047067](https://help.heygen.com/en/articles/10047067-public-avatars-going-offline) | ○ |
| Converting WebM Avatars into Adobe Premiere | [9518951](https://help.heygen.com/en/articles/9518951-converting-webm-avatars-into-adobe-premiere) | ○ |
| Acesso a câmera/mic — computador · celular | [8310606](https://help.heygen.com/en/articles/8310606-how-to-access-your-camera-and-mic-using-a-computer) · [15519101](https://help.heygen.com/en/articles/15519101-how-to-access-your-camera-and-microphone-on-your-mobile-device) | ○ |
| Best practices for creating your AI avatar (guia) | [community](https://community.heygen.com/public/resources/avatar-and-voice-shooting-tips-and-tricks) | ○ |
| Generate Looks — roupas e cenário por texto | [community](https://community.heygen.com/public/resources/generate-looks-photo-avatars) | ○ |
| Introducing Avatar IV | [community](https://community.heygen.com/public/resources/introducing-avatar-iv-create-talking-avatars-from-a-single-photo) | ○ |
| Customizing avatars with different looks | [community](https://community.heygen.com/public/resources/community-spotlight-customizing-avatars-with-different-looks-2024-12-10) | ○ |

**Já respondido:** o **consent video é obrigatório** para digital twin de vídeo — *"users must record a
brief consent video before creating a video-based Digital Twin avatar"*. O texto do consentimento é
fornecido pelo HeyGen e tem que ser lido **exatamente como escrito**, em até 30 s, e a pessoa do
consentimento tem que ser a mesma do footage. Gravação de tela do consentimento é rejeitada.
🔗 [12092609](https://help.heygen.com/en/articles/12092609-recording-your-consent-video)

### 🎬 Prompt de movimento e direção de cena

| Página | Link | ✔ |
|---|---|---|
| **Custom Motion Prompts (Avatar IV & V)** | [12805098](https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v) | ○ |
| **Prompting best practices for adding Motion** | [community](https://community.heygen.com/public/resources/prompting-best-practices-for-adding-motion) | ✅ |
| Prompt Like a Pro — avatares, vozes e motion | [community](https://community.heygen.com/public/resources/prompt-like-a-pro-how-to-create-better-ai-avatars-voices-and-motion-in-heygen) | ○ |
| Motion Designer | [12747991](https://help.heygen.com/en/articles/12747991-motion-designer) | ○ |
| Cinematic Avatar — prompt multi-shot e câmera | [cinematic-avatar](https://developers.heygen.com/cinematic-avatar.md) | ○ |
| Avatar Shots — powered by Seedance2 | [14448006](https://help.heygen.com/en/articles/14448006-avatar-shots-powered-by-seedance2) | ○ |

**Já respondido:** motion prompt oficial segue `[parte do corpo] + [ação] + [emoção/intensidade]`,
**um gesto por prompt**, sem informar segundos (o Avatar IV cuida do ritmo sozinho). Ele **não**
controla câmera, cena, objetos nem deslocamento. Regra da comunidade: linguagem positiva, sem
prompt negativo, e **não redescrever o que já está na imagem**. Fórmula avançada do modo expressivo:
`Subject + Motion + Camera Movement + Aesthetic Atmosphere`.
🔗 [12805098](https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v) ·
[community](https://community.heygen.com/public/resources/prompting-best-practices-for-adding-motion)

### 🤖 Video Agent — vídeo a partir de um prompt

| Página | Link | ✔ |
|---|---|---|
| **Writing Effective Video Prompts** ("real experiments, not theory") | [writing-effective-video-prompts](https://developers.heygen.com/writing-effective-video-prompts.md) | ○ |
| **Prompting Guide (v3)** | [docs/prompting-guide](https://developers.heygen.com/docs/prompting-guide.md) | ○ |
| Prompt to Video | [docs/video-agent](https://developers.heygen.com/docs/video-agent.md) | ○ |
| Styles & References | [docs/styles-and-references](https://developers.heygen.com/docs/styles-and-references.md) | ○ |
| Interactive Sessions (storyboard e revisão) | [docs/interactive-sessions](https://developers.heygen.com/docs/interactive-sessions.md) | ○ |
| Video Agent Styles (receita CLI) | [video-agent-with-styles](https://developers.heygen.com/video-agent-with-styles.md) | ○ |
| Video Agent Prompting Guide (Central de Ajuda) | [13566094](https://help.heygen.com/en/articles/13566094-video-agent-prompting-guide) | ○ |
| How to get started with Video Agent | [12402907](https://help.heygen.com/en/articles/12402907-how-to-get-started-with-video-agent) | ○ |
| Video Agent FAQ | [16007192](https://help.heygen.com/en/articles/16007192-video-agent-faq) | ○ |
| Video Agent — the agentic way (guia) | [community](https://community.heygen.com/public/resources/how-to-create-high-quality-videos-in-minutes-with-video-agent) | ○ |

**Já respondido:** a própria doc para agentes manda **preferir o Video Agent a montar avatar + voz +
composição na mão** — *"chaining avatar + voice + composition endpoints by hand is slower and more
error-prone unless the user explicitly needs that control."*
🔗 [docs/for-ai-agents](https://developers.heygen.com/docs/for-ai-agents.md)

### 🗣️ Voz, áudio próprio e TTS

| Página | Link | ✔ |
|---|---|---|
| **Audio to Video — trazer áudio pronto e sincronizar** | [audio-to-video](https://developers.heygen.com/audio-to-video.md) | ○ |
| **Integrar ElevenLabs e outras vozes de terceiros** | [8310663](https://help.heygen.com/en/articles/8310663-how-to-integrate-elevenlabs-other-third-party-voices) | ○ |
| Voices Overview · Browse · Design · TTS (Starfish) | [overview](https://developers.heygen.com/docs/voices/overview.md) · [search](https://developers.heygen.com/docs/voices/search-voices.md) · [design](https://developers.heygen.com/docs/voices/design-voices.md) · [speech](https://developers.heygen.com/docs/voices/speech.md) | ○ |
| Clone a Voice (API) | [reference/clone-a-voice](https://developers.heygen.com/reference/clone-a-voice.md) | ○ |
| How to Get Started with Voices | [9834925](https://help.heygen.com/en/articles/9834925-how-to-get-started-with-voices) | ○ |
| Using Voices in the AI Studio | [11202248](https://help.heygen.com/en/articles/11202248-using-voices-in-the-ai-studio) | ○ |
| **Voice: Languages We Support** | [11391932](https://help.heygen.com/en/articles/11391932-voice-languages-we-support) | ○ |
| Voice Mirroring e Voice Director | [11408956](https://help.heygen.com/en/articles/11408956-how-to-use-voice-mirroring-and-voice-director) | ○ |
| Voice Doctor Tips | [14010178](https://help.heygen.com/en/articles/14010178-voice-doctor-tips-how-to-improve-your-voice) | ○ |
| Advance Voice Settings | [16139180](https://help.heygen.com/en/articles/16139180-advance-voice-settings) | ○ |
| Lipsync — Speed · Precision | [speed](https://developers.heygen.com/lipsync-speed.md) · [precision](https://developers.heygen.com/lipsync-precision.md) | ○ |
| Brand Glossary — pronúncia de termos | [docs/brand-glossary](https://developers.heygen.com/docs/brand-glossary.md) · [8830251](https://help.heygen.com/en/articles/8830251-how-to-use-brand-glossary) | ○ |

### ✍️ Roteiro, legenda e marca

| Página | Link | ✔ |
|---|---|---|
| Script Tips | [9574152](https://help.heygen.com/en/articles/9574152-script-tips) | ○ |
| How to Write Scripts in the AI Studio | [11381771](https://help.heygen.com/en/articles/11381771-how-to-write-scripts-in-the-ai-studio) | ○ |
| How to Use Captions | [8305536](https://help.heygen.com/en/articles/8305536-how-to-use-captions) | ○ |
| How to Create a Brand System | [9889198](https://help.heygen.com/en/articles/9889198-how-to-create-a-brand-system) | ○ |
| On Brand · Brand Kits (API) | [docs/on-brand](https://developers.heygen.com/docs/on-brand.md) · [docs/brand-kits](https://developers.heygen.com/docs/brand-kits.md) | ○ |
| Avatar & Voice FAQ — troubleshooting, boas práticas, créditos | [15544929](https://help.heygen.com/en/articles/15544929-avatar-voice-faq-troubleshooting-best-practices-and-credits) | ○ |

### 📱 Vídeo curto, vertical e reaproveitamento

| Página | Link | ✔ |
|---|---|---|
| **Social Media Content Pipeline** (Reels/TikTok/Shorts em lote) | [social-media-content-pipeline](https://developers.heygen.com/social-media-content-pipeline.md) | ○ |
| AI Clipping (longo → cortes, com nota de viralidade) | [ai-clipping](https://developers.heygen.com/ai-clipping.md) · [9278954](https://help.heygen.com/en/articles/9278954-ai-clipping-explained) | ○ |
| **How to Use HeyGen Video Podcast** | [15707329](https://help.heygen.com/en/articles/15707329-how-to-use-heygen-video-podcast) | ○ |
| Quick Avatar Video | [12903996](https://help.heygen.com/en/articles/12903996-quick-avatar-video) | ○ |
| Batch Mode · Batch Videos (API, até 100) | [12704317](https://help.heygen.com/en/articles/12704317-batch-mode) · [batch-videos](https://developers.heygen.com/batch-videos.md) | ○ |
| Automated Video Series | [13006248](https://help.heygen.com/en/articles/13006248-automated-video-series) | ○ |
| Transparent Background (WebM) | [transparent-background-videos](https://developers.heygen.com/transparent-background-videos.md) | ○ |
| Product Placement (produto + avatar) | [12704854](https://help.heygen.com/en/articles/12704854-product-placement-combine-a-product-with-an-avatar-in-a-video) | ○ |
| Filler word removal ("um", "uh", silêncios) | [filler-word-removal](https://developers.heygen.com/filler-word-removal.md) | ○ |
| Background music · Sound effects (busca semântica) | [background-music](https://developers.heygen.com/background-music.md) · [sound-effects](https://developers.heygen.com/sound-effects.md) | ○ |
| HeyGen Video Processing Times | [9655503](https://help.heygen.com/en/articles/9655503-heygen-video-processing-times) | ○ |
| How to Remove the HeyGen Watermark | [11057301](https://help.heygen.com/en/articles/11057301-how-to-remove-the-heygen-watermark) | ○ |
| Download / Export · Share · Restore deleted | [9834825](https://help.heygen.com/en/articles/9834825-how-to-download-or-export-a-video) · [11788079](https://help.heygen.com/en/articles/11788079-how-to-share-your-videos) · [8300959](https://help.heygen.com/en/articles/8300959-how-to-restore-a-deleted-video) | ○ |
| Content ID Claims on YouTube | [8986144](https://help.heygen.com/en/articles/8986144-content-id-claims-on-youtube) | ○ |
| AI Studio: overview · primeiro vídeo · mídia · screen recorder | [11049655](https://help.heygen.com/en/articles/11049655-overview-our-new-ai-studio) · [11049837](https://help.heygen.com/en/articles/11049837-create-your-first-video-in-our-studio) · [7951425](https://help.heygen.com/en/articles/7951425-add-media-in-ai-studio) · [14251628](https://help.heygen.com/en/articles/14251628-how-to-use-screen-recorder-in-ai-studio) | ○ |
| Face Swap · PPT/PDF to Video · AI Video Generator · HyperFrames app · Preferências | [7951446](https://help.heygen.com/en/articles/7951446-how-to-use-face-swap-in-heygen) · [13007313](https://help.heygen.com/en/articles/13007313-ppt-pdf-to-video) · [12704101](https://help.heygen.com/en/articles/12704101-master-your-workflow-with-ai-video-generator) · [15001510](https://help.heygen.com/en/articles/15001510-hyperframes-x-heygen) · [15046858](https://help.heygen.com/en/articles/15046858-heygen-s-preferences-personalization-settings) | ○ |
| Organizar workspace (pastas e coleções) | [13016632](https://help.heygen.com/en/articles/13016632-how-to-organize-your-workspace-folders-collections-more) | ○ |
| Tutoriais por tipo de vídeo: brand story · explainer · e-commerce · Canva · templates · interatividade | [7842602](https://help.heygen.com/en/articles/7842602-how-to-use-heygen-to-tell-your-brand-story) · [7842596](https://help.heygen.com/en/articles/7842596-how-to-create-explainer-videos-on-heygen) · [7951031](https://help.heygen.com/en/articles/7951031-how-to-use-heygen-to-elevate-your-ecommerce-user-journey) · [13181753](https://help.heygen.com/en/articles/13181753-how-to-design-and-import-canva-creations-into-heygen-via-integration) · [13466178](https://help.heygen.com/en/articles/13466178-how-to-use-templates-in-heygen-to-streamline-video-creation) · [13538881](https://help.heygen.com/en/articles/13538881-how-to-use-heygen-s-interactivity-for-branching-and-clickable-videos) | ○ |

### 🌎 Tradução e localização

| Página | Link | ✔ |
|---|---|---|
| Video Translation — Speed · Precision | [docs/video-translate](https://developers.heygen.com/docs/video-translate.md) · [precision](https://developers.heygen.com/docs/video-translation-precision.md) | ○ |
| How to Get Started with Video Translation | [10029081](https://help.heygen.com/en/articles/10029081-how-to-get-started-with-video-translation) | ○ |
| Video Translation: Languages We Support | [11391941](https://help.heygen.com/en/articles/11391941-video-translation-languages-we-support) | ○ |
| Proofreading para tradução | [10024431](https://help.heygen.com/en/articles/10024431-how-to-use-proofreading-for-video-translation) | ○ |
| Traduzir e localizar seus vídeos (guia) | [community](https://community.heygen.com/public/resources/how-to-translate-and-localize-your-existing-videos-in-heygen) | ○ |

### 🔌 API, CLI, MCP e Claude

| Página | Link | ✔ |
|---|---|---|
| **For AI Agents** — a escada de auth e as regras para agentes | [docs/for-ai-agents](https://developers.heygen.com/docs/for-ai-agents.md) | ✅ |
| Quick Start (v3) | [docs/quick-start](https://developers.heygen.com/docs/quick-start.md) | ○ |
| **MCP Overview** | [mcp/overview](https://developers.heygen.com/mcp/overview.md) | ○ |
| **MCP — Claude Code** · **Claude Web** | [mcp/claude-code](https://developers.heygen.com/mcp/claude-code.md) · [mcp/claude-web](https://developers.heygen.com/mcp/claude-web.md) | ○ |
| Skills oficiais: overview · install · video · avatar · translate | [overview](https://developers.heygen.com/skills/overview.md) · [install](https://developers.heygen.com/skills/install.md) · [video](https://developers.heygen.com/skills/heygen-video.md) · [avatar](https://developers.heygen.com/skills/heygen-avatar.md) · [translate](https://developers.heygen.com/skills/heygen-translate.md) | ○ |
| Repositório oficial de skills | [github.com/heygen-com/skills](https://github.com/heygen-com/skills) | ○ |
| CLI: overview · commands · output modes · features · examples | [cli](https://developers.heygen.com/cli.md) · [commands](https://developers.heygen.com/commands.md) · [output-modes](https://developers.heygen.com/output-modes.md) · [features](https://developers.heygen.com/features.md) · [examples](https://developers.heygen.com/examples.md) | ○ |
| API Key — gerar, rotacionar, proteger | [docs/api-key](https://developers.heygen.com/docs/api-key.md) | ○ |
| **Create Video** (`POST /v3/videos`) · Get Video | [reference/create-video](https://developers.heygen.com/reference/create-video.md) · [reference/get-video](https://developers.heygen.com/reference/get-video.md) | ○ |
| Webhooks · Webhook Events | [docs/webhooks](https://developers.heygen.com/docs/webhooks.md) · [docs/webhook-events](https://developers.heygen.com/docs/webhook-events.md) | ○ |
| Assets (upload, máx. 32 MB) · Batch Assets | [assets](https://developers.heygen.com/assets.md) · [batch-assets](https://developers.heygen.com/batch-assets.md) | ○ |
| Endpoint Version Comparison (v1/v2 → v3) | [endpoint-version-comparison](https://developers.heygen.com/endpoint-version-comparison.md) | ○ |
| Changelog do produto/API | [changelog](https://developers.heygen.com/changelog.md) | ○ |
| Páginas de produto da integração com Claude | [model-context-protocol](https://www.heygen.com/model-context-protocol) · [integrations/claude](https://www.heygen.com/integrations/claude) | ○ |
| OpenAPI cru | [external-api.json](https://developers.heygen.com/openapi/external-api.json) · [openapi.yaml](https://developers.heygen.com/openapi.yaml) | ○ |

**Já respondido:** o HeyGen publica uma **escada de autenticação** para agentes de IA — mas **duas
páginas oficiais dão ordens diferentes**. O `llms.txt` diz *"Priority order — API key first"* e
classifica OAuth/MCP como *"trial-scale only"*; a `for-ai-agents.md` manda checar **MCP primeiro**
(*"Use the first one that resolves"*) e a `mcp/overview` afirma *"Do I need an API key? No."* e
*"Remote MCP is available on all HeyGen plans."* Não há limite técnico que obrigue a sair do MCP — a
diferença é de cobrança: MCP gasta crédito da assinatura, CLI/API key gasta faturamento de API.
Detalhe que morde: *"If `HEYGEN_API_KEY` is set, the CLI always wins."*
E há uma regra explícita: *"Never ask the user to paste an API key into chat."*
🔗 [llms.txt](https://heygen-1fa696a7.mintlify.site/llms.txt) · [docs/for-ai-agents](https://developers.heygen.com/docs/for-ai-agents.md) · [skills/overview](https://developers.heygen.com/skills/overview.md)

### 💳 Créditos, planos e limites

| Página | Link | ✔ |
|---|---|---|
| **HeyGen Credit-Based Pricing Plans Explained** | [15125761](https://help.heygen.com/en/articles/15125761-heygen-credit-based-pricing-plans-explained) | ○ |
| **How to Use Credits on HeyGen** | [15126059](https://help.heygen.com/en/articles/15126059-how-to-use-credits-on-heygen) | ○ |
| How Dynamic & Non-Dynamic Limits work | [12095329](https://help.heygen.com/en/articles/12095329-how-dynamic-non-dynamic-limits-work-at-heygen) | ○ |
| HeyGen API Pricing Explained | [10060327](https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained) | ○ |
| Self-Serve Pricing (API) | [docs/pricing](https://developers.heygen.com/docs/pricing.md) | ○ |
| **Usage Limits** — rate limit, concorrência, quota | [docs/usage-limits](https://developers.heygen.com/docs/usage-limits.md) | ○ |
| Error Codes | [docs/error-codes](https://developers.heygen.com/docs/error-codes.md) | ○ |
| Get Current User (créditos disponíveis e plano) | [user-profile](https://developers.heygen.com/user-profile.md) | ○ |
| Billing · Refund · Upgrade/Downgrade · Cancel/Pause | [9999710](https://help.heygen.com/en/articles/9999710-billing-payments-invoice) · [8304807](https://help.heygen.com/en/articles/8304807-refund-process-and-policy) · [8300824](https://help.heygen.com/en/articles/8300824-how-to-upgrade-or-downgrade-your-subscription) · [8304328](https://help.heygen.com/en/articles/8304328-how-to-cancel-or-pause-your-heygen-subscription) | ○ |
| Legacy Unlimited plans | [9204682](https://help.heygen.com/en/articles/9204682-heygen-legacy-unlimited-plans) | ○ |
| Enterprise pricing (dólar e contrato) | [enterprise-pricing](https://developers.heygen.com/docs/enterprise-pricing.md) · [dollar-base](https://developers.heygen.com/docs/enterprise-pricing-dollar-base.md) | ○ |

### ⚖️ Políticas, ética, consentimento e conformidade

| Página | Link | ✔ |
|---|---|---|
| **The Ethical Use Of Synthetic Media** | [7842567](https://help.heygen.com/en/articles/7842567-the-ethical-use-of-synthetic-media) | ○ |
| **Why is my Video Pending or Rejected** (moderação) | [9039830](https://help.heygen.com/en/articles/9039830-why-is-my-video-pending-or-rejected) | ○ |
| **HeyGen's Compliance with the EU AI Act** | [11395771](https://help.heygen.com/en/articles/11395771-heygen-s-compliance-with-the-eu-ai-act) | ○ |
| HeyGen Privacy and Security Standards | [11187873](https://help.heygen.com/en/articles/11187873-heygen-privacy-and-security-standards) | ○ |
| HeyGen Terms and Conditions | [8300187](https://help.heygen.com/en/articles/8300187-heygen-terms-and-conditions) | ○ |

### 🎓 HeyGen Academy — trilha em português

| Módulo | Link | ✔ |
|---|---|---|
| Bem-vindo · Visão geral da plataforma | [welcome](https://www.heygen.com/pt-br/academy/welcome-to-academy) · [platform-overview](https://www.heygen.com/pt-br/academy/platform-overview) | ○ |
| Caminhos para criação de vídeos | [video-creation-pathways](https://www.heygen.com/pt-br/academy/video-creation-pathways) | ○ |
| Avatares · Mais sobre avatares | [avatars](https://www.heygen.com/pt-br/academy/avatars) · [more-about-avatars](https://www.heygen.com/pt-br/academy/more-about-avatars) | ○ |
| Vozes · Voice | [voices](https://www.heygen.com/pt-br/academy/voices) · [voice](https://www.heygen.com/pt-br/academy/voice) | ○ |
| **Roteirização** | [scripting](https://www.heygen.com/pt-br/academy/scripting) | ○ |
| Agente de Vídeo · Estúdio de IA | [video-agent](https://www.heygen.com/pt-br/academy/video-agent) · [ai-studio](https://www.heygen.com/pt-br/academy/ai-studio) | ○ |
| Brand kit · Modelos · Edit Styles · Modo em lote | [brand-kit](https://www.heygen.com/pt-br/academy/brand-kit) · [templates](https://www.heygen.com/pt-br/academy/templates) · [edit-styles](https://www.heygen.com/pt-br/academy/edit-styles) · [batch-mode](https://www.heygen.com/pt-br/academy/batch-mode) | ○ |
| Localization · PPT/PDF para vídeo · Compartilhar página | [localization](https://www.heygen.com/pt-br/academy/localization) · [ppt-pdf-to-video](https://www.heygen.com/pt-br/academy/ppt-pdf-to-video) · [share-page](https://www.heygen.com/pt-br/academy/share-page) | ○ |
| **Playbook — HeyGen para Profissionais de Marketing** | [playbook](https://www.heygen.com/pt-br/playbook/heygen-for-marketers-jumpstart-guide) | ✅ |
| Playbook — Empreendedores do conhecimento · Agências | [knowledge](https://www.heygen.com/pt-br/playbook/heygen-for-knowledge-entrepreneurs) · [agencies](https://www.heygen.com/pt-br/playbook/heygen-for-agencies-jumpstart-guide) | ○ |

### 📕 Cookbook e composição de vídeo (developers.heygen.com)

Receitas prontas de caso de uso: [Cookbook overview](https://developers.heygen.com/overview.md) ·
[Content Repurposing](https://developers.heygen.com/content-repurposing.md) ·
[Automated Broadcast](https://developers.heygen.com/automated-broadcast.md) ·
[Multilingual Content](https://developers.heygen.com/multilingual-content.md) ·
[Personalized Sales Outreach](https://developers.heygen.com/personalized-sales-outreach.md) ·
[Showcase](https://developers.heygen.com/showcase.md).
Composição: [HeyGen Studio](https://developers.heygen.com/studio-videos.md) ·
[Templates](https://developers.heygen.com/templates.md) ·
[Building a Studio Template](https://developers.heygen.com/templates-guide.md) ·
[Hyperframes](https://developers.heygen.com/hyperframes-overview.md) ·
[Motion Graphics](https://developers.heygen.com/motion-graphics.md).

### 🏢 Fora do escopo de vídeo curto — catalogado, não lido

LiveAvatar (tempo real e SSO): [9182113](https://help.heygen.com/en/articles/9182113-what-is-a-liveavatar) ·
[12758516](https://help.heygen.com/en/articles/12758516-introducing-liveavatar) ·
[10035615](https://help.heygen.com/en/articles/10035615-how-to-get-started-with-liveavatar) ·
[9612935](https://help.heygen.com/en/articles/9612935-liveavatar-custom-liveavatar-creation-guide) ·
[9585924](https://help.heygen.com/en/articles/9585924-prompting-your-liveavatar) ·
[12758866](https://help.heygen.com/en/articles/12758866-liveavatar-faq) ·
[13841185](https://help.heygen.com/en/articles/13841185-liveavatar-sso-setup-with-okta) ·
[13861462](https://help.heygen.com/en/articles/13861462-liveavatar-sso-setup-with-microsoft-entra-id).
Enterprise e colaboração: [8124871](https://help.heygen.com/en/articles/8124871-set-up-saml-sso-with-microsoft-entra-id) ·
[8119184](https://help.heygen.com/en/articles/8119184-set-up-saml-sso-with-okta) ·
[7886820](https://help.heygen.com/en/articles/7886820-enterprise-plans-get-in-touch) ·
[14172266](https://help.heygen.com/en/articles/14172266-advanced-enterprise-settings) ·
[9468098](https://help.heygen.com/en/articles/9468098-collaboration-and-access-control-with-workspaces) ·
[12582746](https://help.heygen.com/en/articles/12582746-introducing-subworkspaces) ·
[13540469](https://help.heygen.com/en/articles/13540469-single-editor-mode-collaborate-on-video-projects-in-real-time).
SCORM e integrações corporativas: [10549082](https://help.heygen.com/en/articles/10549082-how-to-export-heygen-videos-using-scorm) ·
[13540399](https://help.heygen.com/en/articles/13540399-how-to-integrate-adobe-with-heygen-a-step-by-step-guide) ·
[11408938](https://help.heygen.com/en/articles/11408938-heygen-x-hubspot-personalized-video-tutorial) ·
[10004334](https://help.heygen.com/en/articles/10004334-heygen-hubspot-elevate-sales-and-marketing-with-personalized-video).
Vídeo personalizado em massa (Zapier/Sheets/Gmail): [10324568](https://help.heygen.com/en/articles/10324568-personalized-video-an-introduction) ·
[10344284](https://help.heygen.com/en/articles/10344284-personalized-video-step-one-creating-a-template) ·
[10344403](https://help.heygen.com/en/articles/10344403-personalized-video-step-two-google-sheets-creating-your-first-zap) ·
[10344630](https://help.heygen.com/en/articles/10344630-personalized-video-step-three-creating-your-second-zap-finishing-up) ·
[10346868](https://help.heygen.com/en/articles/10346868-deliver-your-personalized-videos-with-gmail-mail-merge).
Conta e programas: [8300260](https://help.heygen.com/en/articles/8300260-how-to-contact-heygen-support-team) ·
[8300888](https://help.heygen.com/en/articles/8300888-how-to-manage-your-heygen-account-settings) ·
[10207693](https://help.heygen.com/en/articles/10207693-how-to-get-started-with-heygen-for-mobile) ·
[9803824](https://help.heygen.com/en/articles/9803824-learn-about-our-affiliate-program) ·
[14648487](https://help.heygen.com/en/articles/14648487-heygen-ambassador-program-faq).

---

## Rotina de revisão (manual, trimestral)

O HeyGen troca engine de avatar com frequência — **Avatar IV virou padrão e o Avatar V chegou por
cima**, e páginas de "melhores resultados" foram reescritas junto. Um índice de ferramenta de IA
generativa envelhece mais rápido que um de plataforma de anúncio.

A cada **~90 dias**, revisar o núcleo abaixo:

**Núcleo de revisão (8 páginas):** [changelog](https://developers.heygen.com/changelog.md) ·
[llms.txt da v3](https://heygen-1fa696a7.mintlify.site/llms.txt) (é onde página nova aparece antes de
virar item de menu) · [models](https://developers.heygen.com/models.md) ·
[avatar-iv](https://developers.heygen.com/avatar-iv.md) · [avatar-v](https://developers.heygen.com/avatar-v.md) ·
[motion prompts 12805098](https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v) ·
[docs/pricing](https://developers.heygen.com/docs/pricing.md) ·
[docs/usage-limits](https://developers.heygen.com/docs/usage-limits.md).

**Roteiro:** diffar o `llms.txt` contra a última leitura (é o jeito mais rápido de ver o que nasceu
e o que morreu), depois abrir as páginas de engine e de preço. Registrar o que mudou em
[REGRAS-E-LIMITES.md](REGRAS-E-LIMITES.md). Numa sessão, basta pedir
*"revisar núcleo HeyGen"*.

---

## O que NÃO entra aqui

- **Tutorial de YouTube, curso pago, thread de LinkedIn, blog de agência.** Podem gerar a
  *pergunta*; nunca a *resposta*.
- **Print de tela de terceiro** como prova de que "o HeyGen faz".
- **Número sem fonte.** Custo em crédito, duração máxima e resolução mudam por plano — se não achou
  na página oficial, marcar como estimativa e dizer que é.
- **Wrapper de terceiro** (Composio, Truto, agregadores de MCP) tratado como documentação do HeyGen.

---

## Relacionados

- [REGRAS-E-LIMITES.md](REGRAS-E-LIMITES.md) — placar do que já foi checado na fonte
- [BIBLIOTECA-DE-PROMPTS.md](BIBLIOTECA-DE-PROMPTS.md) — prompts com fonte
- [`LEIA-PRIMEIRO.md`](LEIA-PRIMEIRO.md) — por onde começar nesta pasta
- [`AVATAR-IA.md`](../../AVATAR-IA.md), na raiz do pacote — o workflow que usa tudo isto

