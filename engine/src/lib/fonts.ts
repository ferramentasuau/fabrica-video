// Carrega as fontes da marca a partir de assets\ (publicDir) via @remotion/fonts.
// Sem rede no render: os .woff2 ficam em assets\<brandId>\fonts\.
import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import type { Brand, FontSpec } from "./brand";

const loaded = new Set<string>();

const loadOne = (f: FontSpec) => {
  if (!f.file) return; // sem arquivo → fica no fallback do sistema
  const key = `${f.family}-${f.weight}-${f.style}-${f.file}`;
  if (loaded.has(key)) return;
  loaded.add(key);
  loadFont({
    family: f.family,
    url: staticFile(f.file),
    weight: f.weight,
    style: f.style,
  });
};

export const loadBrandFonts = (brand: Brand) => {
  loadOne(brand.fonts.title);
  loadOne(brand.fonts.body);
  if (brand.fonts.numbers) loadOne(brand.fonts.numbers);
  if (brand.fonts.accent) loadOne(brand.fonts.accent);
};

// Fonte avulsa fora do preset da marca (ex.: manuscrito das palavrasDestaque,
// 17/08/2026). Mesmo cache e mesmo caminho de publicDir do loadOne.
export const loadExtraFont = (f: FontSpec) => loadOne(f);
