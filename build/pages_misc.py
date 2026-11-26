"""Visualiser, inspiration, about, trade, contact, FAQs, commerce, policies, 404."""
from layout import e, ICON
from helpers import P, BY, by, card, tile, eyebrow, money, img, crumbs_html, sw
from pages_shop import phead, slider

A = ICON["arrow"]

def visualiser():
    fins = ["gold", "black", "silver", "chrome"]
    m = "".join(f'<button data-match="{f}" aria-label="Match every fitting to {f}"><i class="sw sw--{f}"></i></button>' for f in fins)
    return f'''
<section class="phead phead--plain" style="padding-bottom:40px"><div class="wrap">{crumbs_html([("Home", "index.html"), ("Design Your Space", None)])}
  <div class="phead__row"><div><span class="eyebrow">Room visualiser</span><h1 class="d-l mt-m" data-split="now">Design your <em>space</em></h1></div>
  <p class="lead">Click any fitting to swap it for a real Makhi piece. Match every finish at once, watch the total update, then add the whole room — or send it to our team.</p></div></div></section>
<section class="viz" id="viz" aria-label="Room visualiser">
  <div class="viz__stage">
    <div class="viz__tabs" role="group" aria-label="Room"><button data-scene="bathroom" aria-pressed="true">Bathroom</button><button data-scene="kitchen" aria-pressed="false">Kitchen</button></div>
    <svg class="room" id="vizSvg" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated room with selectable fittings"></svg>
    <div class="viz__match"><span class="label">Match my finish</span>{m}</div>
  </div>
  <aside class="viz__side">
    <div class="viz__head"><span class="eyebrow">Your room</span><h2 class="serif">Fittings</h2></div>
    <div class="viz__list" id="vizList"></div>
    <div class="viz__pick" id="vizPick"><h4>Choose</h4><div class="viz__opts"></div></div>
    <div class="viz__foot"><div class="viz__total"><span class="label">Room total</span><b id="vizTotal">R0.00</b></div>
      <div class="viz__btns"><button class="btn btn--gold" id="vizAdd">Add whole room to cart</button><button class="btn" id="vizSave">Save design</button><a class="btn btn--wa" id="vizWa" href="https://wa.me/27681465775" target="_blank" rel="noopener">{ICON["wa"]} Send to WhatsApp</a></div></div>
  </aside>
</section>
<p class="wrap muted" style="font-size:13px;padding-top:18px;padding-bottom:80px">Illustrated scene — fittings are drawn to represent each real Makhi product and finish. Photoreal room renders can replace the illustration in production.</p>'''

def inspiration():
    looks = [
        ("1 / span 7", "assets/img/ls/bath-black-tub.webp", "4/5", "Noir & stone", "Black quartz bath, matte black floor-standing mixer", [(59, 61, "muda-black-freestanding-bath-mixer"), (40, 84, "amor-freestanding-quartz-stone-bath-black")]),
        ("8 / span 5", "assets/img/ls/kitchen-marble.webp", "2/3", "The marble kitchen", "A slim black faucet over an undermount sink", [(86, 52, "andy-black-pullout-kitchen-faucet")]),
        ("1 / span 4", "assets/img/ls/bath-black-sink.webp", "4/5", "Marble & onyx", "Oval vessel basin and a walk-in screen", [(88, 64, "trevi-mood-basin"), (63, 42, "pandora-desire-walkin-shower-1200x2000")]),
        ("5 / span 4", "assets/img/ls/bath-minimal.webp", "4/5", "Soft minimal", "Wall-hung black pan and a white vanity", [(77, 78, "luxus-closed-coupled-suite-black"), (30, 64, "vanity-set-005-800mm-white")]),
        ("9 / span 4", "assets/img/ls/kitchen-black-3.webp", "4/5", "Kitchen after dark", "Matte black pull-out faucet", [(31, 55, "veja-black-pullout-kitchen-faucet")]),
    ]
    figs = ""
    for col, im, ar, title, cap, hs in looks:
        spots = ""
        for x, y, s in hs:
            p = BY.get(s)
            if not p: continue
            spots += f'''<div class="hotspot{" flip" if x > 55 else ""}" style="left:{x}%;top:{y}%"><button class="hotspot__dot" aria-label="Show {e(p["name"])}"></button><a class="hotspot__card" href="{{{{R}}}}product/{p["slug"]}/"><div class="tile"><img src="{{{{R}}}}{img(p)}" alt=""></div><div><small>Shop the look</small><b>{e(p["name"])}</b><span>{money(p["price"])}</span></div></a></div>'''
        figs += f'<figure style="grid-column:{col}"><div class="shot rv-water" style="aspect-ratio:{ar}"><img src="{{{{R}}}}{im}" alt="{e(cap)}" loading="lazy">{spots}</div><figcaption class="cap"><span class="serif d-xs">{e(title)}</span><span class="muted">{e(cap)}</span></figcaption></figure>'
    guides = [("assets/img/ls/gold-water.webp", "Guide · 4 min", "Choosing a finish", "Gold, black, silver, chrome or steel — how light, stone and timber change each one.", "finishes/"),
              ("assets/img/ls/bath-minimal.webp", "Guide · 3 min", "Small-bathroom ideas", "Wall-hung pans, walk-in screens and tall mixers that make compact rooms feel generous.", "bathroom/"),
              ("assets/img/ls/kitchen-black-2.webp", "Guide · 3 min", "Matching kitchen fittings", "Carry one finish from faucet to handles — and when to break the rule.", "kitchen/")]
    g = "".join(f'<a class="gcard" href="{{{{R}}}}{h}"><div class="shot"><img src="{{{{R}}}}{im}" alt="" loading="lazy"></div><span class="label" style="color:var(--gold-text)">{e(k)}</span><h3 class="serif">{e(t)}</h3><p>{e(d)}</p></a>' for im, k, t, d, h in guides)
    return phead("The <em>Lookbook</em>", "Styled spaces with shoppable fittings, plus short guides for choosing finishes and planning rooms.",
                 [("Home", "index.html"), ("Inspiration", None)], bg="assets/img/ls/bath-stone-sink.webp", eyebrow_txt="Inspiration") + f'''
<section class="section"><div class="wrap"><div class="mag">{figs}</div>
<p class="muted mt-m" style="font-size:13px">Styled imagery shown for inspiration · in production, these become real Makhi installations from @makhi_luxury_taps.</p></div></section>
<section class="section--tight" id="guides"><div class="wrap"><div class="sec-head"><div>{eyebrow(2, "Guides")}<h2 class="d-m mt-m">Plan it <em>well.</em></h2></div></div><div class="guides" data-stagger>{g}</div></div></section>'''

