// Schemas de conteúdo dos templates. Cada template = brand + conteúdo.
import { z } from "zod";
import { brandSchema } from "./brand";

// QuotePost — post estático de feed (4:5) com tipografia editorial.
// O texto vai em "parts": trechos com gold=true saem na fonte accent (itálico) + cor primária.
export const quotePostSchema = z.object({
  brand: brandSchema,
  kicker: z.string().optional(), // rótulo pequeno em cima (ex.: "CONTEÚDO SEMANAL")
  parts: z
    .array(z.object({ text: z.string(), gold: z.boolean().default(false) }))
    .min(1),
  author: z.string().optional(), // default: brand.name
  footer: z.string().optional(), // default: brand.handle
});
export type QuotePostProps = z.infer<typeof quotePostSchema>;

// LegendaDinamica — queima legenda animada (palavra a palavra) SOBRE um vídeo pronto.
// Primeiro template da fábrica que INGERE vídeo em vez de gerar do zero.
// As legendas vêm de transcrição LOCAL (Whisper.cpp) — ver engine/scripts/transcribe.mjs.
export const captionWordSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
});

// ── onda 2 (15/08/2026) — segundo trilho de texto e camada de SFX ────────────
// Medido em 6 reels da referência (679 páginas): a legenda corrida NÃO tem
// karaoke e troca em corte seco; a ênfase mora num SEGUNDO trilho (display
// caixa alta que constrói bloco a bloco sincronizado com a fala) — e os dois
// trilhos nunca dividem a tela. O som pontua o RARO (display, insert, pivô),
// nunca a virada de página (p=0,20 no teste de nulo). Cores sempre por token
// da marca — a paleta da referência fica na pesquisa, não aqui.
export const displayBlocoSchema = z.object({
  texto: z.string(),
  emSegundo: z.number().min(0), // instante em que o bloco entra (colado na fala)
  // adendo 10 (17/08): palavras deste bloco que saem em DOURADO (token
  // primary) dentro de um display branco — ex.: o nome de uma emissora citada
  // como prova ("EMISSORA"). Comparação
  // sem acento/pontuação, como as demais listas de palavras.
  douradas: z.array(z.string()).default([]),
  // adendo 13 (17/08): cor da FRASE inteira, sobrepondo a cor do display —
  // é assim que o pivô fica "É TÉCNICA dourada / o resto branco" e a CTA
  // "TOCA EM branco / SAIBA MAIS dourado". Ausente = herda o display.
  cor: z.enum(["primary", "text", "accent"]).optional(),
  // adendo 18 (17/08): corpo desta frase relativo ao das outras (1 = igual).
  escalaLinha: z.number().min(0.2).max(2).default(1),
  // ENCAIXE DE LEGO: "minha borda esquerda começa onde termina `aposTexto` no
  // bloco `bloco`". A conta usa a tabela de larguras MEDIDA da fonte, então o
  // encaixe bate no pixel e continua batendo se o texto mudar.
  alinharEsquerdaCom: z
    .object({ bloco: z.number().int().min(0), aposTexto: z.string() })
    .nullable()
    .default(null),
  // adendo 19 (17/08): ENCAIXE DE PUZZLE entre duas âncoras do bloco-alvo —
  // "eu ocupo exatamente o vão entre onde termina `de` e onde termina `ate`".
  // O CORPO da frase passa a ser CALCULADO (não escolhido) para preencher o
  // vão; sobrepõe escalaLinha e alinharEsquerdaCom. Ex. da CTA:
  // {bloco:1, de:"Sai", ate:"Saiba mai"} = do "b" ao "s" final de "mais".
  encaixarEntre: z
    .object({
      bloco: z.number().int().min(0),
      // adendo 20: as ancoras falam em TINTA, nao em caixa.
      // `de`   = prefixo; a ancora e a tinta ESQUERDA da letra SEGUINTE
      // `ate`  = prefixo; a ancora e a tinta DIREITA da ULTIMA letra dele
      de: z.string(),
      ate: z.string(),
      // o "quase" do "quase encostar", em em
      folgaEm: z.number().min(0).max(0.2).default(0.015),
      // adendo 23: puxa a âncora ESQUERDA mais para a esquerda (em em da linha
      // alvo). A caixa do glifo vizinho é um retângulo, mas o desenho não —
      // no "b" a barriga fica embaixo e sobra vão livre na altura do T.
      // Com o lado direito travado, a frase CRESCE ao invés de só deslocar.
      puxaEsquerdaEm: z.number().min(0).max(0.5).default(0),
    })
    .nullable()
    .default(null),
});
export const displaySchema = z.object({
  deSegundo: z.number().min(0),
  ateSegundo: z.number().min(0),
  blocos: z.array(displayBlocoSchema).min(1).max(8),
  cor: z.enum(["primary", "text", "accent"]).default("primary"),
  fontSizePx: z.number().min(40).max(220).default(112),
  // "3d" (adendo 9, 17/08): mesmos blocos com a extrusão do texto-atrás gigante da intro, na
  // fonte do textoAtrasFonte, com lados escuros derivados da cor do display.
  // Default "serif" preserva D2 e todos os jobs antigos.
  estilo: z.enum(["serif", "3d"]).default("serif"),
  // "fit" (adendo 11; exemplo ilustrativo de fit-to-width): cada linha
  // PREENCHE a largura útil — linha curta sai maior, bordas alinhadas, pilha
  // justa. "fixo" = corpo único do fontSizePx (comportamento aprovado do D1).
  ajuste: z.enum(["fixo", "fit"]).default("fixo"),
  // adendo 14 (17/08): fonte SÓ deste display, sobrepondo a global do 3D —
  // é assim que a CTA sai em manuscrito e os pivôs continuam na sans pesada.
  // A família precisa estar medida em engine/src/lib/larguras.ts para o `fit`
  // alinhar as bordas.
  fonte: z
    .object({ family: z.string(), file: z.string(), weight: z.string() })
    .nullable()
    .default(null),
  // adendo 14: manuscrito em CAIXA ALTA deixa de parecer manuscrito (vira
  // fonte de marcador). "natural" preserva o texto como escrito.
  caixa: z.enum(["alta", "natural"]).default("alta"),
  // adendo 15: espaço entre PALAVRAS em em (negativo aproxima). Letra de mão
  // junta mais as palavras que uma sans. Entra também na conta da largura.
  espacoPalavraEm: z.number().min(-0.4).max(0.4).default(0),
  // profundidade da extrusão como fração do corpo (0.062 = o dos pivôs)
  profundidade: z.number().min(0.02).max(0.2).default(0.062),
  // adendo 16: vão entre LINHAS como fração do corpo base. Aceita NEGATIVO
  // (linhas se aproximam/sobrepõem, como letra de mão) — por isso vira
  // marginTop e não rowGap, que não aceita valor negativo.
  espacoLinhaPct: z.number().min(-0.3).max(0.4).default(0.12),
  // adendo 21 (18/08): vão entre a TINTA de uma linha e a da seguinte, em em.
  // É o que o olho mede. `espacoLinhaPct` mexia na CAIXA, que em manuscrito
  // tem muito ar — por isso -12% não movia quase nada. null = usa o antigo.
  espacoTintaEm: z.number().min(-0.3).max(0.5).nullable().default(null),
});
export const sfxEventoSchema = z.object({
  src: z.string(), // relativo a assets\ (publicDir); procedência SEMPRE limpa
  emSegundo: z.number().min(0),
  volume: z.number().min(0).max(2).default(1),
});

