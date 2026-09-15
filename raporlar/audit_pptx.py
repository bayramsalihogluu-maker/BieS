#!/usr/bin/env python3
"""Geometry and content audit for the deck.

LibreOffice cannot run in this sandbox, so the usual render-and-look QA is
impossible. This substitutes measurable checks: nothing off-slide, nothing
crossing the margin, no overlapping text boxes, and a conservative estimate of
text that cannot fit its box.
"""
import sys
from pptx import Presentation
from pptx.util import Emu

PATH = "/home/user/BieS/raporlar/TR-Depreciation-Amortisation-HQ-Briefing.pptx"
MARGIN = 0.5           # inches, minimum from slide edge
EMU_IN = 914400

prs = Presentation(PATH)
SW = prs.slide_width / EMU_IN
SH = prs.slide_height / EMU_IN
print(f"Slayt boyutu: {SW:.2f} x {SH:.2f} inch")
print(f"Slayt sayisi: {len(prs.slides)}")

problems = []


def box(sh):
    try:
        return (sh.left / EMU_IN, sh.top / EMU_IN,
                sh.width / EMU_IN, sh.height / EMU_IN)
    except TypeError:
        return None


def overlap(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    ix = max(0, min(ax + aw, bx + bw) - max(ax, bx))
    iy = max(0, min(ay + ah, by + bh) - max(ay, by))
    return ix * iy


for idx, slide in enumerate(prs.slides, 1):
    shapes = []
    for sh in slide.shapes:
        b = box(sh)
        if b is None:
            continue
        x, y, w, h = b
        name = sh.shape_type
        txt = ""
        if sh.has_text_frame:
            txt = sh.text_frame.text.strip()

        # 1. off-slide / margin
        if x < -0.01 or y < -0.01 or x + w > SW + 0.01 or y + h > SH + 0.01:
            problems.append(f"S{idx}: SLAYT DISINDA  {txt[:38]!r}  "
                            f"x={x:.2f} y={y:.2f} w={w:.2f} h={h:.2f}")
        elif txt and (x < MARGIN - 0.01 or y < MARGIN - 0.21 or
                      x + w > SW - MARGIN + 0.01 or y + h > SH - MARGIN + 0.22):
            problems.append(f"S{idx}: KENAR BOSLUGU DAR  {txt[:38]!r}  "
                            f"x={x:.2f} y={y:.2f} sag={x+w:.2f} alt={y+h:.2f}")

        # 2. crude text-fit estimate for text boxes
        if txt and sh.has_text_frame:
            sizes = [r.font.size.pt for p in sh.text_frame.paragraphs
                     for r in p.runs if r.font.size]
            pt = max(sizes) if sizes else 12
            # ~1.9 chars per (pt/10) per inch of width is conservative for Calibri
            chars_per_line = max(1, int(w * 96 / (pt * 0.52)))
            lines = 0
            for para in txt.split("\n"):
                lines += max(1, -(-len(para) // chars_per_line))
            need = lines * (pt * 1.28) / 72.0
            if need > h + 0.06:
                problems.append(f"S{idx}: TASMA RISKI  {txt[:38]!r}  "
                                f"gerekli~{need:.2f}in kutu={h:.2f}in ({pt:.0f}pt)")

        if txt:
            shapes.append((b, txt, sh))

    # 3. overlapping text boxes (ignore container cards, which have no text)
    for i in range(len(shapes)):
        for j in range(i + 1, len(shapes)):
            a, ta, _ = shapes[i]
            bb, tb, _ = shapes[j]
            ov = overlap(a, bb)
            amin = min(a[2] * a[3], bb[2] * bb[3])
            if amin > 0 and ov / amin > 0.30:
                problems.append(f"S{idx}: METIN KUTULARI CAKISIYOR  "
                                f"{ta[:24]!r} <-> {tb[:24]!r}  ortusme={ov/amin:.0%}")

print(f"\nBulgu sayisi: {len(problems)}")
for p in problems:
    print("  -", p)

print("\n=== SLAYT BASLIKLARI ===")
for idx, slide in enumerate(prs.slides, 1):
    texts = [sh.text_frame.text.strip().split("\n")[0]
             for sh in slide.shapes
             if sh.has_text_frame and sh.text_frame.text.strip()]
    print(f"  {idx:>2}. {texts[0][:72] if texts else '(metin yok)'}")

sys.exit(1 if problems else 0)