def about():
    R = "{{R}}"
    chapters = [("01", "Proudly <em>South African.</em>", "Makhi Luxury Taps is a proudly South African brand, built in Edenvale for homes across the country. We believe the details you touch every day should feel extraordinary."),
                ("02", "A true <em>craftsmanship.</em>", "Our taps are designed to provide an elegant feel — the last exquisite touch that completes a kitchen or bathroom. Brass bodies, ceramic valves and multi-layer finishes, chosen to last."),
                ("03", "Water, made <em>beautiful.</em>", "From the teardrop spout of the Swan to the sculpted Muda bath filler, every piece is drawn around water — how it falls, how it moves, how it catches the light."),
                ("04", "Here to <em>help.</em>", "Real people on WhatsApp, phone and email, a store in Edenvale, and Ask Makhi, an AI assistant that never sleeps. Choosing beautifully should feel easy.")]
    ims = ["assets/img/ls/brass-flow.webp", "swan-tall-gold-basin-mixer", "muda-gold-freestanding-bath-mixer", "assets/img/ls/bath-stone-vanity.webp"]
    imh = ""
    for i, x in enumerate(ims):
        on = " is-on" if i == 0 else ""
        imh += (f'<img class="{on.strip()}" src="{R}{x}" alt="" loading="lazy">' if x.startswith("assets") else f'<div class="tile{on}"><img src="{R}{img(BY[x])}" alt="" loading="lazy"></div>')
    ch = "".join(f'<div><span class="ab-n">{n}</span><h2 class="serif">{h}</h2><p class="lead">{p}</p></div>' for n, h, p in chapters)
    n_pieces = len([p for p in P if p["type"] != "combo"])
    stats = [("5", "Signature finishes"), (f"{n_pieces}+", "Pieces for kitchen &amp; bath"), ("2 yr", "Warranty on taps &amp; mixers"), ("ZA", "Proudly South African")]
    st = "".join(f'<div><span class="ab-stat__v serif">{v}</span><span class="label">{l}</span></div>' for v, l in stats)
    vals = [("Craftsmanship", "Made to be touched every day and admired for years.", "assets/img/ls/brass-flow.webp"),
            ("Elegance", "Restraint, proportion and light — never decoration for its own sake.", "assets/img/ls/bath-marble-vanity.webp"),
            ("Quality", "Brass, ceramic cartridges and finishes backed by our warranty.", "assets/img/ls/kitchen-black-3.webp"),
            ("Proudly South African", "Designed for South African homes, water and the way we live.", "assets/img/ls/bath-mountain.webp")]
    v = "".join(f'<article class="ab-val"><img src="{R}{im}" alt="" loading="lazy"><div class="ab-val__in"><span class="ab-n">0{i + 1}</span><h3 class="serif">{e(a)}</h3><p>{e(b)}</p></div></article>' for i, (a, b, im) in enumerate(vals))
    return f'''
<section class="ab-hero on-dark" data-ripple>
  <div class="ab-hero__bg" data-zoom><img src="{R}assets/img/ls/gold-water.webp" alt="" fetchpriority="high"></div>
  <div class="wrap ab-hero__in">{crumbs_html([("Home", "index.html"), ("About", None)])}
    <span class="eyebrow mt-l">The Makhi Story</span>
    <h1 class="ab-hero__t" data-split="now">Water, made <em>beautiful.</em></h1>
    <div class="ab-hero__foot"><p class="lead">A true craftsmanship exhibited by creating a masterpiece — from Edenvale to homes across South Africa.</p><span class="ab-scroll" aria-hidden="true"><i></i>Scroll</span></div>
  </div>
</section>
<section class="section ab-mani"><div class="wrap">
  <p class="ab-mani__t serif" data-split>We make the <em>last exquisite touch</em> — the tap you reach for every morning, the mixer that catches the evening light, the bath you sink into at the end of the day.</p>
  <div class="ab-stats" data-stagger>{st}</div>
</div></section>
<section class="section ab-story-sec"><div class="wrap story"><div class="story__sticky"><div class="story__img">{imh}</div></div><div class="story__chapters">{ch}</div></div></section>
<section class="section--tight"><div class="wrap">
  <div class="sec-head"><div>{eyebrow(5, "Our values")}<h2 class="d-m mt-m">What we <em>stand</em> for.</h2></div></div>
  <div class="ab-vals" data-stagger>{v}</div>
</div></section>
<section class="ab-visit on-dark"><div class="ab-visit__img" data-zoom><img src="{R}assets/img/ls/bath-stone-vanity.webp" alt="" loading="lazy"></div>
  <div class="ab-visit__copy"><span class="eyebrow">The Edenvale store</span><h2 class="d-m mt-m">See every finish <em>in person.</em></h2>
    <p class="lead">Touch the brass, compare gold against black, and leave with a plan. Our team will help you match every piece in the room.</p>
    <dl class="ab-visit__dl"><div><dt class="label">Address</dt><dd>93 Van Riebeeck Avenue, Edenvale Ext 1, Edenvale, 1645</dd></div><div><dt class="label">Call or WhatsApp</dt><dd><a href="tel:+27681465775">+27 68 146 5775</a></dd></div></dl>
    <div class="flex gap-s wrap-f mt-m"><a class="btn btn--gold" href="{R}contact/">Plan your visit {A}</a><a class="btn" href="{R}shop/">Shop the collection</a></div></div>
</section>'''

