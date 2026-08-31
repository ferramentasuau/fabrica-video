// Correção de transcrição — compartilhado pelos build-job-*.mjs de cada marca.
//
// Nasceu duplicado (em dois jobs de marcas diferentes) e virou biblioteca porque a ordem das
// operações tem uma pegadinha real: correção 1-para-1 aplicada em CADEIA se
// atropela. Ex. (ilustrativo): querendo "a soma no quadro" → "o assunto do quadro", três
// regras 1-para-1 produziram "assunto do quadro alto, alto" — a regra seguinte
// leu o resultado da anterior. REMENDO de sequência não tem esse problema,
// porque troca o trecho inteiro de uma vez.
//
// Ordem correta e não-negociável: limpar marcações → REMENDOS → correções 1-1.

/**
 * Remove marcações do Whisper para trecho sem fala.
 *
 * Duas formas, e elas NÃO se limpam do mesmo jeito:
 *  - "[Música]", "(risos)" — vêm numa palavra só, então basta filtrar.
 *  - "♪ MÚSICA DE FUNDO ♪" — vem TOKENIZADA em palavras soltas
 *    ("♪" · "MÚSICA" · "DE" · "FUNDO" · "♪"), então filtrar palavra a palavra
 *    deixaria "MÚSICA DE FUNDO" na tela como se fosse fala. Tem que cair o
 *    trecho inteiro entre os dois símbolos.
 *    Visto num bruto real de job: 8s de trilha sem ninguém falando.
 */
const SO_MUSICA = /^[♪♫🎵🎶]+$/;
export const limparMarcacoes = (words) => {
  const antes = words.length;
  const fora = new Set();
  for (let i = 0; i < words.length; i++) {
    if (!SO_MUSICA.test(words[i].text.trim())) continue;
    fora.add(i);
    // fecha no próximo símbolo; se não houver par, cai só o símbolo solto
    const par = words.findIndex((w, k) => k > i && SO_MUSICA.test(w.text.trim()));
    if (par > i) {
      for (let k = i; k <= par; k++) fora.add(k);
      i = par;
    }
  }
  const limpo = words.filter(
    (w, i) => !fora.has(i) && !/^[[(][^\])]*[\])]$/.test(w.text.trim()),
  );
  return { words: limpo, removidas: antes - limpo.length };
};

/**
 * Troca uma SEQUÊNCIA de palavras por outra de tamanho diferente.
 * Preserva o tempo total do trecho e o distribui entre as palavras novas em
 * proporção ao tamanho de cada uma.
 *
 * Use isto — não uma cadeia de regras 1-para-1 — sempre que a quantidade de
 * palavras mudar, ou quando uma correção dependeria de outra já ter rodado.
 */
export const aplicarRemendos = (words, remendos) => {
  let atual = words;
  let n = 0;
  for (const r of remendos) {
    for (let i = 0; i + r.de.length <= atual.length; i++) {
      const bate = r.de.every(
        (t, k) => atual[i + k].text.toLowerCase() === t.toLowerCase()
      );
      if (!bate) continue;
      const ini = atual[i].startMs;
      const fim = atual[i + r.de.length - 1].endMs;
      const total = fim - ini;
      const pesos = r.para.map((t) => t.length);
      const soma = pesos.reduce((a, b) => a + b, 0);
      let t = ini;
      const novas = r.para.map((texto, k) => {
        const w = {
          text: texto,
          startMs: t,
          endMs: k === r.para.length - 1 ? fim : t + Math.round((total * pesos[k]) / soma),
        };
        t = w.endMs;
        return w;
      });
      atual = [...atual.slice(0, i), ...novas, ...atual.slice(i + r.de.length)];
      n++;
      break; // um remendo se aplica uma vez; se precisar de mais, declare de novo
    }
  }
  return { words: atual, aplicados: n };
};

/**
 * Correções 1-para-1, com guarda de contexto (`anterior` / `proxima`) pra não
 * pegar a ocorrência errada. Só para casos que NÃO mudam a contagem de
 * palavras e NÃO dependem de outra correção.
 */
export const aplicarCorrecoes = (words, correcoes) => {
  let n = 0;
  for (let i = 0; i < words.length; i++) {
    const original = words[i].text;
    for (const r of correcoes) {
      const okAnt = !r.anterior || (words[i - 1] && r.anterior.test(words[i - 1].text));
      const okProx = !r.proxima || (words[i + 1] && r.proxima.test(words[i + 1].text));
      if (r.texto.test(words[i].text) && okAnt && okProx) {
        words[i].text = words[i].text.replace(r.texto, r.para);
      }
    }
    if (words[i].text !== original) n++;
  }
  return { words, corrigidas: n };
};

/** Roda tudo na ordem certa. */
export const corrigir = (words, { remendos = [], correcoes = [] } = {}) => {
  const a = limparMarcacoes(words);
  const b = aplicarRemendos(a.words, remendos);
  const c = aplicarCorrecoes(b.words, correcoes);
  return {
    words: c.words,
    resumo: `marcações removidas: ${a.removidas} · remendos: ${b.aplicados} · correções: ${c.corrigidas}`,
  };
};
