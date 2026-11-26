"""Shop, categories, collections, finishes, product pages."""
import re
from layout import e, ICON, SITE_URL
from helpers import P, BY, by, card, tile, eyebrow, money, img, siblings, base_key, TYPE_LABEL, FIN_LABEL, crumbs_html, sw

A = ICON["arrow"]
PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>'

def phead(title_html, lead, crumbs, bg=None, water=False, short=False, eyebrow_txt=None, extra=""):
    bgh = ""
    if water:
        bgh = '<div class="phead__bg"><canvas data-water data-warm=".8" aria-hidden="true"></canvas></div>'
    elif bg:
        bgh = f'<div class="phead__bg" data-zoom><img src="{{{{R}}}}{bg}" alt="" fetchpriority="high"></div>'
    return f'''<section class="phead on-dark{" phead--short" if short else ""}" data-ripple>{bgh}
  <div class="wrap" style="width:100%">{crumbs_html(crumbs)}
    <div class="phead__row"><div>{f'<span class="eyebrow">{e(eyebrow_txt)}</span>' if eyebrow_txt else ""}<h1 class="d-xl mt-m" data-split="now" id="shopTitle">{title_html}</h1></div>
    <div><p class="lead">{lead}</p>{extra}</div></div></div></section>'''

def slider(title_html, products, n, anchor="", lead="", extra_card=""):
    cards = "".join(card(p) for p in products) + extra_card
    return f'''<section class="section--tight slider-sec" id="{anchor}" aria-label="{e(re.sub('<[^>]+>', '', title_html))}"><div class="wrap">
  <div class="sec-head" style="margin-bottom:40px"><div>{eyebrow(n, re.sub('<[^>]+>', '', title_html))}<h2 class="d-s mt-m">{title_html}</h2>{f'<p class="mt-s" style="max-width:52ch">{lead}</p>' if lead else ""}</div>
  <div class="pslider__ctrl"><button data-slide="-1" aria-label="Previous">{PREV}</button><button data-slide="1" aria-label="Next">{A}</button></div></div>
  <div class="pslider" data-cursor="DRAG">{cards}</div></div></section>'''

# ---------------- SHOP ----------------
def shop():
    fins = [("gold", "Gold"), ("black", "Black"), ("silver", "Silver"), ("chrome", "Chrome"), ("stainless", "Stainless"), ("white", "White"), ("blackwhite", "B & W")]
    sws = "".join(f'<button class="sw-pick" data-finish="{k}" aria-pressed="false"><i class="sw sw-lg sw--{k}"></i>{n}</button>' for k, n in fins)
    noscript = "".join(f'<li><a href="{{{{R}}}}product/{p["slug"]}/">{e(p["name"])} — {money(p["price"])}</a></li>' for p in P)
    return phead("The <em>Collection</em>", "Every tap, mixer, bath, basin, shower and toilet in the Makhi range — filter by room, finish and price.",
                 [("Home", "index.html"), ("Shop All", None)], water=True, short=True, eyebrow_txt="Shop all") + f'''
<div class="shopbar"><div class="wrap shopbar__in">
  <div class="pills" id="pills" role="group" aria-label="Categories"></div>
  <div class="shopbar__tools">
    <div class="select hide-m"><label class="sr-only" for="sort">Sort</label><select id="sort"><option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="sale">Biggest saving</option></select></div>
    <button class="btn btn--sm" data-open-filters>Filters <span id="fCount"></span></button>
  </div></div></div>
<section class="wrap" style="padding-bottom:140px">
  <div class="active-filters" id="chips"><span class="result-count" id="count"></span></div>
  <div class="pgrid" id="grid" aria-live="polite">{"".join(f'<div class="skel" style="aspect-ratio:4/5"></div>' for _ in range(6))}</div>
  <noscript><ul>{noscript}</ul></noscript>
  <div class="load-more"><span class="load-more__txt result-count"></span><div class="load-more__bar"><i></i></div><button class="btn btn--ghost" id="more">Load more</button></div>
</section>
<aside class="filters" id="filters" aria-label="Filters" role="dialog" aria-modal="true">
  <div class="drawer__head"><h3>Refine</h3><button class="icon-btn" data-close aria-label="Close filters">{ICON["close"]}</button></div>
  <div class="drawer__body">
    <div class="fgroup"><h5>Finish</h5><div class="sw-row" id="fFinish">{sws}</div></div>
    <div class="fgroup"><h5>Price</h5><div class="range"><label class="sr-only" for="fPrice">Maximum price</label><input type="range" id="fPrice" min="500" max="30000" step="500"><div class="range__v"><span>R500</span><span id="fPriceV">Any price</span></div></div></div>
    <div class="fgroup"><h5>Room</h5><div class="opts" id="fRoom"><button class="chip" data-room="kitchen" aria-pressed="false">Kitchen</button><button class="chip" data-room="bathroom" aria-pressed="false">Bathroom</button></div></div>
    <div class="fgroup"><h5>Collection</h5><div class="opts" id="fColl"><button class="chip" data-coll="cobra" aria-pressed="false">Cobra Range</button><button class="chip" data-coll="combo" aria-pressed="false">Combo Deals</button></div></div>
    <div class="fgroup"><h5>Mount type</h5><div class="opts" id="fMount"><button class="chip" data-mount="deck" aria-pressed="false">Deck-mounted</button><button class="chip" data-mount="wall" aria-pressed="false">Wall-mounted</button><button class="chip" data-mount="floor" aria-pressed="false">Floor-standing</button><button class="chip" data-mount="freestanding" aria-pressed="false">Freestanding</button></div></div>
    <div class="fgroup"><label class="toggle">In stock only<input type="checkbox" id="fStock"></label></div>
  </div>
  <div class="drawer__foot" style="display:flex;gap:10px"><button class="btn btn--ghost" id="fReset" style="flex:1">Reset</button><button class="btn btn--gold" data-close style="flex:1">Show results</button></div>
</aside>'''

