"""
Generate Facebook Page profile pictures + cover photos for both Pages.
Mirrors AIVB aesthetic: black bg, bold orange-flame brand mark, big recruitment-banner cover.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(f"{OUT}/page-assets", exist_ok=True)

ORANGE = (255, 107, 0)
ORANGE_LIGHT = (255, 160, 50)
RED = (235, 60, 50)
BLACK = (8, 8, 12)
WHITE = (255, 255, 255)
CREAM = (250, 246, 240)

FONT_AVENIR = "/System/Library/Fonts/Avenir Next.ttc"

def fnt(size, weight='bold'):
    try:
        if weight == 'bold':
            return ImageFont.truetype(FONT_AVENIR, size, index=1)
        return ImageFont.truetype(FONT_AVENIR, size, index=0)
    except Exception:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)

def center_text(draw, text, y, size, w, color=WHITE, weight='bold', tracking=0):
    f = fnt(size, weight)
    lines = text.split('\n')
    line_h = size * 1.05
    cy = y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=f)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        draw.text((x, cy), line, font=f, fill=color)
        cy += int(line_h)
    return cy

def draw_flame_logo(d, cx, cy, r, color=ORANGE):
    """Draw a stylized flame/play triangle inside a circle."""
    # Outer circle (the brand mark container)
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color)
    # Inner play-arrow / flame triangle in white
    pad = int(r * 0.45)
    pts = [
        (cx - pad * 0.6, cy - pad),
        (cx - pad * 0.6, cy + pad),
        (cx + pad, cy)
    ]
    d.polygon(pts, fill=WHITE)

# ============================================================
# PROFILE PIC — Page A: Maestría IA (1080x1080)
# ============================================================
def profile_pic_a():
    W = H = 1080
    img = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(img, "RGBA")
    # Subtle gradient ring at edges
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([60, 60, W-60, H-60], outline=(255, 107, 0, 80), width=6)
    glow = glow.filter(ImageFilter.GaussianBlur(8))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    # Big orange play-flame mark
    draw_flame_logo(d, W//2, H//2 - 80, 220, ORANGE)
    # Brand wordmark
    center_text(d, "MAESTRÍA", H//2 + 180, 100, W, WHITE, 'bold')
    center_text(d, "IA", H//2 + 290, 130, W, ORANGE, 'bold')
    img.save(f"{OUT}/page-assets/A_profile.png", "PNG", optimize=True)
    print(f"  ✓ A_profile.png")

# ============================================================
# PROFILE PIC — Page B: Maestría IA Academia (1080x1080)
# ============================================================
def profile_pic_b():
    W = H = 1080
    img = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(img, "RGBA")
    # Outer ring (slightly different so the two are visually distinct)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([60, 60, W-60, H-60], outline=(255, 107, 0, 80), width=6)
    glow = glow.filter(ImageFilter.GaussianBlur(8))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    # Open book mark (more iconic for "Academia")
    cx, cy = W//2, H//2 - 60
    # Two book pages as parallelograms (left and right)
    left_pts  = [(cx - 240, cy - 40), (cx, cy - 80), (cx, cy + 120), (cx - 220, cy + 90)]
    right_pts = [(cx + 240, cy - 40), (cx, cy - 80), (cx, cy + 120), (cx + 220, cy + 90)]
    d.polygon(left_pts, fill=ORANGE)
    d.polygon(right_pts, fill=ORANGE)
    # White center spine
    d.line([(cx, cy - 80), (cx, cy + 120)], fill=BLACK, width=4)
    # White page lines (suggesting text)
    for i, off in enumerate([10, 50, 90]):
        d.line([(cx - 180 + i*8, cy + off), (cx - 30, cy + off)], fill=WHITE, width=4)
        d.line([(cx + 30, cy + off), (cx + 180 - i*8, cy + off)], fill=WHITE, width=4)
    # Brand wordmark
    center_text(d, "MAESTRÍA IA", H//2 + 200, 90, W, WHITE, 'bold')
    center_text(d, "ACADEMIA", H//2 + 305, 80, W, ORANGE, 'bold')
    img.save(f"{OUT}/page-assets/B_profile.png", "PNG", optimize=True)
    print(f"  ✓ B_profile.png")

# ============================================================
# COVER PHOTO — Page A: Maestría IA (1640x720 — FB recommended)
# ============================================================
def cover_a():
    W, H = 1640, 720
    img = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(img, "RGBA")
    # Subtle radial glow off-center
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W//2 - 600, H//2 - 600, W//2 + 600, H//2 + 600], fill=(255, 107, 0, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    # Brand mark top-left
    draw_flame_logo(d, 100, 110, 50, ORANGE)
    f_brand = fnt(32, 'bold')
    d.text((170, 95), "MAESTRÍA IA", font=f_brand, fill=WHITE)
    # Hero text — recruitment style
    center_text(d, "Únete a +20,000 creadores", 200, 70, W, WHITE, 'bold')
    center_text(d, "que ya construyen con IA", 280, 70, W, WHITE, 'bold')
    # Highlight line
    center_text(d, "la comunidad #1 de IA en español", 400, 50, W, ORANGE, 'bold')
    # CTA strip
    cta_text = "Desde $9 USD/mes  ·  maestriavideo.com"
    f_cta = fnt(34, 'reg')
    bbox = d.textbbox((0, 0), cta_text, font=f_cta)
    tw = bbox[2] - bbox[0]
    pad = 24
    bx, by = (W - tw) // 2 - pad, 580
    d.rounded_rectangle([bx, by, bx + tw + pad*2, by + 64], radius=32, outline=ORANGE, width=3)
    d.text((bx + pad, by + 14), cta_text, font=f_cta, fill=WHITE)
    img.save(f"{OUT}/page-assets/A_cover.png", "PNG", optimize=True)
    print(f"  ✓ A_cover.png")

# ============================================================
# COVER PHOTO — Page B: Maestría IA Academia (1640x720)
# ============================================================
def cover_b():
    W, H = 1640, 720
    img = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(img, "RGBA")
    # Two-tone background (left dark, right orange wedge)
    wedge = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wedge)
    wd.polygon([(W*0.6, 0), (W, 0), (W, H), (W*0.45, H)], fill=(255, 107, 0, 200))
    wedge = wedge.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img.convert("RGBA"), wedge).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    # Brand mark top-left
    draw_flame_logo(d, 100, 110, 50, ORANGE)
    f_brand = fnt(32, 'bold')
    d.text((170, 95), "MAESTRÍA IA · ACADEMIA", font=f_brand, fill=WHITE)
    # Hero text — educational tone
    f_main = fnt(76, 'bold')
    d.text((80, 220), "Aprende creación", font=f_main, fill=WHITE)
    d.text((80, 300), "con IA en español", font=f_main, fill=WHITE)
    d.text((80, 380), "paso a paso.", font=f_main, fill=ORANGE)
    # Sub
    f_sub = fnt(36, 'reg')
    d.text((82, 490), "Cursos · Comunidad · Herramientas", font=f_sub, fill=(220, 220, 220))
    # CTA strip (ASCII-safe — no special arrow that misses fallback)
    f_cta = fnt(32, 'bold')
    d.text((82, 580), "Desde $9 USD/mes  ·  maestriavideo.com", font=f_cta, fill=WHITE)
    img.save(f"{OUT}/page-assets/B_cover.png", "PNG", optimize=True)
    print(f"  ✓ B_cover.png")


def main():
    print("Generating Page assets…")
    profile_pic_a()
    profile_pic_b()
    cover_a()
    cover_b()
    print("Done. → /social/page-assets/")

if __name__ == "__main__":
    main()