// uma janela de recorte da pessoa (PNG-seq com alfa)
const cutoutSeqItemSchema = z.object({
  dir: z.string(),
  fps: z.number().min(1).max(120),
  frames: z.number().int().min(1),
  // em que segundo da COMPOSIÇÃO o f0001.png cai. 0 = comportamento antigo.
  deSegundo: z.number().min(0).default(0),
});

export const legendaDinamicaSchema = z.object({
  brand: brandSchema,
  // caminho do vídeo RELATIVO a assets\ (publicDir) — ex.: "minha-marca/video/peca.mp4"
  videoSrc: z.string(),
  captions: z.array(captionWordSchema).min(1),
  durationSeconds: z.number().min(1).max(600),
  wordsPerPage: z.number().min(1).max(6).default(4),
  fontSizePx: z.number().min(30).max(160).default(76),
  // sobe a legenda ACIMA da margem de segurança da marca.
  // Reels/Reels Ads: os 670px de baixo (35%) são da UI do Instagram — curtir,
  // comentar, som, legenda do post e o botão de CTA. Nada de texto ali.
  // safeMargins.bottom (320) + 360 = 680px → passa da linha com folga.
  // Teto de 1400 (com safeMargins.bottom 320 = 1720px do rodapé) porque às
  // vezes a legenda tem que subir MUITO pra não cobrir o assunto do vídeo —
  // num vídeo real o assunto do quadro ocupava até 1060px do rodapé.
  bottomOffsetPx: z.number().min(0).max(1400).default(360),
  // "vazado" = palavra ainda não falada fica SÓ com o contorno (o vídeo aparece
  // dentro da letra); a que está sendo falada preenche na cor primary.
  estiloLetra: z.enum(["solido", "vazado"]).default("vazado"),
  // agito da animação: "reels" = entrada com pulo + soco na ativa.
  intensidade: z.enum(["contido", "reels"]).default("reels"),
  // contorno FINO é o que dá o look "ECOSSISTEMA" (letra oca, elegante).
  strokePx: z.number().min(1).max(8).default(2),
  // maiúscula + espaçamento apertado = cara de título display, como a referência.
  caixaAlta: z.boolean().default(false),
  // Ajuste fino de sincronia, em milissegundos. Positivo = ADIANTA a legenda.
  // Medido em 21/07 (correlação fluxo espectral x marcações): o Whisper acerta
  // o instante da fala com 0ms de erro. O "atraso" que se sente é perceptivo —
  // texto que entra junto com a sílaba parece atrasado porque o olho precisa
  // chegar nele. Por isso o padrão adianta de propósito.
  offsetMs: z.number().min(-1000).max(1000).default(100),
  // Quanto a FRASE entra antes da primeira palavra dela (soma com offsetMs).
  // Separado de propósito: a frase aparece cedo pra dar tempo de ler, e o
  // dourado continua colado na voz.
  antecipaPaginaMs: z.number().min(0).max(800).default(200),
  // vídeo da PESSOA recortada (fundo transparente, WebM VP9 alpha), relativo a
  // assets\. Quando existe, é desenhado POR CIMA da legenda → o texto passa
  // atrás dela. Gerado por engine\scripts\cutout-pessoa.mjs.
  // Instantes (em SEGUNDOS) dos cortes do vídeo. Em cada um o template dá um
  // "respiro" visual — desfoque + zoom leve que sobe e desce — pra o corte
  // seco não brigar com o som de transição. Achar os cortes com:
  //   ffmpeg -i X -vf "select='gt(scene,0.25)',showinfo" -f null -
  transicoes: z.array(z.number()).default([]),
  // duração TOTAL do efeito (metade antes do corte, metade depois)
  transicaoMs: z.number().min(80).max(1200).default(360),
  transicaoBlurPx: z.number().min(0).max(40).default(14),
  transicaoZoom: z.number().min(0).max(0.3).default(0.05),
  cutoutSrc: z.string().optional(),
  // Recorte como SEQUÊNCIA DE PNG (17/08): o alfa de WebM VP9 só existe no
  // decoder libvpx — o extrator do Remotion e o <video> do render ignoram e o
  // recorte saía INVISÍVEL (provado por diff de pixels = 0). PNG com alfa não
  // depende de decoder nenhum. dir relativo ao publicDir, arquivos f0001.png…
  // adendo 27 (18/08): virou LISTA para aceitar mais de uma janela de texto-atrás
  // (FRASE-GANCHO A na intro + FRASE-GANCHO B em 7,49s). `deSegundo` diz em que
  // segundo da composição o f0001.png cai — sem isso o índice satura e cola o
  // último quadro da janela 1 por cima da janela 2 (fantasma). Objeto único
  // continua válido (= deSegundo 0), para não quebrar job antigo.
  cutoutSeq: z
    .union([cutoutSeqItemSchema, z.array(cutoutSeqItemSchema)])
    .nullable()
    .default(null),
  // com o recorte ligado, redesenha SÓ a palavra falada acima da pessoa, pra
  // ela nunca ficar escondida atrás da mão (legibilidade de anúncio pago).
  ativaNaFrente: z.boolean().default(true),

  // Palavras que saem na fonte `accent` da marca (itálico serifado, quando a
  // marca tem). Existe porque num job real o ITÁLICO era a assinatura
  // tipográfica de NOME DE PRODUTO — a identidade daquela marca escrevia os nomes assim.
  // Comparação é sem acento e sem pontuação, então "Nome" casa com "Nome,".
  palavrasAccent: z.array(z.string()).default([]),

  // Cartão de fechamento, nos últimos segundos. Existe porque narração de
  // produto às vezes acaba sem chamada nenhuma (num vídeo real a locução
  // termina numa exclamação de fecho e pronto). Só aparece na variante de ANÚNCIO —
  // no Reels orgânico a marca de referência não usa CTA (os reels dela não têm).
  // ⚠️ O guia de marca do job manda "motion acontece UMA vez e para":
  // o cartão entra com um fade e fica. Nada de loop nem de pulso.
  cartaoFinal: z
    .object({
      titulo: z.string(), // sai na fonte accent (itálico), se a marca tiver
      linha: z.string(),
      // 3ª linha, menor — para CONDIÇÃO de oferta (mínimo, limite de vagas).
      // Existe porque omitir a condição é que seria promessa falsa.
      linha2: z.string().optional(),
      deSegundo: z.number().min(0), // instante em que entra
      // 0.95 deixa o último quadro aparecer de leve atrás (bonito quando a cena
      // é escura). Use 1 quando o vídeo tiver TARJA CLARA queimada: ela vaza
      // pelo véu e vira fantasma — visto num vídeo real da fábrica.
      opacidade: z.number().min(0.5).max(1).default(0.95),
    })
    .optional(),

  // Aproximação lenta num TRECHO do vídeo. Serve pra trecho onde a câmera fica
  // parada: a Meta recomenda "aprimorar com movimento — inclusive adicionar
  // movimento a imagens estáticas" (art. 304846), e tempo de visualização e
  // retenção são sinais que o Instagram nomeia oficialmente.
  // Sempre >= 1.0: aproximar corta pra dentro; afastar mostraria borda vazia.
  // Uma vez e para — nada de loop (o guia de marca do job proíbe pulso perpétuo).
  zoomLento: z
    .object({
      deSegundo: z.number().min(0),
      ateSegundo: z.number().min(0),
      ate: z.number().min(1).max(1.3).default(1.06),
    })
    .optional(),

  // Trechos em PRETO E BRANCO. Nasceu da R3 do corpus de referência (15/08/2026): o
  // aparte dessaturado marca TROCA DE INSTÂNCIA DE VOZ — o cético, o
  // espectador, a ironia, o pensamento intrusivo. Medido em 8 de 8 ocorrências,
  // zero decorativas, duração observada de 0,6 s a 4,0 s.
  //
  // ⚠️ É SINTAXE, NÃO AMBIENTAÇÃO. Não use como "estilo de trecho" — no corpus
  // ele sempre diz quem está falando. E não empilhe com cor de legenda por
  // locutor: ou um código, ou o outro, nunca os dois.
  //
  // Entrada e saída SECAS de propósito: não há rampa. O efeito existe para
  // anunciar uma fronteira, e suavizar a fronteira é apagar o que ele faz.
  //
  // Vazio = comportamento inalterado. Nenhuma marca existente é afetada.
  dessaturar: z
    .array(
      z.object({
        deSegundo: z.number().min(0),
        ateSegundo: z.number().min(0),
      })
    )
    .default([]),

  // ── onda 2 (15/08/2026) — o corpus de referência derrubou dois defaults ────
  // destaquePalavra=false desliga o karaoke: a página inteira fica na cor text,
  // sem palavra acesa. Na referência o karaoke NÃO existe na legenda corrida
  // (6/6 vídeos) — a ênfase mora no display. Default true preserva os jobs
  // antigos (jobs v1) byte a byte.
  destaquePalavra: z.boolean().default(true),
  // paginaSeca=true tira o fade de entrada da página: ela aparece formada,
  // troca em corte seco — 679 páginas medidas, 6/6 vídeos assim.
  paginaSeca: z.boolean().default(false),
  // Segundo trilho de texto: display caixa alta que constrói bloco a bloco
  // sincronizado com a fala. Enquanto um display está ativo a legenda corrida
  // SOME (na referência os dois trilhos nunca dividem a tela).
  displays: z.array(displaySchema).default([]),
  // Camada de SFX: eventos pontuais ancorados no tempo. Regra da referência:
  // sonorizar o RARO (display, insert, pivô) — nunca virada de página.
  sfx: z.array(sfxEventoSchema).default([]),
  // Punch-flash (17/08/2026, "ritmo dinâmico" da intro): zoom instantâneo na
  // camada do VÍDEO "como flash de câmera" — salta para `escala` no instante e
  // decai a 1,0 em voltaMs (ease-out), com clarão branco de ~4 quadros.
  // ⚠️ O "sem zoom" de 12/08 (USER_REJECTED) valia para os zooms LENTOS do
  // avatar; a instrução de 17/08 pede zoom-flash pontuado e VENCE por ser mais
  // nova e específica. Default [] preserva todos os renders anteriores.
  punches: z
    .array(
      z.object({
        emSegundo: z.number().min(0),
        escala: z.number().min(1).max(1.5).default(1.08),
        voltaMs: z.number().min(80).max(2000).default(450),
        flash: z.number().min(0).max(1).default(0.65),
      })
    )
    .default([]),
  // Ajuste do usuário (17/08, adendo 2): o zoom só APROXIMA — cada punch salta
  // para a escala e SEGURA (escadinha visual); em punchesResetSegundo volta a
  // 1,0 de uma vez (a liberação, junto com o drop da trilha). null = comporta-
  // mento antigo (decai em voltaMs).
  punchesResetSegundo: z.number().min(0).nullable().default(null),
  // Trilha de fundo (17/08): entra em deSegundo (na peça 1, no 8,80s em que o
  // riser resolve — o "drop"), com loop e fades. Volume baixo: voz protagonista.
  trilha: z
    .object({
      src: z.string(),
      deSegundo: z.number().min(0).default(0),
      volume: z.number().min(0).max(1).default(0.04),
      fadeInMs: z.number().min(0).max(5000).default(300),
      fadeOutMs: z.number().min(0).max(8000).default(1500),
    })
    .nullable()
    .default(null),
  // Palavras de DESTAQUE — pedido do usuário (17/08/2026): palavras-chave do
  // roteiro saem MAIORES (dentro da margem), em manuscrito legível, com cor e
  // transparência visível. O som da entrada (hit de papel) vai pela prop `sfx`
  // — o montador do job gera os eventos nos tempos das palavras.
  // Comparação sem acento/pontuação, como palavrasAccent.
  palavrasDestaque: z.array(z.string()).default([]),
  // Nível XL (adendo 2, 17/08): frase-chave AINDA maior e com entrada/saída
  // dinâmicas — desliza de lado com mola + pisca na entrada; desliza/apaga nos
  // últimos quadros da página. Só as XL animam (o manuscrito normal é estático).
  palavrasDestaqueXL: z.array(z.string()).default([]),
  estiloDestaque: z
    .object({
      // manuscrito=false (adendo 3, USER_REJECTED do Caveat): destaque usa a
      // FONTE DA LEGENDA, na COR normal do texto — só o tamanho aumenta.
      manuscrito: z.boolean().default(true),
      family: z.string().default("Caveat"),
      file: z.string().default("demo/fonts/caveat-700.woff2"),
      weight: z.string().default("700"),
      escala: z.number().min(1).max(2).default(1.35),
      escalaXL: z.number().min(1).max(2.2).default(1.7),
      cor: z.enum(["primary", "accent", "text"]).default("primary"),
      // "transparente mas visível" — palavras dele
      opacidade: z.number().min(0.3).max(1).default(0.88),
    })
    .default({
      manuscrito: true,
      family: "Caveat",
      file: "demo/fonts/caveat-700.woff2",
      weight: "700",
      escala: 1.35,
      escalaXL: 1.7,
      cor: "primary",
      opacidade: 0.88,
    }),
  // TEXTO ATRÁS DA CABEÇA (adendo 3, 17/08): frase GRANDE e VAZADA renderizada
  // ENTRE o vídeo e o recorte da pessoa (cutoutSrc) — o sanduíche de 3 camadas
  // do efeito clássico. A legenda normal fica NA FRENTE quando textoAtras é
  // usado (o modo legado cutout+legenda-atrás continua valendo sem textoAtras).
  // Adendo 4 (17/08): o efeito só LÊ quando a cabeça cobre ~1/3 do bloco de
  // texto — sobreposição zero foi o bug da 1ª versão. yPct é o TOPO do bloco
  // como fração da ALTURA da composição (a 1ª versão usava paddingTop em %,
  // que o CSS mede sobre a LARGURA — outra fonte do erro de posição).
  textoAtras: z
    .array(
      z.object({
        texto: z.string(),
        deSegundo: z.number().min(0),
        ateSegundo: z.number().min(0),
        yPct: z.number().min(0).max(1).default(0.13), // topo do bloco ÷ altura
        fontSizePx: z.number().min(60).max(320).default(230),
        // vazado = só contorno · solido = preenchido translúcido · 3d = SÓLIDO
        // opaco com extrusão (blocos físicos na cena — frames de referência
        // enviados em 17/08, estilo CapCut "text behind")
        estilo: z.enum(["vazado", "solido", "3d"]).default("vazado"),
        // contorno do vazado; ausente = proporcional (fontSize/40, mín. 4)
        strokePx: z.number().min(1).max(20).optional(),
      })
    )
    .default([]),
  // INSERTS de prova social (adendo 31, 18/08): print de perfil de rede social
  // entrando sincronizado com a menção do nome na fala.
  //
  // O print entra RECORTADO por CSS (o arquivo original fica intacto no disco):
  // só a faixa do cabeçalho — avatar, arroba, selo e a linha de seguidores —
  // porque print inteiro reduzido não se lê. A medição que motivou isto: num
  // print de 591px o arroba tem 30px e o número 20px; só ampliando a faixa para
  // a largura útil do anúncio (1,6×) o arroba chega ao piso de 48px que a
  // pesquisa dá como mínimo para vídeo vertical.
  //
  // `linha` é texto REDIGITADO em tipografia da marca, para o que o print não
  // diz (ex.: "EMISSORA X"). Repetir aqui um dado que já está no print recria a
  // duplicação de texto que o adendo 30 foi tirar — deixe null nesse caso.
  inserts: z
    .array(
      z.object({
        src: z.string(), // relativo a assets/ (publicDir)
        deSegundo: z.number().min(0),
        ateSegundo: z.number().min(0),
        // faixa do print de ORIGEM a mostrar, em píxeis do arquivo.
        // `origW` é a largura do arquivo inteiro — sem ela não dá para saber
        // quanto ampliar a <Img> (a conta é origW/w, não w/largura do cartão;
        // errar isso escala a imagem 1,6x demais e a janela mostra só o canto).
        recorte: z.object({
          x: z.number().min(0).default(0),
          y: z.number().min(0),
          w: z.number().min(1),
          h: z.number().min(1),
          origW: z.number().min(1),
          // y (na origem) a partir do qual a coluna à DIREITA do avatar é
          // tapada com a cor do painel. O anel do avatar desce mais que o bloco
          // de estatísticas; para mostrar o círculo inteiro o recorte precisa ir
          // além, e aí entra a bio cortada no meio. A máscara resolve os dois.
          mascaraY: z.number().min(0).nullable().default(null),
          mascaraX: z.number().min(0).default(285),
          // segunda máscara, LATERAL: quando o avatar é tão grande que o anel
          // desce ALÉM do início da bio (caso medido num print real), mascarar só abaixo do
          // anel não alcança a linha que está ao lado dele.
          mascaraDireitaY: z.number().min(0).nullable().default(null),
        }),
        // largura do cartão na tela; a altura sai da proporção do recorte
        larguraPx: z.number().min(200).max(1015).default(950),
        // empilhamento quando dois cartões dividem a tela (0 = de cima)
        ordem: z.number().int().min(0).default(0),
        // topo do cartão ÷ altura. Default baixo de propósito: em 950px de
        // largura o cartão tem ~362px de altura e, centralizado, cobre o rosto
        // de quem fala — o que a pesquisa de anúncio vertical manda evitar.
        yPct: z.number().min(0).max(1).default(0.46),
        // texto próprio embaixo do print; null = cartão só com o print
        linha: z.string().nullable().default(null),
      })
    )
    .default([]),
  // Fonte do textoAtras (adendo 5, 17/08): a pesquisa cravou que vazado pede
  // sans PESADA — "quanto mais grosso o glifo, mais contorno aguenta"; serifa
  // fina de contorno é o anti-padrão (foi o "feio" do primeiro still).
  // null = cai na fonte title da marca (comportamento antigo).
  textoAtrasFonte: z
    .object({
      family: z.string(),
      file: z.string(),
      weight: z.string(),
    })
    .nullable()
    .default(null),
  // Paginação POR FRASE — USER_PREFERENCE (17/08/2026): "estruturar a
  // legenda por frase completa sem quebrar, conforme o contexto e fluidez da
  // fala". Quando true, ignora wordsPerPage e deixa a PONTUAÇÃO da fala fechar
  // página (teto de segurança: 14 palavras / 64 chars / 5s, para frase-rio não
  // virar parágrafo na tela). A referência usa chunk curto; preferência do dono
  // vence referência.
  porFrase: z.boolean().default(false),
  // Véu de legibilidade atrás da legenda (degradê na cor bg da marca).
  // USER_REJECTED (17/08/2026): "esse véu eu não gostei, prefiro sem"
  // — sobre cena clara um degradê em verde-escuro de marca mancha a metade de baixo.
  // A referência também não usa (6/6: sombra difusa no texto, nada atrás).
  // Default true SÓ para não mudar renders antigos; job novo deve passar false.
  veu: z.boolean().default(true),
});
export type LegendaDinamicaProps = z.infer<typeof legendaDinamicaSchema>;