def trade():
    who = [("Developers", "Volume pricing"), ("Architects", "Specification support"), ("Interior designers", "Curated finishes"), ("Plumbers", "Trade accounts"), ("Contractors", "Project scheduling")]
    w = "".join(f'<div><small>0{i+1}</small>{e(a)}<p class="muted" style="font:400 14px var(--f-body);margin-top:10px">{e(b)}</p></div>' for i, (a, b) in enumerate(who))
    sheets = [("Swan basin mixers", "swan-short-basin-mixer-gold"), ("Naledi kitchen faucets", "naledi-black-kitchen-faucet"), ("Muda freestanding mixers", "muda-gold-freestanding-bath-mixer"), ("Freestanding baths", "ovale-freestanding-quartz-stone-bath-white"), ("Showers & enclosures", "kiri-pivot-door-and-panels-shower-900x900x1850-silver"), ("Toilet suites", "livorno-ts040-closed-coupled-suite")]
    dl = "".join(f'<a href="https://wa.me/27681465775?text={e("Hi Makhi, please send the spec sheet for " + n)}" target="_blank" rel="noopener"><b>{e(n)}</b><span class="flex ai-c gap-s"><span class="label" style="color:var(--muted)">Request PDF</span>{ICON["dl"]}</span></a>' for n, s in sheets)
    gal = "".join(f'<figure class="shot shot--{c} rv-water"><img src="{{{{R}}}}{im}" alt="" loading="lazy"><figcaption>{cap}</figcaption></figure>' for c, im, cap in [("a", "assets/img/ls/bath-marble-vanity.webp", "Project placeholder · Residential"), ("b", "assets/img/ls/kitchen-black.webp", "Project placeholder · Kitchen"), ("c", "assets/img/ls/bath-stone-sink.webp", "Project placeholder"), ("d", "assets/img/ls/bath-mountain.webp", "Project placeholder"), ("e", "assets/img/ls/kitchen-dark.webp", "Project placeholder")])
    return phead("Trade &amp; <em>Projects</em>", "Bulk and project pricing for developers, architects, interior designers, plumbers and contractors.", [("Home", "index.html"), ("Trade & Projects", None)], bg="assets/img/ls/kitchen-black-2.webp", eyebrow_txt="For professionals") + f'''
<section class="section--tight"><div class="wrap"><div class="trade-who">{w}</div></div></section>
<section class="section--tight"><div class="wrap two-col" style="align-items:start">
  <div>{eyebrow(1, "Project enquiry")}<h2 class="d-m mt-m">Tell us about your <em>project.</em></h2><p class="lead mt-m">Share the scope and quantities — our trade desk replies with project pricing and lead times.</p>
    <h3 class="serif d-xs mt-l" style="margin-bottom:18px">Spec sheets</h3><div class="dl-list">{dl}</div><p class="muted" style="font-size:13px;margin-top:12px">PDF spec sheets to be supplied by Makhi — requests go straight to the trade desk.</p></div>
  <div><form class="form" id="tradeForm" data-form="tradeOk" data-wa="Trade / project enquiry from the website" novalidate>
    <div class="row"><div class="field"><input id="t1" name="Name" placeholder=" " required autocomplete="name"><label for="t1">Full name</label></div><div class="field"><input id="t2" name="Company" placeholder=" " required autocomplete="organization"><label for="t2">Company</label></div></div>
    <div class="row"><div class="field"><input id="t3" name="Email" type="email" placeholder=" " required autocomplete="email"><label for="t3">Email</label></div><div class="field"><input id="t4" name="Phone" type="tel" placeholder=" " required autocomplete="tel"><label for="t4">Phone / WhatsApp</label></div></div>
    <div class="row"><div class="field sel"><select id="t5" name="Role" required><option value="" disabled selected></option><option>Developer</option><option>Architect</option><option>Interior designer</option><option>Plumber</option><option>Contractor</option><option>Other</option></select><label for="t5">I am a</label></div>
      <div class="field sel"><select id="t6" name="Units"><option value="" disabled selected></option><option>1–5 bathrooms</option><option>6–20 bathrooms</option><option>21–100 units</option><option>100+ units</option></select><label for="t6">Project size</label></div></div>
    <div class="field"><input id="t7" name="Project" placeholder=" " autocomplete="off"><label for="t7">Project name &amp; location</label></div>
    <div class="field"><textarea id="t8" name="Details" placeholder=" " required></textarea><label for="t8">Products, finishes, quantities, timeline</label></div>
    <label class="check"><input type="checkbox" required> I agree that Makhi may contact me about this enquiry (POPIA).</label>
    <button class="btn btn--gold" type="submit">Send enquiry {A}</button>
  </form><div class="form-ok" id="tradeOk"><h4>Thank you — enquiry received.</h4><p>We've opened WhatsApp with your brief so our trade desk can respond quickly.</p></div></div>
</div></section>
<section class="section--tight"><div class="wrap"><div class="sec-head"><div>{eyebrow(3, "Project gallery")}<h2 class="d-s mt-m">Recent <em>projects</em></h2></div><p class="lead">Placeholder imagery — replace with Makhi project photography.</p></div><div class="mosaic">{gal}</div></div></section>'''

