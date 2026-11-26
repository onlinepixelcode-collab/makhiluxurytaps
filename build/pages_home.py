"""HOME page."""
from layout import e, ICON
from helpers import P, BY, by, card, tile, eyebrow, money, img, stars, TYPE_LABEL

A = ICON["arrow"]

COLLECTIONS = [
    # name html, slug of products, lifestyle image, bg colour, blurb, link
    ("Sw<em>an</em>", ["swan-tall-gold-basin-mixer", "swan-short-basin-mixer-black", "swan-tall-silver-basin-mixer"], "assets/img/ls/bath-stone-sink.webp", "#0B0B0C",
     "The gooseneck that ends in a single drop. Tall for vessel basins, short for inset — in gold, black and silver.", "shop/?q=swan"),
    ("Nal<em>edi</em>", ["naledi-gold-spring-kitchen-mixer", "naledi-black-kitchen-faucet", "naledi-silver-xl-kitchen-faucet"], "assets/img/ls/kitchen-marble.webp", "#24261f",
     "Coil-spring kitchen faucets with spray and stream — a professional kitchen, refined.", "shop/?q=naledi"),
    ("Mu<em>da</em>", ["muda-gold-freestanding-bath-mixer", "muda-chrome-freestanding-bath-mixer", "muda-black-freestanding-bath-mixer"], "assets/img/ls/bath-black-tub.webp", "#2e241b",
     "A floor-standing bath filler with faceted spout and hand shower, rising beside the tub like sculpture.", "shop/?q=muda"),
    ("Am<em>or</em>", ["amor-freestanding-quartz-stone-bath-black-and-white", "amor-freestanding-quartz-stone-bath-black", "amor-freestanding-quartz-stone-bath-white"], "assets/img/ls/bath-mountain.webp", "#1b1d21",
     "Freestanding quartz-stone baths in white, black, or black & white — the centre of the room.", "shop/?q=amor"),
    ("Cob<em>ra</em>", ["cobra-tigris-concealed-diverter-shower-bath-mixer-chrome", "multifunctional-shower-column-matt-black", "iluvia-black-shower-mixer"], "assets/img/ls/bath-black-sink.webp", "#121417",
     "The Cobra Range — concealed shower and bath control with clean, architectural lines.", "cobra-range/"),
]

ROOMS = [
    ("Kitchen", "kitchen/", "assets/img/ls/kitchen-marble.webp", lambda p: p["room"] in ("kitchen",), "naledi-gold-spring-kitchen-mixer"),
    ("Bathroom", "bathroom/", "assets/img/ls/bath-marble-vanity.webp", lambda p: p["room"] in ("bathroom", "both") and p["type"] != "combo", "swan-tall-gold-basin-mixer"),
    ("Showers", "shop/?cat=walk-in", "assets/img/ls/bath-stone-vanity.webp", lambda p: p["type"] in ("walk-in", "enclosed-shower", "shower-column", "shower-mixer"), "multifunctional-shower-column-matt-black"),
    ("Baths", "shop/?cat=bath", "assets/img/ls/bath-black-tub.webp", lambda p: p["type"] in ("bath", "freestanding-mixer"), "amor-freestanding-quartz-stone-bath-black-and-white"),
    ("Basins & Vanities", "shop/?cat=basin", "assets/img/ls/bath-black-sink.webp", lambda p: p["type"] in ("basin", "vanity"), "vanity-set-006-800mm-black"),
    ("Toilets", "shop/?cat=toilet", "assets/img/ls/bath-minimal.webp", lambda p: p["type"] == "toilet", "luxus-closed-coupled-suite-black"),
]

def hero():
    return f'''
<section class="drop on-dark" id="drop" aria-label="Water, made beautiful">
  <div class="drop__stage">
    <div class="drop__bg" aria-hidden="true"></div>
    <div class="drop__still"><img src="{{{{R}}}}assets/img/ls/brass-flow.webp" alt="Gold tap with water flowing" fetchpriority="high"></div>
    <canvas aria-hidden="true"></canvas>
    <div class="drop__kicker"><span class="label">Proudly South African · Edenvale</span></div>
    <div class="drop__copy"><h1 class="drop__title serif">Water, made <em>beautiful.</em></h1></div>
    <div class="drop__intro"><span class="label">The Andy · Chrome</span>Scroll to turn the handle. A true craftsmanship, exhibited by creating a masterpiece.</div>
    <div class="drop__scroll" aria-hidden="true"><i></i>Scroll</div>
    <div class="drop__cta">
      <a class="btn" href="{{{{R}}}}shop/">Shop the Collection {A}</a>
      <button class="btn btn--ghost" data-chat="Find my perfect tap">Find My Perfect Tap · AI</button>
    </div>
    <div class="drop__progress" aria-hidden="true"><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i></div>
  </div>
</section>'''

