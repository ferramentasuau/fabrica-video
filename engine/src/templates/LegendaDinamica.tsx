import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { LegendaDinamicaProps } from "../lib/schemas";
import { loadBrandFonts, loadExtraFont } from "../lib/fonts";
// Larguras REAIS por fonte (avanço por caractere, medido do woff2 pelo
// engine/scripts/medir-largura-fonte.mjs — adendo 12: "faça um json para
// acertar o tamanho"). O fit-to-width deixa de chutar 0,6em.
import {
  larguraEmDaLinha,
  metricasDaFonte,
  obstaculoNoIntervalo,
  tintaDoChar,
  tintaVerticalDaLinha,
} from "../lib/larguras";
import { fontFamilyCss } from "../lib/brand";
import { fadeUp, springIn, springPunch } from "../lib/anim";
import { buildPages } from "../lib/legendas";

/**
 * LegendaDinamica — legenda animada palavra-a-palavra QUEIMADA sobre um vídeo pronto.
 *
 * Primeiro template que ingere vídeo (OffthreadVideo) em vez de gerar do zero.
 * Identidade: palavra ativa na cor `primary` da marca; demais em `text`.
 * Legibilidade SEM tarja preta (proibida no guia de marca): véu suave na cor `bg`
 * da marca + sombra/contorno no texto.
 *
 * Dois recursos que mudam a cara:
 * - `estiloLetra: "vazado"` — a palavra ainda não falada é só contorno, e o vídeo
 *   aparece por dentro da letra.
 * - `cutoutSrc` — vídeo da pessoa recortada (alpha) desenhado POR CIMA da legenda:
 *   o texto passa ATRÁS dela. Com `ativaNaFrente`, só a palavra do momento é
 *   redesenhada acima, pra nunca sumir atrás da mão.
 */

