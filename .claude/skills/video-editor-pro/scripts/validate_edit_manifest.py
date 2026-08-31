#!/usr/bin/env python3
"""Valida um edit-manifest.json. Inválido = exit 1 (e o render NÃO acontece).

Uso: python validate_edit_manifest.py <edit-manifest.json>
Validação profunda dos props é do zod (engine/src/lib/manifest.ts) na hora do
render — aqui é o portão de forma: campos, faixas e caminhos de saída.
"""
import json
import os
import sys

COMPOSICOES = {
    "ProvaSocial", "QuotePost", "DataCard", "LegendaDinamica",
    "SafeZoneOverlay", "CTAEndcard", "Comparison", "KineticTypography",
    "WhatsAppMockup", "DataChart", "VisualStorytelling", "CaptionOverlay",
}

ERROS = []


def erro(msg):
    ERROS.append(msg)


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    caminho = sys.argv[1]
    with open(caminho, encoding="utf-8-sig") as f:  # -sig: PowerShell grava BOM
        try:
            m = json.load(f)
        except json.JSONDecodeError as e:
            raise SystemExit(f"INVÁLIDO: JSON malformado — {e}")

    if m.get("composition") not in COMPOSICOES:
        erro(f"composition '{m.get('composition')}' não existe (válidas: {sorted(COMPOSICOES)})")
    if m.get("fps") != 30:
        erro(f"fps {m.get('fps')} — o padrão da fábrica é 30")
    if m.get("composition") == "QuotePost":
        if (m.get("width"), m.get("height")) != (1080, 1350):
            erro("QuotePost é 1080x1350 (4:5)")
    elif (m.get("width"), m.get("height")) != (1080, 1920):
        erro(f"{m.get('width')}x{m.get('height')} — vertical da fábrica é 1080x1920")
    dif = m.get("durationInFrames")
    if not isinstance(dif, int) or not (30 <= dif <= 5400):
        erro(f"durationInFrames {dif} fora da faixa 30..5400 (1s..3min)")
    if not isinstance(m.get("brandPreset"), str) or not m["brandPreset"]:
        erro("brandPreset ausente")
    if not isinstance(m.get("props"), dict):
        erro("props precisa ser objeto (pode ser vazio só em rascunho)")
    if m.get("safeZones") is not True:
        erro("safeZones deve ser true — conferência de zona é portão da casa")
    out = str(m.get("output", ""))
    out_norm = out.replace("\\", "/")
    if not out or ".." in out_norm or out_norm.startswith("/") or ":" in out:
        erro(f"output suspeito: '{out}' — use caminho relativo dentro do projeto")
    elif not (out_norm.startswith("assets/generated/") or out_norm.startswith("jobs/")):
        erro(f"output '{out}' fora de assets/generated/ ou jobs/")
    ext = os.path.splitext(out)[1].lower()
    if ext not in (".mp4", ".webm", ".mov", ".png"):
        erro(f"extensão de saída inesperada: {ext}")

    if ERROS:
        print("MANIFEST INVÁLIDO:")
        for e in ERROS:
            print(f"  - {e}")
        raise SystemExit(1)
    print(f"manifest válido: {m['composition']} {m['width']}x{m['height']} "
          f"{dif}f ({dif/30:.1f}s) -> {out}")


if __name__ == "__main__":
    main()