def marquee():
    items = [("Gold", "m-gold"), ("Black", "m-black"), ("Silver", "m-silver"), ("Chrome", "m-chrome"), ("Stainless", "m-stainless")]
    inner = "".join(f'<a href="{{{{R}}}}finishes/#{n.lower()}" class="marquee__item {c}" data-cursor="VIEW"><span class="fill" data-t="{n}">{n}</span><span class="dot"></span></a>' for n, c in items)
    return f'<section class="section--tight" aria-label="Five signature finishes" style="padding-bottom:0"><div class="marquee" data-speed="70"><div class="marquee__track">{inner}</div></div></section>'

def statement():
    n_products = len([p for p in P if p["type"] != "combo"])
    return f'''
<section class="section statement marble" data-ripple>
  <div class="wrap">
    {eyebrow(1, "The House of Makhi")}
    <blockquote class="mt-m" data-split>“A true craftsmanship exhibited by creating a <em>masterpiece.</em>”</blockquote>
    <cite>— Makhi Luxury Taps</cite>
    <div class="stats">
      <div class="stat"><div class="stat__v">ZA</div><div class="stat__l">Proudly<br>South African</div></div>
      <div class="stat"><div class="stat__v"><span data-count="5">5</span></div><div class="stat__l">Signature<br>finishes</div></div>
      <div class="stat"><div class="stat__v"><span data-count="{n_products}">{n_products}</span><small>+</small></div><div class="stat__l">Pieces for kitchen<br>&amp; bathroom</div></div>
      <div class="stat"><div class="stat__v"><span data-count="2">2</span><small>yr</small></div><div class="stat__l">Warranty on<br>taps &amp; mixers</div></div>
    </div>
  </div>
</section>'''

def rooms():
    imgs = "".join(f'<img src="{{{{R}}}}{im}" alt="" loading="lazy" decoding="async" class="{"is-on" if i == 0 else ""}" data-i="{i}">' for i, (_, _, im, _, _) in enumerate(ROOMS))
    lis = ""
    for i, (name, href, im, fn, feat) in enumerate(ROOMS):
        n = len([p for p in P if fn(p)])
        fp = BY.get(feat)
        lis += f'<li class="{"is-on" if i == 0 else ""}" data-i="{i}" data-peek="{e(fp["name"]) if fp else ""}" data-peek-img="{img(fp) if fp else ""}" data-peek-price="{money(fp["price"]) if fp else ""}"><a href="{{{{R}}}}{href}" data-cursor="SHOP">{e(name)}<sup>{n:02d}</sup></a></li>'
    fp = BY[ROOMS[0][4]]
    return f'''
<section class="rooms on-dark" id="rooms" aria-labelledby="roomsT" data-ripple>
  <div class="rooms__bg" aria-hidden="true">{imgs}</div>
  <div class="rooms__in">
    <span class="eyebrow rooms__label" id="roomsT" style="color:#E2C98A"><span class="n">02</span> / Discover by room</span>
    <ul class="rooms__list">{lis}</ul>
    <div class="rooms__cta"><a class="btn" href="{{{{R}}}}shop/">Shop all {A}</a></div>
  </div>
  <a class="rooms__peek" href="{{{{R}}}}product/{fp["slug"]}/"><div class="tile"><img src="{{{{R}}}}{img(fp)}" alt=""></div><div><b>{e(fp["name"])}</b><span>{money(fp["price"])}</span></div></a>
</section>'''