# ---------------- KITCHEN ----------------
def kitchen():
    k = [p for p in P if p["room"] == "kitchen"]
    fau = [p for p in P if p["type"] == "kitchen-faucet"]
    pull = [p for p in fau if re.search(r"pull|naledi|spring", p["name"], re.I)]
    wall = [p for p in P if p["type"] == "wall-tap"]
    sinks_card = '''<div class="coming"><span class="eyebrow">Coming soon</span><h3 class="serif d-xs">Drop-in, undermount, farmhouse &amp; flush-mount sinks</h3><p style="font-size:15px">Our kitchen sink range is on its way. Ask our team what's available today.</p><a class="btn btn--sm btn--wa" href="https://wa.me/27681465775?text=Hi%20Makhi%2C%20which%20kitchen%20sinks%20do%20you%20have%3F" target="_blank" rel="noopener">Ask on WhatsApp</a></div>'''
    guide = f'''
<section class="section" aria-labelledby="guideT"><div class="wrap">
  <div class="sec-head"><div>{eyebrow(5, "How to choose")}<h2 id="guideT" class="d-m mt-m" data-split>Choosing your <em>kitchen tap</em></h2></div><p class="lead">Three measurements decide whether a kitchen tap feels effortless every day.</p></div>
  <div class="guide">
    <div class="guide__c"><svg class="diag" viewBox="0 0 300 220" fill="none" stroke-width="1.4" aria-hidden="true">
      <path d="M40 200 H260" stroke="currentColor"/><path class="draw" d="M150 200 V70 Q150 30 110 30 Q80 30 80 60 V90" stroke="currentColor"/>
      <path class="g draw" d="M200 200 V30 M195 30 h10 M195 200 h10" /><text x="210" y="120" fill="currentColor" font-size="11" font-family="Syne">SPOUT HEIGHT</text>
      <path class="w drip-anim" d="M80 96 V196" stroke-dasharray="4 8"/></svg>
      <h3>Spout height</h3><p>Taller spouts clear big pots and are made for deep single bowls. Lower spouts suit shallow sinks and reduce splashing.</p></div>
    <div class="guide__c"><svg class="diag" viewBox="0 0 300 220" fill="none" stroke-width="1.4" aria-hidden="true">
      <path d="M30 200 H270" stroke="currentColor"/><path d="M60 170 h180 v30 h-180z" stroke="currentColor" opacity=".5"/><path class="draw" d="M70 170 V60 Q70 30 110 30 H160 Q170 30 170 50 V70" stroke="currentColor"/>
      <path class="g draw" d="M70 110 H170 M70 105 v10 M170 105 v10"/><text x="88" y="100" fill="currentColor" font-size="11" font-family="Syne">REACH</text>
      <path class="w drip-anim" d="M170 76 V168" stroke-dasharray="4 8"/></svg>
      <h3>Reach</h3><p>The spout should land near the centre of the bowl. Measure from the tap hole to the middle of your sink.</p></div>
    <div class="guide__c"><svg class="diag" viewBox="0 0 300 220" fill="none" stroke-width="1.4" aria-hidden="true">
      <path d="M30 200 H270" stroke="currentColor"/><path d="M90 200 V60 Q90 30 130 30 Q160 30 160 60" stroke="currentColor"/><path class="g swing" d="M160 60 Q175 110 220 140" stroke-dasharray="3 5"/><rect class="swing" x="212" y="134" width="14" height="22" rx="4" stroke="currentColor"/>
      <text x="170" y="190" fill="currentColor" font-size="11" font-family="Syne">PULL-OUT</text></svg>
      <h3>Pull-out vs fixed</h3><p>Pull-out and spring faucets rinse every corner and fill pots on the counter. Fixed spouts give the cleanest silhouette.</p></div>
  </div></div></section>'''
    sub = '<nav class="subnav" aria-label="Kitchen categories"><a href="#faucets">Kitchen Faucets <small>' + f'{len(fau):02d}</small></a><a href="#pull-out">Pull-out Faucets <small>{len(pull):02d}</small></a><a href="#wall">Wall-mounted Taps <small>{len(wall):02d}</small></a><a href="#sinks">Sinks <small>SOON</small></a></nav>'
    return phead("The <em>Kitchen</em>", "Spring, pull-out and wall-mounted faucets in gold, black, silver and chrome — the hardest-working jewellery in the home.",
                 [("Home", "index.html"), ("Kitchen", None)], bg="assets/img/ls/kitchen-marble.webp", eyebrow_txt="Category",
                 extra=f'<div class="flex gap-s wrap-f mt-m"><a class="btn" href="{{{{R}}}}shop/?room=kitchen">Shop all kitchen {A}</a><button class="btn btn--ghost" data-chat="Plan my kitchen">Ask Makhi</button></div>') + \
        f'<div class="wrap" style="margin-top:-1px">{sub}</div>' + \
        slider("Kitchen <em>faucets</em>", fau, 1, "faucets") + \
        slider("Pull-out &amp; <em>spring</em>", pull, 2, "pull-out", "A spray head that reaches every corner of the sink — then glides home.") + \
        slider("Wall-<em>mounted</em>", wall, 3, "wall", "Flexible wall taps for pot-filling and cleaner counters.") + \
        slider("Kitchen <em>sinks</em>", [], 4, "sinks", "", sinks_card) + guide

def finish_band(room):
    return f'''<section class="section--tight panel"><div class="wrap two-col">
  <div>{eyebrow("", "Design your space")}<h2 class="d-m mt-m">See it <em>before</em> you buy.</h2><p class="lead mt-m">Place fittings in a styled room, switch every finish at once and send the design to WhatsApp.</p>
  <div class="flex gap-s wrap-f mt-m"><a class="btn" href="{{{{R}}}}design-your-space/?room={room}">Open the visualiser {A}</a></div></div>
  <div class="ph-img rv-water" style="aspect-ratio:4/3"><img src="{{{{R}}}}assets/img/ls/{"kitchen-black-2" if room == "kitchen" else "bath-stone-vanity"}.webp" alt="" loading="lazy"></div></div></section>'''

