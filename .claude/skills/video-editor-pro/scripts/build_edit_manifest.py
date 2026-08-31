#!/usr/bin/env python3
"""Monta o edit-manifest.json de um job a partir do brief (.yaml ou .json).

Uso: python build_edit_manifest.py <pasta-do-job> [--composition NOME]
Sem dependências obrigatórias: YAML usa PyYAML se existir; senão aceita brief.json.
"""
import json
import os
import sys

COMPOSICOES = {
    "ProvaSocial", "QuotePost", "DataCard", "LegendaDinamica",
    "SafeZoneOverlay", "CTAEndcard", "Comparison", "KineticTypography",
    "WhatsAppMockup", "DataChart", "VisualStorytelling", "CaptionOverlay",
}

PADRAO_POR_MODO = {
    "capcut-editavel": None,          # manifest é do draft VectCut, não de composição
    "hibrida": "CaptionOverlay",
    "mp4-final": "LegendaDinamica",
}


def ler_brief(pasta):
    yml = os.path.join(pasta, "brief.yaml")
    jsn = os.path.join(pasta, "brief.json")
    if os.path.isfile(yml):
        try:
            import yaml  # opcional
        except ImportError:
            raise SystemExit("brief.yaml encontrado mas PyYAML não está instalado — "
                             "instale (pip install pyyaml) ou forneça brief.json")
        with open(yml, encoding="utf-8-sig") as f:  # -sig: PowerShell grava BOM
            return yaml.safe_load(f)
    if os.path.isfile(jsn):
        with open(jsn, encoding="utf-8-sig") as f:
            return json.load(f)
    raise SystemExit(f"nenhum brief.yaml/brief.json em {pasta}")


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    pasta = os.path.abspath(sys.argv[1])
    brief = ler_brief(pasta)

    comp = None
    if "--composition" in sys.argv:
        comp = sys.argv[sys.argv.index("--composition") + 1]
    else:
        comp = PADRAO_POR_MODO.get(str(brief.get("modo_saida") or "hibrida"))
    if comp and comp not in COMPOSICOES:
        raise SystemExit(f"composição desconhecida: {comp} (válidas: {sorted(COMPOSICOES)})")

    # `or`, não o default do .get(): o brief pode declarar o campo como null de
    # propósito (duracao_desejada_s: null = "herdada de cada peça", modo_saida
    # ainda não decidido). Com .get(chave, padrão) a chave EXISTE valendo None,
    # o padrão nunca entra, e o float(None) derruba o script. Quebrou de verdade
    # num job real em 15/08/2026.
    dur_s = float(brief.get("duracao_desejada_s") or 15)
    nome_job = os.path.basename(pasta)
    escolhida = comp or "CaptionOverlay"
    # Overlay transparente sai em .mov, NUNCA .webm: o CapCut 9.1.0.3879 ignora o
    # alpha do VP8 e mostra fundo opaco (medido na Fase 6/7, 14/08/2026).
    # Render pelo engine/scripts/render-overlay-alpha.mjs, que já entrega qtrle.
    ext = "mov" if escolhida == "CaptionOverlay" else "mp4"
    manifest = {
        "composition": escolhida,
        "fps": 30,
        "width": 1080,
        "height": 1920,
        "durationInFrames": int(round(dur_s * 30)),
        "brandPreset": str(brief.get("preset_marca", brief.get("cliente", "default"))),
        "props": {},
        "safeZones": True,
        "output": f"jobs/{nome_job}/renders/{escolhida.lower()}.{ext}",
        "_meta": {
            "objetivo": brief.get("objetivo"),
            "formato_criativo": brief.get("formato_criativo"),
            "engine_legenda": brief.get("engine_legenda"),
            "modo_saida": brief.get("modo_saida"),
            "aprovador": brief.get("aprovador", "aprovador"),
        },
    }

    destino = os.path.join(pasta, "edit-manifest.json")
    if os.path.exists(destino):
        raise SystemExit(f"{destino} já existe — não sobrescrevo manifest aprovado; "
                         "apague ou versione manualmente")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"manifest criado: {destino}")
    print("preencha props e valide com validate_edit_manifest.py antes de renderizar")


if __name__ == "__main__":
    main()
