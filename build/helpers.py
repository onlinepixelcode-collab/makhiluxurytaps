"""Catalogue helpers + static card renderers (mirror core.js markup)."""
import json, os, re
from layout import e, ICON

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "..", "site")

def load_products():
    s = open(os.path.join(SITE, "assets/js/data.js"), encoding="utf-8").read()
    return json.loads(s.split("window.MAKHI_PRODUCTS = ", 1)[1].rstrip().rstrip(";"))

P = load_products()
BY = {p["slug"]: p for p in P}
TYPE_LABEL = {"basin-mixer": "Basin Mixer", "kitchen-faucet": "Kitchen Faucet", "freestanding-mixer": "Freestanding Bath Mixer", "bath-mixer": "Bath Mixer",
              "shower-mixer": "Shower Mixer", "shower-column": "Shower Column", "wall-tap": "Wall-mounted Tap", "bath": "Freestanding Bath", "basin": "Basin",
              "vanity": "Vanity", "enclosed-shower": "Enclosed Shower", "walk-in": "Walk-in Shower", "toilet": "Toilet", "combo": "Combo Deal"}
FIN_LABEL = {"gold": "Gold", "black": "Black", "silver": "Silver", "chrome": "Chrome", "stainless": "Stainless Steel", "white": "White", "blackwhite": "Black & White"}

def money(n):
    return f"R{n:,.2f}"

def img(p, i=0):
    if p["type"] == "combo" and p.get("cover") and i == 0:
        return p["cover"]
    return p["images"][i] if i < len(p["images"]) else p["images"][0]

def base_key(p):
    n = p["name"].lower()
    n = re.sub(r"—.*$", "", n)
    n = re.sub(r"\b(gold|black|silver|chrome|matt|matte|white|stainless|steel|tinted)\b", "", n)
    return re.sub(r"\s+", " ", n).strip()

def siblings(p):
    return [q for q in P if q["id"] != p["id"] and q["type"] == p["type"] and base_key(q) == base_key(p)]

def price_html(p):
    if p.get("was"):
        return f'<span class="price"><span class="sale">{money(p["price"])}</span><s>{money(p["was"])}</s></span>'
    return f'<span class="price">{money(p["price"])}</span>'

def sw(k):
    return f'<i class="sw sw--{k}" title="{FIN_LABEL.get(k, k)}"></i>'

def card(p, cls=""):
    R = "{{R}}"
    fins = []
    for q in [p] + siblings(p):
        if q.get("finish") and q["finish"] not in fins:
            fins.append(q["finish"])
    alt = f'<div class="tile alt"><img src="{R}{p["images"][1]}" alt="" loading="lazy" decoding="async"></div>' if len(p["images"]) > 1 else ""
    if not p["stock"]:
        badge = '<span class="pcard__badge pcard__badge--out">Sold out</span>'
    elif p.get("was"):
        badge = f'<span class="pcard__badge">Save R{p["was"] - p["price"]:,}</span>'
    elif p.get("collection") == "cobra":
        badge = '<span class="pcard__badge">Cobra Range</span>'
    else:
        badge = ""
    label = (p.get("title") or "Combo") if p["type"] == "combo" else TYPE_LABEL.get(p["type"], "") + (" · " + p["finishLabel"] if p.get("finishLabel") else "")
    name = (p.get("title") or p["name"]) if p["type"] == "combo" else re.sub(r" — .*$", "", p["name"])
    swatches = f'<div class="swatches">{"".join(sw(f) for f in fins)}</div>' if fins else ""
    return f'''<article class="pcard {cls}" data-pid="{p["id"]}"><div class="pcard__frame">
      <a href="{R}product/{p["slug"]}/" class="pcard__media" data-cursor="VIEW" aria-label="{e(p["name"])}">{badge}
        <div class="tile"><img src="{R}{img(p)}" alt="{e(p["name"])}" loading="lazy" decoding="async" width="600" height="600"></div>{alt}</a>
      <button class="icon-btn pcard__wish wish" data-wish="{p["id"]}" aria-label="Add {e(p["name"])} to wishlist" aria-pressed="false">{ICON["heart"]}</button>
      <div class="pcard__actions"><button type="button" data-qv="{p["id"]}">Quick view</button><button type="button" data-add="{p["id"]}" {"" if p["stock"] else "disabled"}>{"Add to cart" if p["stock"] else "Sold out"}</button></div></div>
      <div class="pcard__info"><div><h3 class="pcard__name"><a href="{R}product/{p["slug"]}/">{e(name)}</a></h3><div class="pcard__meta">{e(label)}</div></div>
        <div class="pcard__right">{price_html(p)}{swatches}</div></div>
    </article>'''

def tile(p, i=0, cls=""):
    return f'<div class="tile {cls}"><img src="{{{{R}}}}{img(p, i)}" alt="{e(p["name"])}" loading="lazy" decoding="async"></div>'

def eyebrow(n, text):
    return f'<span class="eyebrow"><span class="n">{n:02d}</span> / {e(text)}</span>' if isinstance(n, int) else f'<span class="eyebrow">{e(text)}</span>'

def crumbs_html(items):
    out = ['<nav class="crumbs" aria-label="Breadcrumb">']
    for i, (name, href) in enumerate(items):
        if i:
            out.append('<span aria-hidden="true">/</span>')
        out.append(f'<a href="{{{{R}}}}{href}">{e(name)}</a>' if href is not None else f'<span aria-current="page">{e(name)}</span>')
    out.append("</nav>")
    return "".join(out)

def stars(n=5):
    return f'<span class="stars" aria-label="{n} out of 5 stars">' + ICON["star"] * n + "</span>"

def by(slug):
    return BY[slug]
