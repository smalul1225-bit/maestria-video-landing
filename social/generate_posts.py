"""
Generate 12 AIVB-style typography posts for Maestría IA.
Square 1080x1080. Bold type. Brand orange. Pure CSS-grade visuals — no AI faces (tooling limitation).
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math
import random

OUT = os.path.dirname(os.path.abspath(__file__))
random.seed(42)

# Brand palette
ORANGE = (255, 107, 0)        # primary CTA orange
ORANGE_DK = (200, 70, 0)
BLACK = (10, 10, 12)
WHITE = (255, 255, 255)
CREAM = (250, 246, 240)
PURPLE = (90, 40, 180)
PINK = (255, 90, 140)
DARK_BG = (18, 18, 22)
GREEN_AI = (40, 220, 120)

FONT_BOLD = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_REG  = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_AVENIR = "/System/Library/Fonts/Avenir Next.ttc"
# Use Helvetica fallback
def fnt(size, weight='bold'):
    try:
        if weight == 'bold':
            return ImageFont.truetype(FONT_AVENIR, size, index=1)  # Avenir Next Bold
        else:
            return ImageFont.truetype(FONT_AVENIR, size, index=0)
    except Exception:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)

W, H = 1080, 1080

def grad_bg(c1, c2, vertical=True):
    img = Image.new("RGB", (W, H), c1)
    pix = img.load()
    for y in range(H):
        t = y / H if vertical else 0
        if not vertical:
            for x in range(W):
                t = x / W
                r = int(c1[0]*(1-t) + c2[0]*t)
                g = int(c1[1]*(1-t) + c2[1]*t)
                b = int(c1[2]*(1-t) + c2[2]*t)
                pix[x, y] = (r, g, b)
        else:
            r = int(c1[0]*(1-t) + c2[0]*t)
            g = int(c1[1]*(1-t) + c2[1]*t)
            b = int(c1[2]*(1-t) + c2[2]*t)
            for x in range(W):
                pix[x, y] = (r, g, b)
    return img

def add_noise(img, amount=8):
    pix = img.load()
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            n = random.randint(-amount, amount)
            r, g, b = pix[x, y]
            pix[x, y] = (max(0,min(255,r+n)), max(0,min(255,g+n)), max(0,min(255,b+n)))
    return img

def draw_centered(draw, text, y, size, color=WHITE, weight='bold', tracking=0, max_width=None):
    f = fnt(size, weight)
    # Multi-line support
    lines = text.split('\n')
    line_h = size * 1.05
    total_h = line_h * len(lines)
    cy = y
    for line in lines:
        bbox = draw.textbbox((0,0), line, font=f)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        x = (W - tw) // 2
        draw.text((x, cy), line, font=f, fill=color)
        cy += int(line_h)
    return cy

def watermark(draw, text="@maestriavideo", color=(255,255,255,180)):
    f = fnt(22, 'reg')
    bbox = draw.textbbox((0,0), text, font=f)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, H - 60), text, font=f, fill=color)

def brand_badge(draw, color=ORANGE, label="Maestría IA"):
    f = fnt(24, 'bold')
    bbox = draw.textbbox((0,0), label, font=f)
    tw = bbox[2] - bbox[0]
    pad = 18
    bw, bh = tw + pad*2, 44
    bx, by = (W - bw) // 2, 60
    draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=22, fill=color)
    draw.text((bx + pad, by + 8), label, font=f, fill=WHITE)

# === POST 1: "ESTO ES IA" - hero gradient ===
def post_01():
    img = grad_bg(ORANGE, ORANGE_DK)
    img = add_noise(img, 6)
    d = ImageDraw.Draw(img, "RGBA")
    # Decorative dotted accent
    for i in range(0, W, 28):
        d.ellipse([i, 130, i+6, 136], fill=(255,255,255,60))
        d.ellipse([i, 950, i+6, 956], fill=(255,255,255,60))
    draw_centered(d, "ESTO", 280, 180, WHITE)
    draw_centered(d, "ES IA.", 480, 220, WHITE)
    # Underline accent
    d.rectangle([W//2 - 140, 750, W//2 + 140, 760], fill=WHITE)
    draw_centered(d, "Y tú aún crees que necesitas cámara.", 800, 34, (255,255,255,230), 'reg')
    watermark(d)
    img.save(f"{OUT}/shared/01_esto_es_ia.png", "PNG", optimize=True)

# === POST 2: "CONTENIDO SOCIAL" - dark with neon ===
def post_02():
    img = Image.new("RGB", (W, H), DARK_BG)
    img = add_noise(img, 4)
    d = ImageDraw.Draw(img, "RGBA")
    # Grid lines
    for i in range(0, W, 90):
        d.line([(i, 0), (i, H)], fill=(255,255,255,12), width=1)
    for i in range(0, H, 90):
        d.line([(0, i), (W, i)], fill=(255,255,255,12), width=1)
    # Glow circle
    glow = Image.new("RGBA", (W, H), (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W//2 - 360, H//2 - 360, W//2 + 360, H//2 + 360], fill=(255,107,0,60))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(img)
    draw_centered(d, "CONTENIDO\nSOCIAL", 280, 160, WHITE)
    draw_centered(d, "Sin equipo. Sin actores. Sin excusas.", 760, 36, (240,240,240), 'reg')
    brand_badge(d)
    watermark(d)
    img.save(f"{OUT}/shared/02_contenido_social.png", "PNG", optimize=True)

# === POST 3: "CUALQUIER ESTILO" - color shift ===
def post_03():
    img = grad_bg(PURPLE, PINK, vertical=False)
    img = add_noise(img, 5)
    d = ImageDraw.Draw(img, "RGBA")
    # Stacked words
    f_big = fnt(140, 'bold')
    words = ["CINE", "ANIME", "RETRO", "3D", "REAL"]
    y = 220
    for i, w in enumerate(words):
        opacity = 255 if i == 2 else 110
        bbox = d.textbbox((0,0), w, font=f_big)
        tw = bbox[2] - bbox[0]
        d.text(((W - tw) // 2, y), w, font=f_big, fill=(255,255,255,opacity))
        y += 110
    draw_centered(d, "CUALQUIER ESTILO. UN SOLO PROMPT.", 880, 32, WHITE, 'bold')
    watermark(d)
    img.save(f"{OUT}/shared/03_cualquier_estilo.png", "PNG", optimize=True)

# === POST 4: "30 SEGUNDOS" - timer aesthetic ===
def post_04():
    img = grad_bg((20,20,25), (50,30,80))
    d = ImageDraw.Draw(img, "RGBA")
    # Big "30" - reduced so SEGUNDOS sits below without overlap
    f_huge = fnt(500, 'bold')
    bbox = d.textbbox((0,0), "30", font=f_huge)
    tw = bbox[2] - bbox[0]
    d.text(((W-tw)//2, 200), "30", font=f_huge, fill=ORANGE)
    draw_centered(d, "SEGUNDOS", 720, 100, WHITE)
    draw_centered(d, "El tiempo para crear tu próximo video.", 870, 30, (220,220,220), 'reg')
    brand_badge(d)
    watermark(d)
    img.save(f"{OUT}/shared/04_30_segundos.png", "PNG", optimize=True)

# === POST 5: "SIN CÁMARA" - minimalist cream ===
def post_05():
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img, "RGBA")
    # Camera icon (X'd out)
    cx, cy = W//2, 360
    d.rounded_rectangle([cx-130, cy-90, cx+130, cy+90], radius=20, outline=BLACK, width=10)
    d.rounded_rectangle([cx-30, cy-110, cx+30, cy-70], radius=8, outline=BLACK, width=10)
    d.ellipse([cx-50, cy-40, cx+50, cy+60], outline=BLACK, width=10)
    # Big red X over it
    d.line([(cx-160, cy-130), (cx+160, cy+130)], fill=(220,50,50), width=18)
    d.line([(cx-160, cy+130), (cx+160, cy-130)], fill=(220,50,50), width=18)
    draw_centered(d, "SIN\nCÁMARA.", 540, 150, BLACK)
    draw_centered(d, "Solo prompts. Solo IA. Solo resultados.", 900, 32, (60,60,60), 'reg')
    watermark(d, color=(60,60,60))
    img.save(f"{OUT}/shared/05_sin_camara.png", "PNG", optimize=True)

# === POST 6: "VIRAL" - bright explosive ===
def post_06():
    img = grad_bg(ORANGE, (255,200,50))
    img = add_noise(img, 8)
    d = ImageDraw.Draw(img, "RGBA")
    # Rays / sunburst
    cx, cy = W//2, H//2
    for ang in range(0, 360, 12):
        rad = math.radians(ang)
        x2 = cx + math.cos(rad) * 800
        y2 = cy + math.sin(rad) * 800
        d.line([(cx, cy), (x2, y2)], fill=(255,255,255,30), width=8)
    draw_centered(d, "TU PRÓXIMO\nVIDEO VIRAL", 320, 130, WHITE)
    draw_centered(d, "Empieza con una idea.\nLo demás lo hace la IA.", 700, 40, WHITE, 'reg')
    brand_badge(d, color=BLACK)
    watermark(d)
    img.save(f"{OUT}/shared/06_video_viral.png", "PNG", optimize=True)

# === POST 7: "+20.000 CREADORES" - social proof ===
def post_07():
    img = grad_bg(DARK_BG, (30,30,45))
    d = ImageDraw.Draw(img, "RGBA")
    # Avatar cluster (abstract circles)
    avs = [(200,260), (340,320), (480,260), (620,320), (760,260), (900,320),
           (270,440), (410,500), (550,440), (690,500), (830,440)]
    palettes = [ORANGE, PINK, PURPLE, (50,200,200), (255,200,50), (40,220,120)]
    for i, (x,y) in enumerate(avs):
        c = palettes[i % len(palettes)]
        d.ellipse([x-50, y-50, x+50, y+50], fill=c, outline=WHITE, width=4)
    draw_centered(d, "+20.000", 580, 180, WHITE)
    draw_centered(d, "creadores ya construyen con IA.", 800, 36, (220,220,220), 'reg')
    draw_centered(d, "¿Y tú qué esperas?", 870, 32, ORANGE, 'bold')
    watermark(d)
    img.save(f"{OUT}/shared/07_20k_creadores.png", "PNG", optimize=True)

# === POST 8: "$9 USD" - price hook ===
def post_08():
    img = grad_bg(ORANGE_DK, ORANGE)
    d = ImageDraw.Draw(img, "RGBA")
    # USD label on top
    draw_centered(d, "DESDE", 180, 36, (255,255,255,200), 'reg')
    # Big "$9"
    f_money = fnt(440, 'bold')
    bbox = d.textbbox((0,0), "$9", font=f_money)
    tw = bbox[2] - bbox[0]
    d.text(((W-tw)//2, 250), "$9", font=f_money, fill=WHITE)
    # USD subscript
    f_usd = fnt(72, 'bold')
    d.text(((W+tw)//2 + 18, 290), "USD", font=f_usd, fill=(255,255,255,220))
    draw_centered(d, "al mes", 720, 64, WHITE, 'reg')
    draw_centered(d, "Acceso completo a Maestría IA.\nCancela cuando quieras.", 830, 32, (255,255,255,230), 'reg')
    watermark(d)
    img.save(f"{OUT}/shared/08_9_usd.png", "PNG", optimize=True)

# === POST 9: "LO QUE NADIE TE ENSEÑA" - dark mysterious ===
def post_09():
    img = Image.new("RGB", (W, H), (8,8,12))
    d = ImageDraw.Draw(img, "RGBA")
    # Spotlight
    glow = Image.new("RGBA", (W, H), (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W//2 - 400, 200, W//2 + 400, 1000], fill=(255,107,0,40))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(img)
    draw_centered(d, "APRENDE", 320, 100, WHITE)
    draw_centered(d, "LO QUE NADIE\nTE ENSEÑA.", 440, 140, ORANGE)
    draw_centered(d, "Las herramientas que los grandes no quieren\nque conozcas.", 800, 30, (200,200,200), 'reg')
    brand_badge(d)
    watermark(d)
    img.save(f"{OUT}/shared/09_nadie_te_ensena.png", "PNG", optimize=True)

# === POST 10: "EL FUTURO" - tech grid ===
def post_10():
    img = grad_bg((10,10,30), (40,20,80))
    d = ImageDraw.Draw(img, "RGBA")
    # Tech grid perspective (pushed down)
    grid_top = 660
    for i in range(12):
        y = grid_top + i*40
        opacity = max(20, 200 - i*15)
        d.line([(0, y), (W, y)], fill=(255,107,0,opacity), width=2)
    # Vertical lines (perspective)
    for x_off in range(-7, 8):
        x_top = W//2 + x_off * 30
        x_bot = W//2 + x_off * 180
        d.line([(x_top, grid_top), (x_bot, H)], fill=(255,107,0,60), width=1)
    draw_centered(d, "EL FUTURO", 220, 100, WHITE)
    draw_centered(d, "DE LA CREACIÓN", 330, 80, WHITE)
    draw_centered(d, "DE VIDEO", 425, 80, ORANGE)
    draw_centered(d, "Ya está aquí. Y es más fácil de lo que crees.", 540, 28, (220,220,220), 'reg')
    watermark(d)
    img.save(f"{OUT}/shared/10_el_futuro.png", "PNG", optimize=True)

# === POST 11: "DE CERO A VIRAL" - transformation ===
def post_11():
    img = Image.new("RGB", (W, H), (20,20,25))
    d = ImageDraw.Draw(img, "RGBA")
    # Two halves
    d.rectangle([0, 0, W//2, H], fill=(20,20,25))
    d.rectangle([W//2, 0, W, H], fill=ORANGE)
    # Left side
    f_label = fnt(44, 'bold')
    f_big = fnt(180, 'bold')
    f_med = fnt(38, 'reg')
    # ANTES centered in left half
    def left_centered(text, y, font, fill):
        bbox = d.textbbox((0,0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (W//2 - tw) // 2
        d.text((x, y), text, font=font, fill=fill)
    def right_centered(text, y, font, fill):
        bbox = d.textbbox((0,0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = W//2 + (W//2 - tw) // 2
        d.text((x, y), text, font=font, fill=fill)
    left_centered("ANTES", 120, f_label, (160,160,160))
    left_centered("0", 380, f_big, WHITE)
    left_centered("vistas", 700, f_med, (180,180,180))
    right_centered("DESPUÉS", 120, f_label, WHITE)
    right_centered("1M+", 380, f_big, WHITE)
    right_centered("vistas", 700, f_med, WHITE)
    # Bottom strip
    d.rectangle([0, 900, W, H], fill=BLACK)
    draw_centered(d, "DE CERO A VIRAL CON IA", 940, 40, WHITE, 'bold')
    img.save(f"{OUT}/shared/11_cero_a_viral.png", "PNG", optimize=True)

# === POST 12: "DESBLOQUEA" - bold CTA ===
def post_12():
    img = grad_bg(PURPLE, ORANGE, vertical=True)
    img = add_noise(img, 6)
    d = ImageDraw.Draw(img, "RGBA")
    # Lock icon
    cx, cy = W//2, 280
    d.rounded_rectangle([cx-90, cy-30, cx+90, cy+130], radius=18, fill=WHITE)
    d.arc([cx-60, cy-130, cx+60, cy+30], 180, 360, fill=WHITE, width=18)
    d.ellipse([cx-15, cy+30, cx+15, cy+60], fill=PURPLE)
    d.rectangle([cx-8, cy+50, cx+8, cy+90], fill=PURPLE)
    draw_centered(d, "DESBLOQUEA", 480, 100, WHITE)
    draw_centered(d, "TU CREATIVIDAD", 580, 90, WHITE)
    draw_centered(d, "CON IA", 670, 90, WHITE)
    draw_centered(d, "Maestría IA → maestriavideo.com", 870, 32, WHITE, 'reg')
    watermark(d)
    img.save(f"{OUT}/shared/12_desbloquea.png", "PNG", optimize=True)


def main():
    print("Generating 12 post designs…")
    funcs = [post_01, post_02, post_03, post_04, post_05, post_06,
             post_07, post_08, post_09, post_10, post_11, post_12]
    for i, f in enumerate(funcs, 1):
        print(f"  [{i:02d}/12] {f.__name__}")
        f()
    print("Done. → /social/shared/")

if __name__ == "__main__":
    main()
