"""Makhi Collection catalogue — branded A4 pages generated from the product data.
Writes site/catalogue/print.html (all pages; ?p=N shows one page for rendering)."""
import os, re, json
from layout import e, LOGO_SVG, DROP_D
from helpers import P, BY, TYPE_LABEL, FIN_LABEL, img

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "site", "catalogue")
R = "../"

def money(n): return f"R{n:,.2f}"
LOGO_W = LOGO_SVG.replace('<svg ', '<svg class="logo" ', 1)

def flat(p):
    return img(p).replace("assets/img/p/", "assets/catalogue/img/").replace(".webp", ".jpg")

def name_short(p): return re.sub(r" — .*$", "", p["name"])

def prod_cell(p):
    was = f'<s>{money(p["was"])}</s>' if p.get("was") else ""
    fin = p.get("finishLabel") or ""
    sold = '<span class="tag">Sold out</span>' if not p["stock"] else (f'<span class="tag gold">Save R{p["was"]-p["price"]:,}</span>' if p.get("was") else "")
    return f'''<div class="pc"><div class="pc__img"><img src="{R}{flat(p)}" alt="">{sold}</div>
      <div class="pc__t"><h4>{e(name_short(p))}</h4><p class="meta">{e(TYPE_LABEL.get(p["type"], ""))}{(" · " + e(fin)) if fin else ""}</p>
      <p class="price">{money(p["price"])} {was}</p><p class="url">makhiluxurytaps.co.za</p></div></div>'''

def page(cls, inner, n=None, dark=False, section=""):
    foot = f'<footer class="pf"><span>{e(section)}</span><span>{n:02d}</span></footer>' if n else ""
    return f'<section class="cp {cls}{" dark" if dark else ""}">{inner}{foot}</section>'

