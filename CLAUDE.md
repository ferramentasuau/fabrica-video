# Fábrica de vídeo — regras permanentes do workspace

Regras absolutas do VectCut/CapCut:

1. **Nunca executar** `capcut_server.py` nem o `mcp_server.py` original do VectCutAPI (servidor HTTP).
2. **O VectCut seguro não acessa rede**: sem URLs como mídia, sem upload/OSS, sem porta aberta, sem listener.
3. **Nunca escrever na pasta de projetos do CapCut** sem confirmação humana explícita na conversa.
4. **Executar mudanças grandes por fases**, parando em portão de aprovação.
5. **Criar e validar o edit-manifest antes de editar** qualquer vídeo.
6. **Nunca prometer ou declarar garantia de viralização.**

Regras da fábrica:

- `--props` do Remotion **sempre por arquivo**, nunca inline (PowerShell 5.1 quebra o JSON).
- Preview (still PNG) antes de render cheio é portão obrigatório.
- Nunca rodar `npm install`/render dentro de pasta sincronizada com Drive/OneDrive.
- Credencial jamais no chat nem no Git.

Ponteiros:

- Manual de edição: `.claude/skills/video-editor-pro/SKILL.md`
- Instalação: `SETUP.md`
- Receita aprovada: `presets/receitas/talking-head-v1.json`
- Módulo Avatar (opcional): `AVATAR-IA.md` — o workflow do avatar de IA com voz
  clonada, de ponta a ponta; instalação e aviso de custo em `SETUP.md` §11.
- Base de conhecimento do HeyGen (fontes oficiais): `docs/heygen/` — comece pelo
  `LEIA-PRIMEIRO.md`; regras, limites e custo em crédito em `REGRAS-E-LIMITES.md`.
- Modelo do job do Módulo Avatar: `jobs/_MODELO-anuncio-avatar.json`.