def collections():
    cards = ""; names = ""
    for ci, (nm, slugs, life, bg, blurb, link) in enumerate(COLLECTIONS):
        ps = [BY[s] for s in slugs if s in BY]
        seq = [("p", ps[0]), ("l", life)] + [("p", q) for q in ps[1:]]
        for j, (k, v) in enumerate(seq):
            tall = " tall" if j % 2 == 0 else ""
            if k == "p":
                cards += f'<a class="ccard{tall}" href="{{{{R}}}}product/{v["slug"]}/" data-c="{ci}" data-cursor="VIEW" aria-label="{e(v["name"])}">{tile(v)}</a>'
            else:
                cards += f'<a class="ccard{tall}" href="{{{{R}}}}{link}" data-c="{ci}" data-cursor="VIEW" aria-label="Explore the collection"><img src="{{{{R}}}}{v}" alt="" loading="lazy" decoding="async"></a>'
        letters = []
        import re
        # wrap chars for staggered reveal, keep <em>
        parts = re.split(r"(<em>.*?</em>)", nm)
        for part in parts:
            if part.startswith("<em>"):
                letters.append("<em>" + "".join(f'<span class="ch">{c}</span>' for c in part[4:-5]) + "</em>")
            else:
                letters.append("".join(f'<span class="ch">{c}</span>' for c in part))
        names += f'<p class="cname{" is-on" if ci == 0 else ""}" data-c="{ci}" data-bg="{bg}" data-blurb="{e(blurb)}" data-link="{link}" aria-hidden="{"false" if ci == 0 else "true"}">{"".join(letters)}</p>'
    return f'''
<section class="colls on-dark" id="collections" aria-labelledby="collsT" style="--coll-bg:{COLLECTIONS[0][3]}">
  <div class="colls__pin">
    <span class="eyebrow colls__label" id="collsT" style="justify-content:center;width:100%;color:rgba(244,241,234,.85)"><span class="n">03</span> / Signature collections</span>
    <div class="colls__track">{cards}</div>
    <div class="colls__names">{names}</div>
    <div class="colls__foot">
      <div class="colls__meta"><b>Collection</b><span class="colls__blurb">{e(COLLECTIONS[0][4])}</span></div>
      <a class="btn colls__link" href="{{{{R}}}}{COLLECTIONS[0][5]}">Explore {A}</a>
      <div class="colls__count"><b class="colls__i">01</b> / {len(COLLECTIONS):02d}</div>
    </div>
  </div>
</section>'''

def bestsellers():
    picks = ["swan-short-basin-mixer-silver", "naledi-black-xl-kitchen-faucet", "veja-black-pullout-kitchen-faucet", "naledi-black-kitchen-faucet",
             "swan-short-basin-mixer-gold", "muda-gold-freestanding-bath-mixer", "multifunctional-shower-column-matt-black", "andy-chrome-pullout-kitchen-faucet"]
    cards = "".join(card(BY[s]) for s in picks if s in BY)
    return f'''
<section class="section" aria-labelledby="bestT">
  <div class="wrap">
    <div class="sec-head">
      <div>{eyebrow(4, "Signature pieces")}<h2 id="bestT" class="d-m mt-m" data-split>Our <em>best</em> sellers</h2></div>
      <div class="flex gap-m ai-c"><p class="lead">The pieces South African homes choose first — shown like jewellery, priced honestly.</p>
      <div class="pslider__ctrl"><button data-slide="-1" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 12H5M11 6l-6 6 6 6"/></svg></button><button data-slide="1" aria-label="Next">{A}</button></div></div>
    </div>
    <div class="pslider" data-cursor="DRAG">{cards}</div>
  </div>
</section>'''

def finish_switcher():
    fins = [("gold", "Gold"), ("black", "Black"), ("silver", "Silver"), ("chrome", "Chrome"), ("stainless", "Stainless")]
    picks = "".join(f'<button class="sw-pick{" is-active" if k == "chrome" else ""}" data-finish="{k}" aria-pressed="{"true" if k == "chrome" else "false"}"><i class="sw sw-lg sw--{k}"></i>{n}</button>' for i, (k, n) in enumerate(fins))
    return f'''
<section class="fsw" id="finish-switcher" aria-labelledby="fswT">
  <div class="fsw__stage" data-cursor="DRAG">
    <canvas aria-label="Interactive 3D Andy pull-out kitchen faucet — drag to rotate" role="img"></canvas>
    <div class="fsw__sweep" aria-hidden="true"></div>
    <div class="fsw__name"><span>The Andy · Pull-out Kitchen Faucet</span><span class="fsw__fin">Chrome</span></div>
    <div class="fsw__hint"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>Drag to rotate</div>
  </div>
  <div class="fsw__copy">
    {eyebrow(5, "The finish switcher")}
    <h2 id="fswT" class="d-m" data-split>One form. <em>Five</em> characters.</h2>
    <div class="sw-row" role="group" aria-label="Choose a finish">{picks}</div>
    <div class="fsw__story" aria-live="polite"><h3 class="serif">Chrome</h3><p>Mirror-bright and crisp. Chrome reflects light around the room and is the easiest finish to keep sparkling.</p></div>
    <div class="fsw__avail"><span class="label">Available in this finish</span><div class="fsw__list"></div><a class="link-line mt-s fsw__all" href="{{{{R}}}}shop/?finish=chrome">Shop all chrome {A}</a></div>
  </div>
</section>'''