// ProvaSocial — sequência de retratos REAIS para batida de prova social.
//
// ⚠️ Por que fotos reais e não geração: geradores de imagem recusam
// prompt com pessoa pública real (`ip_detected`), e prova social só funciona se
// o rosto for RECONHECÍVEL — um rosto sintético é menos convincente, não mais.
// A pessoa NÃO se move; quem se move é a câmera (aproximação lenta). É prática
// editorial padrão, não síntese de pessoa real.
export const provaSocialSchema = z.object({
  brand: brandSchema,
  // cada retrato: caminho RELATIVO a assets\ (publicDir) + o nome que aparece
  retratos: z
    .array(z.object({ foto: z.string(), nome: z.string() }))
    .min(1)
    .max(8),
  durationSeconds: z.number().min(2).max(60),
  // preto e branco alinha com a linguagem da landing do job
  pretoEBranco: z.boolean().default(true),
  // aproximação lenta ao longo de cada card (1.0 = parado)
  zoomFinal: z.number().min(1).max(1.3).default(1.05),
  // o nome fica no TERÇO SUPERIOR de propósito: dos 680px do rodapé pra baixo é
  // onde a legenda queimada mora (ver legendaDinamicaSchema.bottomOffsetPx).
  nomeTopoPx: z.number().min(200).max(1000).default(560),
  nomeFontSizePx: z.number().min(40).max(120).default(72),
  // atraso do nome dentro do card, pra ele não competir com o corte
  nomeDelayMs: z.number().min(0).max(800).default(150),
});
export type ProvaSocialProps = z.infer<typeof provaSocialSchema>;