# ---------------- BATHROOM ----------------
def bathroom():
    T = lambda *ts: [p for p in P if p["type"] in ts]
    sub_items = [("Basin Mixers", "basin-mixers", T("basin-mixer")), ("Bath Mixers", "bath-mixers", T("bath-mixer", "freestanding-mixer")), ("Showers & Columns", "showers", T("shower-mixer", "shower-column", "walk-in", "enclosed-shower")),
                 ("Baths", "baths", T("bath")), ("Basins & Vanities", "basins", T("basin", "vanity")), ("Toilets", "toilets", T("toilet"))]
    sub = '<nav class="subnav" aria-label="Bathroom categories">' + "".join(f'<a href="#{a}">{n} <small>{len(l):02d}</small></a>' for n, a, l in sub_items) + "</nav>"
    build_band = f'''<section class="section--tight"><div class="wrap"><div class="editorial"><div class="editorial__img rv-water"><img src="{{{{R}}}}assets/img/ls/bath-black-tub.webp" alt="" loading="lazy"></div>
      <div class="editorial__copy"><span class="eyebrow">Build your bathroom</span><h3 class="serif">Bath, basin, mixer, shower, toilet — <em>one finish.</em></h3><p>Start with a ready-made combo deal, or plan the room piece by piece with Ask Makhi.</p>
      <div class="flex gap-s wrap-f"><button class="btn" data-chat="Plan my bathroom">Plan with Ask Makhi {A}</button><a class="btn btn--ghost" href="{{{{R}}}}combo-deals/">Combo deals</a></div></div></div></div></section>'''
    out = phead("The <em>Bathroom</em>", "Freestanding baths, floor-standing mixers, shower columns, basins and suites — a private gallery for your daily ritual.",
                [("Home", "index.html"), ("Bathroom", None)], bg="assets/img/ls/bath-mountain.webp", eyebrow_txt="Category",
                extra=f'<div class="flex gap-s wrap-f mt-m"><a class="btn" href="{{{{R}}}}shop/?room=bathroom">Shop all bathroom {A}</a><button class="btn btn--ghost" data-chat="Plan my bathroom">Plan with Ask Makhi</button></div>')
    out += f'<div class="wrap" style="margin-top:-1px">{sub}</div>'
    leads = {"basin-mixers": "Tall for vessel basins, short for inset — the Swan in every finish.", "bath-mixers": "Wall-mounted bath mixers and floor-standing freestanding fillers.",
             "showers": "Concealed diverters, multifunction columns, walk-in screens and pivot enclosures.", "baths": "Quartz-stone and fluted acrylic — in white, black, and black & white.",
             "basins": "Countertop basins and fluted vanity sets with mirror.", "toilets": "Closed-coupled suites and wall-hung pans."}
    for i, (n, a, l) in enumerate(sub_items):
        out += slider(n.replace("&", "&amp;"), l, i + 1, a, leads.get(a, ""))
        if a == "showers":
            out += build_band
    return out

# ---------------- COLLECTIONS ----------------
def collections_index():
    cobra = by("cobra-tigris-concealed-diverter-shower-bath-mixer-chrome")
    combos = [p for p in P if p["type"] == "combo"]
    return phead("Our <em>Collections</em>", "Signature ranges and ready-made suites — curated by the Makhi team.", [("Home", "index.html"), ("Collections", None)], bg="assets/img/ls/bath-black-sink.webp", short=True, eyebrow_txt="Collections") + f'''
<section class="section"><div class="wrap"><div class="spaces" style="min-height:80vh">
  <a class="space on-dark" href="{{{{R}}}}cobra-range/" data-cursor="EXPLORE"><div class="space__img"><img src="{{{{R}}}}assets/img/ls/bath-stone-vanity.webp" alt="" loading="lazy"></div><span class="space__n">01</span><span class="space__go">{ICON["arrowUR"]}</span><h3 class="serif">Cobra <em>Range</em></h3><p style="color:#cfcac0;max-width:40ch;margin-top:16px">Concealed control with architectural calm. From {money(cobra["price"])}.</p></a>
  <a class="space on-dark" href="{{{{R}}}}combo-deals/" data-cursor="EXPLORE"><div class="space__img"><img src="{{{{R}}}}assets/img/ls/bath-black-tub.webp" alt="" loading="lazy"></div><span class="space__n">02</span><span class="space__go">{ICON["arrowUR"]}</span><h3 class="serif">Combo <em>Deals</em></h3><p style="color:#cfcac0;max-width:40ch;margin-top:16px">{len(combos)} complete bathroom suites, one price each. From {money(min(p["price"] for p in combos))}.</p></a>
</div></div></section>''' + slider("Signature <em>families</em>", [by(s) for s in ["swan-tall-gold-basin-mixer", "naledi-gold-spring-kitchen-mixer", "muda-gold-freestanding-bath-mixer", "andy-black-pullout-kitchen-faucet", "veja-chrome-pullout-kitchen-faucet", "iluvia-black-shower-mixer", "the-knob-basin-and-bath-mixer-silver"]], 3, "families")

def cobra_page():
    p = by("cobra-tigris-concealed-diverter-shower-bath-mixer-chrome")
    companions = [q for q in P if q["type"] in ("shower-column", "shower-mixer") and q["id"] != p["id"]]
    fins = [("all", "All"), ("chrome", "Chrome"), ("black", "Black"), ("silver", "Silver")]
    swp = "".join(f'<button class="sw-pick{" is-active" if k == "all" else ""}" data-finish="{k}" aria-pressed="{"true" if k == "all" else "false"}">{"<i class=" + chr(34) + "sw sw-lg sw--" + k + chr(34) + "></i>" if k != "all" else "<i class=" + chr(34) + "sw sw-lg" + chr(34) + " style=" + chr(34) + "--c:conic-gradient(#C8A45D,#111,#ccc,#fff,#C8A45D)" + chr(34) + "></i>"}{n}</button>' for k, n in fins)
    return f'''
<section class="cobra on-dark" style="padding-top:var(--header-h)" data-ripple><div class="wrap cobra__grid">
  <div class="cobra__sticky"><div class="cobra__product"><div class="cobra__ring" aria-hidden="true"></div><div class="tile" data-float><img src="{{{{R}}}}{img(p)}" alt="{e(p["name"])}"></div></div></div>
  <div class="cobra__chapters" style="padding-top:20vh">
    <div class="chapter">{crumbs_html([("Home", "index.html"), ("Collections", "collections/"), ("Cobra Range", None)])}<span class="eyebrow">The Cobra Range</span><h1 class="d-xl mt-m" style="color:#F4F1EA" data-split="now">The <em>Cobra</em></h1><p class="lead" style="color:#A3A3A8">Shower and bath, governed by one disc on the wall. Concealed engineering, nothing extra.</p></div>
    <div class="chapter"><span class="num">01</span><h3>Concealed.</h3><p>The valve lives inside the wall. What you see is a perfect circle, a lever and a diverter — that's all.</p></div>
    <div class="chapter"><span class="num">02</span><h3>Diverted.</h3><p>Send water to the shower head or the bath spout at a turn — at exactly the temperature you set.</p></div>
    <div class="chapter"><span class="num">03</span><h3>Enduring.</h3><p>Chrome-plated and backed by our two-year warranty on taps and mixers.</p>
      <div class="pdp__price" style="margin:24px 0"><span class="now" style="color:#F4F1EA">{money(p["price"])}</span></div>
      <div class="flex gap-s wrap-f"><button class="btn btn--gold" data-add="{p["id"]}">Add to cart {A}</button><a class="btn btn--ghost" href="{{{{R}}}}product/{p["slug"]}/">View details</a></div></div>
  </div></div></section>
<section class="section"><div class="wrap">
  <div class="sec-head"><div>{eyebrow(4, "Complete the Cobra shower")}<h2 class="d-m mt-m">Pair it with a <em>column</em> or mixer.</h2></div><div class="fin-swap sw-row" data-target="cobraGrid" role="group" aria-label="Filter by finish">{swp}</div></div>
  <div class="pgrid" id="cobraGrid">{card(p)}{"".join(card(q) for q in companions)}</div>
  <p class="muted mt-l" style="font-size:14px">More Cobra pieces are arriving — <button data-chat="Tell me about the Cobra Range" style="text-decoration:underline;color:var(--gold-text)">ask Makhi</button> to be notified.</p>
</div></section>'''