export const LegendaDinamica: React.FC<LegendaDinamicaProps> = ({
  brand,
  videoSrc,
  captions,
  durationSeconds,
  wordsPerPage,
  fontSizePx,
  bottomOffsetPx,
  estiloLetra,
  intensidade,
  strokePx,
  caixaAlta,
  offsetMs,
  antecipaPaginaMs,
  transicoes,
  transicaoMs,
  transicaoBlurPx,
  transicaoZoom,
  cutoutSrc,
  cutoutSeq,
  ativaNaFrente,
  palavrasAccent,
  cartaoFinal,
  zoomLento,
  dessaturar,
  destaquePalavra,
  paginaSeca,
  displays,
  sfx,
  veu: veuLigado,
  porFrase,
  palavrasDestaque,
  estiloDestaque,
  punches,
  punchesResetSegundo,
  trilha,
  palavrasDestaqueXL,
  textoAtras,
  inserts,
  textoAtrasFonte,
}) => {
  loadBrandFonts(brand);
  // manuscrito das palavras de destaque (17/08) — só carrega se houver lista
  if (palavrasDestaque.length) {
    loadExtraFont({
      family: estiloDestaque.family,
      file: estiloDestaque.file,
      weight: estiloDestaque.weight,
      style: "normal",
      fallback: "cursive",
    });
  }
  // sans pesada do texto-atrás e dos displays 3D (adendos 5 e 9)
  if (textoAtrasFonte) {
    loadExtraFont({
      family: textoAtrasFonte.family,
      file: textoAtrasFonte.file,
      weight: textoAtrasFonte.weight,
      style: "normal",
      fallback: "sans-serif",
    });
  }
  // fonte própria de cada display (adendo 14: manuscrito só na CTA)
  for (const d of displays) {
    if (d.fonte) {
      loadExtraFont({
        family: d.fonte.family,
        file: d.fonte.file,
        weight: d.fonte.weight,
        style: "normal",
        fallback: "cursive",
      });
    }
  }
  const frame = useCurrentFrame();
  const { fps, height: alturaComp, width: larguraCompPx, durationInFrames: duracaoComp } =
    useVideoConfig();
  // tudo em QUADROS: é a unidade real do render. Em milissegundos, palavra
  // curta demais caía entre duas amostras e nunca acendia.
  const qOffset = Math.round((offsetMs / 1000) * fps);
  const qPagina = qOffset + Math.round((antecipaPaginaMs / 1000) * fps);

  // porFrase (USER_PREFERENCE 17/08): a pontuação da fala fecha página; os
  // tetos são só rede de segurança para frase-rio não virar parágrafo na tela.
  const pages = useMemo(
    () =>
      buildPages(
        captions,
        porFrase
          ? { maxWords: 14, maxChars: 64, maxMs: 5000, fps }
          : { maxWords: wordsPerPage, fps }
      ),
    [captions, wordsPerPage, fps, porFrase]
  );

  /**
   * Força da transição neste quadro: 0 longe de qualquer corte, 1 EM cima do
   * corte. O efeito é feito aqui (e não com xfade do ffmpeg) porque o xfade
   * SOBREPÕE trechos e encurtaria o vídeo — 8 transições comeriam ~2,4s e o
   * áudio sairia do lugar. Aqui a duração não muda: só desfoca e aproxima.
   */
  const forcaTransicao = useMemo(() => {
    if (!transicoes.length) return 0;
    const raio = ((transicaoMs / 1000) * fps) / 2;
    if (raio <= 0) return 0;
    let maior = 0;
    for (const seg of transicoes) {
      const dist = Math.abs(frame - seg * fps);
      if (dist < raio) maior = Math.max(maior, 1 - dist / raio);
    }
    // smoothstep: sobe e desce sem "bico", que é o que faz parecer suave
    return maior * maior * (3 - 2 * maior);
  }, [frame, fps, transicoes, transicaoMs]);

  /**
   * Punch-flash (17/08, ajustado no adendo 2): o zoom só APROXIMA — salta para
   * a escala e SEGURA (cada flash chega mais perto), e em punchesResetSegundo
   * volta a 1,0 de uma vez (a liberação, junto com o drop). Com reset null,
   * comportamento antigo: decai em voltaMs. Clarão branco de ~4 quadros sempre.
   */
  const { escalaPunch, flashOpacidade } = useMemo(() => {
    let esc = 1;
    let fl = 0;
    const resetF =
      punchesResetSegundo != null ? Math.round(punchesResetSegundo * fps) : null;
    for (const p of punches) {
      const ini = Math.round(p.emSegundo * fps);
      if (resetF != null) {
        // modo APROXIMA-E-SEGURA: o punch mais recente antes do reset manda
        if (frame >= ini && frame < resetF) esc = Math.max(esc, p.escala);
      } else {
        const dur = Math.max(1, Math.round((p.voltaMs / 1000) * fps));
        if (frame >= ini && frame < ini + dur) {
          const t = (frame - ini) / dur;
          const easeOut = 1 - (1 - t) * (1 - t) * (1 - t);
          esc = 1 + (p.escala - 1) * (1 - easeOut);
        }
      }
      if (frame >= ini && frame < ini + 4) {
        fl = Math.max(fl, p.flash * (1 - (frame - ini) / 4));
      }
    }
    return { escalaPunch: esc, flashOpacidade: fl };
  }, [frame, fps, punches, punchesResetSegundo]);

  /**
   * Aproximação lenta num trecho parado. Entra e FICA no valor final — não
   * volta, porque voltar chamaria atenção pro efeito em vez da peça.
   * A curva é smoothstep pra não ter partida nem chegada seca.
   */
  const escalaZoom = useMemo(() => {
    if (!zoomLento) return 1;
    const de = zoomLento.deSegundo * fps;
    const ate = zoomLento.ateSegundo * fps;
    if (ate <= de || frame < de) return 1;
    const t = Math.min(1, (frame - de) / (ate - de));
    return 1 + (zoomLento.ate - 1) * (t * t * (3 - 2 * t));
  }, [frame, fps, zoomLento]);

  /**
   * Este quadro está dentro de um aparte dessaturado? Sem rampa, de propósito:
   * o P&B marca troca de instância de voz, e fronteira suavizada não marca.
   * Comparação em QUADROS (não em ms) pela mesma razão do qOffset acima.
   */
  const dessaturado = useMemo(
    () =>
      dessaturar.some(
        (d) =>
          frame >= Math.round(d.deSegundo * fps) &&
          frame < Math.round(d.ateSegundo * fps)
      ),
    [frame, fps, dessaturar]
  );

  // Página vigente. Cada uma fica no ar até a SEGUINTE começar — nas pausas da
  // fala a frase continua na tela em vez de piscar e sumir. E entra ANTES da
  // primeira palavra (tempo de ler), enquanto o dourado corre no tempo da voz.
  const framePagina = frame + qPagina;
  const iPage = pages.findIndex((p, i) => {
    const prox = pages[i + 1];
    const de = p.words[0].deFrame;
    const ate = prox
      ? prox.words[0].deFrame
      : p.words[p.words.length - 1].ateFrame + Math.round(0.6 * fps);
    return framePagina >= de && framePagina < ate;
  });
  const page = iPage >= 0 ? pages[iPage] : undefined;

  // ── Gate por PÁGINA (adendos 29 e 30) ──────────────────────────────────────
  // Os gates originais escondiam a legenda POR QUADRO, mas o conteúdo dela é por
  // PÁGINA: quando a janela do texto grande não cai na borda de uma página, a
  // ponta dela aparece embaixo e a frase sai DUPLICADA na tela. Era visível em
  // 4 lugares — a página do gancho nas duas bordas do gigante, a primeira e a
  // última frase da tese no pivô, e o fecho ("e da emissora B.") no segundo pivô.
  //
  // ⚠️ Isto vale SÓ para a legenda corrida. Os gates per-frame continuam vivos e
  // governam o que desenha o texto grande em si (`displayAtivo` → <Display>) e o
  // recorte da pessoa (`textoAtrasAtivo`). Virar qualquer um deles per-página
  // quebra o efeito: o bloco apareceria fora da janela, e a máscara sairia do
  // intervalo do PNG-seq (f0000.png → 404, ou o fantasma congelado do adendo 4).
  const janelaDaPagina = ((): [number, number] | null => {
    if (iPage < 0) return null;
    const p = pages[iPage];
    const prox = pages[iPage + 1];
    const de = p.words[0].deFrame;
    const ate = prox
      ? prox.words[0].deFrame
      : p.words[p.words.length - 1].ateFrame + Math.round(0.6 * fps);
    // o findIndex compara em framePagina (frame + qPagina); volto para quadro
    // real, e corto no fim da composição — a última página "vive" além do vídeo
    // no papel, e essa vida fantasma diluía a % de sobreposição (a página do CTA
    // media 58% quando na tela ela é 100% coberta: 8 pontos de folga em vez de 42)
    return [de - qPagina, Math.min(ate - qPagina, duracaoComp)];
  })();
  // Não basta INTERSECTAR: página que só ENCOSTA na borda seria apagada inteira
  // — na varredura das 86 páginas, duas delas (11% e 23% de sobreposição) levariam
  // junto frases curtas de fecho (ex.: "e mais [X]." / "sem [Y]."), que o texto grande não
  // repete. Some só quem passa metade da vida dentro da janela.
  // A faixa segura medida é 23% < L ≤ 58%; acima disso a página "Toca em Saiba
  // Mais." escapa e duplica o CTA nos quadros finais. 0,5 fica no meio.
  const cobrePagina = (deSegundo: number, ateSegundo: number) => {
    if (!janelaDaPagina) return false;
    const ini = Math.round(deSegundo * fps);
    const fim = Math.round(ateSegundo * fps);
    const dentro = Math.min(janelaDaPagina[1], fim) - Math.max(janelaDaPagina[0], ini);
    const vida = janelaDaPagina[1] - janelaDaPagina[0];
    return vida > 0 && dentro / vida >= 0.5;
  };
  const paginaEmTextoAtras = textoAtras.some((ta) =>
    cobrePagina(ta.deSegundo, ta.ateSegundo)
  );
  const paginaEmDisplay = displays.some((d) => cobrePagina(d.deSegundo, d.ateSegundo));
  // adendo 31: o cartão de prova É a legenda daquele trecho — a corrida repetia
  // o nome logo abaixo de um print que já mostra nome, arroba e selo. Mesma
  // regra dos outros dois trilhos, mesma conta de página.
  const paginaEmInsert = inserts.some((i) => cobrePagina(i.deSegundo, i.ateSegundo));

  // Cartões de prova social vivos neste quadro (adendo 31). A entrada tem ~7
  // quadros e a saída ~5 — os números vêm da pesquisa de motion (200ms/150ms a
  // 30fps); passar disso vira arrasto. Ordenados por `ordem` para que dois
  // cartões na tela empilhem sempre igual, independente de quem entrou antes.
  // O movimento e a OPACIDADE andam separados, e isso é o conserto: com os dois
  // na mesma rampa de 7 quadros o cartão passava meio translúcido com o vídeo
  // aparecendo através dele — lia como dissolve, não como elemento chegando.
  // Agora a opacidade resolve em 3 quadros (~100ms) e o deslocamento continua
  // assentando em 7, que é a faixa que a pesquisa de motion dá para entrada.
  const IN_OPAC_F = 2;
  const IN_MOV_F = 7;
  const insertsAtivos = useMemo(() => {
    const vivos = [];
    for (const ins of inserts) {
      const ini = Math.round(ins.deSegundo * fps);
      const fim = Math.round(ins.ateSegundo * fps);
      if (frame < ini || frame >= fim) continue;
      const entrada = Math.min(1, (frame - ini + 1) / IN_OPAC_F);
      const mov = Math.min(1, (frame - ini + 1) / IN_MOV_F);
      vivos.push({ ins, entrada, mov, saida: 1 });
    }
    return vivos.sort((a, b) => a.ins.ordem - b.ins.ordem);
  }, [frame, fps, inserts]);

  const capFont = brand.fonts.numbers ?? brand.fonts.title;
  const accentFont = brand.fonts.accent ?? brand.fonts.title;
  const gap = Math.round(fontSizePx * 0.24);

  // Palavras que saem na fonte `accent` (nome de produto, num job real).
  // Compara sem acento e sem pontuação: "Nome" casa com "Nome,".
  const chaveAccent = useMemo(() => {
    const limpa = (t: string) =>
      t
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    return new Set(palavrasAccent.map(limpa));
  }, [palavrasAccent]);
  const ehAccent = (t: string) =>
    chaveAccent.size > 0 &&
    chaveAccent.has(
      t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
    );

  // Palavras de destaque (17/08): manuscrito dourado, maior, translúcido.
  const chaveDestaque = useMemo(() => {
    const limpa = (t: string) =>
      t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return new Set(palavrasDestaque.map(limpa));
  }, [palavrasDestaque]);
  const ehDestaque = (t: string) =>
    chaveDestaque.size > 0 &&
    chaveDestaque.has(
      t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
    );
  // XL (adendo 2): frase-chave maior e animada
  const chaveXL = useMemo(() => {
    const limpa = (t: string) =>
      t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return new Set(palavrasDestaqueXL.map(limpa));
  }, [palavrasDestaqueXL]);
  const ehXL = (t: string) =>
    chaveXL.size > 0 &&
    chaveXL.has(
      t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
    );
  const corDestaque =
    estiloDestaque.cor === "primary"
      ? brand.colors.primary
      : estiloDestaque.cor === "accent"
        ? brand.colors.accent
        : brand.colors.text;
  const vazado = estiloLetra === "vazado";
  const reels = intensidade === "reels";

  // véu de legibilidade — cor da MARCA, não preto (guia proíbe tarja preta).
  // No modo vazado ele é mais fraco: véu forte sujaria o vídeo que aparece
  // DENTRO da letra, que é justamente a graça do efeito.
  const veu = vazado
    ? `linear-gradient(to top, ${brand.colors.bg}99 0%, ${brand.colors.bg}73 24%, ${brand.colors.bg}40 40%, transparent 52%)`
    : `linear-gradient(to top, ${brand.colors.bg}B3 0%, ${brand.colors.bg}8C 26%, ${brand.colors.bg}59 44%, transparent 62%)`;

  /**
   * Desenha o bloco da legenda.
   * `somenteAtiva` = camada que vai ACIMA da pessoa recortada: mantém todas as
   * palavras no lugar (pra não mexer no layout) mas só a falada fica visível.
   */
  // Display ativo neste quadro? Os dois trilhos nunca dividem a tela (onda 2):
  // com display no ar, a legenda corrida some.
  const displayAtivo = useMemo(
    () =>
      displays.find(
        (d) =>
          frame >= Math.round(d.deSegundo * fps) &&
          frame < Math.round(d.ateSegundo * fps)
      ),
    [frame, fps, displays]
  );

  const bloco = (somenteAtiva: boolean) => {
    if (!page) return null;
    // adendo 30: os DOIS gates, e de propósito. O por-página tira a ponta que
    // piscava nas bordas (a primeira frase da tese antes do pivô, a última e o
    // fecho "e da emissora B." depois); o per-frame continua cortando as duas páginas que só
    // ENCOSTAM na abertura do display e por isso são preservadas inteiras.
    // Juntos: zero duplicação, e nenhuma frase perdida além das já aceitas.
    if (displayAtivo || paginaEmDisplay) return null;
    // A frase inteira entra de uma vez, no instante em que a página aparece.
    // (Prender a entrada a CADA palavra fazia a última palavra de páginas
    // curtas nunca chegar a nascer — a página saía antes da vez dela.)
    // paginaSeca (onda 2): sem fade — a página aparece já formada, corte seco.
    const delayPagina = page.words[0].deFrame - qPagina;
    const entrada = paginaSeca ? {} : fadeUp(frame, fps, delayPagina, reels ? 18 : 8);
    // limites da página para as animações XL (entrada/saída dinâmicas)
    const proxPage = pages[iPage + 1];
    const fimPagina = proxPage
      ? proxPage.words[0].deFrame - qPagina
      : page.words[page.words.length - 1].ateFrame + Math.round(0.6 * fps);
    const framesNaPagina = frame - delayPagina;
    const framesParaSair = fimPagina - frame;
    return (
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: brand.safeMargins.bottom + bottomOffsetPx,
          paddingLeft: brand.safeMargins.sides,
          paddingRight: brand.safeMargins.sides,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "baseline",
            columnGap: gap,
            rowGap: Math.round(fontSizePx * 0.18),
            fontFamily: fontFamilyCss(capFont),
            fontWeight: capFont.weight,
            fontSize: fontSizePx,
            lineHeight: 1.12,
            textAlign: "center",
            paintOrder: "stroke",
            textTransform: caixaAlta ? "uppercase" : "none",
            letterSpacing: caixaAlta ? "-0.015em" : 0,
            ...entrada,
          }}
        >
          {page.words.map((w, i) => {
            // Janela do destaque em quadros: começa no quadro da palavra e vai
            // até o quadro da PRÓXIMA — o dourado não apaga nos silêncios, e
            // nenhuma palavra fica sem o seu quadro (ver legendas.ts).
            const iniF = w.deFrame - qOffset;
            const fimF = w.ateFrame - qOffset;
            // destaquePalavra=false (onda 2): karaoke desligado — nenhuma
            // palavra acende, a página é estática na cor text (6/6 na referência).
            const ativa = destaquePalavra && frame >= iniF && frame < fimF;
            const delay = iniF;

            // 0 antes de falar · 1 enquanto fala · decai em 5 frames depois
            // (sem isso a palavra "desliga" o destaque num pulo seco)
            const destaque = !destaquePalavra
              ? 0
              : frame < iniF
                ? 0
                : interpolate(frame, [fimF, fimF + 5], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });

            // mola com repique no modo reels: passa de 1.06 e volta (o "soco")
            const p = reels
              ? springPunch(frame, fps, delay)
              : springIn(frame, fps, delay);
            const pico = interpolate(p, [0, 1], [1, reels ? 1.06 : 1.04]);
            const escala = 1 + (pico - 1) * destaque;
            const giro = reels ? (i % 2 === 0 ? -1.2 : 1.2) * destaque : 0;

            const preenchida = !vazado || ativa;
            // nome de produto sai no itálico serifado da marca (ver palavrasAccent)
            const accent = ehAccent(w.text);
            // destaque (17/08): manuscrito, maior, dourado, translúcido — e SEM
            // contorno (stroke em traço de script fica sujo; a sombra segura).
            const xl = ehXL(w.text);
            const destaqueManuscrito = xl || ehDestaque(w.text);
            // Animações XL (adendo 2): ENTRADA desliza de lado com mola + pisca;
            // SAÍDA desliza/apaga nos últimos 4 quadros da página.
            let xlDeslizaX = 0;
            let xlOpacidade = 1;
            if (xl) {
              if (framesNaPagina >= 0 && framesNaPagina < 8) {
                const t = framesNaPagina / 8;
                const back = 1 + 1.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
                xlDeslizaX = -60 * (1 - back);
                const pisca = [0.25, 1, 0.4, 1, 0.75, 1];
                xlOpacidade = framesNaPagina < pisca.length ? pisca[framesNaPagina] : 1;
              }
              if (framesParaSair <= 4 && framesParaSair >= 0) {
                xlDeslizaX = 30 * (1 - framesParaSair / 4);
                xlOpacidade = Math.min(xlOpacidade, framesParaSair / 4);
              }
            }
            return (
              <span
                key={`${i}-${w.startMs}`}
                style={{
                  display: "inline-block",
                  ...(accent
                    ? {
                        fontFamily: fontFamilyCss(accentFont),
                        fontWeight: accentFont.weight,
                        fontStyle: accentFont.style ?? "italic",
                      }
                    : null),
                  ...(destaqueManuscrito
                    ? estiloDestaque.manuscrito
                      ? {
                          fontFamily: `'${estiloDestaque.family}', cursive`,
                          fontWeight: estiloDestaque.weight,
                          fontSize: Math.round(
                            fontSizePx * (xl ? estiloDestaque.escalaXL : estiloDestaque.escala)
                          ),
                          lineHeight: 1,
                        }
                      : {
                          // adendo 10: fonte da legenda, escala vem do estilo
                          // (1.0 = só COR muda — "dourado contraste chamativo")
                          fontSize: Math.round(
                            fontSizePx * (xl ? estiloDestaque.escalaXL : estiloDestaque.escala)
                          ),
                          lineHeight: 1,
                        }
                    : null),
                  // adendo 10 (17/08): destaque SEMPRE leva a cor do token —
                  // o código de cor é o próprio destaque (dourado = autoridade)
                  color: destaqueManuscrito
                    ? corDestaque
                    : preenchida
                      ? ativa
                        ? brand.colors.primary
                        : brand.colors.text
                      : "transparent",
                  // vazado: contorno na cor do texto (a letra fica oca).
                  // preenchido: contorno fino escuro só pra descolar do fundo.
                  WebkitTextStroke:
                    destaqueManuscrito && estiloDestaque.manuscrito
                      ? undefined
                      : preenchida
                        ? `1.5px ${brand.colors.bg}`
                        : `${strokePx}px ${brand.colors.text}`,
                  // sem véu, a sombra difusa é o ÚNICO garantidor de contraste
                  // (solução da referência, 6/6) — por isso mais forte.
                  textShadow: ativa
                    ? `0 0 18px ${brand.colors.primary}80, 0 4px 18px rgba(0,0,0,0.6)`
                    : veuLigado
                      ? "0 3px 14px rgba(0,0,0,0.62), 0 1px 4px rgba(0,0,0,0.5)"
                      : "0 3px 18px rgba(0,0,0,0.8), 0 1px 6px rgba(0,0,0,0.65), 0 0 3px rgba(0,0,0,0.5)",
                  opacity:
                    somenteAtiva && !ativa
                      ? 0
                      : destaqueManuscrito
                        ? estiloDestaque.opacidade * (xl ? xlOpacidade : 1)
                        : xl
                          ? xlOpacidade
                          : 1,
                  transform:
                    destaqueManuscrito && estiloDestaque.manuscrito
                      ? `translateX(${xl ? xlDeslizaX.toFixed(1) : 0}px) scale(${escala}) rotate(-2deg)`
                      : xl
                        ? `translateX(${xlDeslizaX.toFixed(1)}px) scale(${escala})`
                        : `scale(${escala}) rotate(${giro}deg)`,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  };

  // Recorte da pessoa: PNG-seq (à prova de decoder — o alfa de WebM morre fora
  // do libvpx) com fallback no <Video> para jobs legados. O sanduíche só monta
  // ENQUANTO existe textoAtras ativo: depois disso o recorte congelaria no
  // último quadro e descolaria do vídeo em movimento (fantasma).
  const textoAtrasAtivo = textoAtras.some((ta) => {
    const ini = Math.round(ta.deSegundo * fps);
    const fim = Math.round(ta.ateSegundo * fps);
    return frame >= ini && frame < fim;
  });
  // adendo 27: mais de uma janela de recorte. A sequência é escolhida pelo
  // quadro atual, com guarda nas DUAS pontas: sem o piso o índice fica ≤0 antes
  // de `deSegundo` (f0000.png → 404 → render quebrado); sem o teto o último
  // quadro de uma janela congela por cima da seguinte (o fantasma do adendo 4).
  const seqs = Array.isArray(cutoutSeq) ? cutoutSeq : cutoutSeq ? [cutoutSeq] : [];
  const seqAtiva = (() => {
    for (const s of seqs) {
      const ini = Math.round((s.deSegundo ?? 0) * fps);
      const idx = Math.floor(((frame - ini) / fps) * s.fps) + 1;
      if (idx >= 1 && idx <= s.frames) return { dir: s.dir, idx };
    }
    return null;
  })();
  const recorte = seqAtiva ? (
    <Img
      src={staticFile(`${seqAtiva.dir}/f${String(seqAtiva.idx).padStart(4, "0")}.png`)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  ) : cutoutSrc ? (
    <Video src={staticFile(cutoutSrc)} muted />
  ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.bg }}>
      {/* O efeito vai SÓ nesta camada: a legenda por cima continua nítida.
          O zoom (5%) é maior que o raio do desfoque, então a borda desfocada
          nunca aparece — fica coberta pelo que o zoom trouxe pra dentro. */}
      <AbsoluteFill
        style={{
          // blur e dessaturação COMPÕEM: um é pulso de corte, o outro é
          // marcação de voz, e podem cair no mesmo quadro sem se anular.
          // A legenda por cima fica de fora dos dois — e no caso do P&B isso
          // é regra, não acaso: dessaturação E cor de legenda são dois códigos
          // de locutor, e empilhar os dois é o que a R3 proíbe.
          filter:
            [
              forcaTransicao > 0
                ? `blur(${(forcaTransicao * transicaoBlurPx).toFixed(2)}px)`
                : null,
              dessaturado ? "saturate(0)" : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined,
          // os zooms MULTIPLICAM: o do corte é um pulso, o lento é uma deriva
          // contínua, o punch (17/08) é um salto que decai. Somar cancelaria.
          transform: `scale(${(
            (1 + forcaTransicao * transicaoZoom) * escalaZoom * escalaPunch
          ).toFixed(4)})`,
        }}
      >
        <OffthreadVideo src={staticFile(videoSrc)} />
        {/* TEXTO ATRÁS DA CABEÇA (adendo 3): o sanduíche vive DENTRO da camada
            transformada — texto e recorte recebem o MESMO zoom/punch do vídeo,
            senão a pessoa descolaria das próprias bordas. */}
        {textoAtras.map((ta, i) => {
          const ini = Math.round(ta.deSegundo * fps);
          const fim = Math.round(ta.ateSegundo * fps);
          if (frame < ini || frame >= fim) return null;
          const fIn = frame - ini;
          const fOut = fim - frame;
          // Anim CINÉTICA (adendo 6, referência CapCut do usuário): nada de
          // deslizar/piscar (USER_REJECTED) — fade + zoom suave na entrada,
          // DERIVA lenta de escala no meio (o texto respira), fade na saída.
          const vida = Math.max(1, fim - ini);
          let opac = 1;
          let esc = 1 + 0.025 * ((frame - ini) / vida); // deriva contínua
          if (fIn < 9) {
            const t = fIn / 9;
            const easeOut = 1 - Math.pow(1 - t, 3);
            opac = easeOut;
            esc *= 0.94 + 0.06 * easeOut;
          }
          if (fOut <= 5) {
            opac = Math.min(opac, fOut / 5);
          }
          // contorno proporcional ao corpo, o mais leve que a sans pesada
          // aguenta (regra da pesquisa: stroke grosso achata o glifo)
          const stroke = ta.strokePx ?? Math.max(4, Math.round(ta.fontSizePx / 40));
          const sombra3d = sombraExtrusao(ta.fontSizePx, [214, 210, 202], [134, 130, 122]);
          return (
            <AbsoluteFill
              key={`ta-${i}`}
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                // px sobre a ALTURA da composição — paddingTop em % o CSS mede
                // sobre a LARGURA, que foi o que jogou o texto longe da cabeça
                paddingTop: Math.round(ta.yPct * alturaComp),
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  // adendo 5: sans pesada quando configurada — serifa fina de
                  // contorno era o "feio" apontado na revisão e pela pesquisa
                  fontFamily: textoAtrasFonte
                    ? `"${textoAtrasFonte.family}", sans-serif`
                    : fontFamilyCss(brand.fonts.title),
                  fontWeight: 800,
                  fontSize: ta.fontSizePx,
                  lineHeight: 0.95,
                  textTransform: "uppercase",
                  textAlign: "center",
                  letterSpacing: ta.estilo === "3d" ? "0em" : "0.02em",
                  ...(ta.estilo === "3d"
                    ? // 3D: blocos SÓLIDOS opacos com lado extrudado — os
                      // frames de referência enviados em 17/08
                      {
                        color: brand.colors.text,
                        textShadow: sombra3d,
                      }
                    : ta.estilo === "solido"
                      ? // SÓLIDO semi-transparente com brilho leve (CapCut)
                        {
                          color: brand.colors.text,
                          textShadow: `0 0 ${Math.round(ta.fontSizePx * 0.16)}px rgba(255,248,235,0.38), 0 8px 40px rgba(0,0,0,0.35)`,
                        }
                      : // VAZADO: só contorno, com glow suave no traço
                        {
                          color: "transparent",
                          WebkitTextStroke: `${stroke}px ${brand.colors.text}`,
                          filter:
                            "drop-shadow(0 0 14px rgba(255,248,235,0.45)) drop-shadow(0 6px 26px rgba(0,0,0,0.35))",
                        }),
                  opacity: ta.estilo === "solido" ? opac * 0.82 : opac,
                  transform: `scale(${esc.toFixed(4)})`,
                  maxWidth: "96%",
                }}
              >
                {ta.texto}
              </div>
            </AbsoluteFill>
          );
        })}
        {/* pessoa por cima do texto — fecha o sanduíche */}
        {textoAtrasAtivo ? recorte : null}
      </AbsoluteFill>

      {/* clarão do punch-flash (17/08) — acima do vídeo, abaixo da legenda:
          o flash lava a cena mas o texto continua legível */}
      {flashOpacidade > 0 ? (
        <AbsoluteFill
          style={{ backgroundColor: "#FFFFFF", opacity: flashOpacidade, pointerEvents: "none" }}
        />
      ) : null}

      {/* USER_REJECTED 17/08: sem véu quando veu=false — a legibilidade vem
          da sombra reforçada no texto, como na referência (6/6 sem véu). */}
      {veuLigado ? (
        <AbsoluteFill style={{ background: veu, pointerEvents: "none" }} />
      ) : null}

      {/* PROVA SOCIAL (adendo 31) — cartões de perfil sincronizados com o nome.
          Ficam ACIMA do vídeo mas FORA da camada transformada dele: um print de
          interface não pode herdar blur, dessaturação nem zoom, senão o texto
          miúdo some. E ficam ABAIXO dos dois trilhos de texto, para nunca
          disputar a tela com legenda e display. */}
      {insertsAtivos.length ? (
        <AbsoluteFill
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 34,
            // topo do primeiro cartão vem do yPct — centralizar cobria o rosto
            paddingTop: Math.round(alturaComp * insertsAtivos[0].ins.yPct),
            pointerEvents: "none",
          }}
        >
          {insertsAtivos.map(({ ins, entrada, mov }, i) => {
            const escalaRec = ins.larguraPx / ins.recorte.w;
            const alturaRec = Math.round(ins.recorte.h * escalaRec);
            const opac = entrada;
            // ease-out cúbico: o objeto desacelera na chegada, que é o que faz
            // o olho prever onde ele vai parar. UM movimento só — a escala que
            // havia aqui mexia 6px numa peça de 930 e não se via (Chanel).
            const e = 1 - Math.pow(1 - mov, 3);
            return (
              <div
                key={`ins-${i}`}
                style={{
                  position: "relative",
                  width: ins.larguraPx,
                  borderRadius: 32,
                  overflow: "hidden",
                  // respiro embaixo do anel do avatar. Sem isto o círculo encosta
                  // na moldura e "aperta" — tinha ~3px embaixo contra ~20px do
                  // lado. A faixa usa a cor exata do painel do Instagram
                  // (#0B0E17, medida nos prints), então lê como parte do print.
                  background: "#0B0E17",
                  paddingBottom: Math.round(ins.larguraPx * 0.012),
                  border: `3px solid ${brand.colors.primary}`,
                  // só a sombra de CONTATO. O glow dourado de 60px era o acessório a mais:
                  // fazia o cartão flutuar em vez de assentar, e é o anti-padrão que a
                  // própria rubrica lista (sombra difusa sem contato).
                  boxShadow: "0 3px 9px rgba(0,0,0,0.35)",
                  opacity: opac,
                  transform: `translateY(${((1 - e) * 8).toFixed(1)}px)`,
                }}
              >
                {/* o recorte é feito aqui: janela com overflow + Img deslocada */}
                <div style={{ width: "100%", height: alturaRec, overflow: "hidden", position: "relative" }}>
                  <Img
                    src={staticFile(ins.src)}
                    style={{
                      position: "absolute",
                      // a imagem INTEIRA ampliada por escalaRec; o recorte é a
                      // janela do pai. Largura = arquivo inteiro × escala, não
                      // o container × escala — foi o que me cortou o cartão.
                      width: Math.round(ins.recorte.origW * escalaRec),
                      left: -Math.round(ins.recorte.x * escalaRec),
                      top: -Math.round(ins.recorte.y * escalaRec),
                    }}
                  />
                  {ins.recorte.mascaraDireitaY != null ? (
                    <div
                      style={{
                        position: "absolute",
                        background: "#0B0E17",
                        left: Math.round(285 * escalaRec),
                        right: 0,
                        top: Math.round((ins.recorte.mascaraDireitaY - ins.recorte.y) * escalaRec),
                        bottom: 0,
                      }}
                    />
                  ) : null}
                  {ins.recorte.mascaraY != null ? (
                    // tapa a bio, que entra no recorte junto com o pé do anel
                    <div
                      style={{
                        position: "absolute",
                        background: "#0B0E17",
                        left: Math.round(ins.recorte.mascaraX * escalaRec),
                        right: 0,
                        top: Math.round((ins.recorte.mascaraY - ins.recorte.y) * escalaRec),
                        bottom: 0,
                      }}
                    />
                  ) : null}
                </div>
                {ins.linha ? (
                  // SELO no canto, não faixa embaixo: a faixa somava 86px de
                  // altura e era exatamente o que empurrava o cartão para cima
                  // do rosto dela. Aqui ele ocupa o lugar do "..." do print,
                  // que não carrega informação nenhuma.
                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 22,
                      background: brand.colors.primary,
                      color: brand.colors.onPrimary,
                      fontFamily: textoAtrasFonte
                        ? `"${textoAtrasFonte.family}", sans-serif`
                        : fontFamilyCss(brand.fonts.title),
                      fontWeight: 800,
                      // 50px: o selo é RÓTULO, não manchete. A 68px ele ficava maior
                      // que o nome da pessoa e encostava no arroba — hierarquia invertida
                      // num cartão cujo trabalho é provar que a pessoa é real.
                      fontSize: 50,
                      letterSpacing: "0.03em",
                      lineHeight: 1,
                      borderRadius: 12,
                      padding: "10px 16px 12px",
                    }}
                  >
                    {ins.linha}
                  </div>
                ) : null}
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {/* A legenda SAI quando o cartão final entra. Sem isso a última frase
          fica visível como fantasma através do véu do cartão (95% opaco).
          E SAI enquanto o textoAtras vive (adendo 8, pedido do usuário): o
          gigante É a legenda daquele trecho — dois trilhos de texto nunca
          dividem a tela (mesma regra medida na referência).
          Adendo 29: por PÁGINA, não por quadro — recortar por quadro deixava a
          ponta da página piscando nas duas bordas da janela. */}
      {paginaEmTextoAtras ||
      paginaEmInsert ||
      (cartaoFinal && frame >= Math.round(cartaoFinal.deSegundo * fps))
        ? null
        : bloco(false)}

      {/* modo LEGADO (sem textoAtras): pessoa recortada por cima → a legenda
          inteira passa ATRÁS dela. Com textoAtras, o recorte já foi desenhado
          dentro da camada do vídeo e a legenda fica NA FRENTE. */}
      {textoAtras.length === 0 ? recorte : null}

      {/* e a palavra do momento volta por cima, pra não sumir atrás da mão */}
      {textoAtras.length === 0 && (cutoutSrc || cutoutSeq) && ativaNaFrente
        ? bloco(true)
        : null}

      {/* segundo trilho (onda 2): display caixa alta que constrói com a fala */}
      {displayAtivo ? (
        <Display {...{ brand, display: displayAtivo, fonte3d: textoAtrasFonte }} />
      ) : null}

      {/* SFX pontuais — sonorizar o RARO; virada de página fica muda (onda 2) */}
      {sfx.map((s, i) => (
        <Sequence key={`sfx-${i}`} from={Math.round(s.emSegundo * fps)}>
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}

      {/* trilha de fundo (17/08) — entra no "drop", loop, fades; voz protagonista */}
      {trilha ? (
        <Sequence from={Math.round(trilha.deSegundo * fps)}>
          <Audio
            src={staticFile(trilha.src)}
            loop
            volume={(f) => {
              const fadeInF = Math.max(1, Math.round((trilha.fadeInMs / 1000) * fps));
              const fadeOutF = Math.max(1, Math.round((trilha.fadeOutMs / 1000) * fps));
              const seqDur = Math.max(
                1,
                Math.round((durationSeconds - trilha.deSegundo) * fps)
              );
              return (
                trilha.volume *
                Math.min(1, f / fadeInF) *
                Math.min(1, Math.max(0, (seqDur - f) / fadeOutF))
              );
            }}
          />
        </Sequence>
      ) : null}

      {cartaoFinal ? <CartaoFinal {...{ brand, cartaoFinal, fontSizePx }} /> : null}
    </AbsoluteFill>
  );
};

/**
 * EXTRUSÃO 3D (adendos 6 e 9, 17/08): sombras empilhadas 1px a 1px para
 * baixo-esquerda = lado da letra, do tom claro (perto da face) ao escuro
 * (fundo), + sombra difusa de contato. Usada pelo textoAtras (lados cinza) e
 * pelo Display em estilo "3d" (lados dourado-escuros).
 */
const sombraExtrusao = (
  fontSizePx: number,
  claro: [number, number, number],
  escuro: [number, number, number],
  profundidadePct = 0.062
) => {
  // adendo 17: com extrusão RASA o volume não vem da profundidade — vem do
  // SOMBREADO. Passo de meio pixel (lado contínuo), rampa NÃO-LINEAR (escurece
  // rápido e estabiliza, como bisel real reflete), oclusão curta colada na
  // letra + queda discreta, e luz de aresta em dois níveis.
  const profundidade = Math.max(4, Math.round(fontSizePx * profundidadePct));
  const passos = profundidade * 2;
  const lados = Array.from({ length: passos }, (_, k) => {
    const d = (k + 1) / 2;
    const t = Math.pow(k / Math.max(1, passos - 1), 0.65);
    const c = claro.map((v, j) => Math.round(v + (escuro[j] - v) * t));
    return `${-d}px ${d}px 0 rgb(${c[0]},${c[1]},${c[2]})`;
  }).join(", ");
  // aresta final escura fecha o volume
  const fim = escuro.map((v) => Math.max(0, Math.round(v * 0.5)));
  const aresta = `${-(profundidade + 0.5)}px ${profundidade + 0.5}px 0 rgb(${fim[0]},${fim[1]},${fim[2]})`;
  // luz em dois níveis: fio duro + brilho suave logo abaixo (traço de pincel
  // chapado é o que fazia parecer decalque)
  const luz = `0.5px -0.5px 0 rgba(255,255,255,0.6), 1.5px -1.5px 2px rgba(255,255,255,0.22)`;
  // oclusão CURTA (senta a letra na cena) + queda ampla discreta
  const oclusao = `${-(profundidade + 1)}px ${profundidade + 2}px 4px rgba(0,0,0,0.5)`;
  const queda = `${-(profundidade + 4)}px ${profundidade + 9}px 14px rgba(0,0,0,0.32)`;
  return `${luz}, ${lados}, ${aresta}, ${oclusao}, ${queda}`;
};


/**
 * Display — o segundo trilho de texto (onda 2, 15/08/2026).
 *
 * Na referência (6/6 vídeos): caixa alta, cor única da família da marca,
 * constrói BLOCO A BLOCO sincronizado com a fala (pop de 2–4 quadros por
 * bloco), centralizado, e a legenda corrida some enquanto ele está no ar.
 * Sai em corte seco — quem marca a saída é a montagem, não um fade.
 */
const Display: React.FC<{
  brand: LegendaDinamicaProps["brand"];
  display: NonNullable<LegendaDinamicaProps["displays"]>[number];
  fonte3d: LegendaDinamicaProps["textoAtrasFonte"];
}> = ({ brand, display, fonte3d }) => {
  const frame = useCurrentFrame();
  const { fps, width: larguraComp } = useVideoConfig();
  const corDoToken = (t: "primary" | "text" | "accent") =>
    t === "primary" ? brand.colors.primary : t === "accent" ? brand.colors.accent : brand.colors.text;
  const cor = corDoToken(display.cor);
  const displayFont = brand.fonts.title;
  // lados da extrusão acompanham a FACE: dourado→dourado escuro, resto→cinza
  const tonsDoToken = (t: "primary" | "text" | "accent"): [number[], number[]] =>
    t === "primary"
      ? [
          [184, 146, 46],
          [110, 85, 24],
        ]
      : [
          [214, 210, 202],
          [134, 130, 122],
        ];
  // estilo "3d" (adendos 9 e 10): blocos com a extrusão do texto-atrás da intro;
  // os LADOS derivam da cor da face — dourado→lados dourado-escuros,
  // branco→lados cinza (iguais ao gigante da intro).
  const eh3d = display.estilo === "3d";
  // a extrusão escala com o CORPO REAL da linha (no modo fit cada linha tem o
  // seu) — em 96px fixo o lado ficava fino nas linhas grandes
  const sombraDe = (t: "primary" | "text" | "accent", fs: number) => {
    const [claro, escuro] = tonsDoToken(t);
    return sombraExtrusao(
      fs,
      claro as [number, number, number],
      escuro as [number, number, number],
      display.profundidade
    );
  };
  const sombraSerif = "0 4px 22px rgba(0,0,0,0.65), 0 1px 6px rgba(0,0,0,0.5)";
  const limpa = (t: string) =>
    t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  // FIT-TO-WIDTH por linha (adendo 11; exemplo ILUSTRATIVO:
  // "QUATRO LINHAS / CURTAS / ENCHENDO / A LARGURA"): cada
  // frase PREENCHE a largura útil — linha curta sai MAIOR para as bordas
  // alinharem com as longas. Inter 800 caps ≈ 0,6em/glifo; teto de 1,9× o
  // corpo base para linha muito curta não virar outdoor.
  // OPT-IN por display (`ajuste: "fit"`): o D1 foi aprovado no corpo fixo e
  // não se mexe em coisa aprovada. "fixo" = corpo único, com encolhimento de
  // segurança se alguma linha estourar a margem.
  const ehFit = eh3d && display.ajuste === "fit";
  const disponivel = larguraComp - 2 * (brand.safeMargins.sides + 30);
  // Largura REAL da linha em em: soma dos avanços medidos do woff2 (adendo 12)
  // + letterSpacing (-0,01em por vão). Caractere fora da tabela cai em 0,6.
  // fonte do display: a própria (adendo 14) ou a global do 3D
  const fonteUsada = display.fonte ?? fonte3d;
  const larguraEm = (texto: string) =>
    larguraEmDaLinha(texto, fonteUsada?.family ?? "Inter", -0.01, display.espacoPalavraEm);
  const fsFixo = eh3d
    ? Math.min(
        display.fontSizePx,
        ...display.blocos.map((b) => Math.floor(disponivel / larguraEm(b.texto)))
      )
    : display.fontSizePx;
  const fsLinha = (texto: string, escalaLinha = 1) => {
    const base = ehFit
      ? Math.min(
          // teto 2,0×: linha de 1-2 palavras curtíssimas não vira outdoor
          Math.round(display.fontSizePx * 2.0),
          Math.floor(disponivel / larguraEm(texto))
        )
      : fsFixo;
    return Math.round(base * escalaLinha);
  };

  /**
   * ENCAIXE DE LEGO (adendo 18): desloca a linha para que sua borda ESQUERDA
   * caia exatamente onde termina `aposTexto` na linha-alvo. Tudo em cima da
   * tabela de larguras MEDIDA da fonte — sem chute, e continua batendo se o
   * texto mudar. As duas linhas são centradas, então a conta é:
   *   x do alvo   = (largura - W_alvo)/2 + prefixo_em × fs_alvo
   *   x da minha  = (largura - W_minha)/2
   */
  /**
   * ENCAIXE DE PUZZLE (adendo 19): a frase ocupa exatamente o vão entre duas
   * âncoras do bloco-alvo — o CORPO dela deixa de ser escolhido e passa a ser
   * calculado. Devolve o corpo e o deslocamento em x.
   */
  const encaixe = (b: (typeof display.blocos)[number]) => {
    const ref = b.encaixarEntre;
    if (!ref) return null;
    const alvo = display.blocos[ref.bloco];
    if (!alvo) return null;
    const familia = fonteUsada?.family ?? "Inter";
    const fsAlvo = fsLinha(alvo.texto, alvo.escalaLinha);
    const xAlvo = (larguraComp - larguraEm(alvo.texto) * fsAlvo) / 2;
    // ancora ESQUERDA: tinta de onde COMECA a letra seguinte ao prefixo `de`
    const chDe = alvo.texto[ref.de.length] ?? "";
    const xDe =
      xAlvo +
      (larguraEm(ref.de) + tintaDoChar(chDe, familia)[0] - ref.puxaEsquerdaEm) * fsAlvo;
    // ancora DIREITA: tinta de onde TERMINA a ultima letra do prefixo `ate`
    const chAte = ref.ate[ref.ate.length - 1] ?? "";
    const xAte =
      xAlvo +
      (larguraEm(ref.ate.slice(0, -1)) + tintaDoChar(chAte, familia)[1]) * fsAlvo;
    const vao = xAte - xDe;
    if (vao <= 0) return null;
    // a MINHA largura tambem e de tinta a tinta (o T tem folga a esquerda, o
    // m a direita) — senao "encostar" fica sempre curto
    const meuIni = tintaDoChar(b.texto[0] ?? "", familia)[0];
    const meuFim =
      larguraEm(b.texto.slice(0, -1)) +
      tintaDoChar(b.texto[b.texto.length - 1] ?? "", familia)[1];
    const minhaTintaEm = meuFim - meuIni;
    // escalaLinha (adendo 21) encolhe a peça DEPOIS do encaixe: ela deixa
    // de preencher o vão inteiro e assenta dentro dele
    const fs = Math.round(((vao - 2 * ref.folgaEm * fsAlvo) / minhaTintaEm) * b.escalaLinha);
    // desloca para a TINTA (nao a caixa) cair na ancora + folga
    const xCentrado = (larguraComp - larguraEm(b.texto) * fs) / 2;
    const dx = Math.round(xDe + ref.folgaEm * fsAlvo - (xCentrado + meuIni * fs));
    return { fs, dx };
  };

  /**
   * Vão vertical medido na TINTA (adendo 21). A caixa da linha tem muito ar
   * acima e abaixo do desenho (ascendente/descendente); mexer em % do corpo
   * quase não movia o vão visível. Aqui a margem é resolvida para que a
   * distância entre a BASE da tinta da linha de cima e o TOPO da tinta desta
   * seja exatamente `espacoTintaEm` (aceita negativo = sobreposição real).
   */
  const margemDaLinha = (i: number, fsMinha: number) => {
    if (display.espacoTintaEm == null) {
      return Math.round(display.fontSizePx * display.espacoLinhaPct);
    }
    const familia = fonteUsada?.family ?? "Inter";
    const { ascent, descent } = metricasDaFonte(familia);
    const L = ehFit ? 1.0 : 1.06;
    // deslocamento da linha de base dentro da caixa (meia-entrelinha + ascent)
    const base = (L - (ascent - descent)) / 2 + ascent;
    const ant = display.blocos[i - 1];
    const puzzleAnt = encaixe(ant);
    const fsAnt = puzzleAnt ? puzzleAnt.fs : fsLinha(ant.texto, ant.escalaLinha);
    const [yMinAnt] = tintaVerticalDaLinha(ant.texto, familia);
    // adendo 22: o teto não é o ponto mais alto da MINHA linha inteira — é o
    // do trecho que a linha de cima realmente cobre (o risco do "b" e a
    // bolinha do "i"). Fora desse trecho, o que for alto não atrapalha.
    const eu = display.blocos[i];
    let yMaxMinha = tintaVerticalDaLinha(eu.texto, familia)[1];
    if (puzzleAnt) {
      const meuFs = fsLinha(eu.texto, eu.escalaLinha);
      const xEsqMinha = (larguraComp - larguraEm(eu.texto) * meuFs) / 2;
      const xEsqAnt = (larguraComp - larguraEm(ant.texto) * fsAnt) / 2 + puzzleAnt.dx;
      const x0 = (xEsqAnt - xEsqMinha) / meuFs;
      const x1 = (xEsqAnt + larguraEm(ant.texto) * fsAnt - xEsqMinha) / meuFs;
      yMaxMinha = obstaculoNoIntervalo(
        eu.texto,
        familia,
        x0,
        x1,
        -0.01,
        display.espacoPalavraEm
      ).topo;
    }
    const baseTintaAnt = (base - yMinAnt) * fsAnt; // do topo da caixa anterior
    const topoTintaMinha = (base - yMaxMinha) * fsMinha; // do topo da minha
    const alvo = display.espacoTintaEm * fsMinha;
    return Math.round(baseTintaAnt + alvo - fsAnt * L - topoTintaMinha);
  };

  const deslocarX = (b: (typeof display.blocos)[number]) => {
    const ref = b.alinharEsquerdaCom;
    if (!ref) return 0;
    const alvo = display.blocos[ref.bloco];
    if (!alvo) return 0;
    const fsAlvo = fsLinha(alvo.texto, alvo.escalaLinha);
    const fsMeu = fsLinha(b.texto, b.escalaLinha);
    const xAlvo =
      (larguraComp - larguraEm(alvo.texto) * fsAlvo) / 2 +
      larguraEm(ref.aposTexto) * fsAlvo;
    const xMeu = (larguraComp - larguraEm(b.texto) * fsMeu) / 2;
    return Math.round(xAlvo - xMeu);
  };

  return (
    <AbsoluteFill
      style={{
        // Ancorado embaixo, na faixa que a legenda corrida LIBERA quando o
        // display entra (os trilhos nunca coexistem). Centralizar na vertical
        // punha o texto em cima do rosto — o avatar é enquadrado em close.
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: brand.safeMargins.bottom + 400,
        paddingLeft: brand.safeMargins.sides + 30,
        paddingRight: brand.safeMargins.sides + 30,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // adendo 16: o vão entre linhas vira marginTop por bloco (aceita
          // negativo); aqui o gap fica zerado para não somar dois espaços
          rowGap: ehFit ? 0 : Math.round(display.fontSizePx * 0.16),
          textAlign: "center",
        }}
      >
        {display.blocos.map((b, i) => {
          const ini = Math.round(b.emSegundo * fps);
          if (frame < ini) return null;
          // pop curto: 3 quadros de escala 0,86→1 — a referência usa 2–4 quadros
          const p = Math.min(1, (frame - ini) / 3);
          const escala = 0.86 + 0.14 * (p * p * (3 - 2 * p));
          const puzzle = encaixe(b);
          const fs = puzzle ? puzzle.fs : fsLinha(b.texto, b.escalaLinha);
          const dx = puzzle ? puzzle.dx : deslocarX(b);
          // cor da FRASE (adendo 13) — sobrepõe a do display
          const tokenBloco = b.cor ?? display.cor;
          const corBloco = corDoToken(tokenBloco);
          const sombraBloco = eh3d ? sombraDe(tokenBloco, fs) : sombraSerif;
          return (
            <div
              key={`bloco-${i}`}
              style={{
                fontFamily:
                  eh3d && fonteUsada
                    ? `"${fonteUsada.family}", sans-serif`
                    : fontFamilyCss(displayFont),
                fontWeight: 800,
                fontSize: fs,
                lineHeight: ehFit ? 1.0 : 1.06,
                textTransform: display.caixa === "natural" ? "none" : "uppercase",
                wordSpacing: `${display.espacoPalavraEm}em`,
                letterSpacing: "-0.01em",
                // cada frase é UMA linha (pedido do usuário) — o Inter é mais
                // largo que a serifa e quebrava o "NÃO É [B]." do pivô
                whiteSpace: "nowrap",
                // vão entre linhas: por TINTA quando espacoTintaEm existe
                // (adendo 21), senão o antigo por caixa
                marginTop: ehFit && i > 0 ? margemDaLinha(i, fs) : 0,
                color: corBloco,
                textShadow: sombraBloco,
                transform: `translateX(${dx}px) scale(${escala.toFixed(3)})`,
              }}
            >
              {(b.douradas ?? []).length === 0
                ? b.texto
                : // adendo 10: palavras marcadas saem DOURADAS dentro do bloco
                  // branco (emissora A, emissora B) — com os lados da extrusão combinando
                  b.texto.split(" ").map((palavra, j, arr) => {
                    const dourada = (b.douradas ?? []).some((d) => limpa(d) === limpa(palavra));
                    return (
                      <span
                        key={j}
                        style={{
                          color: dourada ? brand.colors.primary : corBloco,
                          textShadow: dourada ? sombraDe("primary", fs) : sombraBloco,
                        }}
                      >
                        {palavra}
                        {j < arr.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Cartão de fechamento — entra uma vez, com fade, e FICA.
 *
 * Existe porque narração de produto às vezes termina sem chamada nenhuma. Só é
 * usado na variante de ANÚNCIO: no Reels orgânico a marca de referência não põe CTA.
 *
 * ⚠️ Nada de loop nem pulso: o guia de marca do job manda que "motion
 * acontece UMA vez e para". O véu cobre a tela inteira porque aqui o cartão
 * SUBSTITUI a cena — não disputa espaço com ela.
 */
const CartaoFinal: React.FC<{
  brand: LegendaDinamicaProps["brand"];
  cartaoFinal: NonNullable<LegendaDinamicaProps["cartaoFinal"]>;
  fontSizePx: number;
}> = ({ brand, cartaoFinal, fontSizePx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inicio = Math.round(cartaoFinal.deSegundo * fps);
  if (frame < inicio) return null;

  const tituloFont = brand.fonts.accent ?? brand.fonts.title;
  const linhaFont = brand.fonts.body;
  const entrada = fadeUp(frame, fps, inicio, 26);

  return (
    <AbsoluteFill
      style={{
        // véu na cor da marca: o cartão fecha a peça
        backgroundColor:
          cartaoFinal.opacidade >= 0.999
            ? brand.colors.bg
            : `${brand.colors.bg}${Math.round(cartaoFinal.opacidade * 255)
                .toString(16)
                .padStart(2, "0")
                .toUpperCase()}`,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: brand.safeMargins.sides + 40,
        paddingRight: brand.safeMargins.sides + 40,
        textAlign: "center",
        pointerEvents: "none",
        ...entrada,
      }}
    >
      <div
        style={{
          fontFamily: fontFamilyCss(tituloFont),
          fontWeight: tituloFont.weight,
          fontStyle: tituloFont.style ?? "italic",
          fontSize: Math.round(fontSizePx * 1.25),
          lineHeight: 1.1,
          color: brand.colors.primary,
        }}
      >
        {cartaoFinal.titulo}
      </div>
      <div
        style={{
          marginTop: Math.round(fontSizePx * 0.42),
          fontFamily: fontFamilyCss(linhaFont),
          fontWeight: linhaFont.weight,
          fontSize: Math.round(fontSizePx * 0.62),
          letterSpacing: "0.02em",
          lineHeight: 1.3,
          color: brand.colors.text,
        }}
      >
        {cartaoFinal.linha}
      </div>
      {cartaoFinal.linha2 ? (
        <div
          style={{
            marginTop: Math.round(fontSizePx * 0.3),
            fontFamily: fontFamilyCss(linhaFont),
            fontWeight: linhaFont.weight,
            fontSize: Math.round(fontSizePx * 0.42),
            letterSpacing: "0.03em",
            lineHeight: 1.35,
            color: brand.colors.textMuted,
          }}
        >
          {cartaoFinal.linha2}
        </div>
      ) : null}
      {brand.handle ? (
        <div
          style={{
            marginTop: Math.round(fontSizePx * (cartaoFinal.linha2 ? 0.6 : 0.9)),
            fontFamily: fontFamilyCss(linhaFont),
            fontWeight: "600",
            fontSize: Math.round(fontSizePx * 0.36),
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: brand.colors.textMuted,
          }}
        >
          {brand.handle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