def contact():
    R = "{{R}}"
    I = {
        "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 3.5h2.6l1.4 4-2 1.4a12 12 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/></svg>',
        "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
        "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    }
    ways = [("tel:+27681465775", I["phone"], "Call", "+27 68 146 5775", ""),
            ("https://wa.me/27681465775", ICON["wa"], "WhatsApp", "Chat with the team", ' target="_blank" rel="noopener"'),
            ("mailto:info@makhiluxurytaps.co.za", I["mail"], "Email", "info@makhiluxurytaps.co.za", ""),
            ("#visit", I["pin"], "Visit", "Edenvale store", "")]
    wh = "".join(f'<a class="ct-way" href="{h}"{x}><span class="ct-way__ic">{ic}</span><span class="label">{e(l)}</span><span class="ct-way__v">{e(v)}</span><span class="ct-way__go" aria-hidden="true">{A}</span></a>' for h, ic, l, v, x in ways)
    help_ = [("Delivery &amp; collection", "faqs/#delivery"), ("Returns &amp; refunds", "refund-returns/"), ("Track an order", "track-order/"), ("Trade &amp; projects", "trade/")]
    hl = "".join(f'<a href="{R}{h}"><span>{t}</span>{A}</a>' for t, h in help_)
    return f'''
<section class="ct-hero on-dark" data-ripple>
  <div class="ct-hero__bg" data-zoom><img src="{R}assets/img/ls/bath-black-sink.webp" alt="" fetchpriority="high"></div>
  <div class="wrap ct-hero__in">{crumbs_html([("Home", "index.html"), ("Contact", None)])}
    <div class="ct-hero__row"><div><span class="eyebrow">Contact</span><h1 class="d-xl mt-m" data-split="now">Let's <em>talk.</em></h1></div>
      <p class="lead">Product advice, orders, returns or trade — we'd love to hear from you.</p></div>
    <div class="ct-ways" data-stagger>{wh}</div>
  </div>
</section>
<section class="section"><div class="wrap ct-main">
  <div class="ct-form">
    <span class="eyebrow">Send an enquiry</span><h2 class="d-m mt-m">How can we <em>help?</em></h2>
    <form class="form mt-l" id="contactForm" data-form="contactOk" novalidate>
      <div class="ct-topics" role="radiogroup" aria-label="Topic">{"".join(f'<label class="chip-r"><input type="radio" name="topic" value="{t}"{" checked" if i == 0 else ""}><span>{t}</span></label>' for i, t in enumerate(["Product advice", "Order", "Returns", "Trade", "Other"]))}</div>
      <div class="row"><div class="field"><input id="c1" name="name" placeholder=" " required autocomplete="name"><label for="c1">Full name</label></div><div class="field"><input id="c2" name="phone" type="tel" placeholder=" " autocomplete="tel"><label for="c2">Phone</label></div></div>
      <div class="row"><div class="field"><input id="c3" name="email" type="email" placeholder=" " required autocomplete="email"><label for="c3">Email</label></div><div class="field"><input id="c5" name="order" placeholder=" "><label for="c5">Order number (optional)</label></div></div>
      <div class="field"><textarea id="c6" name="message" placeholder=" " required></textarea><label for="c6">Message</label></div>
      <label class="check"><input type="checkbox" required> I agree to Makhi processing my details to respond (see our <a href="{R}privacy/" style="text-decoration:underline">privacy policy</a>).</label>
      <button class="btn btn--gold" type="submit">Send message {A}</button>
    </form>
    <div class="form-ok" id="contactOk"><h4>Thank you — message received.</h4><p>Our team will be in touch shortly. For anything urgent, WhatsApp us on +27 68 146 5775.</p></div>
  </div>
  <aside class="ct-side">
    <div class="ct-card" id="visit"><span class="label">The store</span><p class="serif ct-card__t">93 Van Riebeeck Avenue</p><p>Edenvale Ext 1, Edenvale, 1645</p>
      <div class="ct-card__row"><span class="label">Hours</span><span class="placeholder">Store hours — client to confirm</span></div>
      <a class="btn btn--sm mt-m" href="https://www.google.com/maps/dir/?api=1&destination=93+Van+Riebeeck+Avenue,+Edenvale,+1645" target="_blank" rel="noopener">Get directions {A}</a></div>
    <div class="ct-help"><span class="label">Quick help</span>{hl}</div>
    <button class="ct-ask" type="button" data-chat="Hi Makhi, I have a question">{ICON["spark"]}<span><b>Ask Makhi</b>Instant answers, any time</span></button>
  </aside>
</div></section>
<section class="ct-map"><iframe title="Map of Makhi Luxury Taps, Edenvale" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=93+Van+Riebeeck+Avenue,+Edenvale,+1645&output=embed"></iframe>
  <div class="ct-map__pin"><span class="label">Makhi Luxury Taps</span><b class="serif">Edenvale, Johannesburg</b></div></section>'''

FAQ = [
    ("delivery", "Delivery & collection", [
        ("Do you deliver across South Africa?", "Yes — we deliver nationwide, and you're welcome to collect from our Edenvale store."),
        ("How much is delivery and how long does it take?", '<span class="placeholder">Delivery fees and times — client to confirm</span> Our team confirms the fee and timing for your area when you order.'),
        ("What should I check when my order arrives?", "Please inspect your goods with the driver. Note any damage on the delivery note and take photos — we can't accept damage reported after 48 hours. For combo deals, check every item before your installer leaves."),
    ]),
    ("returns", "Returns & refunds", [
        ("Can I return something if I change my mind?", "Yes, within 7 days of delivery or collection, if the item is unused, uninstalled and in its original packaging. A 15% handling/restocking fee applies and the delivery fee is non-refundable."),
        ("What if my item is defective, damaged or wrong?", "Under the Consumer Protection Act you have 6 months for defective goods. Report it within 48 hours with photos to sales@makhiluxurytaps.co.za and we'll repair, replace or refund — your choice. We cover return collection for defects in Gauteng."),
        ("What can't be returned?", "Installed or used items, opened sealed goods (silicone, waste fittings), custom orders and special colours, baths and shower doors without their original pallet/packaging, and items damaged by incorrect installation or harsh cleaners."),
        ("How long do refunds take?", "Approved refunds are paid within 7–10 working days to your original payment method. PayJustNow refunds return to PayJustNow; Cash on Delivery, EFT and in-store purchases are refunded by EFT."),
    ]),
    ("payments", "Payments", [
        ("How can I pay?", "Card, EFT, PayJustNow, Laybuy, cash on delivery and in-store payment."),
        ("How does Laybuy cancellation work?", "If you cancel before your final payment, your deposit is refundable less a R400 admin fee if items haven't been ordered from the supplier. If they have, a 15% fee applies."),
        ("Is checkout secure?", "Yes — payments are processed over an encrypted connection by our payment partners. We never store your card details."),
    ]),
    ("installation", "Installation", [
        ("Do you install?", '<span class="placeholder">Installation service — client to confirm</span> All fittings must be installed by a qualified plumber; proof is required for warranty claims. Our team can recommend plumbers.'),
        ("Which mixer suits my basin?", "Vessel or countertop basins need a tall mixer (like the Swan Tall); inset and undermount basins suit a standard-height mixer. Ask Makhi for a quick compatibility check."),
    ]),
    ("care", "Care & warranty", [
        ("How do I clean my taps?", "Use a mix of half dish-washing liquid and half water, rinse, and wipe with a soft cloth. No polishing needed — never use aggressive cleaners or bleach."),
        ("What warranty do I get?", "Taps, mixers and shower columns: 2 years against manufacturing defects. Freestanding baths and basins: 2 years. Toilets: 1 year on mechanisms. Excludes wear & tear, limescale and incorrect installation."),
    ]),
]
def faqs():
    nav = "".join(f'<a href="#{k}">{e(t)}</a>' for k, t, _ in FAQ)
    cats = ""
    for k, t, qs in FAQ:
        items = "".join(f'<div class="acc__item"><button class="acc__q" aria-expanded="false">{e(q)}<i></i></button><div class="acc__a"><div>{a}</div></div></div>' for q, a in qs)
        cats += f'<div class="faq-cat" id="{k}"><h2 class="serif">{e(t)}</h2><div class="acc">{items}</div></div>'
    schema = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a.split("</span>")[-1].strip()}} for _, _, qs in FAQ for q, a in qs]}
    return phead("Questions, <em>answered.</em>", "Delivery, returns, payments, installation and care.", [("Home", "index.html"), ("FAQs", None)], bg="assets/img/ls/bath-minimal.webp", short=True, eyebrow_txt="Help") + f'''
<section class="section"><div class="wrap faq-layout"><nav class="faq-nav" aria-label="FAQ categories">{nav}<button class="btn btn--sm mt-m" data-chat="">Ask Makhi</button></nav>
<div><div class="faq-search">{ICON["search"]}<label class="sr-only" for="faqQ">Search FAQs</label><input id="faqQ" placeholder="Search questions…" autocomplete="off"></div>{cats}
<div id="faqNone" hidden class="empty-state"><h4>No matching questions.</h4><p>Ask Makhi or WhatsApp our team.</p><button class="btn mt-s" data-chat="">Ask Makhi</button></div></div></div></section>''', schema