def combo_page():
    cs = sorted([p for p in P if p["type"] == "combo"], key=lambda p: int(re.search(r"\d+", p["name"]).group()))
    rows = ""
    for i, p in enumerate(cs):
        items = "".join(f"<li>{e(x)}</li>" for x in p.get("items", []))
        rev = ' style="direction:rtl"' if i % 2 else ""
        rows += f'''<article class="editorial" style="margin-bottom:24px"{rev}><div class="editorial__img" style="direction:ltr">{tile(p)}</div>
        <div class="editorial__copy" style="direction:ltr"><span class="eyebrow">{e(p["name"])}</span><h2 class="serif d-s">{e(p.get("title") or p["name"])}</h2>
          <ul class="prose" style="padding-left:1.1em;margin:0;font-size:15px">{items}</ul>
          <div class="flex ai-c gap-m wrap-f"><span class="pdp__price" style="margin:0"><span class="now">{money(p["price"])}</span></span><span class="badge-line">{len(p.get("items", []))} pieces · bundle price</span></div>
          <div class="flex gap-s wrap-f"><button class="btn btn--gold" data-add="{p["id"]}" {"" if p["stock"] else "disabled"}>Add bundle to cart {A}</button><a class="btn btn--ghost" href="{{{{R}}}}product/{p["slug"]}/">Details</a></div></div></article>'''
    return phead("Combo <em>Deals</em>", "Complete bathroom suites — bath, freestanding mixer, vanity, toilet and shower — matched by our team and sold at one bundle price.",
                 [("Home", "index.html"), ("Collections", "collections/"), ("Combo Deals", None)], bg="assets/img/ls/bath-marble-vanity.webp", eyebrow_txt="Collections") + \
        f'<section class="section"><div class="wrap">{rows}<p class="muted" style="font-size:13px">Please check every item on delivery before your installer leaves and report any shortage immediately.</p></div></section>'

# ---------------- FINISHES ----------------
FIN_COPY = {
    "gold": ("Gold", "m-gold", "Warm, jewel-like and quietly opulent.", ["Marble, travertine and warm stone", "Walnut and oak joinery", "Deep green, navy and charcoal walls"], "Gold catches soft light beautifully — keep it lustrous with gentle, soapy water and a soft cloth.", "swan-tall-gold-basin-mixer"),
    "black": ("Black", "m-black", "Matte, graphic and architectural.", ["White ceramics and terrazzo", "Concrete and microcement", "Pale timber and Scandinavian palettes"], "Matte black needs the gentlest touch — no abrasives or scourers, which can leave a sheen.", "swan-tall-black-basin-mixer"),
    "silver": ("Silver", "m-silver", "Soft brightness that never dates.", ["Grey and white marble", "Coastal, light-filled rooms", "Mixing with existing fittings"], "Wipe with diluted dish-washing liquid and dry to keep water spots away.", "swan-tall-silver-basin-mixer"),
    "chrome": ("Chrome", "m-chrome", "Mirror-bright, crisp and classic.", ["Monochrome bathrooms", "Glass showers and gloss tiles", "Hotel-style suites"], "Chrome is the easiest to keep sparkling — a soft, damp cloth after use is all it needs.", "andy-chrome-pullout-kitchen-faucet"),
    "stainless": ("Stainless Steel", "m-stainless", "Brushed, honest and hard-wearing.", ["Busy family kitchens", "Steel sinks and appliances", "Industrial and contemporary spaces"], "Wipe in the direction of the brushed grain; avoid steel wool and bleach.", None),
}
def finishes_page():
    idx = "".join(f'<a class="chip" href="#{k}"><i class="sw sw--{k}"></i>{v[0]}</a>' for k, v in FIN_COPY.items())
    secs = ""
    for k, (name, metal, line, suits, care, hero) in FIN_COPY.items():
        ps = [p for p in P if p["finish"] == k and p["type"] != "combo"]
        hp = BY.get(hero)
        grid = f'<div class="pslider mt-m" data-cursor="DRAG">{"".join(card(p) for p in ps)}</div>' if ps else f'<p class="mt-m">Our stainless steel pieces are coming soon. <a href="https://wa.me/27681465775?text=Hi%20Makhi%2C%20do%20you%20have%20stainless%20steel%20options%3F" target="_blank" rel="noopener" style="color:var(--gold-text);text-decoration:underline">Ask our team</a> about current options.</p>'
        secs += f'''<section class="finish-sec" id="{k}" aria-labelledby="f-{k}">
  <div class="finish-sec__macro {metal}"><div class="metal"></div>{f'<div class="tile" data-float><img src="{{{{R}}}}{img(hp)}" alt="{e(hp["name"])}" loading="lazy"></div>' if hp else ""}<span class="big" aria-hidden="true">{name.split()[0]}</span></div>
  <div class="finish-sec__copy"><span class="eyebrow">Finish · {len(ps)} piece{"s" if len(ps) != 1 else ""}</span><h2 id="f-{k}" class="serif">{name}</h2><p class="lead">{line}</p>
    <div class="finish-facts"><div><h4>Suits</h4><ul>{"".join(f"<li>{e(s)}</li>" for s in suits)}</ul></div><div><h4>Care</h4><p>{e(care)}</p></div></div>
    <div class="flex gap-s wrap-f"><a class="btn" href="{{{{R}}}}shop/?finish={k}">Shop {name.lower()} {A}</a></div></div>
</section><div class="wrap" style="padding-bottom:64px">{grid}</div>'''
    return phead("Five <em>finishes</em>", "Gold, black, silver, chrome and stainless steel — what each one suits, how to care for it, and every piece it comes in.",
                 [("Home", "index.html"), ("Finishes", None)], bg="assets/img/ls/gold-water.webp", eyebrow_txt="Finishes",
                 extra=f'<div class="finish-index mt-m">{idx}</div>') + secs