export const dataCardSchema = z.object({
  brand: brandSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  data: z.discriminatedUnion("kind", [
    // Número grande animado (contador)
    z.object({
      kind: z.literal("bigNumber"),
      value: z.string(), // ex.: "87%", "R$ 12.400", "3,2x"
      label: z.string(), // frase curta embaixo do número
    }),
    // Gráfico de barras (2 a 6 barras)
    z.object({
      kind: z.literal("barChart"),
      bars: z
        .array(z.object({ label: z.string(), value: z.number() }))
        .min(2)
        .max(6),
      unit: z.string().optional(), // ex.: "%", "R$" — mostrado junto do valor
    }),
  ]),
  cta: z.string().optional(), // sobrepõe o CTA padrão da marca
  durationSeconds: z.number().min(6).max(30).default(10),
});
export type DataCardProps = z.infer<typeof dataCardSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// FASE 7 — composições novas. Daqui pra baixo é SÓ ADIÇÃO: os schemas acima
// não mudam (são contrato com os jobs existentes).
// ═══════════════════════════════════════════════════════════════════════════

// SafeZoneOverlay — zonas de segurança Meta 9:16 desenhadas como overlay.
// Fundo TRANSPARENTE de propósito: é peça de CONFERÊNCIA (sobrepor num render
// ou no editor), não peça final. Percentuais da Meta: topo 14%, base 35%,
// laterais 6% — em 1080x1920 as linhas caem em y=269, y=1248, x=65 e x=1015.
export const safeZoneOverlaySchema = z.object({
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  mostrarRotulos: z.boolean().default(true),
});
export type SafeZoneOverlayProps = z.infer<typeof safeZoneOverlaySchema>;

