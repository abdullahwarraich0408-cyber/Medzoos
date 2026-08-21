from PIL import Image
from pathlib import Path

ROOT = Path(r"c:\Users\HP 650 G9\Desktop\Business\app\medCare")
WORD = ROOT / "src" / "assets" / "branding" / "medzoos-wordmark.png"
MARK = ROOT / "src" / "assets" / "branding" / "medzoos-mark.png"
BRAND = ROOT / "src" / "assets" / "branding"
DRAWABLE = ROOT / "android" / "app" / "src" / "main" / "res" / "drawable"
DRAWABLE.mkdir(parents=True, exist_ok=True)

WHITE = (255, 255, 255, 255)


def trim_content(img: Image.Image, pad=8):
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 20 and (r < 248 or g < 248 or b < 248):
                found = True
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if not found:
        return img
    minx = max(0, minx - pad)
    miny = max(0, miny - pad)
    maxx = min(w - 1, maxx + pad)
    maxy = min(h - 1, maxy + pad)
    return img.crop((minx, miny, maxx + 1, maxy + 1))


word = trim_content(Image.open(WORD))
mark = trim_content(Image.open(MARK))

# Clean JS wordmark (tight crop on transparent/white)
word_js = Image.new("RGBA", (word.width + 40, word.height + 40), WHITE)
word_js.alpha_composite(word, (20, 20))
word_js.save(BRAND / "splash-wordmark.png")
print("splash-wordmark", word_js.size)

# Native cold-start splash: portrait canvas, logo comfortably centered (NOT zoomed)
W, H = 1080, 1920
canvas = Image.new("RGBA", (W, H), WHITE)

# Wordmark ~58% of screen width
target_w = int(W * 0.58)
ratio = target_w / word.width
nw, nh = target_w, int(word.height * ratio)
word_r = word.resize((nw, nh), Image.Resampling.LANCZOS)
x = (W - nw) // 2
y = int(H * 0.42) - nh // 2
canvas.alpha_composite(word_r, (x, y))
canvas.save(DRAWABLE / "splash_logo.png")
print("splash_logo", canvas.size, "logo_at", (x, y, nw, nh))

# Also save a square safe preview for JS hero if needed
preview = Image.new("RGBA", (900, 1600), WHITE)
pw = int(900 * 0.62)
pr = pw / word.width
pnw, pnh = pw, int(word.height * pr)
preview.alpha_composite(
    word.resize((pnw, pnh), Image.Resampling.LANCZOS),
    ((900 - pnw) // 2, 1600 // 2 - pnh // 2 - 40),
)
preview.save(BRAND / "splash-hero.png")
print("splash-hero", preview.size)
print("done")
