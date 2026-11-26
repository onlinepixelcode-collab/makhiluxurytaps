#!/usr/bin/env python3
"""Render the catalogue:
  1. flatten product photos onto the stone tone (no CSS blend → light, vector PDF)
  2. ONE headless Chrome run prints the PDF            → site/assets/catalogue/makhi-collection-2026.pdf
  3. macOS PDFKit rasterises pages (no browser windows) → site/assets/catalogue/pages/pNN.webp
Needs the local preview server on :8765 (python3 -m http.server 8765 --directory site)."""
import os, json, subprocess, concurrent.futures as cf, glob, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "..", "site")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE = os.environ.get("CAT_BASE", "http://localhost:8765/catalogue/print.html")
OUT = os.path.join(SITE, "assets", "catalogue")
FLAT = os.path.join(OUT, "img")
TMP = os.path.join(os.environ.get("TMPDIR", "/tmp"), "makhi_cat")
for d in (os.path.join(OUT, "pages"), FLAT, TMP): os.makedirs(d, exist_ok=True)

# 1. flatten every product photo onto stone #EFEBE4 with a multiply blend (ffmpeg)
def flat(src):
    name = os.path.basename(src).replace(".webp", ".jpg")
    dst = os.path.join(FLAT, name)
    if os.path.exists(dst): return
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-f", "lavfi", "-i", "color=c=0xEFEBE4:s=16x16",
                    "-filter_complex", "[0:v]scale=900:-2,format=gbrp[a];[1:v]format=gbrp[c];[c][a]scale2ref[b][a2];[a2][b]blend=all_mode=multiply,format=yuvj420p",
                    "-frames:v", "1", "-q:v", "4", dst], check=True)
for f in glob.glob(os.path.join(FLAT, "*.jpg")):
    if not os.path.basename(f).startswith("ls-"): os.remove(f)
for name in ("brass-flow", "kitchen-marble", "bath-mountain", "bath-black-tub", "marble-white", "marble-black"):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", os.path.join(SITE, "assets", "img", "ls", name + ".webp"), "-vf", "scale=1300:-2", "-q:v", "5", os.path.join(FLAT, "ls-" + name + ".jpg")], check=True)
srcs = sorted(glob.glob(os.path.join(SITE, "assets", "img", "p", "*_0.webp")))
with cf.ThreadPoolExecutor(6) as ex: list(ex.map(flat, srcs))
print("flattened", len(srcs))

# 2. one Chrome run → PDF
pdf = os.path.join(OUT, "makhi-collection-2026.pdf")
subprocess.run([CHROME, "--headless=new", f"--user-data-dir={TMP}/prof", "--no-first-run", "--disable-gpu", "--no-pdf-header-footer",
                "--virtual-time-budget=12000", f"--print-to-pdf={pdf}", BASE], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=240)
print("pdf", os.path.getsize(pdf) // 1024, "KB")

# 3. PDFKit → PNG → WebP
pngdir = os.path.join(TMP, "png"); shutil.rmtree(pngdir, ignore_errors=True); os.makedirs(pngdir)
subprocess.run(["swift", os.path.join(HERE, "pdf_pages.swift"), pdf, pngdir, "1100"], check=True)
for f in glob.glob(os.path.join(OUT, "pages", "*.webp")): os.remove(f)
def towebp(png):
    out = os.path.join(OUT, "pages", os.path.basename(png).replace(".png", ".webp"))
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", png, "-q:v", "86", out], check=True)
with cf.ThreadPoolExecutor(6) as ex: list(ex.map(towebp, sorted(glob.glob(os.path.join(pngdir, "*.png")))))
print("pages", len(glob.glob(os.path.join(OUT, "pages", "*.webp"))))