// CTAEndcard — cartão final de CTA pra fechar qualquer peça (anúncio ou orgânico).
export const ctaEndcardSchema = z.object({
  brand: brandSchema,
  ctaText: z.string().optional(), // default: brand.cta.text
  subTexto: z.string().optional(), // linha de apoio (condição da oferta, prazo)
  durationSeconds: z.number().min(2).max(30).default(4),
});
export type CTAEndcardProps = z.infer<typeof ctaEndcardSchema>;

// Comparison — A vs B com itens em stagger e destaque no vencedor.
export const comparisonLadoSchema = z.object({
  titulo: z.string(),
  itens: z.array(z.string()).min(1).max(6),
});
export const comparisonSchema = z.object({
  brand: brandSchema,
  titulo: z.string(),
  ladoA: comparisonLadoSchema,
  ladoB: comparisonLadoSchema,
  // "empilhado" = A em cima, B embaixo (o que melhor usa o 9:16);
  // "colunas" = lado a lado — só pra itens CURTOS, senão o texto espreme.
  layout: z.enum(["empilhado", "colunas"]).default("empilhado"),
  // lado que ganha borda + título na cor primary; null = comparação neutra
  vencedor: z.enum(["A", "B"]).nullable().default(null),
  durationSeconds: z.number().min(4).max(30).default(8),
});
export type ComparisonProps = z.infer<typeof comparisonSchema>;