def checkout():
    return f'''
<section class="phead phead--plain" style="padding-bottom:40px"><div class="wrap">{crumbs_html([("Home", "index.html"), ("Checkout", None)])}<h1 class="d-l mt-m">Secure <em>checkout</em></h1></div></section>
<section class="section--tight" style="padding-top:0"><div class="wrap">
 <div id="coEmpty" hidden class="empty-state"><div class="drop-ico">{ICON["drop"]}</div><h4>Your cart is dry.</h4><p>Let's change that.</p><a class="btn mt-m" href="{{{{R}}}}shop/">Shop the collection {A}</a></div>
 <div id="coDone" hidden class="order-card" style="max-width:820px;margin:0 auto;padding:clamp(28px,5vw,64px)"><span class="eyebrow">Order placed</span><h2 class="d-m mt-m">Thank you. <em>It's on its way.</em></h2><p class="lead mt-m">Your order number is <strong id="coNo" style="color:var(--gold-text)"></strong>. A confirmation will follow by email.</p><div class="flex gap-s wrap-f mt-m"><a class="btn btn--gold" id="coTrack" href="{{{{R}}}}track-order/">Track your order {A}</a><a class="btn btn--ghost" href="{{{{R}}}}shop/">Continue shopping</a></div><p class="muted mt-m" style="font-size:13px">Demo checkout — no payment was taken.</p></div>
 <div class="co" id="coWrap">
  <form class="form" id="coForm" novalidate>
    <h2 class="serif"><span class="num">01</span> Contact</h2>
    <div class="row"><div class="field"><input id="k1" name="fname" placeholder=" " required autocomplete="given-name"><label for="k1">First name</label></div><div class="field"><input id="k2" name="lname" placeholder=" " required autocomplete="family-name"><label for="k2">Surname</label></div></div>
    <div class="row"><div class="field"><input id="k3" type="email" name="email" placeholder=" " required autocomplete="email"><label for="k3">Email</label></div><div class="field"><input id="k4" type="tel" name="phone" placeholder=" " required autocomplete="tel"><label for="k4">Mobile</label></div></div>
    <h2 class="serif"><span class="num">02</span> Delivery</h2>
    <div class="pay-opts"><label class="pay-opt"><input type="radio" name="method" value="deliver" checked><div><b>Deliver to me</b><small>Nationwide — fee confirmed by our team</small></div></label><label class="pay-opt"><input type="radio" name="method" value="collect"><div><b>Collect in Edenvale</b><small>93 Van Riebeeck Avenue, Edenvale</small></div></label></div>
    <div id="coAddress" class="form" style="margin-top:6px">
      <div class="field"><input id="k5" name="street" placeholder=" " required autocomplete="street-address"><label for="k5">Street address</label></div>
      <div class="row"><div class="field"><input id="k6" name="suburb" placeholder=" " required autocomplete="address-level3"><label for="k6">Suburb</label></div><div class="field"><input id="k7" name="city" placeholder=" " required autocomplete="address-level2"><label for="k7">City</label></div></div>
      <div class="row"><div class="field sel"><select id="k8" name="province" required><option value="" disabled selected></option><option>Gauteng</option><option>Western Cape</option><option>KwaZulu-Natal</option><option>Eastern Cape</option><option>Free State</option><option>Limpopo</option><option>Mpumalanga</option><option>North West</option><option>Northern Cape</option></select><label for="k8">Province</label></div><div class="field"><input id="k9" name="postal" inputmode="numeric" maxlength="4" placeholder=" " required autocomplete="postal-code"><label for="k9">Postal code</label></div></div>
    </div>
    <h2 class="serif"><span class="num">03</span> Payment</h2>
    <div class="pay-opts">
      <label class="pay-opt"><input type="radio" name="pay" value="card" checked><div><b>Card</b><small>Visa · Mastercard — secure payment gateway</small></div></label>
      <label class="pay-opt"><input type="radio" name="pay" value="eft"><div><b>Instant EFT</b><small>Pay directly from your bank</small></div></label>
      <label class="pay-opt"><input type="radio" name="pay" value="payjustnow"><div><b>PayJustNow</b><small>Spread the cost over instalments</small></div></label>
      <label class="pay-opt"><input type="radio" name="pay" value="laybuy"><div><b>Laybuy</b><small>Reserve now, pay over time</small></div></label>
    </div>
    <label class="check mt-s"><input type="checkbox" required> I accept the <a href="{{{{R}}}}terms/" style="text-decoration:underline">terms</a> and <a href="{{{{R}}}}refund-returns/" style="text-decoration:underline">returns policy</a>.</label>
    <button class="btn btn--gold btn--block" type="submit" style="--bh:60px">Place order {ICON["lock"]}</button>
    <div class="secure">{ICON["lock"]} 256-bit encrypted · We never store card details</div>
  </form>
  <aside class="co__sum"><h3 class="serif">Order summary</h3><div id="coItems"></div>
    <div class="totals mt-m"><div><span>Subtotal</span><span id="coSub">R0.00</span></div><div><span>Delivery</span><span id="coShip" class="muted">Confirmed by our team</span></div><div class="grand"><span>Total</span><span id="coTotal">R0.00</span></div></div>
    <div class="pay-badges"><span>VISA</span><span>Mastercard</span><span>EFT</span><span>PayJustNow</span><span>Laybuy</span></div></aside>
 </div>
</div></section>'''