def build():
    pages = []          # (cls, inner, dark, section, slugs)
    T = lambda *ts: [p for p in P if p["type"] in ts]
    # 1 cover
    pages.append(("cover", f'''<img class="bg" src="{R}assets/catalogue/img/ls-brass-flow.jpg" alt=""><div class="shade"></div><div class="frame"></div>
      <div class="cover__top">{LOGO_W}</div>
      <div class="cover__mid"><span class="kicker">The Collection · 2026</span><h1>Water,<br>made <em>beautiful.</em></h1></div>
      <div class="cover__bot"><span>Luxury taps · mixers · baths · showers</span><span>Proudly South African</span></div>''', True, "", []))
    # 2 inside cover
    pages.append(("intro", f'''<div class="marble"></div><div class="intro__in"><span class="kicker gold">Makhi Luxury Taps</span>
      <blockquote>“A true craftsmanship exhibited by creating a <em>masterpiece.</em>”</blockquote>
      <p>Makhi Luxury Taps is a proudly South African brand. Our taps are designed to provide an elegant feel that is sure to deliver that last exquisite touch to complete your kitchen or bathroom.</p>
      <p>Inside: every piece in the collection — in gold, black, silver, chrome and white — with prices current at publication.</p>
      <div class="intro__contact"><div><b>Visit</b>93 Van Riebeeck Avenue<br>Edenvale Ext 1, Edenvale, 1645</div><div><b>Talk</b>+27 68 146 5775<br>info@makhiluxurytaps.co.za</div></div></div>''', False, "Welcome", []))
    # 3 contents placeholder (filled later)
    pages.append(("contents", "{{CONTENTS}}", True, "Contents", []))
    # 4 finishes
    fins = [("gold", "Gold", "Warm, jewel-like, quietly opulent."), ("black", "Black", "Matte, graphic, architectural."), ("silver", "Silver", "Soft brightness that never dates."), ("chrome", "Chrome", "Mirror-bright and crisp."), ("stainless", "Stainless", "Brushed, honest, hard-wearing.")]
    fin_html = "".join(f'<div class="fin"><i class="sw sw--{k}"></i><div><h4>{n}</h4><p>{d}</p></div></div>' for k, n, d in fins)
    pages.append(("finishes", f'''<span class="kicker gold">Five finishes</span><h2>One form.<br><em>Five</em> characters.</h2>
      <div class="fins">{fin_html}</div><p class="care"><b>Care</b> Clean with half dish-washing liquid, half water, and a soft cloth. No polishing needed — never use aggressive cleaners or bleach.</p>''', True, "Finishes", []))
    sections = []
    def opener(title_html, img_path, lead, section):
        sections.append((re.sub("<[^>]+>", "", title_html), len(pages) + 1))
        pages.append(("opener", f'<img class="bg" src="{R}{img_path}" alt=""><div class="shade"></div><div class="opener__in"><span class="kicker">{e(section)}</span><h2>{title_html}</h2><p>{e(lead)}</p></div>', True, section, []))
    def grid(title, items, section, per=4):
        for i in range(0, len(items), per):
            chunk = items[i:i + per]
            head = f'<header class="ph"><span class="kicker gold">{e(section)}</span><h3>{e(title)}{" <em>cont.</em>" if i else ""}</h3></header>'
            pages.append(("grid", head + f'<div class="pg pg{len(chunk)}">{"".join(prod_cell(p) for p in chunk)}</div>', False, section, [p["slug"] for p in chunk]))
    opener("The <em>Kitchen</em>", "assets/catalogue/img/ls-kitchen-marble.jpg", "Spring, pull-out and wall-mounted faucets — the hardest-working jewellery in the home.", "Kitchen")
    grid("Kitchen faucets", T("kitchen-faucet") + T("wall-tap"), "Kitchen")
    opener("The <em>Bathroom</em>", "assets/catalogue/img/ls-bath-mountain.jpg", "Mixers, freestanding baths, showers and suites — a private gallery for your daily ritual.", "Bathroom")
    grid("Basin mixers", T("basin-mixer"), "Bathroom")
    grid("Bath & freestanding mixers", T("freestanding-mixer") + T("bath-mixer"), "Bathroom")
    grid("Shower mixers & columns", T("shower-mixer") + T("shower-column"), "Bathroom")
    grid("Freestanding baths", T("bath"), "Bathroom")
    grid("Basins & vanities", T("basin") + T("vanity"), "Bathroom")
    grid("Showers", T("walk-in") + T("enclosed-shower"), "Bathroom")
    grid("Toilets", T("toilet"), "Bathroom")
    opener("Combo <em>Deals</em>", "assets/catalogue/img/ls-bath-black-tub.jpg", "Whole bathrooms, one price — matched and bundled by our team.", "Combo Deals")
    combos = sorted(T("combo"), key=lambda p: int(re.search(r"\d+", p["name"]).group()))
    for i in range(0, len(combos), 2):
        cells = ""
        for p in combos[i:i + 2]:
            items = "".join(f"<li>{e(x)}</li>" for x in p.get("items", []))
            cells += f'''<div class="combo"><div class="combo__img"><img src="{R}{flat(p)}" alt=""></div><div><span class="kicker gold">{e(p["name"])}</span><h4>{e(p.get("title") or "")}</h4><ul>{items}</ul><p class="price big">{money(p["price"])} <small>bundle price</small></p></div></div>'''
        pages.append(("combos", f'<header class="ph"><span class="kicker gold">Combo Deals</span><h3>Complete <em>suites</em></h3></header><div class="combos">{cells}</div>', False, "Combo Deals", [p["slug"] for p in combos[i:i + 2]]))
    # service page
    pages.append(("service", f'''<span class="kicker gold">The Makhi promise</span><h2>Luxury, made <em>simple.</em></h2>
      <div class="svc"><div><h4>Warranty</h4><p>Taps, mixers &amp; shower columns: 2 years against manufacturing defects. Freestanding baths &amp; basins: 2 years. Toilets: 1 year on mechanisms.</p></div>
      <div><h4>Returns</h4><p>7-day change of mind on unused, uninstalled items in original packaging (15% handling fee). Defects: 6 months under the CPA — report within 48 hours.</p></div>
      <div><h4>Payment</h4><p>Card, EFT, PayJustNow, Laybuy, cash on delivery and in-store.</p></div>
      <div><h4>Delivery</h4><p>Nationwide delivery, or collect in Edenvale. Fees and times confirmed for your area.</p></div></div>
      <p class="note">Prices current at publication (November 2026) and subject to change. Installation by a qualified plumber is required for warranty.</p>''', True, "Service", []))
    # back cover (ensure even page count incl. back)
    if (len(pages) + 1) % 2:
        pages.append(("notes", '<div class="marble"></div><div class="notes__in"><span class="kicker gold">Notes</span><div class="lines"></div></div>', False, "Notes", []))
    pages.append(("back", f'''<div class="marble dark"></div><div class="frame"></div><div class="back__in">{LOGO_W}
      <p class="tag">Water, made beautiful.</p>
      <div class="back__c"><span>makhiluxurytaps.co.za</span><span>+27 68 146 5775 · WhatsApp</span><span>info@makhiluxurytaps.co.za</span><span>93 Van Riebeeck Avenue, Edenvale, 1645</span><span>@makhi_luxury_taps</span></div></div>''', True, "", []))
    # contents
    rows = "".join(f'<li><span>{e(t)}</span><i></i><b>{n:02d}</b></li>' for t, n in [("Five finishes", 4)] + sections + [("The Makhi promise", len(pages) - (2 if pages[-2][0] == "notes" else 1))])
    pages[2] = ("contents", f'<span class="kicker gold">Contents</span><h2>The <em>Collection</em></h2><ol class="toc">{rows}</ol><p class="toc__n">{len([p for p in P if p["type"] != "combo"])} pieces · {len([p for p in P if p["type"] == "combo"])} combo deals</p>', True, "Contents", [])
    html_pages = "".join(page(c, i, n if 0 < n < len(pages) - 1 else None, d, s) for n, (c, i, d, s, _) in enumerate(pages, start=0))
    manifest = [{"n": i, "cls": c, "section": s, "slugs": sl} for i, (c, _, _, s, sl) in enumerate(pages)]
    doc = f'''<!doctype html><html lang="en-ZA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Makhi — The Collection 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&family=Syne:wght@600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{html_pages}
<script>const p=new URLSearchParams(location.search).get("p"); if(p!==null){{document.documentElement.classList.add("one"); document.querySelectorAll(".cp").forEach((s,i)=>{{ if(i!==Number(p)) s.remove(); }});}}</script></body></html>'''
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, "print.html"), "w", encoding="utf-8").write(doc)
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"))
    return manifest