def cobra():
    p = by("cobra-tigris-concealed-diverter-shower-bath-mixer-chrome")
    ring = "COBRA TIGRIS · CONCEALED DIVERTER · SHOWER &amp; BATH · CHROME · "
    specs = [("Concealed", "The valve lives inside the wall. All you see is one polished disc."),
             ("Two-way diverter", "Shower or bath at a turn, at exactly the temperature you set."),
             ("Two-year warranty", "Chrome-plated, built for everyday South African water.")]
    sp = "".join(f'<li><span class="cx__n">0{i + 1}</span><h3 class="serif">{e(h)}</h3><p>{e(t)}</p></li>' for i, (h, t) in enumerate(specs))
    return f'''
<section class="cx on-dark" id="cobra" aria-labelledby="cobraT" data-ripple>
  <div class="wrap cx__head"><span class="eyebrow"><span class="n">06</span> / The Cobra Range</span><span class="label">Concealed diverter mixer · Chrome</span></div>
  <div class="cx__stage">
    <div class="cx__word" aria-hidden="true"><span>Cobra</span></div>
    <div class="wrap cx__grid">
      <div class="cx__copy">
        <h2 id="cobraT" class="d-l">Control, <em>concealed.</em></h2>
        <p class="lead">Shower and bath control in one quiet disc on the wall. Everything else disappears.</p>
      </div>
      <div class="cx__disc">
        <svg class="cx__ring" viewBox="0 0 400 400" aria-hidden="true"><defs><path id="cxPath" d="M200,200 m-182,0 a182,182 0 1,1 364,0 a182,182 0 1,1 -364,0"/></defs>
          <circle cx="200" cy="200" r="198" class="cx__hair"/><circle cx="200" cy="200" r="166" class="cx__hair cx__hair--dash"/>
          <text><textPath href="#cxPath">{ring}{ring}</textPath></text></svg>
        <a class="cx__medal" href="{{{{R}}}}product/{p["slug"]}/" aria-label="{e(p["name"])}"><img src="{{{{R}}}}{img(p, 0)}" alt="{e(p["name"])}" loading="lazy"></a>
      </div>
      <div class="cx__buy">
        <span class="label">Cobra Tigris</span>
        <span class="cx__price serif">{money(p["price"])}</span>
        <div class="cx__ctas"><button class="btn btn--gold" data-add="{p["id"]}">Add to cart</button><a class="btn" href="{{{{R}}}}cobra-range/">Explore the range {A}</a></div>
      </div>
    </div>
  </div>
  <ol class="wrap cx__specs" data-stagger>{sp}</ol>
</section>'''

def viz_teaser():
    return f'''
<section class="section" aria-labelledby="vtT">
  <div class="wrap vt">
    <div>
      {eyebrow(7, "Design your space")}
      <h2 id="vtT" class="d-m mt-m" data-split>Build the room <em>before</em> you buy it.</h2>
      <p class="lead mt-m">Choose a bath, basin, mixer, shower and toilet from the real Makhi range. Match every fitting to one finish with a tap, watch the total update, then send the design to WhatsApp.</p>
      <div class="flex gap-s wrap-f mt-m"><a class="btn" href="{{{{R}}}}design-your-space/">Start designing {A}</a><a class="btn btn--ghost" href="{{{{R}}}}combo-deals/">Or shop a ready suite</a></div>
    </div>
    <a class="vt__preview rv-water" href="{{{{R}}}}design-your-space/" data-cursor="OPEN"><span class="badge-line vt__badge">Live visualiser</span><img src="{{{{R}}}}assets/img/ls/bath-stone-vanity.webp" alt="Styled bathroom" loading="lazy" style="width:100%;height:100%;object-fit:cover"></a>
  </div>
</section>'''

