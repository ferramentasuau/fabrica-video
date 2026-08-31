// _remendos.mjs — as correções de transcrição COMPARTILHADAS do SEU lote.
//
// O Whisper é instrumento de TEMPO, não de TEXTO: ele erra sempre nas mesmas
// palavras — nome de quem fala, nome do produto, nomes citados e o CTA. Quando
// várias peças de um lote repetem o mesmo trecho, escrever a mesma lista de
// correções em cada peça é o caminho para esquecer uma. Este arquivo guarda as
// correções que valem para o LOTE INTEIRO; o erro específico de UMA peça vai no
// JSON dela e entra pelo --remendos do preparar-peca.mjs.
//
// As quatro listas começam VAZIAS de propósito — preencha com os erros do SEU
// material. O portão no fim do preparar-peca.mjs mostra as divergências entre a
// legenda e o roteiro: é de lá que saem os itens destas listas.

/** Trocas de SEQUÊNCIA — cada item é { de: [...], para: [...] }: quando a
 *  legenda contém a sequência exata de palavras `de`, o trecho inteiro vira
 *  `para` (o tempo é redistribuído). Preferir SEMPRE este formato: por trocar o
 *  trecho de uma vez, remendos não se atropelam como correções 1-para-1
 *  encadeadas fariam. Ex.: { de: ["marca", "demol"], para: ["Marca", "Demo."] } */
export const REMENDOS = [];

/** Correções 1-para-1, com guarda de contexto — cada item é
 *  { texto: /regex/u, para: "PalavraCerta", proxima: /regex/ }: a palavra que
 *  casar com `texto` vira `para`, mas SÓ se a palavra seguinte casar com
 *  `proxima` (a guarda evita corrigir um homógrafo inocente). Útil quando o
 *  ASR devolve bytes inválidos num acento e só o sufixo é confiável. */
export const CORRECOES = [];

/** Palavras/frases que TÊM de aparecer na legenda final de qualquer peça do
 *  lote (nome do produto, nome de quem fala, o CTA). Serve de portão: se
 *  alguma faltar depois dos remendos, é erro novo do ASR — o preparar-peca.mjs
 *  para e pede remendo. Ex.: "Toca em Saiba Mais" */
export const EXIGIDAS = [];

/** Formas ERRADAS que não podem sobrar na legenda (as grafias que o ASR insiste
 *  em produzir para os seus nomes próprios). Também é portão: se alguma
 *  aparecer, a peça não passa. */
export const PROIBIDAS = [];
