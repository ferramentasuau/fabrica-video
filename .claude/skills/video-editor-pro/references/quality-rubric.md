# Rubrica de QC editorial (100 pontos)

Nota mínima para aprovar: **85**, com **zero falhas bloqueadoras**.

| Critério | Pontos | O que olhar |
|---|---:|---|
| Gancho e promessa | 15 | 0–3s prende? Promessa clara? (janela oficial Meta: skip em 2s é sinal negativo) |
| Clareza do roteiro | 10 | uma ideia central; início-meio-fim movido por mudança |
| Retenção e ritmo | 10 | mudança visual a cada frase; sem barriga no meio; >15s assistidos é sinal positivo |
| Legendas | 15 | sentido, sincronia (±1 quadro), zona segura, sem tarja (R1) |
| Segundo trilho | 10 | display/pivô constrói com a fala; **nunca divide a tela** com a legenda corrida nem com cartão |
| Elemento sobre o vídeo | 10 | texto-atrás com oclusão legível (~10% da tinta); cartão dentro da zona e **abaixo da boca**; entrada sólida em ≤1 quadro |
| Apoio visual | 5 | b-roll/tela/objeto serve à narrativa, não decora |
| Áudio e efeitos | 10 | voz limpa; SFX pontual; trilha (se houver) a 6–10% de volume — ver `orquestracao.md` |
| Identidade própria | 5 | fontes/cores da marca; sem cara de template alheio |
| Zonas seguras e legibilidade | 5 | conferir-zona.mjs / SafeZoneOverlay |
| Qualidade técnica | 5 | qc_video.py passou |

## Falhas bloqueadoras (qualquer uma = reprovado)

mídia offline · áudio dessincronizado · frame preto não intencional · texto
cortado · erro ortográfico relevante · legenda cobrindo rosto/CTA · clipping de
áudio · proporção/resolução errada · draft que não abre · publicado sem
autorização · **elemento cobrindo a boca de quem fala** (varrido quadro a quadro,
não em amostra — foi a única bloqueadora real do loop de 19/08) · **frase
repetida na tela** (dois trilhos dizendo a mesma coisa) · **quadro vazio ou
fantasma na emenda entre elementos** · **asset sem licença conhecida** — o papel e a
origem de cada pasta da `assets\_biblioteca-som\` estão anotados no `_origem.txt`
dela; trilhas musicais não acompanham o pacote (usar a biblioteca do CapCut ou banco
gratuito — ver SETUP). A rubrica exige que a origem de todo asset usado esteja
registrada, não presume risco.

## Ferramentas

- Técnico: `scripts/qc_video.py <mp4>` (resolução, fps, duração, clipping, frame preto).
- Zona segura: `node engine\scripts\conferir-zona.mjs` (portão da casa desde 06/08)
  ou still do `SafeZoneOverlay` por cima do frame.
- Editorial: esta rubrica, preenchida item a item no relatório do job.
- Desenho novo: o loop de `references/loop-refinamento.md` — critério travado antes de
  construir, e revisor com contexto zero. Critério sem instrumento de medida não
  é portão; é opinião com número.
