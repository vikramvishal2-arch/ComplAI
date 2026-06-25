"""Remove the white/near-white background from the Propel Ready logo and trim to content."""
from PIL import Image
import os

SRC = os.path.join("public", "propel-ready-logo-source.png")
OUT = os.path.join("public", "propel-ready-logo-transparent.png")

img = Image.open(SRC).convert("RGBA")
px = img.load()
w, h = img.size

# Threshold: pixels brighter than this (and low saturation) become transparent.
WHITE_CUTOFF = 238          # fully transparent at/above this
SOFT_EDGE = 205             # start fading from here for smooth anti-aliased edges

for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        mx, mn = max(r, g, b), min(r, g, b)
        sat = mx - mn  # low saturation == greyscale/white
        if mx >= WHITE_CUTOFF and sat <= 24:
            px[x, y] = (r, g, b, 0)
        elif mx >= SOFT_EDGE and sat <= 30:
            # linear fade across the soft edge band
            frac = (mx - SOFT_EDGE) / float(WHITE_CUTOFF - SOFT_EDGE)
            new_a = int(a * (1.0 - frac))
            px[x, y] = (r, g, b, max(0, min(a, new_a)))

# Trim transparent border so the mark fills the box.
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

img.save(OUT)
print(f"Saved {OUT} size={img.size}")