// KineticTypography — frase que entra palavra a palavra no timing dos props.
export const kineticWordSchema = captionWordSchema.extend({
  emphasis: z.boolean().default(false), // cor primary + escala maior
});
export const kineticTypographySchema = z.object({
  brand: brandSchema,
  words: z.array(kineticWordSchema).min(1),
  fontSizePx: z.number().min(40).max(200).default(110),
  caixaAlta: z.boolean().default(true),
  // respiro depois da última palavra, pra frase não sumir num corte seco
  caudaMs: z.number().min(0).max(5000).default(800),
  // default: (última palavra + caudaMs) — ver calculateMetadata no Root
  durationSeconds: z.number().min(1).max(120).optional(),
});
export type KineticTypographyProps = z.infer<typeof kineticTypographySchema>;

// WhatsAppMockup — conversa de WhatsApp (visual dark) com bolhas em sequência.
// Não usa brand: a identidade aqui é a do PRÓPRIO WhatsApp — é isso que dá a
// leitura instantânea de "print de conversa" no feed.
export const whatsMensagemSchema = z.object({
  texto: z.string(),
  lado: z.enum(["in", "out"]), // in = recebida (esquerda) · out = enviada (direita)
  delayMs: z.number().min(0), // instante ABSOLUTO (ms do início) em que a bolha entra
});
export const whatsAppMockupSchema = z.object({
  mensagens: z.array(whatsMensagemSchema).min(1).max(12),
  nomeContato: z.string(),
  avatar: z.string().nullable().default(null), // relativo a assets\; null = círculo com a inicial
  horario: z.string().default("09:41"), // carimbo das bolhas e do header
  // som de notificação por bolha — DESLIGADO por padrão (a peça normalmente já tem trilha)
  som: z.boolean().default(false),
  somSrc: z.string().optional(), // áudio relativo a assets\; som=true sem somSrc fica mudo
  // default: última bolha + 2,5s — ver calculateMetadata no Root
  durationSeconds: z.number().min(1).max(120).optional(),
});
export type WhatsAppMockupProps = z.infer<typeof whatsAppMockupSchema>;