def combos():
    cs = sorted([p for p in P if p["type"] == "combo"], key=lambda p: p["price"])
    order = [by("combo-deal-5"), by("combo-deal-1"), by("combo-deal-7"), by("combo-deal-3"), by("combo-deal-2"), by("combo-deal-9")]
    cls = ["a", "b", "c", "d", "e", "f"]
    cards = ""
    for c, p in zip(cls, order):
        items = ", ".join(p.get("items", [])[:4 if c == "a" else 3])
        cards += f'''<a class="bcard bcard--{c}" href="{{{{R}}}}product/{p["slug"]}/" data-cursor="VIEW">{tile(p)}
          <div class="bcard__top"><span class="label">{e(p["name"])}</span><span class="bcard__save">{len(p.get("items", []))} pieces</span></div>
          <div><h3 class="serif">{e(p.get("title") or p["name"])}</h3></div>
          <div class="bcard__foot"><span class="price">{money(p["price"])}</span><span class="label" style="color:#111">Bundle price</span></div></a>'''
    return f'''
<section class="section panel" aria-labelledby="comboT">
  <div class="wrap">
    <div class="sec-head"><div>{eyebrow(8, "Curated suites")}<h2 id="comboT" class="d-m mt-m" data-split>The <em>Suites</em></h2></div>
      <div><p class="lead">Complete bathrooms, curated by Makhi.</p><a class="link-line mt-s" href="{{{{R}}}}combo-deals/">All {len(cs)} combo deals {A}</a></div></div>
    <div class="bento" data-stagger>{cards}</div>
  </div>
</section>'''

def inspiration():
    shots = [
        ("a", "assets/img/ls/bath-black-tub.webp", "4/5", "Noir freestanding bath", [(59, 61, "muda-black-freestanding-bath-mixer"), (40, 84, "amor-freestanding-quartz-stone-bath-black")]),
        ("b", "assets/img/ls/kitchen-black.webp", "4/5", "Black kitchen", [(24, 58, "andy-black-pullout-kitchen-faucet")]),
        ("c", "assets/img/ls/bath-black-sink.webp", "4/5", "Marble & onyx", [(88, 64, "trevi-mood-basin"), (63, 42, "pandora-desire-walkin-shower-1200x2000")]),
        ("d", "assets/img/ls/bath-marble-vanity.webp", "6/7", "Twin vessels", [(28, 55, "the-knob-basin-and-bath-mixer-black"), (65, 63, "aiyi-round-basin-black-and-white")]),
        ("e", "assets/img/ls/bath-minimal.webp", "4/5", "Minimal suite", [(77, 78, "luxus-closed-coupled-suite-black"), (30, 64, "vanity-set-005-800mm-white")]),
    ]
    out = ""
    for c, im, ar, cap, hs in shots:
        spots = ""
        for x, y, s in hs:
            p = BY.get(s)
            if not p: continue
            flip = " flip" if x > 55 else ""
            spots += f'''<div class="hotspot{flip}" style="left:{x}%;top:{y}%"><button class="hotspot__dot" aria-label="Show {e(p["name"])}"></button>
              <a class="hotspot__card" href="{{{{R}}}}product/{p["slug"]}/"><div class="tile"><img src="{{{{R}}}}{img(p)}" alt=""></div><div><small>Shop the look</small><b>{e(p["name"])}</b><span>{money(p["price"])}</span></div></a></div>'''
        out += f'<figure class="shot shot--{c} rv-water" style="aspect-ratio:{ar}"><img src="{{{{R}}}}{im}" alt="{e(cap)}" loading="lazy" decoding="async">{spots}<figcaption>{e(cap)}</figcaption></figure>'
    return f'''
<section class="section" aria-labelledby="inspT">
  <div class="wrap">
    <div class="sec-head"><div>{eyebrow(9, "Inspiration")}<h2 id="inspT" class="d-m mt-m" data-split>Spaces, <em>shoppable.</em></h2></div>
      <div><p class="lead">Tap a point of light to see the fitting and its price.</p><a class="link-line mt-s" href="{{{{R}}}}inspiration/">Open the lookbook {A}</a></div></div>
    <div class="mosaic">{out}</div>
    <p class="muted mt-m" style="font-size:13px">Styled imagery shown for inspiration · replace with Makhi installation photography from @makhi_luxury_taps.</p>
  </div>
</section>'''

