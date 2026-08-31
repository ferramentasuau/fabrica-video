# Fábrica de vídeo vertical

Uma fábrica de edição de vídeo vertical **1080×1920** (Reels/TikTok/Shorts),
construída sobre três peças que trabalham juntas:

- **Remotion** (`engine/`) — o vídeo nasce como código: legenda dinâmica,
  texto gigante atrás da pessoa, displays 3D, cartão de prova social e CTA
  são renderizados de forma reprodutível, a partir de um manifest validado.
- **VectCut seguro** (`tools/VectCutAPI/`, opcional) — transforma o render em
  **rascunho editável do CapCut**, sem rede e sem tocar nas suas pastas sem
  confirmação.
- **CapCut** — o acabamento humano: cortes, punch, passagens de luz, som e
  trilha, seguindo a orquestra documentada na receita.

## Comece por aqui

```bash
git clone https://github.com/ferramentasuau/fabrica-video.git D:/VIDEO-FACTORY
```

⚠️ Clone para `D:\VIDEO-FACTORY` e **nunca** para dentro de pasta sincronizada
com Drive/OneDrive (render corrompe).

Ordem de leitura recomendada:

1. **`SETUP.md`** — a instalação completa, passo a passo, com os portões de
   fumaça (comece por ele; nada funciona antes dele).
2. **`.claude/skills/video-editor-pro/SKILL.md`** — o manual de edição da
   fábrica. Carrega sozinho ao abrir o Claude Code nesta pasta.
3. **`presets/receitas/`** — a receita aprovada (o único arquivo da pasta): cada
   número vem com o `_por_que` que o explica. É o melhor retrato de como a
   fábrica pensa.
4. **`.claude/skills/video-editor-pro/references/`** — os 13 guias de
   profundidade (legenda, displays, inserts, orquestração, QC…).
5. **`AVATAR-IA.md`** — *módulo opcional*: o workflow do avatar de IA com voz
   clonada, de ponta a ponta (consentimento, clone de voz, roteiro, look,
   geração e montagem). Exige contas de terceiros — leia o aviso de custo em
   `SETUP.md` §11 antes de começar.

## O mapa das pastas

| pasta | o que guarda |
|---|---|
| `engine/` | o projeto Remotion + os scripts do pipeline (`engine/scripts/`) |
| `presets/` | receitas aprovadas, presets de legenda e de display |
| `brands/` | as marcas: `_MODELO.json` (copie e preencha) e `demo` (exemplo) |
| `assets/` | bibliotecas de som, visual e fontes + os assets da marca `demo` |
| `jobs/` | um job por peça; `2026-08-14-teste-sintetico/` é o modelo do fluxo |
| `evals/` | a estrutura de golden projects (nasce vazia, de propósito) |
| `tools/` | utilitários + `vectcut-safe.patch`; o clone do VectCutAPI entra aqui, congelado e com o patch aplicado (ver SETUP §6) |
| `docs/heygen/` | *módulo opcional* — a base de conhecimento do avatar de IA: templates de prompt, regras, limites e custo em crédito, tudo de fonte oficial |

**Módulo Avatar (opcional).** Além da fábrica de edição, o pacote traz o
caminho para produzir a fala **sem gravar**: `AVATAR-IA.md` (o workflow do
avatar com voz clonada) e `docs/heygen/` (a base de conhecimento), servidos
pelos scripts `*-anuncio-avatar.mjs` em `engine/scripts/`. Ele depende de
**contas em serviços de terceiros** (HeyGen e ElevenLabs) e de **plano pago**
para a qualidade descrita — a instalação e o aviso honesto de custo estão em
`SETUP.md` §11. A fábrica inteira funciona sem ele.

Regras permanentes do workspace (o que o Claude Code obedece aqui dentro):
`CLAUDE.md`.
