# Entrega no CapCut — trilhas, som separado e as travas do publish

> Procedimento consolidado na peça 1 (19/08/2026). Antes disso a skill só
> dizia "nunca publicar sem confirmação" e não descrevia a operação.

## Índice

- [O princípio: som fora do render](#o-princípio-som-fora-do-render)
- [Layout de trilhas](#layout-de-trilhas)
- [As raízes de leitura](#as-raízes-de-leitura)
- [Publicar: as travas, na ordem](#publicar-as-travas-na-ordem)
- [Trocar o vídeo de um projeto já publicado](#trocar-o-vídeo-de-um-projeto-já-publicado)
- [Gotchas](#gotchas)

## O princípio: som fora do render

Efeito queimado na mixagem não se ajusta. Na peça 1 o aprovador refez a mixagem
inteira depois de pronta — moveu o riser, trocou o som do pivô, baixou trilhas —
e só conseguiu porque cada som estava numa trilha própria.

**O render sai com a voz sozinha.** `sfx: []` e `trilha: null` nos props. Todo
efeito vira clipe no CapCut.

Um fader por som: uma trilha por tipo de efeito, não uma trilha "SFX" com tudo.

## Layout de trilhas

A peça aprovada saiu com **8 trilhas para 7 materiais** — a repetição não é
desleixo, é fader:

| trilha | conteúdo |
|---|---|
| vídeo principal | o MP4 renderizado, cortado nas fronteiras estruturais, com o punch por segmento |
| vídeo passagens | Light Leak sobre cada corte e cada entrada de cartão |
| áudio trilha de fundo | a música, em pedaços, com as pausas |
| áudio mista | colchão de intro + revezamento + stinger de cartão (três materiais, um fader) |
| áudio RISER | 1 clipe, resolvendo no corte do fim da intro |
| áudio pivô ×3 | um clipe por frase da tese, **uma trilha cada** |

**Trilha organiza por CONTROLE, não por arquivo.** O que vai ser ajustado sozinho
ganha trilha própria; o que entra e nunca mais é tocado pode dividir. Os três
cliques do pivô ocupam três trilhas porque cada um foi mexido separadamente.

Os tempos e o porquê de cada entrada estão no reference de orquestração — o
SKILL.md diz quando lê-lo.

## As raízes de leitura

O VectCut seguro só lê de `media\`, `jobs\`, `presets\` e `assets\generated\`.

**`assets\<marca>\` NÃO é raiz de leitura.** Mídia destinada ao CapCut precisa ser
copiada para uma raiz permitida antes, senão o MCP recusa o caminho. Junction e
symlink também são recusados: `realpath` resolve e a checagem barra.

Escrita só em `staging\`.

## Publicar: as travas, na ordem

`publish_draft_to_capcut` só passa se todas valerem:

1. `SAFE_CAPCUT_DRAFT_ROOT` no ambiente
2. a pasta do draft existe em `staging\`
3. `confirm: true` explícito
4. `validate_draft` passa
5. o script está vivo no cache da sessão — publique na mesma sessão em que salvou
6. **CapCut FECHADO** (na dúvida, trata como aberto)
7. destino inexistente — nunca sobrescreve
8. backup zip automático antes de copiar
9. rollback se qualquer passo falhar

E a regra da conversa, que fica por cima de todas: **nunca publicar sem
confirmação dele no chat.** A trava mecânica virou promessa de comportamento
desde que `SAFE_CAPCUT_DRAFT_ROOT` ficou permanente no `.mcp.json`.

## Trocar o vídeo de um projeto já publicado

Situação recorrente: ele já editou no CapCut e um ajuste de motor exige re-render.

O publish **nunca sobrescreve**, então republicar está fora. O caminho é cirurgia
no lugar:

1. conferir CapCut fechado
2. backup zip da pasta do projeto
3. copiar o MP4 novo por cima do asset dentro do projeto
4. se a duração mudou, corrigir em 3 lugares do `draft_content.json`:
   `materials.videos[].duration` e o `source_timerange` / `target_timerange` do
   segmento
5. conferir md5 e duração; abrir

Duração idêntica preserva todo o corte dele. Na peça 1 isso foi feito 5 vezes sem
perder uma edição.

**O arquivo vivo é `draft_content.json`, não `draft_info.json`.** O CapCut migra
para o formato dele ao abrir o projeto pela primeira vez; mexer no `draft_info`
depois disso não alcança nada.

## Gotchas

- O CapCut descarta `material_name` ao migrar e rederiva do nome do ARQUIVO. Para
  os nomes aparecerem legíveis, **renomeie os arquivos em disco**, não o campo.
  Depois varra TODOS os JSONs da pasta atrás do nome antigo — na peça 1 eram 11
  arquivos, incluindo cópias em `Timelines\` e um `mini_draft.json`.
- `extra_material_refs` aponta para várias tabelas auxiliares, não só `speeds`.
  Conferir órfão contra todas as tabelas de material, senão o teste acusa falso.
- Processo do CapCut demora a morrer. Depois que ele fecha, ainda aparecem
  processos por alguns segundos — reconferir antes de abortar.
- Nome de arquivo com `/` tipográfico (⧸) ou acento passa, mas complica script.
  Normalizar ao copiar para a raiz de leitura.
- **Som que ele pega da biblioteca do próprio CapCut não está em `assets/`** —
  vive em `AppData/Local/CapCut/User Data/Cache/music/<hash>.mp3` e só o
  `material_name` diz o que é. Ao mapear um projeto dele, resolver esses antes de
  concluir que um som é desconhecido.
