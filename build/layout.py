"""Shared layout for every Makhi page."""
import json, html as H

SITE_URL = "https://demo.pixelcode.co.za/makhiluxurytaps/"
BASE_PATH = "/makhiluxurytaps/"
VERSION = "1.3.4"

GSAP = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
ST = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
LENIS = "https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"
THREE_MAP = {"imports": {"three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                         "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}

def e(s):
    return H.escape(str(s), quote=True)

LOGO_SVG = open(__file__.replace("build/layout.py", "site/assets/img/brand/makhi-logo.svg")).read()
DROP_D = open(__file__.replace("build/layout.py", "site/assets/img/brand/drop.d")).read()
LOGO_INLINE = LOGO_SVG.replace("<svg ", '<svg role="img" aria-label="Makhi Luxury Taps" ', 1)

ICON = {
    "search": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"><circle cx="10.6" cy="10.6" r="6.1"/><path d="M15.2 15.2l5.3 5.3"/><path d="M7.6 9.2a3.4 3.4 0 0 1 2.4-2" opacity=".55"/></svg>',
    "heart": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"><path d="M12 19.6c-.3 0-7.6-4.3-8.6-9.1C2.7 7.2 4.8 4.6 7.7 4.6c1.9 0 3.3 1.1 4.3 2.6 1-1.5 2.4-2.6 4.3-2.6 2.9 0 5 2.6 4.3 5.9-1 4.8-8.3 9.1-8.6 9.1z"/></svg>',
    "user": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"><circle cx="12" cy="8.4" r="3.6"/><path d="M5 20.2c.9-3.7 3.7-5.7 7-5.7s6.1 2 7 5.7"/></svg>',
    "bag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round"><path d="M4.8 8.2h14.4l-1.1 11.3a1.6 1.6 0 0 1-1.6 1.4H7.5a1.6 1.6 0 0 1-1.6-1.4L4.8 8.2z"/><path d="M8.8 10.6V7a3.2 3.2 0 0 1 6.4 0v3.6"/></svg>',
    "home": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    "grid": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/></svg>',
    "drop": f'<svg viewBox="0 0 82 100" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="{DROP_D}"/></svg>',
    "spark": f'<svg viewBox="0 0 82 100" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="{DROP_D}"/></svg>',
    "arrow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    "arrowUR": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    "close": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    "ig": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "fb": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.8c0-.8.5-1 .9-1H17V2.2L14.1 2C11 2 10.3 4.3 10.3 5.8v2.7H8v3.7h2.3V22H14v-9.8h2.8l.4-3.7z"/></svg>',
    "wa": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.2 0-.4.1-.5l.4-.4.3-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z"/></svg>',
    "lock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    "truck": '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 12h26v20H3zM29 19h9l7 7v6H29z"/><circle cx="12" cy="35" r="4"/><circle cx="37" cy="35" r="4"/><path d="M3 18h12M6 24h9"/></svg>',
    "shield": '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1"><path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z"/><path d="M17 24l5 5 9-10"/></svg>',
    "route": '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1"><circle cx="10" cy="38" r="4"/><circle cx="38" cy="10" r="4"/><path d="M14 38h16a7 7 0 0 0 0-14H18a7 7 0 0 1 0-14h16"/></svg>',
    "chat": '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1"><path d="M8 10h32v22H22l-9 7v-7H8z"/><path d="M16 19h16M16 25h10"/></svg>',
    "star": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2 6.1 20.5l1.4-6.6-5-4.5 6.6-.7z"/></svg>',
    "dl": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 3v13M6 11l6 6 6-6M4 21h16"/></svg>',
    "pin": '<svg viewBox="0 0 22 28" fill="currentColor"><path d="M11 0C4.9 0 0 4.9 0 11c0 8 11 17 11 17s11-9 11-17C22 4.9 17.1 0 11 0zm0 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>',
    "book": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 5.5C6.5 4 9.5 4 12 5.5 14.5 4 17.5 4 20 5.5V19c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0z"/><path d="M12 5.5V19"/></svg>',
}

THEME_ICON = '''<svg class="ti" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <defs>
    <clipPath id="tiClip"><path d="M12 3.2C12 3.2 6 9.9 6 13.9a6 6 0 0 0 12 0C18 9.9 12 3.2 12 3.2z"/></clipPath>
    <linearGradient id="tiGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3AC"/><stop offset=".55" stop-color="#C8A45D"/><stop offset="1" stop-color="#8E6C2E"/></linearGradient>
    <radialGradient id="tiGlow" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#F3DFA6" stop-opacity=".55"/><stop offset="1" stop-color="#F3DFA6" stop-opacity="0"/></radialGradient>
  </defs>
  <circle class="ti__halo" cx="12" cy="12.6" r="11" fill="url(#tiGlow)"/>
  <g class="ti__rays" stroke="#C8A45D" stroke-width="1.35" stroke-linecap="round"><path d="M12.00 4.20L12.00 1.70"/><path d="M17.94 6.66L19.71 4.89"/><path d="M20.40 12.60L22.90 12.60"/><path d="M17.94 18.54L19.71 20.31"/><path d="M12.00 21.00L12.00 23.50"/><path d="M6.06 18.54L4.29 20.31"/><path d="M3.60 12.60L1.10 12.60"/><path d="M6.06 6.66L4.29 4.89"/></g>
  <g class="ti__drop">
    <g clip-path="url(#tiClip)"><g class="ti__liquid"><path class="ti__wave" fill="url(#tiGold)" d="M-12 9.5c2 0 2-1.2 4-1.2s2 1.2 4 1.2 2-1.2 4-1.2 2 1.2 4 1.2 2-1.2 4-1.2 2 1.2 4 1.2 2-1.2 4-1.2 2 1.2 4 1.2 2-1.2 4-1.2 2 1.2 4 1.2V26h-36z"/></g></g>
    <path class="ti__outline" d="M12 3.2C12 3.2 6 9.9 6 13.9a6 6 0 0 0 12 0C18 9.9 12 3.2 12 3.2z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>
    <path class="ti__glint" d="M9.3 14.6a2.8 2.8 0 0 0 1.6 2.4" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>
  </g>
</svg>'''

NAV = [
    ("Kitchen", "kitchen/", [("Kitchen Faucets", "shop/?cat=kitchen-faucet"), ("Pull-out Faucets", "kitchen/#pull-out"), ("Wall-mounted Taps", "shop/?cat=wall-tap"), ("Kitchen Sinks", "kitchen/#sinks")],
     [("Shop by finish", [("Gold", "shop/?room=kitchen&finish=gold"), ("Black", "shop/?room=kitchen&finish=black"), ("Silver & Chrome", "shop/?room=kitchen&finish=silver")])], "naledi-gold-spring-kitchen-mixer"),
    ("Bathroom", "bathroom/", [("Basin Mixers", "shop/?cat=basin-mixer"), ("Bath Mixers", "shop/?cat=bath-mixer"), ("Freestanding Mixers", "shop/?cat=freestanding-mixer"), ("Shower Mixers & Columns", "shop/?cat=shower-mixer")],
     [("Baths, basins & toilets", [("Freestanding Baths", "shop/?cat=bath"), ("Basins & Vanities", "shop/?cat=basin"), ("Showers", "shop/?cat=walk-in"), ("Toilets", "shop/?cat=toilet")])], "muda-gold-freestanding-bath-mixer"),
    ("Collections", "collections/", [("The Cobra Range", "cobra-range/"), ("Combo Deals", "combo-deals/"), ("Catalogue", "catalogue/"), ("Shop All", "shop/")],
     [("Signature pieces", [("Swan Mixers", "shop/?q=swan"), ("Naledi Faucets", "shop/?q=naledi"), ("Muda Bath Mixers", "shop/?q=muda")])], "cobra-tigris-concealed-diverter-shower-bath-mixer-chrome"),
    ("Finishes", "finishes/", [("Gold", "finishes/#gold"), ("Black", "finishes/#black"), ("Silver", "finishes/#silver"), ("Chrome", "finishes/#chrome"), ("Stainless Steel", "finishes/#stainless")],
     [("Tools", [("Finish Switcher", "index.html#finish-switcher")])], "swan-tall-gold-basin-mixer"),
    ("Inspiration", "inspiration/", [("Lookbook", "inspiration/"), ("Catalogue", "catalogue/"), ("Trade & Projects", "trade/")],
     [("Guides", [("Choosing a finish", "inspiration/#guides"), ("Small bathrooms", "inspiration/#guides"), ("Matching the kitchen", "inspiration/#guides")])], "swan-tall-black-basin-mixer"),
    ("Catalogue", "catalogue/", [], [], None),
    ("About", "about/", [], [], None),
    ("Contact", "contact/", [], [], None),
]

def ann_bar():
    items = ["Fast delivery across South Africa", "Secure payments", "Track your order", "WhatsApp us: +27 68 146 5775", "Proudly South African", "Also available on Takealot"]
    one = "".join(f'<span class="ann__it"><i aria-hidden="true"></i>{e(t)}</span>' for t in items)
    return ('<div class="ann ann--run" role="region" aria-label="Announcements"><div class="ann__rail">'
            f'<div class="ann__set">{one}</div><div class="ann__set" aria-hidden="true">{one}</div>'
            '</div></div>')

def header(R, products, current=""):
    bys = {p["slug"]: p for p in products}
    lis = []
    for name, href, links, groups, feat in NAV:
        mega = ""
        if links:
            fp = bys.get(feat)
            thumbs = {"Kitchen": "naledi-black-xl-kitchen-faucet", "Bathroom": "swan-tall-gold-basin-mixer", "Collections": "amor-freestanding-quartz-stone-bath-black-and-white", "Finishes": "swan-short-basin-mixer-gold", "Inspiration": "muda-gold-freestanding-bath-mixer"}
            col1 = "".join(f'<li><a href="{R}{h}"><span>{e(t)}</span><i aria-hidden="true">{ICON["arrow"]}</i></a></li>' for t, h in links)
            col2 = ""
            for gt, gl in groups:
                col2 += f'<h4>{e(gt)}</h4><ul class="mega__sub">' + "".join(f'<li><a href="{R}{h}">{e(t)}</a></li>' for t, h in gl) + "</ul>"
            fin = "".join(f'<a class="mega__fin" href="{R}shop/?finish={k}" title="{n}"><i class="sw sw--{k}"></i><span>{n}</span></a>' for k, n in [("gold", "Gold"), ("black", "Black"), ("silver", "Silver"), ("chrome", "Chrome")])
            feat_html = ""
            if fp:
                feat_html = f'''<a class="mega__feat" href="{R}product/{fp["slug"]}/"><div class="mega__img tile"><img src="{R}{fp["images"][0]}" alt="" loading="lazy"></div>
                  <div class="mega__cap"><span class="label">Featured</span><p class="serif">{e(fp["name"])}</p><span class="price">R{fp["price"]:,}.00</span><span class="mega__cta">Discover {ICON["arrow"]}</span></div></a>'''
            mega = f'''<div class="mega"><div class="wrap mega__in">
              <div class="mega__lead"><span class="label">{e(name)}</span><p class="serif mega__title"><a href="{R}{href}">{e(name)} <em>collection</em></a></p><ul class="mega__links">{col1}</ul></div>
              <div class="mega__mid">{col2}<h4>Shop by finish</h4><div class="mega__fins">{fin}</div></div>
              {feat_html}
            </div></div>'''
        cur = ' aria-current="page"' if current and href.startswith(current) else ""
        lis.append(f'<li><a href="{R}{href}"{cur}>{e(name)}</a>{mega}</li>')
    return f'''
<header class="hdr with-nav" role="banner">
  <div class="wrap hdr__in">
    <div class="hdr__left">
      <button class="menu-btn" aria-expanded="false" aria-controls="fsm"><span class="menu-btn__bars" aria-hidden="true"></span><span class="t">MENU</span></button>
      <button class="icon-btn hide-m" data-open-search aria-label="Search">{ICON["search"]}</button>
    </div>
    <a href="{R}index.html" class="logo" aria-label="Makhi Luxury Taps — home">{LOGO_INLINE}</a>
    <div class="hdr__right">
      <button class="icon-btn hide-d" data-open-search aria-label="Search">{ICON["search"]}</button>
      <button class="icon-btn theme-btn" aria-label="Switch light or dark theme" data-tip="Light / Dark">{THEME_ICON}</button>
      <a class="icon-btn hide-m" href="{R}wishlist/" aria-label="Wishlist">{ICON["heart"]}</a>
      <a class="icon-btn hide-m" href="{R}account/" aria-label="Account">{ICON["user"]}</a>
      <a class="icon-btn" href="{R}checkout/" data-open-cart aria-label="Cart">{ICON["bag"]}<span class="cart-count" aria-live="polite">0</span><span class="cart-ripple"></span></a>
    </div>
  </div>
  <nav aria-label="Primary"><ul class="hdr__nav">{"".join(lis)}</ul></nav>
</header>'''

def fsm(R, products):
    bys = {p["slug"]: p for p in products}
    items = [("Shop All", "shop/", "swan-short-basin-mixer-gold"), ("Kitchen", "kitchen/", "naledi-gold-spring-kitchen-mixer"), ("Bathroom", "bathroom/", "muda-gold-freestanding-bath-mixer"),
             ("Collections", "collections/", "cobra-tigris-concealed-diverter-shower-bath-mixer-chrome"), ("Catalogue", "catalogue/", "andy-chrome-pullout-kitchen-faucet"), ("Finishes", "finishes/", "swan-tall-gold-basin-mixer"),
             ("Inspiration", "inspiration/", "swan-tall-black-basin-mixer"), ("About", "about/", "multifunctional-shower-column-matt-black")]
    lis = "".join(f'<li><a href="{R}{h}" data-i="{i}" data-cap="{e(bys[s]["name"]) if s in bys else ""}">{e(t)}</a></li>' for i, (t, h, s) in enumerate(items))
    tiles = "".join(f'<div class="tile{" is-on" if i == 0 else ""}" data-i="{i}"><img src="{R}{bys[s]["images"][0]}" alt="" loading="lazy"></div>' for i, (t, h, s) in enumerate(items) if s in bys)
    quick = [("Kitchen", "kitchen/", "naledi-gold-spring-kitchen-mixer"), ("Bathroom", "bathroom/", "swan-tall-gold-basin-mixer"), ("Combo Deals", "combo-deals/", "amor-freestanding-quartz-stone-bath-black-and-white"), ("Catalogue", "catalogue/", "andy-chrome-pullout-kitchen-faucet")]
    qh = "".join(f'<a class="fsm__q" href="{R}{h}"><span class="tile"><img src="{R}{bys[s]["images"][0]}" alt="" loading="lazy"></span><span>{e(t)}</span></a>' for t, h, s in quick if s in bys)
    return f'''
<div class="fsm" id="fsm" aria-hidden="true">
  <nav class="fsm__nav" aria-label="Menu">
    <form class="fsm__search" action="{R}shop/" method="get" role="search">
      {ICON["search"]}<label class="sr-only" for="fsmQ">Search the collection</label>
      <input id="fsmQ" name="q" type="search" placeholder="Search taps, baths, finishes…" autocomplete="off">
      <button type="submit" aria-label="Search">{ICON["arrow"]}</button>
      <div class="fsm__res" aria-live="polite"></div>
    </form>
    <div class="fsm__quick">{qh}</div>
    <ul class="fsm__list">{lis}</ul>
    <div class="fsm__util">
      <a href="{R}account/">{ICON["user"]}Account</a><a href="{R}wishlist/">{ICON["heart"]}Wishlist</a><a href="{R}track-order/">{ICON["bag"]}Track order</a>
      <button class="theme-btn fsm__theme" type="button" aria-label="Switch light or dark theme">{THEME_ICON}<span>Light / Dark</span></button>
    </div>
    <div class="fsm__foot">
      <a href="https://wa.me/27681465775" target="_blank" rel="noopener" class="fsm__wa">{ICON["wa"]}<span><b>WhatsApp us</b>+27 68 146 5775</span></a>
      <div class="fsm__links"><a href="{R}contact/">Contact</a><a href="{R}faqs/">FAQs</a><a href="{R}trade/">Trade &amp; Projects</a></div>
    </div>
  </nav>
  <div class="fsm__visual">{tiles}<div class="fsm__caption"><span class="label">Featured</span><p class="serif">{e(bys[items[0][2]]["name"])}</p></div></div>
</div>'''

def footer(R):
    return f'''
<footer class="ftr" role="contentinfo">
  <div class="wrap">
    <div class="ftr__hero">
      <div class="ftr__hl"><span class="label">Makhi Luxury Taps</span><p class="serif">Water, made <em>beautiful.</em></p></div>
      <div class="ftr__cta">
        <span class="label">Visit or talk to us</span>
        <p>See every finish in person at our Edenvale showroom, or chat to the team on WhatsApp.</p>
        <div class="flex gap-s wrap-f"><a class="btn btn--gold btn--sm" href="{R}contact/">Plan a visit {ICON["arrow"]}</a><a class="btn btn--ghost btn--sm" href="https://wa.me/27681465775" target="_blank" rel="noopener">{ICON["wa"]} WhatsApp</a></div>
      </div>
    </div>
    <div class="ftr__top">
      <div class="ftr__brand">
        <a href="{R}index.html" class="logo">{LOGO_INLINE}</a>
        <p>A proudly South African brand of luxury taps and bathroom ware — the last exquisite touch for your kitchen and bathroom.</p>
        <div class="socials">
          <a href="https://www.instagram.com/makhi_luxury_taps/" target="_blank" rel="noopener" aria-label="Instagram @makhi_luxury_taps">{ICON["ig"]}</a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">{ICON["fb"]}</a>
          <a href="https://wa.me/27681465775" target="_blank" rel="noopener" aria-label="WhatsApp">{ICON["wa"]}</a>
        </div>
      </div>
      <div class="ftr__col"><h6>Shop</h6><ul><li><a href="{R}kitchen/">Kitchen</a></li><li><a href="{R}bathroom/">Bathroom</a></li><li><a href="{R}cobra-range/">Cobra Range</a></li><li><a href="{R}combo-deals/">Combo Deals</a></li><li><a href="{R}catalogue/">Catalogue</a></li><li><a href="{R}shop/">Shop All</a></li></ul></div>
      <div class="ftr__col"><h6>Help</h6><ul><li><a href="{R}faqs/">FAQs</a></li><li><a href="{R}track-order/">Track Order</a></li><li><a href="{R}refund-returns/">Returns</a></li><li><a href="{R}contact/">Contact</a></li></ul></div>
      <div class="ftr__col"><h6>Company</h6><ul><li><a href="{R}about/">About</a></li><li><a href="{R}inspiration/">Inspiration</a></li><li><a href="{R}trade/">Trade &amp; Projects</a></li></ul></div>
      <div class="ftr__col ftr__visit"><h6>Visit &amp; talk</h6>
        <address>
          <a href="https://maps.google.com/?q=93+Van+Riebeeck+Avenue+Edenvale" target="_blank" rel="noopener">93 Van Riebeeck Avenue<br>Edenvale Ext 1, Edenvale, 1645</a>
          <a href="tel:+27681465775">+27 68 146 5775</a>
          <a href="mailto:info@makhiluxurytaps.co.za">info@makhiluxurytaps.co.za</a>
        </address>
      </div>
    </div>
    <a class="tkl" href="https://www.takealot.com/" target="_blank" rel="noopener" aria-label="Makhi Luxury Taps is also available on Takealot">
      <span class="tkl__txt"><span class="label">Also available on</span><span class="tkl__line">Shop Makhi on South Africa's favourite marketplace</span></span>
      <span class="tkl__logo"><img src="{R}assets/img/brand/Takealot.svg" alt="Takealot" width="150" height="43"></span>
      <span class="tkl__go">{ICON["arrowUR"]}</span>
    </a>
    <div class="ftr__wordmark" aria-hidden="true">
      <svg viewBox="0 0 1200 230" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="ftrShimmer" x1="0" x2="1" y1="0" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color="#C8A45D" stop-opacity=".0"/><stop offset=".45" stop-color="#C8A45D" stop-opacity=".0"/>
            <stop offset=".5" stop-color="#F3DFA6" stop-opacity="1"/><stop offset=".55" stop-color="#C8A45D" stop-opacity=".0"/><stop offset="1" stop-color="#C8A45D" stop-opacity="0"/>
            <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="6s" repeatCount="indefinite"/>
          </linearGradient>
        </defs>
        <text x="600" y="205" text-anchor="middle" fill="none" stroke="var(--line)" stroke-width="1.2">MAKHI</text>
        <text x="600" y="205" text-anchor="middle" fill="url(#ftrShimmer)" opacity=".55">MAKHI</text>
        <text x="600" y="205" text-anchor="middle" fill="none" stroke="url(#ftrShimmer)" stroke-width="1.6">MAKHI</text>
      </svg>
    </div>
    <div class="ftr__bottom">
      <span>© {2026} Makhi Luxury Taps. All rights reserved.</span>
      <div class="pay-badges" aria-label="Payment methods"><img src="{R}assets/img/brand/pay/payfast.svg" alt="Payfast" height="24"><img src="{R}assets/img/brand/pay/visa.svg" alt="Visa" height="24"><img src="{R}assets/img/brand/pay/mastercard.svg" alt="Mastercard" height="24"><img src="{R}assets/img/brand/pay/instant-eft.png" alt="Instant EFT by Payfast" height="24"></div>
      <nav aria-label="Legal"><a href="{R}refund-returns/">Refund &amp; Returns</a><a href="{R}terms/">Terms</a><a href="{R}privacy/">Privacy (POPIA)</a></nav>
    </div>
    <p class="made">Made with <span class="heart" role="img" aria-label="love"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.7 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.5 0 5.6 3.6 4.4 7.1-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg></span> by <a href="https://pixelcode.co.za" target="_blank" rel="noopener">Pixel Code</a></p>
  </div>
</footer>'''

def overlays(R):
    return f'''
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="cart" aria-label="Cart" role="dialog" aria-modal="true">
  <div class="drawer__head"><h3>Your cart</h3><button class="icon-btn" data-close aria-label="Close cart">{ICON["close"]}</button></div>
  <div class="drawer__body" id="cartBody"></div>
  <div class="drawer__foot" id="cartFoot" hidden>
    <div class="totals"><div><span>Subtotal</span><span id="cartSub">R0.00</span></div><div><span>Delivery</span><span class="muted">Calculated at checkout</span></div><div class="grand"><span>Total</span><span id="cartTotal">R0.00</span></div></div>
    <a class="btn btn--block" href="{R}checkout/" data-checkout>Secure checkout {ICON["arrow"]}</a>
    <div class="secure">{ICON["lock"]} Secure, encrypted payment</div><div class="pay-badges" aria-label="Payment methods"><img src="{R}assets/img/brand/pay/payfast.svg" alt="Payfast" height="24"><img src="{R}assets/img/brand/pay/visa.svg" alt="Visa" height="24"><img src="{R}assets/img/brand/pay/mastercard.svg" alt="Mastercard" height="24"><img src="{R}assets/img/brand/pay/instant-eft.png" alt="Instant EFT by Payfast" height="24"></div>
  </div>
</aside>
<div class="modal" id="qv" role="dialog" aria-modal="true" aria-labelledby="qvTitle"><div class="modal__box" id="qvBox"></div></div>
<div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search">
  <div class="wrap search__in">
    <div class="search__field">{ICON["search"]}<label class="sr-only" for="searchInput">Search products</label><input id="searchInput" type="search" placeholder="Search taps, baths, finishes…" autocomplete="off"><button class="icon-btn" data-close aria-label="Close search">{ICON["close"]}</button></div>
    <div class="search__sugg"><button class="chip" data-q="gold">Gold</button><button class="chip" data-q="black kitchen">Black kitchen</button><button class="chip" data-q="freestanding">Freestanding</button><button class="chip" data-q="swan">Swan</button><button class="chip" data-q="combo">Combo deals</button><button class="chip" data-chat="">Ask Makhi</button></div>
    <div class="search__res" id="searchRes"></div>
  </div>
</div>
<div class="cookie" id="cookie" role="dialog" aria-label="Cookie preferences">
  <h5>Your privacy, respected.</h5>
  <p>We use essential cookies to run this site, and — only with your consent — analytics to improve it. Read our <a href="{R}privacy/" style="text-decoration:underline">POPIA privacy policy</a>.</p>
  <div class="cookie__row"><button class="btn btn--ghost" data-consent="essential">Essential only</button><button class="btn" data-consent="all">Accept all</button></div>
</div>
<button class="fab fab--ai" data-chat aria-label="Open Ask Makhi">{ICON["spark"]}<span class="fab__tip">Ask Makhi</span></button>
<nav class="bnav" aria-label="Mobile">
  <a href="{R}index.html">{ICON["home"]}Home</a>
  <a href="{R}shop/">{ICON["grid"]}Shop</a>
  <button class="ai" data-chat><span class="dot"></span>{ICON["spark"]}Ask Makhi</button>
  <a href="{R}wishlist/">{ICON["heart"]}Wishlist</a>
  <a href="{R}checkout/" data-open-cart>{ICON["bag"]}<span class="cart-count">0</span>Cart</a>
</nav>'''

def preloader():
    return f'''
<div class="preloader" aria-hidden="true">
  <p class="preloader__tag">Makhi Luxury Taps · Water, made beautiful</p>
  <div class="preloader__mark">
    <svg viewBox="-30 -30 160 160">
      <defs>
        <clipPath id="plClip"><path transform="translate(9 0)" d="{DROP_D}"/></clipPath>
        <linearGradient id="plGold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#F3DFA6"/><stop offset=".5" stop-color="#C8A45D"/><stop offset="1" stop-color="#8E6C2E"/></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="74" fill="none" stroke="rgba(200,164,93,.35)" stroke-width=".6"/>
      <path transform="translate(9 0)" d="{DROP_D}" fill="none" stroke="rgba(244,241,234,.35)" stroke-width=".6"/>
      <g clip-path="url(#plClip)"><rect id="plFill" x="-20" y="100" width="140" height="120" fill="url(#plGold)"/></g>
      <circle id="plRipple" cx="50" cy="96" r="2" fill="none" stroke="#C8A45D" stroke-width=".6" opacity="0"/>
      <path id="plDrop" d="M50 -26c0 0-5 6.5-5 10a5 5 0 0 0 10 0c0-3.5-5-10-5-10z" fill="#C8A45D" opacity="0"/>
    </svg>
  </div>
  <div class="preloader__pct"><span>0</span><small>%</small></div>
  <div class="preloader__line"><i></i></div>
</div>'''

SVG_DEFS = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="goldFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3DFA6"/><stop offset=".5" stop-color="#C8A45D"/><stop offset="1" stop-color="#8E6C2E"/></linearGradient>
    <filter id="chatWater" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="11"/><feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="rippleText" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency="0.02 0.06" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="110" xChannelSelector="R" yChannelSelector="G"/></filter>
  </defs>
</svg>'''

def org_schema():
    return {
        "@context": "https://schema.org", "@type": "HomeAndConstructionBusiness", "name": "Makhi Luxury Taps",
        "description": "Proudly South African luxury taps, mixers, basins, baths, showers and toilets for kitchens and bathrooms.",
        "url": SITE_URL, "telephone": "+27681465775", "email": "info@makhiluxurytaps.co.za",
        "image": SITE_URL + "assets/icon-512.png", "priceRange": "R599 – R26,999",
        "address": {"@type": "PostalAddress", "streetAddress": "93 Van Riebeeck Avenue", "addressLocality": "Edenvale", "addressRegion": "Gauteng", "postalCode": "1645", "addressCountry": "ZA"},
        "areaServed": ["South Africa", "Johannesburg", "Edenvale", "Gauteng"],
        "sameAs": ["https://www.instagram.com/makhi_luxury_taps/", "https://makhiluxurytaps.co.za/"]
    }

def page(path, title, desc, body, products, *, page_id="", hero=False, three=False, water=False, scripts=(), modules=(), schema=None, crumbs=None, image=None, nav=""):
    depth = path.count("/")
    R = "../" * depth if path != "404.html" else BASE_PATH
    body = body.replace("{{R}}", R)
    canonical = SITE_URL + (path if path not in ("index.html",) else "")
    full_title = title if "Makhi" in title else f"{title} | Makhi Luxury Taps"
    og = image or "assets/img/ls/bath-black-tub.webp"
    schemas = [org_schema()] if page_id in ("home", "contact", "about") else []
    if schema:
        schemas += schema if isinstance(schema, list) else [schema]
    if crumbs:
        schemas.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": SITE_URL + u} for i, (n, u) in enumerate(crumbs)]})
    ld = "".join(f'<script type="application/ld+json">{json.dumps(s, ensure_ascii=False)}</script>' for s in schemas)
    tscripts = ""
    if three or modules:
        tscripts = f'<script type="importmap">{json.dumps(THREE_MAP)}</script>'
    extra = "".join(f'<script src="{R}assets/js/{s}?v={VERSION}" defer></script>' for s in scripts)
    mods = f'<script type="module" src="{R}assets/js/hero.js?v={VERSION}"></script>' if three else ""
    mods += "".join(f'<script type="module" src="{R}assets/js/{m}?v={VERSION}"></script>' for m in modules)
    water_s = f'<script src="{R}assets/js/water.js?v={VERSION}" defer></script>' if water else ""
    return f'''<!doctype html>
<html lang="en-ZA" class="no-js" data-theme="dark" data-root="{R}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(full_title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canonical}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0B0B0C">
<meta property="og:type" content="{"product" if page_id == "product" else "website"}">
<meta property="og:site_name" content="Makhi Luxury Taps">
<meta property="og:title" content="{e(full_title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE_URL}{og}">
<meta property="og:locale" content="en_ZA">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="ZA-GT"><meta name="geo.placename" content="Edenvale, Johannesburg">
<link rel="icon" type="image/png" href="{R}assets/favicon.png">
<link rel="apple-touch-icon" href="{R}assets/icon-512.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@400;500;600;700&family=Syne:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}assets/css/main.css?v={VERSION}">
<script>(function(){{try{{var t=localStorage.getItem("makhi:theme");t=t?JSON.parse(t):(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t;if(sessionStorage.getItem("makhi:pt")==="1")document.documentElement.classList.add("pt-in");}}catch(e){{}}}})();</script>
{tscripts}
{ld}
</head>
<body data-page="{page_id}" class="{"has-hero" if hero else ""}">
<a class="skip" href="#main">Skip to content</a>
{SVG_DEFS}
{preloader()}
{ann_bar()}
{header(R, products, nav)}
{fsm(R, products)}
<main id="main">
{body}
</main>
{footer(R)}
{overlays(R)}
<script src="{GSAP}" defer></script>
<script src="{ST}" defer></script>
<script src="{LENIS}" defer></script>
<script src="{R}assets/js/data.js?v={VERSION}" defer></script>
<script src="{R}assets/js/core.js?v={VERSION}" defer></script>
<script src="{R}assets/js/concierge.js?v={VERSION}" defer></script>
{water_s}
<script src="{R}assets/js/pages.js?v={VERSION}" defer></script>
{extra}
{mods}
</body>
</html>'''
