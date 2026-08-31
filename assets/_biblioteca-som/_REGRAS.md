# Biblioteca de som da fábrica — organizada por função

> **Vale para QUALQUER projeto** (decisão do aprovador, 17/08/2026): mora em
> `assets\_biblioteca-som\`, fora de qualquer pasta de marca. Os jobs de origem
> e qualquer marca nova puxam daqui. O prefixo `_` segue a convenção da casa
> para pasta transversal (como `_broll-tmp`).
>
> A taxonomia vem da LEITURA dos 6 reels da onda 2 da referência (forense visual
> no corpus de origem, não incluído): cada pasta é um ELEMENTO do vídeo
> entrando ou saindo, e guarda os sons que servem àquela função.
> **Migração de 17/08/2026**: a pasta `CAPCUT FERRAMENTAS E PROJETOS` foi movida
> para cá e **não existe mais**. Os 8 efeitos originais dela estão em
> `efeitos-originais\` (nomes preservados) e as trilhas em `13-trilhas\`.
> O resto dos assets dela virou `assets\_biblioteca-visual\` (backgrounds,
> overlays, transições, templates, margens) e `assets\_biblioteca-fontes\`.
>
> **Quem distribui os sons é o aprovador**, ouvindo um a um e dizendo onde cada
> um vai. As pastas nascem vazias de propósito.

## As 3 regras medidas no corpus (valem para qualquer edição da casa)

1. **Página de legenda é MUDA.** 113 de 124 viradas sem som no vídeo mapeado;
   p=0,20 no teste de nulo (acaso). Por isso NÃO existe pasta "som de página" —
   a ausência é a regra, não esquecimento. Sonorizar cada página soaria
   metralhadora: são ~1,2 páginas por segundo.
2. **Sonorizar o RARO.** A referência usa 3 a 8 sons por vídeo. Corte de câmera
   default é MUDO — só ganha som quando corte é evento raro no vídeo (no vídeo
   de 15 cortes eles têm som, p=0,010; no de cortes frequentes, zero).
3. **O whoosh ANTECIPA o visual em 100–400ms** nas saídas (headline, display,
   oclusão). O som chega primeiro, a imagem confirma.

## O que cada pasta sonoriza (com a evidência)

| pasta | elemento | evidência da referência |
|---|---|---|
| 01-hook-abertura | a batida que abre o vídeo | HF_027: o gancho é o ÚNICO trecho com trilha + pops limpos |
| 02-display-pop | palavra/bloco de display ENTRANDO | 46 pops medidos no HF_027, Δ±20–30ms da palavra falada |
| 03-display-saida | cartela SAINDO | HF_028: sai sempre colada num corte forte (7/7) |
| 04-insert-entrada | clipe/card/prova ENTRANDO | HF_027: PiP com som a 2ms; HF_024: rampa 131× na troca de clipe |
| 05-insert-saida | clipe/card SAINDO | HF_024: whoosh antecipando 100–400ms |
| 06-transicao-flare | transição luminosa (flare/burn) | HF_017: flare = fronteira de mundo (~16×); HF_021: burn 7/7 capítulos |
| 07-corte-hit | corte de cena (uso RARO — regra 2) | HF_023: cortes sonorizados p=0,010 num vídeo de 15 cortes |
| 08-aparte-pb | aparte P&B entrando/saindo | troca de instância de voz (8/8 no corpus) |
| 09-beat-drop-pivo | silêncio → batida → palavra | mantra do HF_025 (Δ −32/0/+38/−10ms); HF_023 rampa 807× |
| 10-enumeracao-tick | tick por item contado | HF_026: pops linha a linha na cartela numerada |
| 11-riser | subida antes de revelação | duck-then-hit do HF_023 |
| 12-cta-final | pontuação do CTA | fecho do vídeo |
| 13-trilhas | camas musicais | papel de cada cama descrito em `_origem.txt` — as trilhas não acompanham o pacote; usar a biblioteca do CapCut ou banco gratuito (ver SETUP) |
| 14-foley-props | som de objeto/ação em cena | prova como objeto físico (regra da onda 1) |

## Lacunas abertas (pastas vazias de propósito — preencher com gerador de SFX por IA ou banco CapCut)

- 02-display-pop (pop seco curto — o TECLADO.mp3 da 14 pode ser recortado como typewriter)
- 03-display-saida · 08-aparte-pb · 12-cta-final · 07-corte-hit

## Nomeação do aprovador

Ao validar de ouvido, renomeie à vontade — o nome dele vence. Registrar mudanças
de pasta aqui embaixo com data, para virar padrão:

- (vazio ainda)