# ---------------- PRODUCT ----------------
DETAIL_COPY = {
    "360° rotation": "The spout swivels a full circle, so every corner of the sink is within reach.",
    "Pull-out spray": "Draw the head out to rinse pans and fill pots, then let it glide neatly home.",
    "Pull-down spray": "A pull-down head that brings water exactly where you need it.",
    "Spray & stream modes": "Switch between a soft aerated stream and a powerful spray at the touch of a button.",
    "Coil-spring design": "The professional-kitchen coil spring — engineered to flex, beautiful to look at.",
    "Spring neck": "A flexible spring neck that moves with you and returns to form.",
    "Hand shower": "An integrated hand shower for rinsing, filling and the slow luxury of a long soak.",
    "Built-in diverter": "Route water between spout and shower with a single, satisfying turn.",
    "Brass construction": "Brass at the core for strength, weight and a finish that lasts.",
    "Copper body": "High-quality copper with multi-layer plating — corrosion-resistant and durable.",
    "Ceramic valve": "A ceramic cartridge for precise, drip-free control year after year.",
    "Quartz stone": "Cast quartz stone — dense, cool to the touch and quietly luxurious.",
    "Stainless steel": "Stainless steel components chosen for strength and an easy-clean finish.",
    "Single lever": "One lever for flow and temperature — intuitive, elegant, effortless.",
    "Single handle": "A single handle sets flow and temperature in one simple movement.",
    "Fluted form": "Vertical fluting catches the light and gives the piece its sculptural rhythm.",
    "LED mirror": "An LED-lit mirror for soft, flattering light at the basin.",
    "Matte black finish": "A deep, velvety matte black that frames the room like a line drawing.",
    "2-year warranty": "Backed by Makhi's two-year warranty against manufacturing defects.",
    "1-year warranty": "Backed by Makhi's one-year warranty on mechanisms.",
}

def warranty_for(p):
    t = p["type"]
    if t in ("basin-mixer", "kitchen-faucet", "freestanding-mixer", "bath-mixer", "shower-mixer", "shower-column", "wall-tap"):
        return "2 years against manufacturing defects"
    if t in ("bath", "basin"):
        return "2 years"
    if t == "toilet":
        return "1 year on mechanisms"
    return "Per Makhi warranty policy"

def dims_from_name(p):
    m = re.search(r"(\d{3,4})\s*[×x]\s*(\d{3,4})(?:\s*[×x]\s*(\d{3,4}))?", p["name"])
    return m.groups() if m else None

def drawing(p):
    t = p["type"]; d = dims_from_name(p)
    W = lambda v, fb="": f"{v} mm" if v else fb
    if t in ("basin-mixer",):
        tall = "tall" in p["name"].lower()
        top = 60 if tall else 150
        art = f'<path class="art" d="M140 470 h120 M170 470 V{top + 130} h60 V470" /><path class="art" d="M200 {top + 130} V{top + 40} Q200 {top} 240 {top} Q300 {top} 300 {top + 60} V{top + 90}"/><path class="art" d="M300 {top + 90} q-14 30 0 48 q14 -18 0 -48z"/><path class="art" d="M230 {top + 170} l50 -36"/>'
        dims = f'<path class="dim" d="M90 470 V{top} M84 470 h12 M84 {top} h12"/><text class="dimt" x="40" y="{(470 + top) // 2}" transform="rotate(-90 60 {(470 + top) // 2})">HEIGHT</text><path class="dim" d="M200 {top - 30} H300 M200 {top - 36} v12 M300 {top - 36} v12"/><text class="dimt" x="210" y="{top - 40}">SPOUT REACH</text><path class="dim" d="M170 500 H230"/><text class="dimt" x="150" y="525">HOLE Ø</text>'
    elif t == "kitchen-faucet":
        art = '<path class="art" d="M150 470 h110 M185 470 V330 h40 V470"/><path class="art" d="M205 330 V140 Q205 80 150 80 Q110 80 110 130 V200"/><rect class="art" x="100" y="200" width="20" height="44" rx="6"/><path class="art" d="M225 400 l50 -30"/>'
        dims = '<path class="dim" d="M320 470 V80 M314 470 h12 M314 80 h12"/><text class="dimt" x="332" y="280">HEIGHT</text><path class="dim" d="M110 50 H205 M110 44 v12 M205 44 v12"/><text class="dimt" x="112" y="40">REACH</text>'
    elif t == "freestanding-mixer":
        art = '<ellipse class="art" cx="200" cy="470" rx="50" ry="10"/><path class="art" d="M190 470 V110 h20 V470"/><path class="art" d="M200 110 Q200 70 250 70 H300 Q320 70 320 92 V110"/><rect class="art" x="176" y="250" width="48" height="16" rx="6"/>'
        dims = '<path class="dim" d="M110 470 V70 M104 470 h12 M104 70 h12"/><text class="dimt" x="60" y="300" transform="rotate(-90 80 300)">HEIGHT</text><path class="dim" d="M200 40 H320 M200 34 v12 M320 34 v12"/><text class="dimt" x="215" y="30">SPOUT REACH</text>'
    elif t == "bath":
        art = '<path class="art" d="M60 260 Q60 230 95 230 L345 230 Q380 230 380 260 Q372 430 300 440 L140 440 Q68 430 60 260z"/><path class="art" d="M80 255 H360" opacity=".5"/>'
        dims = '<path class="dim" d="M60 190 H380 M60 184 v12 M380 184 v12"/><text class="dimt" x="170" y="180">LENGTH</text><path class="dim" d="M410 230 V440 M404 230 h12 M404 440 h12"/><text class="dimt" x="420" y="340" transform="rotate(90 420 340)">HEIGHT</text>'
    elif t in ("walk-in", "enclosed-shower"):
        a, b, c = (d or (None, None, None))
        art = '<rect class="art" x="120" y="80" width="200" height="390"/><path class="art" d="M220 80 V470" opacity=".5"/>' if t == "enclosed-shower" else '<rect class="art" x="140" y="80" width="180" height="390"/><path class="art" d="M320 80 H360 M140 200 H320 M140 320 H320" opacity=".6"/>'
        h = c or b
        dims = f'<path class="dim" d="M120 50 H320 M120 44 v12 M320 44 v12"/><text class="dimt" x="170" y="40">WIDTH · {W(a)}</text><path class="dim" d="M370 80 V470 M364 80 h12 M364 470 h12"/><text class="dimt" x="382" y="300" transform="rotate(90 382 300)">HEIGHT · {W(h)}</text>'
    elif t == "toilet":
        art = '<rect class="art" x="150" y="120" width="130" height="150" rx="12"/><path class="art" d="M130 270 H300 Q300 350 250 365 L245 450 H180 L175 365 Q130 350 130 270z"/>'
        dims = '<path class="dim" d="M340 120 V450 M334 120 h12 M334 450 h12"/><text class="dimt" x="352" y="300" transform="rotate(90 352 300)">HEIGHT</text><path class="dim" d="M130 490 H300"/><text class="dimt" x="170" y="515">PROJECTION</text>'
    elif t in ("basin", "vanity"):
        art = '<path class="art" d="M100 300 Q100 220 225 220 Q350 220 350 300z"/><path class="art" d="M80 300 H370" />' if t == "basin" else '<ellipse class="art" cx="225" cy="120" rx="60" ry="90"/><rect class="art" x="90" y="300" width="270" height="140" rx="10"/><path class="art" d="M80 290 H370"/>'
        dims = '<path class="dim" d="M100 180 H350 M100 174 v12 M350 174 v12"/><text class="dimt" x="160" y="168">WIDTH ' + ("800 mm" if "800" in p["name"] else "") + '</text>'
    else:
        art = '<circle class="art" cx="225" cy="250" r="110"/><rect class="art" x="215" y="140" width="20" height="60" rx="5"/>'
        dims = '<path class="dim" d="M115 400 H335"/><text class="dimt" x="170" y="425">Ø</text>'
    return f'<svg viewBox="0 0 450 540" aria-hidden="true">{art}{dims}</svg>'

