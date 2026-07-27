#!/usr/bin/env python3
"""
Upscale do logo Sidus — APENAS LANCZOS, zero alterações ao design.
Coloca o PNG original (já transparente) em public/logo-sidus-fonte1.png
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
FONTE = PUBLIC / 'logo-sidus-fonte1.png'


def upscale_max(im: Image.Image, lado_max: int) -> Image.Image:
    w, h = im.size
    escala = lado_max / max(w, h)
    novo_w = max(1, round(w * escala))
    novo_h = max(1, round(h * escala))
    return im.resize((novo_w, novo_h), Image.Resampling.LANCZOS)


def main() -> None:
    if not FONTE.exists():
        print('❌ Falta public/logo-sidus-fonte1.png — o PNG original do utilizador (transparente).')
        sys.exit(1)

    original = Image.open(FONTE)
    if original.mode != 'RGBA':
        original = original.convert('RGBA')

    print(f'📄 Fonte: {FONTE.name} — {original.size[0]}×{original.size[1]} (sem alterações)')

    hd = upscale_max(original, 2048)
    k4 = upscale_max(original, 4096)

    hd.save(PUBLIC / 'logo-sidus-vertical.png', optimize=True)
    k4.save(PUBLIC / 'logo-sidus-vertical-4k.png', optimize=True)
    hd.save(PUBLIC / 'logo-sidus-horizontal.png', optimize=True)

    print(f'✅ HD:  logo-sidus-vertical.png ({hd.width}×{hd.height})')
    print(f'✅ 4K:  logo-sidus-vertical-4k.png ({k4.width}×{k4.height})')


if __name__ == '__main__':
    main()
