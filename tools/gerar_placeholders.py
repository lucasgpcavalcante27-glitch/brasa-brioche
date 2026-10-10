#!/usr/bin/env python3
"""Gera imagens PROVISÓRIAS (SVG) para as 9 camadas do hambúrguer e para o cardápio.

Cada camada usa viewBox 600 x <altura>, a mesma largura (600) e as alturas
definidas em data/ingredients.js. Quando você colocar os PNGs reais em
assets/images/burger/, o site passa a usá-los automaticamente.

Uso:  python3 tools/gerar_placeholders.py
"""
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BURGER_DIR = os.path.join(ROOT, "assets", "images", "burger")
MENU_DIR = os.path.join(ROOT, "assets", "images", "menu")
os.makedirs(BURGER_DIR, exist_ok=True)
os.makedirs(MENU_DIR, exist_ok=True)


def svg(w, h, inner, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}"><defs>{defs}</defs>{inner}</svg>\n')


def grad(id_, stops, vertical=True):
    coords = 'x1="0" y1="0" x2="0" y2="1"' if vertical else 'x1="0" y1="0" x2="1" y2="0"'
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id_}" {coords}>{s}</linearGradient>'


# Cada função devolve (inner, defs) para um viewBox 600 x H (prefixo p evita colisão de ids)
def bun_top(p, H=190):
    d = grad(p + "g", [(0, "#f2b45c"), (0.55, "#c9772b"), (1, "#8f4a17")])
    inner = f'<path d="M12 {H-8} C 6 {H*0.35}, 120 6, 300 6 S 594 {H*0.35}, 588 {H-8} Q 300 {H+10} 12 {H-8} Z" fill="url(#{p}g)"/>'
    inner += f'<path d="M60 {H*0.45} C 120 20, 480 20, 540 {H*0.45} C 440 {H*0.18}, 160 {H*0.18}, 60 {H*0.45} Z" fill="#fff" opacity=".13"/>'
    rnd = random.Random(7)
    for _ in range(26):
        x = rnd.uniform(110, 490)
        y = rnd.uniform(30, H * 0.62)
        # mantém sementes dentro da cúpula
        if y < 60 and not (200 < x < 400):
            continue
        a = rnd.uniform(-40, 40)
        inner += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="9" ry="4.6" fill="#f6e7c1" transform="rotate({a:.0f} {x:.0f} {y:.0f})"/>'
    return inner, d


def sauce(p, H=44):
    d = grad(p + "g", [(0, "#f08a3c"), (1, "#c2551a")])
    inner = f'<path d="M20 12 Q 80 2 150 12 T 300 12 T 450 12 T 580 12 Q 592 26 570 30 Q 520 44 470 32 Q 400 44 330 32 Q 250 46 180 32 Q 100 42 40 30 Q 12 28 20 12 Z" fill="url(#{p}g)"/>'
    return inner, d


def lettuce(p, H=66):
    d = grad(p + "g", [(0, "#8ed05a"), (1, "#3f8f2a")])
    inner = ('<path d="M8 30 Q 30 6 60 24 T 120 22 T 180 26 T 240 20 T 300 28 T 360 20 T 420 26 T 480 20 T 540 24 T 592 30 '
             'Q 596 50 570 52 Q 540 62 500 52 Q 460 64 420 52 Q 380 62 340 52 Q 300 64 260 52 Q 220 62 180 52 Q 140 62 100 52 Q 60 62 30 52 Q 4 50 8 30 Z" '
             f'fill="url(#{p}g)"/>')
    inner += '<path d="M40 34 Q 150 20 300 34 T 560 34" stroke="#c5ee9b" stroke-width="3" fill="none" opacity=".55"/>'
    return inner, d


def tomato(p, H=52):
    d = grad(p + "g", [(0, "#e8453a"), (1, "#a8201a")])
    inner = ""
    for i, cx in enumerate(range(80, 560, 100)):
        inner += f'<ellipse cx="{cx}" cy="26" rx="62" ry="22" fill="url(#{p}g)"/>'
        inner += f'<ellipse cx="{cx}" cy="25" rx="42" ry="11" fill="#f26a5c" opacity=".55"/>'
    return inner, d


def cheddar(p, H=56):
    d = grad(p + "g", [(0, "#ffc83a"), (1, "#e88f12")])
    inner = (f'<path d="M24 8 H 576 L 584 22 L 560 24 Q 556 50 540 50 Q 524 50 520 24 H 420 Q 414 40 404 40 Q 394 40 390 24 '
             f'H 210 Q 206 48 190 48 Q 174 48 172 24 H 70 Q 64 36 54 36 Q 44 36 40 24 L 16 22 Z" fill="url(#{p}g)"/>')
    inner += '<path d="M40 14 H 560" stroke="#fff3b0" stroke-width="4" opacity=".6"/>'
    return inner, d


