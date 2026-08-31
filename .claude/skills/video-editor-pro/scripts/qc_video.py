#!/usr/bin/env python3
"""QC técnico de um vídeo renderizado. Reprova = exit 1.

Uso: python qc_video.py <video> [--dur <esperada_s>] [--sem-audio] [--w 1080] [--h 1920]
Checa: container, resolução, fps, duração (±0,5s), clipping de áudio
(max_volume > -0,5 dBFS), frame preto não intencional no início, color_range.
"""
import json
import subprocess
import sys

PROBLEMAS = []
AVISOS = []


def ffprobe(caminho):
    r = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json",
                        "-show_format", "-show_streams", caminho],
                       capture_output=True, text=True, timeout=120)
    if r.returncode != 0:
        raise SystemExit(f"REPROVADO: ffprobe não abriu o arquivo — {r.stderr[:200]}")
    return json.loads(r.stdout)


def ffmpeg_filtro(caminho, filtro, extra=None):
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", caminho, "-af" if "volume" in filtro else "-vf",
           filtro, "-f", "null", "-"]
    if extra:
        cmd = ["ffmpeg", "-hide_banner", "-nostats", *extra, "-i", caminho,
               "-vf", filtro, "-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    return r.stderr


def main():
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    caminho = args[0]
    dur_esp = float(args[args.index("--dur") + 1]) if "--dur" in args else None
    sem_audio = "--sem-audio" in args
    w_esp = int(args[args.index("--w") + 1]) if "--w" in args else 1080
    h_esp = int(args[args.index("--h") + 1]) if "--h" in args else 1920

    info = ffprobe(caminho)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"].get("duration", 0) or 0)

    if not v:
        PROBLEMAS.append("sem stream de vídeo")
    else:
        if (v.get("width"), v.get("height")) != (w_esp, h_esp):
            PROBLEMAS.append(f"resolução {v.get('width')}x{v.get('height')} != {w_esp}x{h_esp}")
        num, den = (v.get("r_frame_rate") or "0/1").split("/")
        fps = float(num) / float(den) if float(den) else 0
        if abs(fps - 30) > 0.2:
            AVISOS.append(f"fps {fps:.2f} (padrão da fábrica: 30)")
        if v.get("color_range") == "pc":
            AVISOS.append("color_range=pc — o Meta re-encoda e o preto/branco pula (decisão 06/08)")

    if dur_esp is not None and abs(dur - dur_esp) > 0.5:
        PROBLEMAS.append(f"duração {dur:.2f}s difere da esperada {dur_esp:.2f}s (> ±0,5s)")

    if not sem_audio:
        if not a:
            PROBLEMAS.append("sem stream de áudio (use --sem-audio se for overlay mudo)")
        else:
            err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", caminho,
                                  "-af", "volumedetect", "-f", "null", "-"],
                                 capture_output=True, text=True, timeout=600).stderr
            for linha in err.splitlines():
                if "max_volume" in linha:
                    mv = float(linha.split(":")[1].replace("dB", "").strip())
                    if mv > -0.5:
                        PROBLEMAS.append(f"clipping: max_volume {mv} dB (> -0,5 dBFS)")
                    else:
                        print(f"  audio max_volume: {mv} dB")

    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-t", "2", "-i", caminho,
                          "-vf", "blackdetect=d=0.5:pix_th=0.02", "-f", "null", "-"],
                         capture_output=True, text=True, timeout=300).stderr
    if "black_start:0" in err.replace(" ", ""):
        PROBLEMAS.append("frame preto no início (>0,5s) — bloqueadora se não intencional")

    print(f"\nQC de {caminho}: {dur:.2f}s")
    for avi in AVISOS:
        print(f"  aviso: {avi}")
    if PROBLEMAS:
        print("REPROVADO:")
        for p in PROBLEMAS:
            print(f"  - {p}")
        raise SystemExit(1)
    print("APROVADO no QC técnico")


if __name__ == "__main__":
    main()
