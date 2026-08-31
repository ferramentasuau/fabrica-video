// Avisa quando o autor do VectCutAPI publicar código novo.
//
// Por que existe: nosso clone está CONGELADO num commit (UPSTREAM_COMMIT.txt) e a
// SPEC proíbe atualização automática. Mas ninguém fica olhando o GitHub, então a
// pergunta "ele mexeu?" só era respondida por acaso. Este script responde.
//
// O que ele NÃO faz: baixar, aplicar, atualizar nada. Só compara e conta.
// Atualizar de verdade é o procedimento do §6 da SPEC, com merge revisado e os
// 46 testes rodando — porque temos DOIS remendos dentro do código de terceiro
// (font_type no script_file.py, material_ext no util.py + 3 chamadas) que um
// merge desatento pode engolir em silêncio.
//
// Usa rede — de propósito, e fora do servidor seguro. O `vectcut-safe` continua
// com a rede morta; quem fala com o GitHub é este script, que não toca em draft.
//
// Uso:  node tools/checar-upstream.mjs
// Saída: código 0 = igual (nada a fazer) · 10 = o autor publicou algo novo
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const CONGELADO_TXT = path.join(AQUI, "VectCutAPI", "UPSTREAM_COMMIT.txt");
const REMOTE = "https://github.com/sun-guannan/VectCutAPI.git";

if (!fs.existsSync(CONGELADO_TXT)) {
  console.error(`não achei ${CONGELADO_TXT} — o clone do upstream sumiu?`);
  process.exit(1);
}

const txt = fs.readFileSync(CONGELADO_TXT, "utf8");
const nosso = txt.match(/commit:\s*([0-9a-f]{40})/i)?.[1];
if (!nosso) {
  console.error("não consegui ler o hash congelado do UPSTREAM_COMMIT.txt");
  process.exit(1);
}

let saida;
try {
  saida = execFileSync("git", ["ls-remote", REMOTE, "HEAD"], {
    encoding: "utf8",
    timeout: 30_000,
  });
} catch (e) {
  console.error(`falhou ao consultar o GitHub: ${e.message}`);
  console.error("(sem internet? o resultado é inconclusivo, não é 'não mudou')");
  process.exit(1);
}

const deles = saida.trim().split(/\s+/)[0];
if (!deles) {
  console.error("resposta do GitHub veio vazia — inconclusivo");
  process.exit(1);
}

if (deles === nosso) {
  console.log(`upstream INALTERADO — ainda em ${nosso.slice(0, 7)}. Nada a fazer.`);
  process.exit(0);
}

console.log("=".repeat(70));
console.log("O AUTOR DO VECTCUTAPI PUBLICOU CÓDIGO NOVO");
console.log("=".repeat(70));
console.log(`  nosso (congelado): ${nosso}`);
console.log(`  dele (HEAD agora): ${deles}`);
console.log(`  comparar:          https://github.com/sun-guannan/VectCutAPI/compare/${nosso.slice(0, 12)}...${deles.slice(0, 12)}`);
console.log("");
console.log("NÃO atualize por impulso. A fábrica funciona congelada e aquele código");
console.log("não toca a rede, então não há correção de segurança a perseguir.");
console.log("Só vale atualizar se o CapCut quebrar o formato ou se ele consertar");
console.log("algo que esteja te atrapalhando.");
console.log("");
console.log("Se for atualizar, o roteiro é o SETUP §6 (re-clonar e reaplicar o patch) — e ATENÇÃO aos dois");
console.log("remendos nossos dentro do código dele, que um merge pode engolir:");
console.log("  · pyJianYingDraft/script_file.py  — font_type variável livre");
console.log("  · util.py + add_audio_track.py + add_video_track.py + add_image_impl.py");
console.log("    — material_ext(), a extensão que segue a origem");
console.log("Depois do merge: 46 testes (15 unidade + 31 roundtrip) e um rascunho");
console.log("descartável publicado no CapCut. Se qualquer um falhar, não usa.");
process.exit(10);
