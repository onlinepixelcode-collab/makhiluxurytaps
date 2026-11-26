#!/usr/bin/env python3
"""Build the Makhi Luxury Taps demo site into ../site
Usage:  python3 build/build.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from layout import page, SITE_URL, BASE_PATH
from helpers import P, SITE
import pages_home, pages_shop, pages_misc

OUT = os.path.abspath(SITE)
written = []

def write(path, html):
    full = os.path.join(OUT, path if path.endswith(".html") else path + "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(html)
    written.append(path)

def W(path, title, desc, body, **kw):
    write(path, page(path, title, desc, body, P, **kw))

# Home
W("index.html", "Makhi Luxury Taps | Luxury Taps, Mixers & Bathrooms — South Africa",
  "Proudly South African luxury taps, basin mixers, kitchen faucets, freestanding baths, showers and toilets. Gold, black, silver and chrome finishes. Edenvale, Johannesburg.",
  pages_home.build(), page_id="home", hero=True, three=True)

# Shop & categories
W("shop/", "Shop All Luxury Taps & Bathroomware", "Shop every Makhi tap, mixer, bath, basin, shower and toilet. Filter by room, finish and price. Fast delivery across South Africa.",
  pages_shop.shop(), page_id="shop", water=True, crumbs=[("Home", ""), ("Shop", "shop/")], nav="shop/")
W("kitchen/", "Luxury Kitchen Taps & Pull-out Faucets", "Spring, pull-out and wall-mounted kitchen faucets in gold, black, silver and chrome — with a guide to choosing the right kitchen tap.",
  pages_shop.kitchen(), page_id="kitchen", crumbs=[("Home", ""), ("Kitchen", "kitchen/")], image="assets/img/ls/kitchen-marble.webp", nav="kitchen/")
W("bathroom/", "Luxury Bathroom Taps, Baths & Showers", "Basin mixers, freestanding baths and mixers, shower columns, walk-in showers, basins and toilet suites from Makhi Luxury Taps.",
  pages_shop.bathroom(), page_id="bathroom", crumbs=[("Home", ""), ("Bathroom", "bathroom/")], image="assets/img/ls/bath-mountain.webp", nav="bathroom/")
W("collections/", "Collections — Cobra Range & Combo Deals", "Explore the Makhi Cobra Range and complete bathroom combo deals.",
  pages_shop.collections_index(), page_id="collections", crumbs=[("Home", ""), ("Collections", "collections/")], nav="collections/")
W("cobra-range/", "The Cobra Range — Concealed Shower & Bath Mixers", "The Makhi Cobra Range: concealed diverter shower/bath mixers with architectural lines.",
  pages_shop.cobra_page(), page_id="cobra", crumbs=[("Home", ""), ("Collections", "collections/"), ("Cobra Range", "cobra-range/")], nav="collections/")
W("combo-deals/", "Bathroom Combo Deals — Complete Suites", "Complete bathroom suites at one bundle price: bath, freestanding mixer, vanity, toilet and shower.",
  pages_shop.combo_page(), page_id="combos", crumbs=[("Home", ""), ("Combo Deals", "combo-deals/")], nav="collections/")
W("finishes/", "Tap Finishes — Gold, Black, Silver, Chrome & Stainless", "Compare Makhi's five finishes: what each suits, how to care for it, and every product available in it.",
  pages_shop.finishes_page(), page_id="finishes", crumbs=[("Home", ""), ("Finishes", "finishes/")], image="assets/img/ls/gold-water.webp", nav="finishes/")

# Products
for p in P:
    body, schema, short = pages_shop.product_page(p)
    room = ("Kitchen", "kitchen/") if p["room"] == "kitchen" else ("Bathroom", "bathroom/")
    W(f"product/{p['slug']}/", f"{p.get('title') + ' — ' if p.get('title') else ''}{p['name']} — R{p['price']:,}", short[:155],
      body, page_id="product", water=True, schema=schema, crumbs=[("Home", ""), room, (p["name"], f"product/{p['slug']}/")], image=p["images"][0])

# Experiences & content
# Design Your Space hidden for now
if False: W("design-your-space/", "Design Your Space — Bathroom & Kitchen Visualiser", "Build your bathroom or kitchen with real Makhi products, match every finish at once and send the design to WhatsApp.",
  pages_misc.visualiser(), page_id="visualiser", crumbs=[("Home", ""), ("Design Your Space", "design-your-space/")])
W("inspiration/", "Inspiration & Lookbook", "Shoppable bathroom and kitchen inspiration, plus guides to choosing finishes and planning small bathrooms.",
  pages_misc.inspiration(), page_id="inspiration", crumbs=[("Home", ""), ("Inspiration", "inspiration/")], nav="inspiration/")
W("about/", "The Makhi Story — Proudly South African", "Makhi Luxury Taps is a proudly South African brand of luxury taps and bathroomware, based in Edenvale.",
  pages_misc.about(), page_id="about", crumbs=[("Home", ""), ("About", "about/")], nav="about/")
W("trade/", "Trade & Projects — Bulk Tapware Pricing", "Project and bulk pricing for developers, architects, interior designers, plumbers and contractors in South Africa.",
  pages_misc.trade(), page_id="trade", crumbs=[("Home", ""), ("Trade", "trade/")])
W("contact/", "Contact — Edenvale Showroom, Phone & WhatsApp", "Contact Makhi Luxury Taps: +27 68 146 5775, info@makhiluxurytaps.co.za, 93 Van Riebeeck Avenue, Edenvale.",
  pages_misc.contact(), page_id="contact", crumbs=[("Home", ""), ("Contact", "contact/")], nav="contact/")
faq_body, faq_schema = pages_misc.faqs()
W("faqs/", "FAQs — Delivery, Returns, Payments & Care", "Answers about delivery, returns, payments, installation, care and warranty at Makhi Luxury Taps.",
  faq_body, page_id="faqs", schema=faq_schema, crumbs=[("Home", ""), ("FAQs", "faqs/")])

W("catalogue/", "The Catalogue 2026 — Flip Through & Download", "Flip through the Makhi Collection 2026 as a 3D book, shop every spread, and download the catalogue as a PDF.",
  pages_misc.catalogue_page(), page_id="catalogue", modules=["catalogue3d.js"], crumbs=[("Home", ""), ("Catalogue", "catalogue/")], image="assets/catalogue/pages/p00.webp", nav="catalogue/")

# Commerce
W("checkout/", "Secure Checkout", "Secure checkout for Makhi Luxury Taps.", pages_misc.checkout(), page_id="checkout")
W("account/", "Your Account", "Orders, tracking, addresses, wishlist and saved designs.", pages_misc.account(), page_id="account")
W("wishlist/", "Your Wishlist", "Your saved Makhi pieces.", pages_misc.wishlist(), page_id="wishlist")
W("track-order/", "Track Your Order", "Track your Makhi order: placed, packed, dispatched, delivered.", pages_misc.track(), page_id="track")

# Policies
W("refund-returns/", "Refund & Returns Policy", "Makhi's 7-day change-of-mind returns, CPA defect returns, refunds and warranty.", pages_misc.policy("refund"), page_id="policy")
W("terms/", "Terms & Conditions", "Terms and conditions for shopping with Makhi Luxury Taps.", pages_misc.policy("terms"), page_id="policy")
W("privacy/", "Privacy Policy (POPIA)", "How Makhi Luxury Taps handles your personal information under POPIA.", pages_misc.policy("privacy"), page_id="policy")
W("404.html", "Page not found", "This tap has run dry.", pages_misc.notfound(), page_id="404")

# robots, sitemap, htaccess
noindex = {"checkout/", "account/", "wishlist/", "track-order/", "404.html"}
urls = [u for u in written if u not in noindex]
with open(os.path.join(OUT, "sitemap.xml"), "w") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for u in urls:
        loc = SITE_URL + ("" if u == "index.html" else u)
        pr = "1.0" if u == "index.html" else ("0.6" if u.startswith("product/") else "0.8")
        f.write(f"  <url><loc>{loc}</loc><lastmod>2026-11-26</lastmod><priority>{pr}</priority></url>\n")
    f.write("</urlset>\n")
with open(os.path.join(OUT, "robots.txt"), "w") as f:
    f.write(f"User-agent: *\nAllow: /\nDisallow: {BASE_PATH}checkout/\nDisallow: {BASE_PATH}account/\nSitemap: {SITE_URL}sitemap.xml\n")
with open(os.path.join(OUT, ".htaccess"), "w") as f:
    f.write(f"""# Makhi demo — Apache
ErrorDocument 404 {BASE_PATH}404.html
DirectoryIndex index.html
Options -Indexes
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/json
</IfModule>
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
""")
print(f"Built {len(written)} pages into {OUT}")
