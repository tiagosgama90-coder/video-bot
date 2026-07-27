#!/usr/bin/env python3
"""Processa o logo oficial Sidus — HD/4K + transparência, unidade intacta."""

from __future__ import annotations

import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
FONTE_URL = 'https://sidusastro.com/apple-touch-icon.png?v=6'
BG_CORES = [
    np.array([11, 7, 30], dtype=np.float32),
    np.array([0, 0, 0], dtype=np.float32),
]


def mascara_dourada(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    luminancia = 0.299 * r + 0.587 * g + 0.114 * b
    dourado = (r > 65) & (g > 50) & (b < 155) & (r >= g * 0.72)
    brilho = luminancia > 42
    return dourado | brilho


def dilatar(mascara: np.ndarray, raio: int) -> np.ndarray:
    h, w = mascara.shape
    out = mascara.copy()
    ys, xs = np.where(mascara)
    for y, x in zip(ys, xs, strict=False):
        y0, y1 = max(0, y - raio), min(h, y + raio + 1)
        x0, x1 = max(0, x - raio), min(w, x + raio + 1)
        out[y0:y1, x0:x1] = True
    return out


def remover_fundo_unidade(im: Image.Image) -> Image.Image:
    """
    Remove só o fundo EXTERNO ao logo.
    Mantém opaco tudo dentro da caixa do logo (símbolo + espaço + SIDUS) —
    evita que o símbolo e o texto pareçam duas peças separadas.
    """
    rgba = im.convert('RGBA')
    arr = np.array(rgba, dtype=np.float32)
    rgb = arr[..., :3]
    h, w = rgb.shape[:2]

    conteudo = dilatar(mascara_dourada(rgb), raio=6)
    if not conteudo.any():
        return rgba

    ys, xs = np.where(conteudo)
    margem = max(4, int(min(h, w) * 0.02))
    y0 = max(0, int(ys.min()) - margem)
    y1 = min(h, int(ys.max()) + margem + 1)
    x0 = max(0, int(xs.min()) - margem)
    x1 = min(w, int(xs.max()) + margem + 1)

    dist_bg = np.min([np.linalg.norm(rgb - bg, axis=-1) for bg in BG_CORES], axis=0)
    dentro = np.zeros((h, w), dtype=bool)
    dentro[y0:y1, x0:x1] = True

    alpha = np.zeros((h, w), dtype=np.float32)
    # Toda a unidade do logo fica opaca (símbolo + espaço + SIDUS = uma peça)
    alpha[dentro] = 255.0

    # Só o exterior vira transparente
    fora_fundo = (~dentro) & (dist_bg < 24)
    alpha[fora_fundo] = 0.0

    # Anti-aliasing na borda exterior
    fora_quase = (~dentro) & (dist_bg < 42) & ~fora_fundo
    alpha[fora_quase] = np.clip((dist_bg[fora_quase] - 16) / 22, 0, 1) * 255

    arr[..., 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    fonte = PUBLIC / 'logo-sidus-fonte-oficial.png'
    print(f'⬇️  A descarregar logo oficial: {FONTE_URL}')
    urllib.request.urlretrieve(FONTE_URL, fonte)

    original = Image.open(fonte)
    print(f'   Fonte: {original.size[0]}×{original.size[1]}')

    transparente = remover_fundo_unidade(original)
    vertical_hd = transparente.resize((2048, 2048), Image.Resampling.LANCZOS)
    vertical_4k = transparente.resize((4096, 4096), Image.Resampling.LANCZOS)

    destino_vertical = PUBLIC / 'logo-sidus-vertical.png'
    destino_horizontal = PUBLIC / 'logo-sidus-horizontal.png'
    destino_4k = PUBLIC / 'logo-sidus-vertical-4k.png'

    vertical_hd.save(destino_vertical, optimize=True)
    vertical_4k.save(destino_4k, optimize=True)
    vertical_hd.save(destino_horizontal, optimize=True)

    print(f'✅ Vertical HD:  {destino_vertical} ({vertical_hd.width}×{vertical_hd.height})')
    print(f'✅ Vertical 4K:  {destino_4k} ({vertical_4k.width}×{vertical_4k.height})')
    print(f'✅ Horizontal (= vertical intacto): {destino_horizontal}')

    fonte.unlink(missing_ok=True)


if __name__ == '__main__':
    main()