// DataChart — barras OU linha, até 8 pontos, escala automática e contadores.
// (O DataCard já tem barras 2–6 DENTRO da narrativa "dado da semana"; este é o
// gráfico sozinho, parametrizado, pra entrar em qualquer edição.)
export const dataChartPontoSchema = z.object({
  label: z.string(),
  valor: z.number(),
});
export const dataChartSchema = z.object({
  brand: brandSchema,
  tipo: z.enum(["barras", "linha"]),
  pontos: z.array(dataChartPontoSchema).min(2).max(8),
  titulo: z.string().optional(),
  subtitle: z.string().optional(),
  unit: z.string().optional(), // ex.: "%", "R$" — mostrado junto do valor
  durationSeconds: z.number().min(4).max(30).default(8),
});
export type DataChartProps = z.infer<typeof dataChartSchema>;

// VisualStorytelling — sequência de cenas com cross-fade + zoom lento.
// Cena de imagem pode levar texto por cima; a legibilidade vem de véu na cor
// `bg` da MARCA (tarja preta é proibida no projeto). A duração total é a soma
// dos duracaoMs — o cross-fade SOBREPÕE cenas, não desloca (ver Root).
export const cenaSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("imagem"),
    src: z.string(), // relativo a assets\ (publicDir)
    texto: z.string().optional(),
    duracaoMs: z.number().min(500).max(30000),
  }),
  z.object({
    tipo: z.literal("texto"),
    texto: z.string(),
    duracaoMs: z.number().min(500).max(30000),
  }),
]);
export const visualStorytellingSchema = z.object({
  brand: brandSchema,
  cenas: z.array(cenaSchema).min(1).max(12),
  // sobreposição do cross-fade entre cenas (0 = corte seco)
  transicaoMs: z.number().min(0).max(2000).default(500),
});
export type VisualStorytellingProps = z.infer<typeof visualStorytellingSchema>;

