from PIL import Image, ImageDraw
from pathlib import Path

ROOT = Path(r"c:\Users\HP 650 G9\Desktop\Business\app\medCare")
MARK = ROOT / "src" / "assets" / "branding" / "medzoos-mark.png"
WORD = ROOT / "src" / "assets" / "branding" / "medzoos-wordmark.png"
RES = ROOT / "android" / "app" / "src" / "main" / "res"
DRAWABLE = RES / "drawable"
DRAWABLE.mkdir(parents=True, exist_ok=True)

WHITE = (255, 255, 255, 255)

mark = Image.open(MARK).convert("RGBA")
word = Image.open(WORD).convert("RGBA")


def trim_transparent(img, pad=2):
    bbox = img.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


mark = trim_transparent(mark)
word = trim_transparent(word)


def fit_on_canvas(src, size, scale=0.92, bg=WHITE, round_mask=False):
    canvas = Image.new("RGBA", (size, size), bg)
    max_side = int(size * scale)
    ratio = min(max_side / src.width, max_side / src.height)
    nw = max(1, int(src.width * ratio))
    nh = max(1, int(src.height * ratio))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.alpha_composite(resized, (x, y))
    if round_mask:
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size - 1, size - 1), fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(canvas, (0, 0))
        out.putalpha(mask)
        return out
    return canvas


# Zoomed launcher icons — fill most of the tile
sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

for folder, size in sizes.items():
    out_dir = RES / folder
    out_dir.mkdir(parents=True, exist_ok=True)
    icon = fit_on_canvas(mark, size, scale=0.94)
    round_icon = fit_on_canvas(mark, size, scale=0.94, round_mask=True)
    icon.save(out_dir / "ic_launcher.png")
    round_icon.save(out_dir / "ic_launcher_round.png")
    print(f"wrote {folder} {size}px (zoomed)")

# Native splash: large centered Z mark (reads clearly on cold start)
splash = Image.new("RGBA", (1080, 1920), WHITE)
mark_big = trim_transparent(mark)
# Large mark in vertical center
ratio = min(720 / mark_big.width, 720 / mark_big.height)
nw, nh = int(mark_big.width * ratio), int(mark_big.height * ratio)
mark_r = mark_big.resize((nw, nh), Image.Resampling.LANCZOS)
splash.alpha_composite(mark_r, ((1080 - nw) // 2, (1920 - nh) // 2 - 80))

# Wordmark under the mark
wm = trim_transparent(word)
wr = min(640 / wm.width, 160 / wm.height)
ww, wh = int(wm.width * wr), int(wm.height * wr)
wm_r = wm.resize((ww, wh), Image.Resampling.LANCZOS)
splash.alpha_composite(wm_r, ((1080 - ww) // 2, (1920 - nh) // 2 - 80 + nh + 48))
splash.save(DRAWABLE / "splash_logo.png")
print("wrote splash_logo.png (full-screen composition)")

# Also keep a centered bitmap-friendly logo for layer-list gravity=center
centered = Image.new("RGBA", (900, 900), WHITE)
ratio2 = min(780 / mark_big.width, 780 / mark_big.height)
nw2, nh2 = int(mark_big.width * ratio2), int(mark_big.height * ratio2)
mark2 = mark_big.resize((nw2, nh2), Image.Resampling.LANCZOS)
centered.alpha_composite(mark2, ((900 - nw2) // 2, (900 - nh2) // 2 - 40))
wr2 = min(700 / wm.width, 140 / wm.height)
ww2, wh2 = int(wm.width * wr2), int(wm.height * wr2)
wm2 = wm.resize((ww2, wh2), Image.Resampling.LANCZOS)
centered.alpha_composite(wm2, ((900 - ww2) // 2, (900 - nh2) // 2 - 40 + nh2 + 36))
centered.save(DRAWABLE / "splash_logo.png")
print("wrote splash_logo.png (square centered)")

js_assets = ROOT / "src" / "assets" / "branding"
fit_on_canvas(mark, 512, scale=0.94).save(js_assets / "icon-foreground.png")
centered.save(js_assets / "splash-hero.png")
print("done")