def account():
    return f'''
<section class="phead phead--plain" style="padding-bottom:48px"><div class="wrap">{crumbs_html([("Home", "index.html"), ("Account", None)])}<div class="phead__row"><h1 class="d-l mt-m">Your <em>account</em></h1><p class="lead">Orders, tracking, addresses, wishlist and saved room designs.</p></div></div></section>
<section class="section--tight" style="padding-top:0"><div class="wrap acct">
  <nav class="acct__nav" role="tablist" aria-label="Account sections"><button data-t="orders" aria-selected="true" role="tab">Orders &amp; tracking</button><button data-t="addresses" aria-selected="false" role="tab">Addresses</button><button data-t="wishlist" aria-selected="false" role="tab">Wishlist</button><button data-t="details" aria-selected="false" role="tab">Sign in</button></nav>
  <div>
    <div class="acct__panel is-on" id="p-orders"><h2 class="d-s" style="margin-bottom:28px">Orders</h2><div id="accOrders"></div></div>
    <div class="acct__panel" id="p-addresses"><h2 class="d-s" style="margin-bottom:28px">Delivery address</h2><form class="form" id="addrForm" style="max-width:640px">
      <div class="field"><input id="a1" name="street" placeholder=" " autocomplete="street-address"><label for="a1">Street address</label></div>
      <div class="row"><div class="field"><input id="a2" name="suburb" placeholder=" "><label for="a2">Suburb</label></div><div class="field"><input id="a3" name="city" placeholder=" "><label for="a3">City</label></div></div>
      <div class="field"><input id="a4" name="postal" placeholder=" " inputmode="numeric" maxlength="4"><label for="a4">Postal code</label></div><button class="btn" type="submit">Save address</button></form></div>
    <div class="acct__panel" id="p-wishlist"><h2 class="d-s" style="margin-bottom:28px">Wishlist</h2><div class="pgrid" id="accWish" style="padding-top:0"></div></div>
    
    <div class="acct__panel" id="p-details"><h2 class="d-s" style="margin-bottom:12px">Sign in</h2><p class="muted" style="margin-bottom:28px">Demo — accounts connect to the store's customer system in production.</p>
      <form class="form" data-form="loginOk" style="max-width:520px" novalidate><div class="field"><input id="l1" type="email" placeholder=" " required autocomplete="email"><label for="l1">Email</label></div><div class="field"><input id="l2" type="password" placeholder=" " required autocomplete="current-password"><label for="l2">Password</label></div><button class="btn btn--gold">Sign in {A}</button></form>
      <div class="form-ok" id="loginOk"><h4>Welcome back.</h4><p>(Demo) You're signed in on this device.</p></div></div>
  </div>
</div></section>'''

def wishlist():
    return f'''
<section class="phead phead--plain" style="padding-bottom:40px"><div class="wrap">{crumbs_html([("Home", "index.html"), ("Wishlist", None)])}<div class="phead__row"><h1 class="d-l mt-m">Your <em>wishlist</em> <sup class="num" id="wishCount" style="font-size:.3em">0</sup></h1><button class="btn btn--gold" id="wishAll" data-add-many="" hidden>Add all to cart {A}</button></div></div></section>
<section class="section--tight" style="padding-top:0"><div class="wrap"><div class="pgrid" id="wishGrid" style="padding-top:0"></div><p class="muted mt-l" style="font-size:14px">Want an alert when a saved piece drops in price or comes back in stock? <button data-chat="Set up a price-drop or back-in-stock alert" style="text-decoration:underline;color:var(--gold-text)">Ask Makhi</button>.</p></div></section>'''

def track():
    return phead("Track your <em>order</em>", "Placed → Packed → Dispatched → Delivered.", [("Home", "index.html"), ("Track order", None)], bg="assets/img/ls/kitchen-dark.webp", short=True, eyebrow_txt="Order tracking") + f'''
<section class="section"><div class="wrap" style="max-width:980px">
  <form class="track-form" id="trackForm"><div class="field"><input id="tn" name="no" placeholder=" " required><label for="tn">Order number (e.g. MK-123456)</label></div><button class="btn btn--gold" style="--bh:60px">Track {A}</button></form>
  <div id="trackOut" class="mt-l"></div>
  <p class="muted mt-m" style="font-size:14px">Can't find your number? <a href="https://wa.me/27681465775" target="_blank" rel="noopener" style="text-decoration:underline">WhatsApp us</a> with your name and we'll look it up.</p>
</div></section>'''

