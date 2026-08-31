// mapear-projeto-capcut.mjs — lê um projeto FINALIZADO do CapCut e escreve um
// mapa JSON anotado: cada corte, cada passagem, cada som, com o tempo, a
// propriedade e a palavra da fala em que cai.
//
// Serve para APRENDER com uma edição aprovada: o que o editor fez à mão vira
// dado, e o dado vira regra na skill.
//
// Uso:
//   node engine/scripts/mapear-projeto-capcut.mjs <pasta-do-projeto> <words.json> <saida.json>

import fs from "node:fs";
import path from "node:path";

const [proj, wordsPath, saida, anotPath] = process.argv.slice(2);
if (!proj || !wordsPath || !saida) {
  console.error("uso: node mapear-projeto-capcut.mjs <projeto> <words.json> <saida.json> [anotacoes.json]");
  process.exit(1);
}
// As anotações são a LEITURA humana do que foi medido. Ficam fora do script para
// que o mapa possa ser regerado sem perder o aprendizado escrito nele.
const anot = anotPath ? JSON.parse(fs.readFileSync(anotPath, "utf8")) : {};

const US = 1e6;
const d = JSON.parse(fs.readFileSync(path.join(proj, "draft_content.json"), "utf8"));
const words = JSON.parse(fs.readFileSync(wordsPath, "utf8")).words;

const mat = {};
for (const [tabela, lista] of Object.entries(d.materials))
  if (Array.isArray(lista)) for (const m of lista) if (m?.id) mat[m.id] = { ...m, _tabela: tabela };

const base = (p) => (p || "").replace(/\\/g, "/").split("/").pop();
const fades = Object.fromEntries(
  (d.materials.audio_fades || []).map((f) => [f.id, f])
);

// em que palavra da fala este instante cai
const naFala = (t, tol = 0.3) => {
  const perto = words.filter((w) => Math.abs(w.start - t) <= tol);
  if (perto.length)
    return { palavra: perto.sort((a, b) => Math.abs(a.start - t) - Math.abs(b.start - t))[0].text, onde: "onset" };
  const dentro = words.find((w) => w.start <= t && t <= w.end);
  if (dentro) return { palavra: dentro.text, onde: "meio da palavra" };
  const ant = words.filter((w) => w.end <= t).pop();
  return { palavra: ant ? `após "${ant.text}"` : null, onde: "silêncio" };
};

const trilhas = [];
for (const t of d.tracks) {
  const segs = [...t.segments].sort((a, b) => a.target_timerange.start - b.target_timerange.start);
  if (!segs.length) continue;
  const m0 = mat[segs[0].material_id] || {};
  let ant = null;
  const eventos = segs.map((s) => {
    const m = mat[s.material_id] || {};
    const ini = s.target_timerange.start / US;
    const dur = s.target_timerange.duration / US;
    const fonte = s.source_timerange ? s.source_timerange.start / US : null;
    const fade = (s.extra_material_refs || []).map((r) => fades[r]).find(Boolean);
    const escala = s.clip?.scale?.x ?? 1;
    const pausaAntes = ant !== null && ini - ant > 0.05 ? Number((ini - ant).toFixed(2)) : null;
    ant = ini + dur;
    return {
      arquivo: base(m.path) || m.name || null,
      entra: Number(ini.toFixed(2)),
      sai: Number((ini + dur).toFixed(2)),
      duracao: Number(dur.toFixed(2)),
      ...(fonte !== null ? { posicaoNaFonte: Number(fonte.toFixed(2)) } : {}),
      ...(pausaAntes ? { pausaAntes } : {}),
      ...(s.volume !== undefined && s.volume !== 1 ? { volume: Number(s.volume.toFixed(3)) } : {}),
      ...(Math.abs((s.speed ?? 1) - 1) > 0.01 ? { velocidade: Number(s.speed.toFixed(1)) } : {}),
      ...(s.reverse ? { invertido: true } : {}),
      ...(Math.abs(escala - 1) > 0.01 ? { escala: Number(escala.toFixed(2)) } : {}),
      ...(fade?.fade_in_duration ? { fadeIn: Number((fade.fade_in_duration / US).toFixed(2)) } : {}),
      ...(fade?.fade_out_duration ? { fadeOut: Number((fade.fade_out_duration / US).toFixed(2)) } : {}),
      naFala: naFala(ini),
    };
  });
  trilhas.push({
    tipo: t.type,
    nome: t.name || null,
    arquivoPrincipal: base(m0.path) || m0.name || null,
    misturada: new Set(segs.map((s) => base((mat[s.material_id] || {}).path))).size > 1,
    quantos: segs.length,
    eventos,
  });
}

const principal = trilhas.filter((t) => t.tipo === "video").sort((a, b) => b.quantos - a.quantos)[0];
const cortes = principal.eventos.slice(1).map((e) => e.entra);
const noOnset = principal.eventos.slice(1).filter((e) => e.naFala.onde === "onset").length;

// CORRIDAS DE ZOOM: segmentos vizinhos com a mesma escala são UM gesto, não vários.
// Sem agrupar, 11 segmentos a 1,15 parecem ruído; agrupados viram 5 decisões.
const corridas = [];
for (const e of principal.eventos) {
  const esc = e.escala ?? 1;
  const ult = corridas[corridas.length - 1];
  if (ult && ult.escala === esc && Math.abs(ult.sai - e.entra) < 0.01) {
    ult.sai = e.sai;
    ult.segmentos++;
  } else corridas.push({ escala: esc, entra: e.entra, sai: e.sai, segmentos: 1, naFala: e.naFala });
}
const zooms = corridas
  .filter((c) => c.escala !== 1)
  .map((c) => ({
    escala: c.escala,
    entra: c.entra,
    sai: Number(c.sai.toFixed(2)),
    segmentos: c.segmentos,
    abreEm: c.naFala.palavra,
  }));

const mapa = {
  _o_que_e: "Mapa forense de um projeto CapCut finalizado e aprovado. Cada evento com tempo, propriedade e a palavra da fala em que cai. Gerado por engine/scripts/mapear-projeto-capcut.mjs.",
  projeto: path.basename(proj),
  duracao: Number((d.duration / US).toFixed(2)),
  resumo: {
    trilhas: trilhas.length,
    cortes: cortes.length,
    cortesNoOnsetDaPalavra: `${noOnset}/${cortes.length}`,
    materiaisDistintos: new Set(
      trilhas.flatMap((t) => t.eventos.map((e) => e.arquivo))
    ).size,
    corridasDeZoom: zooms.length,
  },
  ...anot,
  zooms,
  trilhas: trilhas.map((t) => {
    const nota = (anot._papeis || {})[t.arquivoPrincipal];
    return nota ? { ...t, _papel: nota } : t;
  }),
};
delete mapa._papeis;

fs.writeFileSync(saida, JSON.stringify(mapa, null, 2), "utf8");
console.log(`mapa escrito: ${saida}`);
console.log(`  ${trilhas.length} trilhas · ${cortes.length} cortes · ${noOnset}/${cortes.length} no onset da palavra`);
