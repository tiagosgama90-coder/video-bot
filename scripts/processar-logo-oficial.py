#!/usr/bin/env python3
"""Processa o logo oficial Sidus — HD/4K + transparência, sem alterar nem dividir o design."""

from __future__ import annotations

import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
FONTE_URL = 'https://sidusastro.com/apple-touch-icon.png?v=6'
# Fundos oficiais: site (#0B071E) e PNG do utilizador (#000000)
BG_CORES = [
    np.array([11, 7, 30], dtype=np.float32),
    np.array([0, 0, 0], dtype=np.float32),
]


def remover_fundo(im: Image.Image) -> Image.Image:
    """Remove fundo escuro preservando brilho dourado da estrela superior."""
    rgba = im.convert('RGBA')
    arr = np.array(rgba, dtype=np.float32)
    rgb = arr[..., :3]
    dist_bg = np.min(
        [np.linalg.norm(rgb - bg, axis=-1) for bg in BG_CORES],
        axis=0,
    )

    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    luminancia = 0.299 * r + 0.587 * g + 0.114 * b
    dourado = (r > 70) & (g > 55) & (b < 150) & (r >= g * 0.75)

    alpha = np.clip((luminancia - 18) / 42 + (dist_bg / 28) + dourado.astype(np.float32) * 0.55, 0, 1)
    alpha = np.where(dourado | (luminancia > 55), np.maximum(alpha, 0.92), alpha)
    alpha = np.where((dist_bg < 12) & (luminancia < 35) & ~dourado, 0, alpha)

    arr[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def recortar_margens(im: Image.Image, margem_px: int = 8) -> Image.Image:
    """Remove espaço vazio em cima/baixo — mantém símbolo + SIDUS juntos como no original."""
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    return im.crop((x0, y0, x1, y1)).copy()


def upscale(im: Image.Image, lado: int) -> Image.Image:
    ratio = lado / max(im.width, im.height)
    novo_w = max(1, round(im.width * ratio))
    novo_h = max(1, round(im.height * ratio))
    return im.resize((novo_w, novo_h), Image.Resampling.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    fonte = PUBLIC / 'logo-sidus-fonte-oficial.png'
    print(f'⬇️  A descarregar logo oficial: {FONTE_URL}')
    urllib.request.urlretrieve(FONTE_URL, fonte)

    original = Image.open(fonte)
    print(f'   Fonte: {original.size[0]}×{original.size[1]}')

    transparente = recortar_margens(remover_fundo(original))
    vertical_hd = upscale(transparente, 2048)
    vertical_4k = upscale(transparente, 4096)

    destino_vertical = PUBLIC / 'logo-sidus-vertical.png'
    destino_horizontal = PUBLIC / 'logo-sidus-horizontal.png'
    destino_4k = PUBLIC / 'logo-sidus-vertical-4k.png'

    vertical_hd.save(destino_vertical, optimize=True)
    vertical_4k.save(destino_4k, optimize=True)
    # horizontal = mesmo logo vertical intacto (não dividir símbolo do texto)
    vertical_hd.save(destino_horizontal, optimize=True)

    print(f'✅ Vertical HD:  {destino_vertical} ({vertical_hd.width}×{vertical_hd.height})')
    print(f'✅ Vertical 4K:  {destino_4k} ({vertical_4k.width}×{vertical_4k.height})')
    print(f'✅ Horizontal (= vertical intacto): {destino_horizontal}')

    fonte.unlink(missing_ok=True)


if __name__ == '__main__':
    main()