def patty(p, H=96):
    d = grad(p + "g", [(0, "#6b3a22"), (0.5, "#4a2414"), (1, "#2b130a")])
    inner = f'<rect x="10" y="6" width="580" height="{H-14}" rx="42" fill="url(#{p}g)"/>'
    rnd = random.Random(3)
    for _ in range(70):
        x = rnd.uniform(40, 560)
        y = rnd.uniform(18, H - 26)
        inner += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rnd.uniform(4, 12):.0f}" ry="{rnd.uniform(2, 5):.0f}" fill="#{rnd.choice(["8a5a3a", "1c0c06", "6f4126"])}" opacity=".7"/>'
    inner += f'<rect x="40" y="12" width="520" height="8" rx="4" fill="#fff" opacity=".1"/>'
    return inner, d


def bacon(p, H=54):
    d = grad(p + "g", [(0, "#d6534a"), (1, "#8c231c")])
    inner = ""
    for k, (y0, off) in enumerate(((8, 0), (20, 40))):
        pts = f"M{4+off} {y0+8} "
        x = 4 + off
        up = True
        while x < 590:
            x += 60
            pts += f"Q {x-30} {y0 + (-4 if up else 22)} {x} {y0+8} "
            up = not up
        pts += f"L 590 {y0+30} L {4+off} {y0+30} Z"
        inner += f'<path d="{pts}" fill="url(#{p}g)"/>'
        inner += f'<path d="M{20+off} {y0+16} Q 300 {y0+4} 570 {y0+16}" stroke="#f3b3a4" stroke-width="5" fill="none" opacity=".5"/>'
    return inner, d


def onion(p, H=50):
    d = grad(p + "g", [(0, "#b9792a"), (1, "#6e3f10")])
    inner = f'<path d="M14 24 Q 40 4 90 12 T 190 10 T 300 14 T 410 10 T 510 12 Q 580 8 588 28 Q 570 46 520 40 Q 440 48 380 40 Q 300 48 220 40 Q 140 48 80 40 Q 30 46 14 24 Z" fill="url(#{p}g)"/>'
    for cx in range(70, 560, 80):
        inner += f'<ellipse cx="{cx}" cy="26" rx="26" ry="9" fill="none" stroke="#e7b361" stroke-width="3" opacity=".7"/>'
    return inner, d


def bun_bottom(p, H=90):
    d = grad(p + "g", [(0, "#d58d3d"), (1, "#8f4a17")])
    inner = f'<path d="M10 8 H 590 Q 596 56 540 {H-8} Q 300 {H+2} 60 {H-8} Q 4 56 10 8 Z" fill="url(#{p}g)"/>'
    inner += '<rect x="30" y="12" width="540" height="10" rx="5" fill="#fff" opacity=".12"/>'
    return inner, d


LAYERS = [
    ("bun-top", bun_top, 190),
    ("special-sauce", sauce, 44),
    ("lettuce", lettuce, 66),
    ("tomato", tomato, 52),
    ("cheddar", cheddar, 56),
    ("beef-patty", patty, 96),
    ("bacon", bacon, 54),
    ("caramelized-onion", onion, 50),
    ("bun-bottom", bun_bottom, 90),
]

# Camadas individuais (viewBox 600 x H) — o nome do arquivo bate com os PNG finais.
for name, fn, h in LAYERS:
    inner, defs = fn("x", h)
    with open(os.path.join(BURGER_DIR, name + ".svg"), "w", encoding="utf-8") as f:
        f.write(svg(600, h, inner, defs))


def compose(indices, gap=-6):
    """Empilha camadas para a ilustração provisória de um item do cardápio."""
    y = 0
    parts, defs = "", ""
    for n, i in enumerate(indices):
        name, fn, h = LAYERS[i]
        inner, d = fn(f"m{n}", h)
        parts += f'<g transform="translate(0 {y})">{inner}</g>'
        defs += d
        y += h + gap
    return parts, defs, y


MENU = {
    "classico": [0, 1, 2, 3, 4, 5, 8],
    "smoke-cheddar": [0, 1, 4, 5, 6, 7, 8],
    "brasa-dupla": [0, 2, 4, 5, 4, 5, 6, 8],
}

for slug, idx in MENU.items():
    parts, defs, hh = compose(idx)
    W, H = 800, 640
    scale = 0.9
    ox = (W - 600 * scale) / 2
    oy = (H - hh * scale) / 2 + 10
    bg = ('<rect width="800" height="640" fill="#1a1411"/>'
          '<circle cx="400" cy="330" r="250" fill="#2a1d16"/>'
          '<ellipse cx="400" cy="560" rx="230" ry="18" fill="#000" opacity=".45"/>')
    body = f'{bg}<g transform="translate({ox} {oy}) scale({scale})">{parts}</g>'
    with open(os.path.join(MENU_DIR, slug + ".svg"), "w", encoding="utf-8") as f:
        f.write(svg(W, H, body, defs))

print("Placeholders gerados em", BURGER_DIR, "e", MENU_DIR)