def highlights(p):
    txt = (" ".join(p["desc"]) + " " + " ".join(v for _, v in p["specs"]) + " " + p["name"]).lower()
    rules = [("360", "360° rotation"), ("pull-out", "Pull-out spray"), ("pullout", "Pull-out spray"), ("pull-down", "Pull-down spray"),
             ("spray and stream", "Spray & stream modes"), ("coil-spring", "Coil-spring design"), ("spring", "Spring neck"),
             ("handshower", "Hand shower"), ("hand shower", "Hand shower"), ("diverter", "Built-in diverter"),
             ("brass", "Brass construction"), ("copper", "Copper body"), ("ceramic", "Ceramic valve"), ("quartz", "Quartz stone"),
             ("stainless steel", "Stainless steel"), ("single lever", "Single lever"), ("single-handle", "Single handle"),
             ("fluted", "Fluted form"), ("led mirror", "LED mirror"), ("matte black", "Matte black finish")]
    out = []
    for k, v in rules:
        if k in txt and v not in out:
            out.append(v)
    w = warranty_for(p)
    if "2 years" in w: out.append("2-year warranty")
    elif "1 year" in w: out.append("1-year warranty")
    return out[:4]

def product_page(p):
    R = "{{R}}"
    sibs = siblings(p)
    is_metal = p.get("finish") in ("gold", "black", "silver", "chrome", "stainless")
    fin_html = ""
    if p["type"] != "combo" and p.get("finish"):
        options = []
        if is_metal:
            for k, n in [("gold", "Gold"), ("black", "Black"), ("silver", "Silver"), ("chrome", "Chrome"), ("stainless", "Stainless")]:
                if k == p["finish"]:
                    options.append(f'<button class="sw-pick is-active" aria-pressed="true" data-finish="{k}"><i class="sw sw-lg sw--{k}"></i>{n}</button>')
                else:
                    s = next((q for q in sibs if q["finish"] == k), None)
                    options.append(f'<button class="sw-pick" data-finish="{k}" data-href="{R}product/{s["slug"]}/" aria-label="View in {n}"><i class="sw sw-lg sw--{k}"></i>{n}</button>' if s else f'<button class="sw-pick" disabled aria-label="{n} — not available"><i class="sw sw-lg sw--{k}"></i>{n}</button>')
        else:
            for q in [p] + sibs:
                if q.get("finish"):
                    act = q["id"] == p["id"]
                    options.append(f'<button class="sw-pick{" is-active" if act else ""}" data-finish="{q["finish"]}" {"" if act else "data-href=" + chr(34) + R + "product/" + q["slug"] + "/" + chr(34)}><i class="sw sw-lg sw--{q["finish"]}"></i>{FIN_LABEL.get(q["finish"], "")}</button>')
        avail = ", ".join(FIN_LABEL[q["finish"]] for q in [p] + sibs if q.get("finish"))
        fin_html = f'''<div class="pdp__block"><div class="label">Finish <span>{e(p.get("finishLabel") or "")}</span></div><div class="sw-row pdp__fins">{"".join(options)}</div>
          <p class="fin-note">Available in this finish: {e(avail)}. {"Greyed finishes aren't stocked for this design — " if is_metal else ""}<a href="{R}finishes/#{p["finish"]}">About {e(FIN_LABEL.get(p["finish"], ""))}</a></p></div>'''
    images = p["images"] if p["type"] != "combo" else ([p["cover"]] if p.get("cover") else []) + p["images"]
    thumbs = "".join(f'<button data-img="{i}" class="{"is-on" if i == 0 else ""}" aria-label="Image {i + 1}"><div class="tile"><img src="{R}{im}" alt="" loading="lazy"></div></button>' for i, im in enumerate(images))
    is_tap = p["type"] in ("basin-mixer", "kitchen-faucet", "freestanding-mixer", "bath-mixer", "shower-mixer", "shower-column", "wall-tap")
    extra_th = ""
    if len(images) > 1:
        extra_th += f'<button data-spin aria-label="Drag through angles"><span class="t-ico">360°<br>view</span></button>'
    if is_tap:
        extra_th += f'<button data-flow aria-label="Water in motion"><span class="t-ico">Water<br>flow</span></button>'
    desc = "".join(f"<p>{e(d)}</p>" for d in p["desc"]) or (f'<ul>{"".join(f"<li>{e(x)}</li>" for x in p.get("items", []))}</ul>' if p.get("items") else "<p>Crafted to bring the Makhi signature of elegance to your space. Ask Makhi or our team for detailed specifications.</p>")
    short = p["desc"][0] if p["desc"] else (f'{len(p.get("items", []))}-piece bathroom suite at one bundle price.' if p["type"] == "combo" else f'{TYPE_LABEL.get(p["type"], "")} from Makhi Luxury Taps' + (f' in {p["finishLabel"].lower()}.' if p.get("finishLabel") else "."))
    if len(short) > 220:
        short = short[:short[:220].rfind(" ")] + "…"
    specs = list(p["specs"])
    base = [("Category", TYPE_LABEL.get(p["type"], "")), ("Finish", p.get("finishLabel") or "—"), ("Mount type", p.get("mount") or "—"), ("Collection", "Cobra Range" if p.get("collection") == "cobra" else ("Combo Deals" if p["type"] == "combo" else "Makhi")), ("Warranty", warranty_for(p))]
    have = {k.lower() for k, _ in specs}
    rows = [(k, v) for k, v in base if k.lower() not in have] + specs
    if is_tap and "flow" not in have:
        rows += [("Flow rate", "To be confirmed by Makhi"), ("Cartridge", next((v for k, v in specs if "valve" in k.lower()), "To be confirmed by Makhi")), ("Connections", "Standard SA connections — confirm with Makhi")]
    table = "".join(f'<tr><th scope="row">{e(k)}</th><td>{e(v)}</td></tr>' for k, v in rows)
    same_fin = [q for q in P if q.get("finish") == p.get("finish") and q["type"] != p["type"] and q["type"] != "combo" and q["id"] != p["id"]][:8] if p.get("finish") else []
    if not same_fin:
        same_fin = [q for q in P if q["room"] == p["room"] and q["type"] != p["type"] and q["type"] != "combo"][:8]
    also = [q for q in P if q["type"] == p["type"] and q["id"] != p["id"]][:8] or [q for q in P if q["room"] == p["room"] and q["id"] != p["id"]][:8]
    coll = "Cobra Range" if p.get("collection") == "cobra" else (p.get("title") if p["type"] == "combo" else TYPE_LABEL.get(p["type"], ""))
    room_crumb = ("Kitchen", "kitchen/") if p["room"] == "kitchen" else ("Bathroom", "bathroom/")
    save = f'<span class="save">Save R{p["was"] - p["price"]:,}</span>' if p.get("was") else ""
    name = (f'{p["title"]} <em>— {p["name"]}</em>' if p.get("title") else e(p["name"]))
    viz_ok = p["type"] in ("basin-mixer", "kitchen-faucet", "freestanding-mixer", "shower-column", "shower-mixer", "wall-tap", "bath", "basin", "vanity", "walk-in", "enclosed-shower", "toilet")
    hl = highlights(p)
    feat_rows = "".join(f'<li><span class="num">0{i + 1}</span><div><h3 class="serif">{e(h)}</h3><p>{e(DETAIL_COPY.get(h, "Considered in every detail — designed to look beautiful and work effortlessly, every day."))}</p></div></li>' for i, h in enumerate(hl[:3]))
    life = "assets/img/ls/kitchen-marble.webp" if p["room"] == "kitchen" else ("assets/img/ls/bath-black-tub.webp" if p["type"] in ("bath", "freestanding-mixer") else "assets/img/ls/bath-stone-sink.webp")
    detail_band = f'''<section class="pdp-detail on-dark"><div class="pdp-detail__img" data-zoom><img src="{R}{life}" alt="" loading="lazy"></div>
      <div class="pdp-detail__copy"><span class="eyebrow">In detail</span><h2 class="d-m">{e(p["name"].split(" — ")[0])}</h2><ul class="pdp-detail__list">{feat_rows}</ul>
      <div class="flex gap-s wrap-f"><button class="btn btn--gold" data-add="{p["id"]}" {"" if p["stock"] else "disabled"}>Add to cart · {money(p["price"])}</button></div></div></section>''' if hl else ""
    body = f'''
<div class="pdp" data-product="{p["slug"]}">
  <div class="pdp__gallery"><div class="pdp__stick">
    <div class="thumbs" role="group" aria-label="Product images">{thumbs}{extra_th}</div>
    <div class="stage" data-cursor="ZOOM">
      <div class="tile"><img src="{R}{images[0]}" alt="{e(p["name"])}" fetchpriority="high"></div>
      <div class="stage__wipe" aria-hidden="true"></div>
      <div class="stage__flow"><canvas aria-label="Water in motion" role="img"></canvas></div>
      <span class="spin-hint">Drag to turn</span>
      <span class="stage__counter">01 / {len(images):02d}</span>
    </div>
  </div></div>
  <div class="pdp__panel">
    {crumbs_html([("Home", "index.html"), room_crumb, (p["name"] if not p.get("title") else p["title"], None)])}
    <span class="pdp__coll">{e(coll)}</span>
    <h1 class="serif">{name}</h1>
    <div class="pdp__rating"><span class="stars" style="opacity:.35">{ICON["star"] * 5}</span><span>No reviews yet — <a href="#tabs" style="text-decoration:underline">be the first</a></span></div>
    <div class="pdp__price"><span class="now">{money(p["price"])}</span>{f'<s>{money(p["was"])}</s>' if p.get("was") else ""}{save}</div>
    <p class="pdp__pjn">or 3 interest-free payments of <b>{money(p["price"] / 3)}</b> with PayJustNow</p>
    <p class="pdp__short">{e(short)}</p>
    {"<ul class='pdp__hl'>" + "".join(f"<li><i></i>{e(h)}</li>" for h in highlights(p)) + "</ul>" if highlights(p) else ""}
    {fin_html}
    <div class="pdp__block">
      <div class="pdp__buy"><div class="qty"><button data-pq="-1" aria-label="Decrease quantity">−</button><span id="pdpQty" aria-live="polite">1</span><button data-pq="1" aria-label="Increase quantity">+</button></div>
        <button class="btn btn--gold btn--block" id="pdpAdd" data-add="{p["id"]}" data-qty="1" {"" if p["stock"] else "disabled"}>{"Add to cart" if p["stock"] else "Sold out"} {A}</button></div>
      <div class="pdp__buy2"><button class="btn btn--block" id="pdpBuy" {"" if p["stock"] else "disabled"}>Buy now</button><button class="btn btn--ghost wish" data-wish="{p["id"]}" aria-label="Add to wishlist" aria-pressed="false">{ICON["heart"]}</button></div>
      <p class="pdp__ask">Questions about fit or finish? <a data-ask target="_blank" rel="noopener" href="https://wa.me/27681465775">Ask our team on WhatsApp</a> or <button type="button" data-chat="Tell me more about the {e(p["name"])}">Ask Makhi</button></p>
    </div>
    <div class="pdp__block pdp__meta">
      <div><span class="stock-dot{"" if p["stock"] else " out"}"></span><span>{"In stock — ships from Edenvale" if p["stock"] else "Sold out — <button data-chat='Notify me when " + e(p["name"]) + " is back in stock' style='text-decoration:underline'>get a back-in-stock alert</button>"}</span></div>
      <div>{ICON["truck"]}<div style="flex:1"><span>Delivery estimate</span><div class="postal"><label class="sr-only" for="postal">Postal code</label><input id="postal" inputmode="numeric" maxlength="4" placeholder="Postal code"><button class="btn btn--sm btn--ghost" id="postalBtn">Check</button></div><div class="postal-res" id="postalRes" aria-live="polite"></div></div></div>
      <div>{ICON["shield"]}<span>Warranty: {e(warranty_for(p))}. 7-day change-of-mind returns.</span></div>
      <div>{ICON["lock"]}<div><span>Secure payment</span><div class="pay-badges" style="margin-top:8px" aria-label="Payment methods"><img src="{R}assets/img/brand/pay/payfast.svg" alt="Payfast" height="24"><img src="{R}assets/img/brand/pay/visa.svg" alt="Visa" height="24"><img src="{R}assets/img/brand/pay/mastercard.svg" alt="Mastercard" height="24"><img src="{R}assets/img/brand/pay/instant-eft.png" alt="Instant EFT by Payfast" height="24"></div></div></div>
    </div>
    
  </div>
</div>
<div class="atc-bar" aria-hidden="true"><div class="tile"><img src="{R}{images[0]}" alt=""></div><div class="atc-bar__n"><b>{e(p["name"])}</b><span class="price">{money(p["price"])}</span></div><button class="btn btn--gold" data-add="{p["id"]}" {"" if p["stock"] else "disabled"}>Add</button></div>

{detail_band}
<section class="section" aria-labelledby="specT"><div class="wrap tech">
  <div class="tech__draw rv">{drawing(p)}<span class="note">Technical drawing · indicative · full dimensions on request</span></div>
  <div>{eyebrow(1, "Specification")}<h2 id="specT" class="d-m mt-m">The <em>details.</em></h2><table class="spec-table mt-m">{table}</table></div>
</div></section>

<section class="section--tight" id="tabs"><div class="wrap" data-tabs>
  <div class="tabs__list" role="tablist" aria-label="Product information">
    <button role="tab" aria-selected="true">Description</button><button role="tab" aria-selected="false">Specifications</button><button role="tab" aria-selected="false">Installation &amp; Care</button><button role="tab" aria-selected="false">Delivery &amp; Returns</button><button role="tab" aria-selected="false">Reviews</button>
  </div>
  <div class="tabs__panel is-on" role="tabpanel"><div class="cols"><div class="prose">{desc}</div><div class="ph-img" style="aspect-ratio:4/3"><img src="{R}assets/img/ls/{"kitchen-marble" if p["room"] == "kitchen" else "bath-marble-vanity"}.webp" alt="" loading="lazy"></div></div></div>
  <div class="tabs__panel" role="tabpanel"><table class="spec-table" style="max-width:820px">{table}</table></div>
  <div class="tabs__panel" role="tabpanel"><div class="cols prose"><div><h3 class="serif">Installation</h3><p>Our fittings must be installed by a <strong>qualified plumber</strong> — proof of installation is required for warranty claims. Need a recommendation? Our team can help on WhatsApp.</p></div>
    <div><h3 class="serif">Care</h3><ul><li>Clean with a mix of half dish-washing liquid and half water; rinse with a soft cloth.</li><li>No polishing needed — never use aggressive cleaners, bleach or scourers.</li><li>The warranty excludes limescale and damage from harsh cleaners or incorrect installation.</li></ul></div></div></div>
  <div class="tabs__panel" role="tabpanel"><div class="cols prose"><div><h3 class="serif">Delivery</h3><p>We deliver across South Africa, or collect from our Edenvale store. <span class="placeholder">Delivery times &amp; fees: client to confirm</span></p><p>Please inspect goods with the driver and note any damage on the delivery note — damage reported after 48 hours can't be accepted.</p></div>
    <div><h3 class="serif">Returns</h3><p><strong>7-day change of mind</strong> on unused, uninstalled items in original packaging (15% handling fee; delivery fee non-refundable). <strong>Defects:</strong> 6 months under the CPA — report within 48 hours with photos.</p><a class="link-line" href="{R}refund-returns/">Full returns policy {A}</a></div></div></div>
  <div class="tabs__panel" role="tabpanel"><div class="empty-state" style="padding:40px 0;text-align:left"><h4>No reviews yet.</h4><p>Bought this piece? We'd love to hear how it looks in your home.</p><a class="btn btn--ghost mt-s" target="_blank" rel="noopener" href="https://wa.me/27681465775?text={e("Hi Makhi, I'd like to review the " + p["name"])}">Share your review</a></div></div>
</div></section>
{slider("Complete the <em>look</em>", same_fin, 2, "look", "Matching pieces" + (f" in {p['finishLabel'].lower()}" if p.get("finishLabel") else "") + " to carry the finish through the room.")}
{slider("You may also <em>like</em>", also, 3, "also")}'''
    schema = {"@context": "https://schema.org", "@type": "Product", "name": p["name"], "image": [SITE_URL + i for i in images], "description": short,
              "sku": str(p["id"]), "brand": {"@type": "Brand", "name": "Makhi Luxury Taps"}, "category": TYPE_LABEL.get(p["type"], ""),
              "offers": {"@type": "Offer", "priceCurrency": "ZAR", "price": f'{p["price"]:.2f}', "availability": "https://schema.org/" + ("InStock" if p["stock"] else "OutOfStock"),
                         "url": SITE_URL + f'product/{p["slug"]}/', "seller": {"@type": "Organization", "name": "Makhi Luxury Taps"}}}
    if p.get("finishLabel"):
        schema["color"] = p["finishLabel"]
    return body, schema, short