def policy(kind):
    if kind == "refund":
        title, h = "Refund &amp; <em>Returns</em>", "At Makhi Luxury Taps we stand by our quality. If you're not happy, we will make it right."
        body = '''<h2>1. 7-day change of mind (cooling-off)</h2><p>You may return unused, uninstalled items in original packaging within 7 days of delivery or collection. Items must not be used, scratched or installed. Refund less 15% handling/restocking fee. Delivery fee non-refundable.</p>
<h2>2. Defective, damaged or wrong item</h2><p>As per the Consumer Protection Act, you have 6 months for defective goods. Report within 48 hours with photos to <a href="mailto:sales@makhiluxurytaps.co.za">sales@makhiluxurytaps.co.za</a>. We will repair, replace or refund — your choice. We cover return collection for defects in Gauteng; outside Gauteng, courier costs to be arranged.</p><p>For Combo Deals, please check all items on delivery before your installer leaves and report shortages immediately.</p>
<h2>3. What we cannot accept</h2><ul><li>Items that have been installed, used, or sealed goods opened (silicone, waste fittings)</li><li>Custom orders and special colours (e.g. matte black specials ordered on request)</li><li>Baths and shower doors without original pallet/packaging</li><li>Items damaged by incorrect installation or harsh cleaners</li></ul>
<h2>4. How to return</h2><ol><li>WhatsApp or call <a href="tel:+27681465775">068 146 5775</a> with your order number, reason and photos.</li><li>We issue a Return Authorisation Number (RAN).</li><li>Bring the item to our Pretoria North or Edenvale store, or we arrange collection.</li><li>Inspection within 2 working days.</li></ol>
<h2>5. Refunds</h2><p>Approved refunds are paid within 7–10 working days to the original payment method. PayJustNow: refund goes back to PayJustNow, not cash. Laybuy: refund less payments made, rest cancelled. Cash on delivery, EFT and in-store: EFT refund.</p>
<h2>6. Cancellations — Laybuy</h2><p>If you cancel a laybuy before final payment, your deposit is refundable less a R400 admin fee if items have not been ordered from the supplier. If items have already been ordered, a 15% fee applies.</p>
<h2>7. Warranty</h2><ul><li>Taps, mixers, shower columns: 2-year warranty against manufacturing defects</li><li>Freestanding baths, basins: 2-year warranty</li><li>Toilets: 1 year on mechanisms</li></ul><p>Warranty does not cover wear and tear, limescale or incorrect installation. Must be installed by a qualified plumber — proof required.</p>
<h2>8. Deliveries</h2><p>Please inspect goods with the driver. Note any damage on the delivery note and take photos. We are not liable for damage reported after 48 hours.</p>'''
    elif kind == "terms":
        title, h = "Terms &amp; <em>Conditions</em>", "The terms that apply when you browse and buy from Makhi Luxury Taps."
        body = '''<p class="placeholder">Draft for client review — to be confirmed by Makhi's legal adviser before launch.</p>
<h2>1. About us</h2><p>This website is operated by Makhi Luxury Taps, 93 Van Riebeeck Avenue, Edenvale, 1645, South Africa. Contact: info@makhiluxurytaps.co.za · +27 68 146 5775.</p>
<h2>2. Prices &amp; availability</h2><p>All prices are in South African Rand and include VAT where applicable. Prices and stock may change without notice. If an item is unavailable after you order, we'll contact you to offer an alternative or a full refund.</p>
<h2>3. Orders</h2><p>Your order is an offer to buy. A contract is formed when we confirm your order and receive payment.</p>
<h2>4. Delivery</h2><p>Delivery fees and estimated times are confirmed for your area before dispatch. Risk passes to you on delivery.</p>
<h2>5. Returns &amp; warranty</h2><p>See our <a href="../refund-returns/">Refund &amp; Returns policy</a>, which forms part of these terms and complies with the Consumer Protection Act.</p>
<h2>6. Installation</h2><p>Products must be installed by a qualified plumber. Damage from incorrect installation is not covered.</p>
<h2>7. Privacy</h2><p>We handle your personal information according to our <a href="../privacy/">privacy policy</a> and POPIA.</p>
<h2>8. Governing law</h2><p>These terms are governed by the laws of the Republic of South Africa.</p>'''
    else:
        title, h = "Privacy <em>Policy</em>", "How we collect, use and protect your personal information under POPIA."
        body = '''<p class="placeholder">Draft for client review — confirm Information Officer details before launch.</p>
<h2>1. Responsible party</h2><p>Makhi Luxury Taps, 93 Van Riebeeck Avenue, Edenvale, 1645. Information Officer: <span class="placeholder">name &amp; email to be confirmed</span>.</p>
<h2>2. What we collect</h2><ul><li>Contact and delivery details you give us when ordering or enquiring</li><li>Order and payment status (card details are handled by our payment partners, never stored by us)</li><li>Messages you send via forms, WhatsApp or Ask Makhi</li><li>With your consent only: analytics about how the site is used</li></ul>
<h2>3. Why we use it</h2><p>To process orders and deliveries, respond to enquiries, provide warranty and returns support, and — only if you opt in — send our newsletter.</p>
<h2>4. Cookies</h2><p>Essential cookies keep your cart, wishlist and preferences working. Analytics cookies are set only if you choose “Accept all” in our cookie banner. You can change your choice by clearing site data.</p>
<h2>5. Sharing</h2><p>We share information only with service providers who help us deliver your order (couriers, payment providers, hosting) and only as needed. We never sell your information.</p>
<h2>6. Your rights</h2><p>Under POPIA you may request access to, correction of, or deletion of your personal information, object to processing, and lodge a complaint with the Information Regulator.</p>
<h2>7. Security &amp; retention</h2><p>We use reasonable technical and organisational measures to protect your information and keep it only as long as needed for the purposes above or as required by law.</p>
<h2>8. Contact</h2><p>info@makhiluxurytaps.co.za · +27 68 146 5775</p>'''
    names = {"refund": "Refund & Returns", "terms": "Terms & Conditions", "privacy": "Privacy Policy"}
    return f'''<section class="phead phead--plain"><div class="wrap">{crumbs_html([("Home", "index.html"), (names[kind], None)])}<span class="eyebrow">Policies</span><h1 class="d-l mt-m">{title}</h1><p class="lead mt-m">{h}</p></div></section>
<section class="section--tight"><div class="wrap"><div class="prose">{body}<p class="muted mt-l">Last updated: 26 November 2026</p></div></div></section>'''