def why():
    tiles = [("truck", "Fast Delivery", "Delivered across South Africa, or collect from our Edenvale store."),
             ("shield", "Secure Payments", "Card, EFT, PayJustNow and Laybuy — encrypted and protected."),
             ("route", "Order Tracking", "Follow every order from placed to packed, dispatched and delivered."),
             ("chat", "Expert Support", "Real people on WhatsApp, phone and email — plus Ask Makhi, our AI assistant, any hour.")]
    t = "".join(f'<div class="why__t">{ICON[i]}<h3>{e(h)}</h3><p>{e(p)}</p></div>' for i, h, p in tiles)
    return f'''
<section class="section--tight" aria-labelledby="whyT"><div class="wrap">
  <div class="sec-head" style="margin-bottom:48px"><div>{eyebrow(10, "Why Makhi")}<h2 id="whyT" class="d-s mt-m">Luxury, made <em>simple.</em></h2></div></div>
  <div class="why" data-stagger>{t}</div></div></section>'''

def reviews():
    revs = [("The finish is flawless — it looks like jewellery on our vanity. Delivery was quick and the team on WhatsApp was so helpful.", "Customer name · Johannesburg"),
            ("We did our whole en-suite with a combo deal. It looks like a five-star hotel bathroom for a fraction of the price.", "Customer name · Pretoria"),
            ("Our Naledi kitchen faucet gets compliments from everyone who visits. Proper quality, proudly South African.", "Customer name · Edenvale")]
    items = "".join(f'<div class="rev__item{" is-on" if i == 0 else ""}">{stars()}<blockquote>“{e(q)}”</blockquote><cite>{e(c)}</cite></div>' for i, (q, c) in enumerate(revs))
    dots = "".join(f'<button class="{"is-on" if i == 0 else ""}" aria-label="Review {i+1}"><i></i></button>' for i in range(len(revs)))
    return f'''
<section class="section reviews marble" aria-labelledby="revT" data-ripple><div class="wrap">
  {eyebrow(11, "In their words")}<h2 id="revT" class="sr-only">Reviews</h2>
  <div class="rev mt-l" aria-live="polite">{items}</div>
  <div class="rev__nav">{dots}</div>
  <span class="demo-note">Demo copy — replace with verified Google reviews</span>
</div></section>'''

def insta():
    pics = ["assets/img/site/WhatsApp-Image-2023-06-12-at-14.webp", "assets/img/site/Kitchen-Sink.webp", "assets/img/site/IMG-20241002-WA0017.webp", "assets/img/site/0.webp", "assets/img/site/9511d62c-4084-44cd-ba51-8fb12e3fa5ff.webp", "assets/img/site/1fd099c9-2114-469b-9eaa-d078f265a81f.webp"]
    a = "".join(f'<a href="https://www.instagram.com/makhi_luxury_taps/" target="_blank" rel="noopener" aria-label="View on Instagram" data-cursor="VIEW"><img src="{{{{R}}}}{p}" alt="" loading="lazy" decoding="async">{ICON["ig"]}</a>' for p in pics)
    return f'''
<section class="section--tight" aria-labelledby="igT"><div class="wrap">
  <div class="sec-head" style="margin-bottom:48px"><div>{eyebrow(12, "@makhi_luxury_taps")}<h2 id="igT" class="d-s mt-m">Follow the <em>flow.</em></h2></div><a class="btn btn--ghost" href="https://www.instagram.com/makhi_luxury_taps/" target="_blank" rel="noopener">Follow on Instagram</a></div>
  <div class="insta" data-stagger>{a}</div></div></section>'''

def newsletter():
    return f'''
<section class="section news marble" aria-labelledby="newsT" data-ripple><div class="wrap">
  {eyebrow(13, "The Makhi letter")}
  <h2 id="newsT" class="d-m" data-split>Be first to see <em>new collections.</em></h2>
  <p class="lead" style="margin:0 auto">Launches, limited finishes and design notes. A few beautiful emails a year — never noise.</p>
  <form data-newsletter novalidate><label class="sr-only" for="newsEmail">Email address</label><input id="newsEmail" type="email" placeholder="Your email address" required autocomplete="email"><button class="btn btn--gold">Subscribe {A}</button></form>
  <small>By subscribing you agree to our <a href="{{{{R}}}}privacy/" style="text-decoration:underline">privacy policy</a>. Unsubscribe any time.</small>
</div></section>'''

def build():
    body = hero() + marquee() + statement() + rooms() + collections() + bestsellers() + finish_switcher() + cobra() + combos() + inspiration() + why() + reviews()
    return body
