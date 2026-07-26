#!/usr/bin/env python3
"""Processa o logo oficial Sidus (sidusastro.com) — HD/4K + transparência, sem alterar o design."""

from __future__ import annotations

import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
FONTE_URL = 'https://sidusastro.com/apple-touch-icon.png?v=6'
BG_RGB = np.array([11, 7, 30], dtype=np.float32)  # #0B071E — fundo oficial


def remover_fundo(im: Image.Image) -> Image.Image:
    """Remove fundo escuro preservando brilho dourado da estrela superior."""
    rgba = im.convert('RGBA')
    arr = np.array(rgba, dtype=np.float32)
    rgb = arr[..., :3]
    dist_bg = np.linalg.norm(rgb - BG_RGB, axis=-1)

    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    luminancia = 0.299 * r + 0.587 * g + 0.114 * b
    dourado = (r > 70) & (g > 55) & (b < 150) & (r >= g * 0.75)

    # alpha suave — mantém glow e anti-aliasing
    alpha = np.clip((luminancia - 18) / 42 + (dist_bg / 28) + dourado.astype(np.float32) * 0.55, 0, 1)
    alpha = np.where(dourado | (luminancia > 55), np.maximum(alpha, 0.92), alpha)
    alpha = np.where((dist_bg < 12) & (luminancia < 35) & ~dourado, 0, alpha)

    arr[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def compor_horizontal(vertical: Image.Image) -> Image.Image:
    """Símbolo + SIDUS lado a lado, a partir do logo vertical oficial."""
    w, h = vertical.size
    simbolo = vertical.crop((int(w * 0.08), int(h * 0.04), int(w * 0.92), int(h * 0.58)))
    texto = vertical.crop((int(w * 0.12), int(h * 0.62), int(w * 0.88), int(h * 0.92)))

    simbolo = simbolo.resize((int(simbolo.width * 1.05), int(simbolo.height * 1.05)), Image.Resampling.LANCZOS)
    texto = texto.resize((int(texto.width * 1.1), int(texto.height * 1.1)), Image.Resampling.LANCZOS)

    margem = int(w * 0.06)
    altura = max(simbolo.height, texto.height) + margem * 2
    largura = simbolo.width + texto.width + margem * 3
    canvas = Image.new('RGBA', (largura, altura), (0, 0, 0, 0))

    y_simbolo = (altura - simbolo.height) // 2
    y_texto = (altura - texto.height) // 2
    canvas.paste(simbolo, (margem, y_simbolo), simbolo)
    canvas.paste(texto, (margem * 2 + simbolo.width, y_texto), texto)
    return canvas


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    fonte = PUBLIC / 'logo-sidus-fonte-oficial.png'
    print(f'⬇️  A descarregar logo oficial: {FONTE_URL}')
    urllib.request.urlretrieve(FONTE_URL, fonte)

    original = Image.open(fonte)
    print(f'   Fonte: {original.size[0]}×{original.size[1]}')

    transparente = remover_fundo(original)
    vertical_hd = transparente.resize((2048, 2048), Image.Resampling.LANCZOS)
    vertical_4k = transparente.resize((4096, 4096), Image.Resampling.LANCZOS)

    horizontal_base = compor_horizontal(transparente)
    horizontal_hd = horizontal_base.resize(
        (int(horizontal_base.width * (2048 / transparente.height)), 2048),
        Image.Resampling.LANCZOS,
    )

    destino_vertical = PUBLIC / 'logo-sidus-vertical.png'
    destino_horizontal = PUBLIC / 'logo-sidus-horizontal.png'
    destino_4k = PUBLIC / 'logo-sidus-vertical-4k.png'

    vertical_hd.save(destino_vertical, optimize=True)
    vertical_4k.save(destino_4k, optimize=True)
    horizontal_hd.save(destino_horizontal, optimize=True)

    print(f'✅ Vertical HD (2048):  {destino_vertical} ({destino_vertical.stat().st_size // 1024} KB)')
    print(f'✅ Vertical 4K (4096): {destino_4k} ({destino_4k.stat().st_size // 1024} KB)')
    print(f'✅ Horizontal HD:      {destino_horizontal} ({destino_horizontal.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
