"""Brighten the dark-navy globe of the Propel Ready logo so it reads on dark backgrounds.

Targets dark, blue-dominant pixels (the globe mesh + nodes) and lifts them toward a
brighter blue, leaving the blue->green arrow gradient largely untouched.
"""
from PIL import Image
import os

SRC = os.path.join("public", "propel-ready-logo-transparent.png")
OUT = os.path.join("public", "propel-ready-logo-transparent.png")

# Bright target the dark navy is pulled toward.
TARGET = (147, 197, 253)  # #93c5fd

img = Image.open(SRC).convert("RGBA")
px = img.load()
w, h = img.size


def lerp(a, b, t):
    return int(round(a + (b - a) * t))


for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        mx = max(r, g, b)
        # Blue-dominant and reasonably dark == globe navy. Greenish arrow tip is skipped.
        blue_dominant = b >= r and b >= g and (b - g) > 8
        if blue_dominant and mx < 190:
            # darker pixels get pulled harder toward the bright target
            t = 0.78 + 0.2 * (1.0 - mx / 190.0)
            t = max(0.0, min(0.98, t))
            nr = lerp(r, TARGET[0], t)
            ng = lerp(g, TARGET[1], t)
            nb = lerp(b, TARGET[2], t)
            px[x, y] = (nr, ng, nb, a)

img.save(OUT)
print(f"Saved {OUT} size={img.size}")