CSS = r'''
@page { size: A4; margin: 0; }
:root { --gold:#C8A45D; --goldt:#86672C; --onyx:#0B0B0C; --ivory:#F4F1EA; --stone:#EFEBE4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #555; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html.one, html.one body { background: transparent; }
body { font: 400 10.5pt/1.55 Manrope, sans-serif; color: #444; }
.cp { position: relative; width: 210mm; height: 297mm; overflow: hidden; background: #FAF8F4; page-break-after: always; break-after: page; margin: 0 auto 10mm; padding: 22mm 18mm 20mm; display: flex; flex-direction: column; }
html.one .cp { margin: 0; }
@media print { .cp { margin: 0; } html, body { background: none; } }
.cp.dark { background: #0B0B0C; color: #A3A3A8; }
h1, h2, h3, h4 { font-family: "Cormorant Garamond", serif; font-weight: 400; color: #111; line-height: 1; letter-spacing: -.01em; }
.dark h1, .dark h2, .dark h3, .dark h4 { color: #F4F1EA; }
em { font-style: italic; font-weight: 300; }
.dark em { color: #E2C98A; } .cp:not(.dark) h2 em, .cp:not(.dark) h3 em { color: var(--goldt); }
.kicker { font: 600 7.5pt/1 Syne, sans-serif; letter-spacing: .28em; text-transform: uppercase; color: #cfc9be; display: inline-flex; align-items: center; gap: 10px; }
.kicker::before { content: ""; width: 18px; height: 1px; background: currentColor; }
.kicker.gold { color: var(--goldt); } .dark .kicker.gold { color: #D2B06A; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,7,8,.55), rgba(7,7,8,.15) 40%, rgba(7,7,8,.88)); }
.frame { position: absolute; inset: 9mm; border: .35mm solid rgba(200,164,93,.55); pointer-events: none; }
.marble { position: absolute; inset: 0; background: url(../assets/catalogue/img/ls-marble-white.jpg) center/cover; opacity: .55; }
.marble.dark { background-image: url(../assets/catalogue/img/ls-marble-black.jpg); opacity: .35; }
.pf { position: absolute; left: 18mm; right: 18mm; bottom: 10mm; display: flex; justify-content: space-between; font: 600 6.5pt/1 Syne, sans-serif; letter-spacing: .26em; text-transform: uppercase; color: #9a958c; border-top: .2mm solid rgba(138,106,47,.35); padding-top: 4mm; }
.dark .pf { color: #77777d; border-color: rgba(200,164,93,.3); }
/* cover */
.cover { padding: 0; justify-content: space-between; color: #F4F1EA; }
.cover > * { position: relative; }
.cover .bg, .cover .shade, .cover .frame { position: absolute; }
.cover__top { padding: 24mm 0 0; display: flex; justify-content: center; }
.logo { width: 62mm; height: auto; fill: #F4F1EA; color: #F4F1EA; }
.cover__mid { padding: 0 22mm; text-align: center; }
.cover h1 { font-size: 64pt; line-height: .92; margin-top: 8mm; }
.cover__bot { display: flex; justify-content: space-between; padding: 0 20mm 20mm; font: 600 7pt/1 Syne; letter-spacing: .26em; text-transform: uppercase; color: #cfc9be; }
/* intro */
.intro > *, .notes > * { position: relative; }
.intro .marble, .notes .marble, .back .marble { position: absolute; }
.intro__in { margin: auto 0; }
.intro blockquote { font: 300 34pt/1.05 "Cormorant Garamond"; color: #111; margin: 10mm 0 10mm; }
.intro blockquote em { color: var(--goldt); }
.intro p { max-width: 120mm; margin-bottom: 4mm; }
.intro__contact { display: flex; gap: 14mm; margin-top: 14mm; padding-top: 8mm; border-top: .2mm solid rgba(138,106,47,.4); font-size: 9.5pt; }
.intro__contact b { display: block; font: 600 7pt/1 Syne; letter-spacing: .24em; text-transform: uppercase; color: var(--goldt); margin-bottom: 3mm; }
/* contents */
.contents h2 { font-size: 46pt; margin: 8mm 0 14mm; }
.toc { list-style: none; }
.toc li { display: flex; align-items: baseline; gap: 4mm; padding: 4.5mm 0; border-bottom: .2mm solid rgba(200,164,93,.25); font: 400 19pt/1 "Cormorant Garamond"; color: #F4F1EA; }
.toc i { flex: 1; } .toc b { font: 300 15pt "Cormorant Garamond"; color: #D2B06A; font-weight: 300; }
.toc__n { margin-top: auto; font: 600 7pt Syne; letter-spacing: .24em; text-transform: uppercase; color: #77777d; margin-bottom: 8mm; }
/* finishes */
.finishes h2 { font-size: 44pt; margin: 8mm 0 12mm; }
.fins { display: grid; gap: 6mm; }
.fin { display: flex; gap: 7mm; align-items: center; padding-bottom: 6mm; border-bottom: .2mm solid rgba(200,164,93,.22); }
.fin h4 { font-size: 22pt; margin-bottom: 1.5mm; }
.sw { width: 15mm; height: 15mm; border-radius: 50%; flex: none; box-shadow: inset 0 0 0 .3mm rgba(0,0,0,.25), 0 2mm 5mm rgba(0,0,0,.4); }
.sw--gold { background: linear-gradient(135deg,#F3DFA6,#C8A45D 50%,#8E6C2E); } .sw--black { background: linear-gradient(135deg,#3a3a3d,#0d0d0e 60%,#1f1f21); }
.sw--silver { background: linear-gradient(135deg,#fff,#c9cbcf 45%,#8d9096); } .sw--chrome { background: linear-gradient(135deg,#fff 0%,#b8c0c8 30%,#f4f6f8 52%,#7f8790 100%); }
.sw--stainless { background: repeating-linear-gradient(90deg,#c6c8cb 0 .4mm,#b3b6ba .4mm .8mm); }
.care { margin-top: auto; margin-bottom: 8mm; font-size: 9.5pt; } .care b { color: #D2B06A; font: 600 7pt Syne; letter-spacing: .24em; text-transform: uppercase; margin-right: 3mm; }
/* opener */
.opener { justify-content: flex-end; }
.opener .bg, .opener .shade { position: absolute; }
.opener__in { position: relative; margin-bottom: 14mm; }
.opener h2 { font-size: 72pt; line-height: .88; margin: 6mm 0 6mm; }
.opener p { color: #cfcac0; max-width: 110mm; font-size: 11pt; }
/* grids */
.ph { margin-bottom: 9mm; } .ph h3 { font-size: 30pt; margin-top: 4mm; }
.pg { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm 7mm; flex: 1; align-content: start; }
.pc__img { position: relative; aspect-ratio: 1; background: #EFEBE4; display: grid; place-items: center; overflow: hidden; }
.pc__img img { width: 100%; height: 100%; object-fit: contain; }
.tag { position: absolute; top: 3mm; left: 3mm; font: 600 6pt Syne; letter-spacing: .2em; text-transform: uppercase; background: #0B0B0C; color: #E2C98A; padding: 1.6mm 2.6mm; border-radius: 10mm; }
.pc__t { padding-top: 3.5mm; }
.pc h4 { font-size: 15pt; line-height: 1.1; }
.meta { font: 600 6.3pt/1.4 Syne; letter-spacing: .2em; text-transform: uppercase; color: #8a857c; margin: 1.5mm 0 2mm; }
.price { font: 500 10pt Manrope; color: #111; } .price s { color: #9a958c; margin-left: 2mm; font-size: 8.5pt; }
.url { display: none; }
.pg1, .pg2 { grid-template-columns: 1fr 1fr; }
/* combos */
.combos { display: grid; gap: 8mm; }
.combo { display: grid; grid-template-columns: 70mm 1fr; gap: 7mm; padding-bottom: 8mm; border-bottom: .2mm solid rgba(138,106,47,.3); }
.combo__img { aspect-ratio: 1; overflow: hidden; background: #EFEBE4; display: grid; place-items: center; }
.combo__img img { width: 100%; height: 100%; object-fit: contain; }
.combo h4 { font-size: 22pt; margin: 3mm 0 3mm; }
.combo ul { padding-left: 4mm; font-size: 8.8pt; line-height: 1.5; margin-bottom: 4mm; }
.combo li::marker { color: var(--gold); }
.price.big { font: 400 20pt "Cormorant Garamond"; } .price.big small { font: 600 6.3pt Syne; letter-spacing: .2em; text-transform: uppercase; color: #8a857c; margin-left: 2mm; }
/* service */
.service h2 { font-size: 46pt; margin: 8mm 0 12mm; }
.svc { display: grid; grid-template-columns: 1fr 1fr; gap: 9mm 10mm; }
.svc h4 { font-size: 20pt; margin-bottom: 3mm; } .svc p { font-size: 9.5pt; }
.note { margin-top: auto; margin-bottom: 8mm; font-size: 8pt; color: #77777d; }
/* notes + back */
.notes__in { flex: 1; display: flex; flex-direction: column; } .lines { flex: 1; margin-top: 8mm; background: repeating-linear-gradient(180deg, transparent 0 9.5mm, rgba(138,106,47,.3) 9.5mm 9.7mm); }
.back { justify-content: center; align-items: center; text-align: center; }
.back__in { position: relative; display: flex; flex-direction: column; align-items: center; }
.back .tag { position: static; background: none; color: #E2C98A; font: italic 300 20pt "Cormorant Garamond"; letter-spacing: 0; text-transform: none; margin: 8mm 0 16mm; }
.back__c { display: grid; gap: 3mm; font: 600 7pt/1.6 Syne; letter-spacing: .24em; text-transform: uppercase; color: #a8a49b; }
'''

if __name__ == "__main__":
    m = build(); print(len(m), "pages")