// CaptionOverlay — legenda dinâmica com FUNDO TRANSPARENTE, pra sobrepor num
// editor externo. Mesma linguagem da LegendaDinamica, mas SEM OffthreadVideo e
// SEM véu: o contraste é todo do texto — sombra tripla + contorno na cor `bg`
// da marca (tarja preta é proibida no projeto).
// Render com alpha: use scripts/render-overlay-alpha.mjs — NUNCA WebM se o destino
// for o CapCut (ele ignora o alpha do VP8; só aceita .mov ProRes 4444 ou qtrle).
export const captionOverlayWordSchema = captionWordSchema.extend({
  emphasis: z.boolean().default(false), // fica na cor primary o tempo todo
});
export const captionOverlaySchema = z.object({
  brand: brandSchema,
  captions: z.array(captionOverlayWordSchema).min(1),
  durationSeconds: z.number().min(1).max(600),
  // páginas de 2–5 palavras (quebra por sentido — ver lib/legendas.ts)
  wordsPerPage: z.number().min(2).max(5).default(4),
  fontSizePx: z.number().min(30).max(160).default(76),
  // distância do RODAPÉ até a base do bloco (px). 680 passa da linha dos 35%
  // da UI do Reels (1920−680=1240 < 1248); quem sobrepõe no editor pode subir.
  bottomPx: z.number().min(0).max(1700).default(680),
  caixaAlta: z.boolean().default(false),
  strokePx: z.number().min(0).max(8).default(2),
  // mesmos ajustes de sincronia da LegendaDinamica (ver lá o porquê dos defaults)
  offsetMs: z.number().min(-1000).max(1000).default(100),
  antecipaPaginaMs: z.number().min(0).max(800).default(200),
});
export type CaptionOverlayProps = z.infer<typeof captionOverlaySchema>;