def notfound():
    picks = [by(s) for s in ["swan-short-basin-mixer-silver", "naledi-black-xl-kitchen-faucet", "veja-black-pullout-kitchen-faucet", "muda-gold-freestanding-bath-mixer"]]
    return f'''<section class="nf"><div>
  <svg class="nf__tap" viewBox="0 0 200 260" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 30 H120 Q150 30 150 60 V80"/><rect x="40" y="18" width="40" height="24" rx="4"/><path d="M60 18 V6 M48 6 H72" stroke-linecap="round"/><path d="M140 80 H160 V92 H140z"/><path class="dr" d="M150 100c0 0-6 8-6 12a6 6 0 0 0 12 0c0-4-6-12-6-12z" stroke="none"/><ellipse class="rp" cx="150" cy="238" rx="30" ry="6"/><path d="M60 246 H190" opacity=".3"/></svg>
  <span class="eyebrow" style="justify-content:center">Error 404</span><h1 class="serif mt-m">This tap has <em>run dry.</em></h1><p class="lead" style="margin:18px auto 0">The page you're after has moved or no longer exists.</p>
  <form action="{{{{R}}}}shop/" method="get"><label class="sr-only" for="nfq">Search</label><input id="nfq" name="q" placeholder="Search the collection…"><button class="btn btn--sm">Search</button></form>
  <div class="flex gap-s wrap-f" style="justify-content:center"><a class="btn btn--gold" href="{{{{R}}}}index.html">Back home {A}</a><button class="btn btn--ghost" data-chat="">Ask Makhi</button></div>
</div></section>
<section class="section--tight"><div class="wrap"><h2 class="d-s" style="margin-bottom:40px">Bestsellers</h2><div class="pgrid pgrid--4">{"".join(card(p) for p in picks)}</div></div></section>'''


def catalogue_page():
    import json as _j, os as _o
    from layout import DROP_D
    man = _j.load(open(_o.path.join(_o.path.dirname(_o.path.abspath(__file__)), "..", "site", "catalogue", "manifest.json")))
    pdf_kb = _o.path.getsize(_o.path.join(_o.path.dirname(_o.path.abspath(__file__)), "..", "site", "assets", "catalogue", "makhi-collection-2026.pdf")) // 1024
    arrowL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>'
    first = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M18 6l-6 6 6 6M8 6v12"/></svg>'
    return f"""
<section class="book3d on-dark" id="book3d" data-cursor="DRAG" data-manifest="{e(_j.dumps(man))}" data-pages="{{{{R}}}}assets/catalogue/pages/" data-marble="{{{{R}}}}assets/img/ls/marble-black.webp" data-drop="{DROP_D}">
  <canvas aria-label="Makhi Collection 2026 catalogue as a 3D book — click or drag to turn pages" role="img"></canvas>
  <div class="book3d__top">
    <div><span class="eyebrow">The Collection · 2026</span><h1 class="serif">The <em>Catalogue</em></h1></div>
    <a class="btn btn--gold" href="{{{{R}}}}assets/catalogue/makhi-collection-2026.pdf" download data-dl-pdf>{ICON["dl"]} Download PDF <small>{pdf_kb/1024:.1f} MB</small></a>
  </div>
  <div class="book3d__load" aria-hidden="true"><span class="label">Opening the catalogue</span><b>0</b><i>%</i></div>
  <div class="book3d__ui" role="group" aria-label="Catalogue controls">
    <button class="icon-btn" data-book="first" aria-label="Back to cover">{first}</button>
    <button class="icon-btn" data-book="prev" aria-label="Previous page">{arrowL}</button>
    <span class="book3d__count" aria-live="polite">Cover</span>
    <button class="icon-btn" data-book="next" aria-label="Next page">{A}</button>
  </div>
  <p class="book3d__hint">Click a page or drag to turn · ← → keys</p>
  <aside class="spread" aria-label="Products on this spread"><span class="label">Shop this spread</span><div class="spread__list"></div></aside>
</section>
<section class="section--tight"><div class="wrap two-col">
  <div><span class="eyebrow">Take it with you</span><h2 class="d-m mt-m">Every piece, <em>one</em> beautiful file.</h2>
    <p class="lead mt-m">{len([m for m in man if m["slugs"]])} product pages, five finishes and nine complete suites — in the same onyx, marble and gold as the website. Prices current at publication.</p>
    <div class="flex gap-s wrap-f mt-m"><a class="btn btn--gold" href="{{{{R}}}}assets/catalogue/makhi-collection-2026.pdf" download data-dl-pdf>{ICON["dl"]} Download the catalogue (PDF)</a><a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/?text={e("The Makhi Luxury Taps catalogue 2026: https://demo.pixelcode.co.za/makhiluxurytaps/assets/catalogue/makhi-collection-2026.pdf")}">{ICON["wa"]} Share on WhatsApp</a></div></div>
  <div class="cat-thumbs">{"".join(f'<img src="{{{{R}}}}assets/catalogue/pages/p{i:02d}.webp" alt="Catalogue page {i + 1}" loading="lazy">' for i in (0, 4, 9, 30))}</div>
</div></section>"""
