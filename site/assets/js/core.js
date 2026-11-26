/* ==========================================================================
   MAKHI — core.js
   Shared engine: theme, header, menu, cart, wishlist, cursor, smooth scroll,
   reveals, transitions, preloader, cookie banner, search, sound, analytics.
   ========================================================================== */
(() => {
  "use strict";

  const doc = document.documentElement;
  const ROOT = doc.dataset.root || "";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => window.innerWidth < 900;
  if (reduce) doc.classList.add("reduce-motion");
  doc.classList.remove("no-js");

  const WA = "27681465775";
  const PHONE = "+27 68 146 5775";
  const EMAIL = "info@makhiluxurytaps.co.za";

  /* ---------- storage (safe) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("makhi:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("makhi:" + k, JSON.stringify(v)); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem("makhi:" + k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem("makhi:" + k, v); } catch (e) {} }
  };

  /* ---------- analytics ---------- */
  window.dataLayer = window.dataLayer || [];
  const track = (event, data = {}) => {
    window.dataLayer.push({ event, ...data, ts: Date.now() });
  };

  /* ---------- formatting ---------- */
  const group = (n) => String(Math.trunc(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fmt = (n) => { n = Number(n); return "R" + group(n) + "." + Math.round((Math.abs(n) % 1) * 100).toString().padStart(2, "0"); };
  const fmt0 = (n) => "R" + group(Number(n));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- catalogue ---------- */
  const P = (window.MAKHI_PRODUCTS || []);
  const byId = new Map(P.map((p) => [p.id, p]));
  const bySlug = new Map(P.map((p) => [p.slug, p]));
  const purl = (p) => ROOT + "product/" + p.slug + "/";
  const pimg = (p, i = 0) => ROOT + (p.cover && i === 0 && p.type === "combo" ? p.cover : (p.images[i] || p.images[0]));
  const FINISHES = [
    { k: "gold", label: "Gold" },
    { k: "black", label: "Black" },
    { k: "silver", label: "Silver" },
    { k: "chrome", label: "Chrome" },
    { k: "stainless", label: "Stainless Steel" }
  ];
  const TYPE_LABEL = {
    "basin-mixer": "Basin Mixer", "kitchen-faucet": "Kitchen Faucet", "freestanding-mixer": "Freestanding Bath Mixer",
    "bath-mixer": "Bath Mixer", "shower-mixer": "Shower Mixer", "shower-column": "Shower Column", "wall-tap": "Wall-mounted Tap",
    bath: "Freestanding Bath", basin: "Basin", vanity: "Vanity", "enclosed-shower": "Enclosed Shower", "walk-in": "Walk-in Shower",
    toilet: "Toilet", combo: "Combo Deal"
  };
  const baseKey = (p) => p.name.toLowerCase()
    .replace(/—.*$/, "")
    .replace(/\b(gold|black|silver|chrome|matt|matte|white|stainless|steel|tinted)\b/g, "")
    .replace(/\s+/g, " ").trim();
  const siblings = (p) => P.filter((q) => q.id !== p.id && q.type === p.type && baseKey(q) === baseKey(p));
  const metalFinishes = new Set(["gold", "black", "silver", "chrome", "stainless"]);

  /* ---------- icons ---------- */
  const I = {
    logo: '<svg viewBox="0 0 82 100" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M64.35,23.96c1.91,2.32,3.76,4.69,5.52,7.13,3.36,4.65,6.43,9.51,8.69,14.79,1.7,3.96,2.93,8.14,3,12.45.14,9.27-3.11,18.51-8.89,25.75-4.74,5.94-11.16,10.53-18.34,13.06-7.79,2.75-16.45,3.05-24.46.83-7.93-2.2-15.14-6.9-20.39-13.17-4.93-5.9-8.14-13.19-9.13-20.81-.3-2.33-.45-4.7-.28-6.99.34-4.68,1.94-9.2,4-13.44,2.42-4.99,5.49-9.64,8.82-14.09,1.36-1.82,2.76-3.6,4.21-5.35l6.35,6.35c-3.63,4.45-7.02,9.08-9.83,14.1-1.42,2.55-2.69,5.2-3.58,7.98-.65,2.03-1.1,4.14-1.09,6.28.02,5.07,1.26,10.08,3.59,14.55,3.19,6.11,8.41,11.13,14.63,14.09,6.02,2.86,12.95,3.74,19.5,2.51,5.07-.95,9.89-3.16,13.92-6.37,5.76-4.58,9.88-11.2,11.38-18.46.46-2.22.7-4.5.65-6.74-.05-2.53-.73-5.03-1.64-7.41-1.63-4.32-4.01-8.34-6.61-12.17-1.99-2.93-4.13-5.76-6.37-8.51l6.34-6.34h0ZM43.7,25.02c2.55,2.26,4.98,4.68,7.34,7.18,3.62,3.84,7.02,7.87,9.88,12.32,1.74,2.72,3.28,5.59,4.23,8.66.6,1.92.93,3.9.89,5.94-.1,5.49-2.05,10.9-5.45,15.2-3.43,4.34-8.31,7.52-13.69,8.87-5.15,1.29-10.7.92-15.63-1.07-4.47-1.8-8.39-4.91-11.18-8.83-2.97-4.17-4.62-9.23-4.67-14.41-.04-4.17,1.59-8.25,3.67-11.94,2.58-4.57,5.88-8.71,9.41-12.64,2.9-3.23,5.94-6.32,9.2-9.21l.05-.05,2.97-2.61c.99.87,1.98,1.74,2.97,2.61h0ZM40.68,34.51c-3.23,3.14-6.31,6.44-9.11,9.97-2.12,2.67-4.1,5.47-5.59,8.53-.64,1.32-1.2,2.7-1.47,4.14-.18.93-.18,1.89-.1,2.84.28,3.4,1.67,6.7,3.89,9.29,2.71,3.15,6.62,5.22,10.75,5.64,3.67.37,7.46-.53,10.56-2.53,3.52-2.28,6.13-5.95,7.08-10.06.29-1.25.44-2.56.42-3.82-.03-1.5-.52-2.96-1.11-4.36-1.08-2.54-2.57-4.89-4.19-7.13-3.25-4.51-7.03-8.62-11.02-12.5l-.06-.05s-.04.04-.06.05h0ZM29.2,10.82l6.31,6.31c-2.33,2.35-4.61,4.75-6.81,7.21l-6.33-6.33c2.22-2.45,4.5-4.85,6.83-7.19h0ZM52.31,10.77c2.3,2.31,4.55,4.67,6.75,7.09l-6.33,6.33c-.99-1.1-2-2.18-3.01-3.26-1.22-1.3-2.47-2.58-3.72-3.85l6.31-6.31h0ZM34.39,5.74c1.11-1.04,2.23-2.07,3.37-3.09l.04-.03,2.98-2.62c.99.87,1.99,1.75,2.98,2.62,1.14,1,2.25,2.03,3.35,3.07l-6.32,6.32h0s-.02.01-.04.03l-.03.03-6.32-6.32h0Z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.7 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.5 0 5.6 3.6 4.4 7.1-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    drop: '<svg viewBox="0 0 24 30" fill="currentColor"><path d="M12 1C12 1 2 12.5 2 19a10 10 0 0 0 20 0C22 12.5 12 1 12 1z"/></svg>',
    dropLine: '<svg viewBox="0 0 24 30" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 1.5C12 1.5 2.5 12.5 2.5 19a9.5 9.5 0 0 0 19 0C21.5 12.5 12 1.5 12 1.5z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2 6.1 20.5l1.4-6.6-5-4.5 6.6-.7z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.2 0-.4.1-.5l.4-.4.3-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z"/></svg>'
  };

  const swatchHTML = (k) => `<i class="sw sw--${k}" title="${(FINISHES.find(f => f.k === k) || { label: k }).label}"></i>`;
  const priceHTML = (p) => p.was
    ? `<span class="price"><span class="sale">${fmt(p.price)}</span><s>${fmt(p.was)}</s></span>`
    : `<span class="price">${fmt(p.price)}</span>`;

  /* ---------- product card ---------- */
  function card(p, opts = {}) {
    const sibs = [p, ...siblings(p)].map((q) => q.finish).filter((f, i, a) => f && a.indexOf(f) === i);
    const alt = p.images[1] ? `<div class="tile alt"><img src="${ROOT + p.images[1]}" alt="" loading="lazy" decoding="async"></div>` : "";
    const badge = !p.stock ? '<span class="pcard__badge pcard__badge--out">Sold out</span>' : (p.was ? `<span class="pcard__badge">Save ${fmt0(p.was - p.price)}</span>` : (p.collection === "cobra" ? '<span class="pcard__badge">Cobra Range</span>' : ""));
    const label = p.type === "combo" ? (p.title || "Combo") : (TYPE_LABEL[p.type] || "") + (p.finishLabel ? " · " + p.finishLabel : "");
    return `<article class="pcard ${opts.cls || ""}" data-pid="${p.id}"><div class="pcard__frame">
      <a href="${purl(p)}" class="pcard__media" data-cursor="VIEW" aria-label="${esc(p.name)}">
        ${badge}
        <div class="tile${p.type === "combo" ? "" : ""}"><img src="${pimg(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="600" height="600"></div>
        ${alt}
      </a>
      <button class="icon-btn pcard__wish wish ${isWished(p.id) ? "is-on" : ""}" data-wish="${p.id}" aria-label="Add ${esc(p.name)} to wishlist" aria-pressed="${isWished(p.id)}">${I.heart}</button>
      <div class="pcard__actions">
        <button type="button" data-qv="${p.id}">Quick view</button>
        <button type="button" data-add="${p.id}" ${p.stock ? "" : "disabled"}>${p.stock ? "Add to cart" : "Sold out"}</button>
      </div></div>
      <div class="pcard__info">
        <div><h3 class="pcard__name"><a href="${purl(p)}">${esc(p.type === "combo" ? (p.title || p.name) : p.name.replace(/ — .*$/, ""))}</a></h3><div class="pcard__meta">${esc(label)}</div></div>
        <div class="pcard__right">${priceHTML(p)}${sibs.length ? `<div class="swatches">${sibs.map(swatchHTML).join("")}</div>` : ""}</div>
      </div>
    </article>`;
  }
  function mini(p) {
    return `<div class="mini"><a href="${purl(p)}" class="tile"><img src="${pimg(p)}" alt="${esc(p.name)}" loading="lazy"></a>
      <a href="${purl(p)}" class="mini__n">${esc(p.name)}</a>
      <div class="mini__row"><span class="price">${fmt(p.price)}</span>${p.stock ? `<button class="mini__add" data-add="${p.id}">Add +</button>` : '<span class="muted" style="font-size:12px">Sold out</span>'}</div></div>`;
  }

  /* ---------- toasts ---------- */
  function toast(html, opts = {}) {
    let wrap = $(".toasts");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toasts"; wrap.setAttribute("role", "status"); wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = "toast" + (opts.plain ? " toast--plain" : "");
    t.innerHTML = html;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 500); }, opts.ms || 3800);
  }

  /* ---------- cart ---------- */
  let cart = store.get("cart", []);
  let wish = store.get("wish", []);
  function isWished(id) { return wish.includes(id); }
  const cartCount = () => cart.reduce((a, b) => a + b.qty, 0);
  const cartTotal = () => cart.reduce((a, b) => a + (byId.get(b.id)?.price || 0) * b.qty, 0);
  function saveCart() { store.set("cart", cart); updateCounts(); renderCart(); }
  function updateCounts() {
    const n = cartCount();
    $$(".cart-count").forEach((el) => { el.textContent = n; el.classList.toggle("has", n > 0); });
  }
  function addToCart(id, qty = 1, srcEl) {
    const p = byId.get(Number(id));
    if (!p || !p.stock) return;
    const ex = cart.find((c) => c.id === p.id);
    ex ? (ex.qty += qty) : cart.push({ id: p.id, qty });
    saveCart();
    flyDrop(srcEl);
    sound.drip(0.9);
    track("add_to_cart", { id: p.id, name: p.name, price: p.price, qty });
    toast(`<div class="tile"><img src="${pimg(p)}" alt=""></div><div><b>Added to cart</b><span>${esc(p.name)}</span></div><a href="#" data-open-cart>View</a>`);
  }
  function addMany(ids) {
    ids.forEach((id) => { const p = byId.get(id); if (p && p.stock) { const ex = cart.find((c) => c.id === id); ex ? ex.qty++ : cart.push({ id, qty: 1 }); } });
    saveCart(); flyDrop(); sound.drip(1);
    track("add_to_cart", { ids, bundle: true });
    toast(`<div><b>Added to cart</b><span>${ids.length} pieces added to your cart</span></div><a href="#" data-open-cart>View</a>`, { plain: true });
  }
  function flyDrop(srcEl) {
    const target = $(isMobile() ? ".bnav [data-open-cart]" : ".hdr [data-open-cart]");
    if (!target || reduce || !window.gsap) return rippleCart();
    const tr = target.getBoundingClientRect();
    const sr = srcEl ? srcEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const d = document.createElement("div");
    d.className = "fly-drop"; d.innerHTML = I.drop;
    document.body.appendChild(d);
    const sx = sr.left + sr.width / 2 - 7, sy = sr.top + sr.height / 2 - 9;
    const tx = tr.left + tr.width / 2 - 7, ty = tr.top + tr.height / 2 - 9;
    gsap.set(d, { x: sx, y: sy, scale: 0.4 });
    gsap.timeline({ onComplete: () => { d.remove(); rippleCart(); } })
      .to(d, { scale: 1.2, duration: 0.25, ease: "power2.out" })
      .to(d, { x: tx, duration: 0.85, ease: "power1.inOut" }, 0.1)
      .to(d, { y: Math.min(sy, ty) - 120, duration: 0.42, ease: "power2.out" }, 0.1)
      .to(d, { y: ty, duration: 0.43, ease: "power2.in" }, 0.52)
      .to(d, { scaleY: 0.4, scaleX: 1.6, opacity: 0, duration: 0.18 }, 0.93);
  }
  function rippleCart() {
    $$("[data-open-cart] .cart-ripple").forEach((r) => { r.classList.remove("go"); void r.offsetWidth; r.classList.add("go"); });
  }
  function upsellFor() {
    const inCart = new Set(cart.map((c) => c.id));
    const fins = cart.map((c) => byId.get(c.id)?.finish).filter(Boolean);
    const fin = fins[0];
    const types = new Set(cart.map((c) => byId.get(c.id)?.type));
    let pool = P.filter((p) => p.stock && !inCart.has(p.id) && p.type !== "combo" && !types.has(p.type));
    if (fin) pool.sort((a, b) => (b.finish === fin) - (a.finish === fin));
    return pool.slice(0, 2);
  }
  function renderCart() {
    const body = $("#cartBody"), foot = $("#cartFoot");
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="empty-state"><div class="drop-ico">${I.logo}</div><h4>Your cart is dry.</h4><p>Let's change that.</p><a href="${ROOT}shop/" class="btn mt-m">Shop the collection ${I.arrow}</a></div>`;
      foot.hidden = true; return;
    }
    foot.hidden = false;
    body.innerHTML = cart.map((c) => {
      const p = byId.get(c.id); if (!p) return "";
      return `<div class="ci"><a href="${purl(p)}" class="tile"><img src="${pimg(p)}" alt=""></a>
        <div><a href="${purl(p)}" class="ci__name">${esc(p.name)}</a><div class="ci__meta">${esc(TYPE_LABEL[p.type] || "")}${p.finishLabel ? " · " + p.finishLabel : ""}</div>
        <div class="qty"><button data-q="-1" data-id="${p.id}" aria-label="Decrease quantity">−</button><span aria-live="polite">${c.qty}</span><button data-q="1" data-id="${p.id}" aria-label="Increase quantity">+</button></div><br>
        <button class="ci__rm" data-rm="${p.id}">Remove</button></div>
        <span class="price">${fmt(p.price * c.qty)}</span></div>`;
    }).join("") + `<div class="upsell"><h5>Complete the look</h5><div class="upsell__row">${upsellFor().map(mini).join("")}</div></div>`;
    $("#cartSub").textContent = fmt(cartTotal());
    $("#cartTotal").textContent = fmt(cartTotal());
  }
  function openCart() { $("#cart")?.classList.add("is-on"); $("#scrim")?.classList.add("is-on"); renderCart(); lenis?.stop(); $("#cart .drawer__head button")?.focus(); }
  function closeOverlays() {
    $$(".drawer.is-on, .modal.is-on, .filters.is-on, .search.is-on").forEach((e) => e.classList.remove("is-on"));
    $("#scrim")?.classList.remove("is-on");
    if (document.body.classList.contains("menu-open")) {
      document.body.classList.remove("menu-open");
      const mb = $(".menu-btn"); if (mb) { mb.setAttribute("aria-expanded", "false"); mb.setAttribute("aria-label", "Open menu"); const t = $(".t", mb); if (t) t.textContent = "MENU"; }
      $(".fsm")?.setAttribute("aria-hidden", "true");
    }
    lenis?.start();
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id, btn) {
    id = Number(id);
    const on = !wish.includes(id);
    wish = on ? [...wish, id] : wish.filter((w) => w !== id);
    store.set("wish", wish);
    $$(`[data-wish="${id}"]`).forEach((b) => { b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
    if (on) { const p = byId.get(id); toast(`<div class="tile"><img src="${pimg(p)}" alt=""></div><div><b>Saved to wishlist</b><span>${esc(p.name)}</span></div><a href="${ROOT}wishlist/">View</a>`); sound.drip(0.6); }
    track("wishlist", { id, on });
    document.dispatchEvent(new CustomEvent("makhi:wish"));
  }

  /* ---------- quick view ---------- */
  function quickView(id) {
    const p = byId.get(Number(id)); if (!p) return;
    const m = $("#qv");
    $("#qvBox").innerHTML = `<button class="icon-btn modal__close" data-close aria-label="Close">${I.close}</button>
      <div class="qv__media"><div class="tile"><img src="${pimg(p)}" alt="${esc(p.name)}"></div></div>
      <div class="qv__body"><span class="pdp__coll">${esc(TYPE_LABEL[p.type] || "")}${p.collection === "cobra" ? " · Cobra Range" : ""}</span>
      <h3 id="qvTitle">${esc(p.type === "combo" ? (p.title + " — " + p.name) : p.name)}</h3>${priceHTML(p)}
      ${p.desc[0] ? `<p>${esc(p.desc[0])}</p>` : p.items ? `<ul class="bcard__items" style="color:inherit">${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
      ${p.finishLabel ? `<div class="flex gap-s ai-c">${swatchHTML(p.finish)}<span class="label" style="letter-spacing:.16em">${p.finishLabel}</span></div>` : ""}
      <div class="flex gap-s wrap-f mt-s"><button class="btn" data-add="${p.id}" ${p.stock ? "" : "disabled"}>${p.stock ? "Add to cart" : "Sold out"} ${I.arrow}</button><a class="btn btn--ghost" href="${purl(p)}">Full details</a></div>
      <p class="muted" style="font-size:14px">${p.stock ? "In stock · ships from Edenvale" : "Currently sold out — ask us about restock alerts."}</p></div>`;
    m.classList.add("is-on"); $("#scrim").classList.add("is-on"); lenis?.stop();
    track("quick_view", { id: p.id });
  }

  /* ---------- theme ---------- */
  function setTheme(t) {
    doc.dataset.theme = t;
    store.set("theme", t);
    $$('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", t === "light" ? "#FAF8F4" : "#0B0B0C"));
    document.dispatchEvent(new CustomEvent("makhi:theme", { detail: t }));
  }
  function toggleTheme(e) {
    const next = doc.dataset.theme === "light" ? "dark" : "light";
    sound.drip(0.7);
    track("theme_toggle", { to: next });
    if (!document.startViewTransition || reduce) return setTheme(next);
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => setTheme(next));
    vt.ready.then(() => {
      doc.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end * 0.35}px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 1100, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" });
    });
  }

  /* ---------- sound (synthesised water drips, off by default) ---------- */
  const sound = (() => {
    let ctx = null, on = store.get("sound", false), timer = null;
    function ensure() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return ctx; }
    function drip(vol = 0.5) {
      if (!on || !ensure()) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      const base = 700 + Math.random() * 900;
      o.type = "sine"; o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * 2.6, t + 0.08);
      f.type = "bandpass"; f.frequency.value = base * 1.6; f.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12 * vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.25);
    }
    function ambient() { clearTimeout(timer); if (!on) return; drip(0.25 + Math.random() * 0.25); timer = setTimeout(ambient, 1800 + Math.random() * 4200); }
    function set(v) { v = false; on = v; store.set("sound", v); $$(".sound-btn").forEach((b) => { b.classList.toggle("on", v); b.setAttribute("aria-pressed", v); b.setAttribute("aria-label", v ? "Turn water sounds off" : "Turn water sounds on"); }); if (v) { ensure(); ctx?.resume(); drip(0.8); ambient(); } else clearTimeout(timer); }
    return { drip, set, toggle: () => set(!on), init: () => set(false) };
  })();

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  function initScroll() {
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.95 });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    }
    window.lenis = lenis;
  }

  /* ---------- header ---------- */
  function initHeader() {
    const hdr = $(".hdr"); if (!hdr) return;
    let last = 0;
    const barH = parseFloat(getComputedStyle(doc).getPropertyValue("--bar-h")) || 36;
    const darks = $$(".on-dark");
    const onScroll = () => {
      const y = window.scrollY;
      const probe = hdr.getBoundingClientRect().top + 42;
      hdr.classList.toggle("on-dark", darks.some((d) => { if (!d.classList.contains("on-dark")) return false; const r = d.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
      hdr.classList.toggle("is-scrolled", y > 24);
      document.body.classList.toggle("hdr-past-bar", y > barH);
      if (!document.body.classList.contains("menu-open")) hdr.classList.toggle("is-hidden", y > 600 && y > last + 4);
      if (y < last - 4) hdr.classList.remove("is-hidden");
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    // mark current nav
    const here = location.pathname.replace(/index\.html$/, "");
    $$(".hdr__nav > li > a").forEach((a) => { const u = new URL(a.href, location.href).pathname; if (u !== "/" && here.endsWith(u.replace(/^.*?(\/[^/]+\/)$/, "$1"))) a.setAttribute("aria-current", "page"); });
  }
  function initAnnouncement() {
    const bar = $(".ann"), items = $$(".ann__item"), dots = $$(".ann__dots i"); if (!bar || items.length < 2) return;
    let i = 0, timer = null, paused = false;
    const go = (n, dir = 1) => {
      const cur = items[i]; const nx = (n + items.length) % items.length; if (nx === i) return;
      const out = dir > 0 ? "is-out" : "is-out-r", inn = dir > 0 ? "from-r" : "from-l";
      items[nx].classList.add(inn); void items[nx].offsetWidth;
      cur.classList.remove("is-on"); cur.classList.add(out); cur.setAttribute("aria-hidden", "true");
      items[nx].classList.remove(inn); items[nx].classList.add("is-on"); items[nx].setAttribute("aria-hidden", "false");
      setTimeout(() => cur.classList.remove(out), 800);
      dots.forEach((d, k) => d.classList.toggle("is-on", k === nx));
      i = nx;
    };
    const play = () => { clearInterval(timer); timer = setInterval(() => { if (!paused) go(i + 1, 1); }, 4200); };
    const nextBtn = bar.querySelector(".ann__next"), prevBtn = bar.querySelector(".ann__prev");
    if (nextBtn) nextBtn.addEventListener("click", () => { go(i + 1, 1); play(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { go(i - 1, -1); play(); });
    bar.addEventListener("mouseenter", () => { paused = true; });
    bar.addEventListener("mouseleave", () => { paused = false; });
    let sx = null;
    bar.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    bar.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 30) { go(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); play(); } sx = null; });
    play();
  }
  function initMenu() {
    const btn = $(".menu-btn"); if (!btn) return;
    btn.addEventListener("click", () => {
      const open = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      const t = $(".t", btn); if (t) t.textContent = open ? "CLOSE" : "MENU";
      $(".fsm").setAttribute("aria-hidden", !open);
      open ? lenis?.stop() : lenis?.start();
      sound.drip(0.5);
    });
    const fq = $("#fsmQ"), fres = $(".fsm__res");
    if (fq && fres) {
      let ft;
      fq.addEventListener("input", () => {
        clearTimeout(ft);
        ft = setTimeout(() => {
          const q = fq.value.trim().toLowerCase();
          if (q.length < 2) { fres.innerHTML = ""; return; }
          const w = q.split(/\s+/);
          const hits = P.filter((p) => { const h = (p.name + " " + (p.title || "") + " " + (TYPE_LABEL[p.type] || "") + " " + (p.finishLabel || "")).toLowerCase(); return w.every((x) => h.includes(x)); }).slice(0, 4);
          fres.innerHTML = hits.length ? hits.map((p) => `<a href="${purl(p)}"><span class="tile"><img src="${pimg(p)}" alt=""></span><span>${esc(p.name)}</span><span class="price">${fmt(p.price)}</span></a>`).join("")
            : `<a href="${ROOT}shop/?q=${encodeURIComponent(q)}"><span></span><span>See all results for “${esc(q)}”</span><span></span></a>`;
          track("search", { q, where: "menu", results: hits.length });
        }, 120);
      });
    }
    const tiles = $$(".fsm__visual .tile");
    $$(".fsm__list a").forEach((a, i) => a.addEventListener("mouseenter", () => {
      tiles.forEach((t) => t.classList.toggle("is-on", t.dataset.i === String(a.dataset.i ?? i)));
      const cap = $(".fsm__caption .serif"); if (cap && a.dataset.cap) cap.textContent = a.dataset.cap;
    }));
  }

  /* ---------- footer: accordions on small screens ---------- */
  function initFooter() {
    const mq = matchMedia("(max-width: 760px)");
    $$(".ftr__col:not(.ftr__visit)").forEach((col) => {
      const h = $("h6", col); if (!h) return;
      h.setAttribute("role", "button"); h.tabIndex = 0;
      const set = (open) => { col.classList.toggle("is-open", open); h.setAttribute("aria-expanded", String(open)); };
      const toggle = () => { if (mq.matches) set(!col.classList.contains("is-open")); };
      h.addEventListener("click", toggle);
      h.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggle(); } });
      set(false);
    });
  }

  /* ---------- search ---------- */
  function initSearch() {
    const s = $("#search"); if (!s) return;
    const input = $("#searchInput"), res = $("#searchRes");
    const run = (q) => {
      q = q.trim().toLowerCase();
      if (!q) { res.innerHTML = P.filter((p) => p.stock && p.type !== "combo").slice(0, 4).map((p) => card(p)).join(""); return; }
      const words = q.split(/\s+/);
      const hits = P.filter((p) => { const hay = (p.name + " " + (TYPE_LABEL[p.type] || "") + " " + (p.finishLabel || "") + " " + p.room + " " + (p.title || "") + " " + (p.items || []).join(" ")).toLowerCase(); return words.every((w) => hay.includes(w)); });
      res.innerHTML = hits.length ? hits.slice(0, 12).map((p) => card(p)).join("") : `<p class="lead">Nothing matches “${esc(q)}”. Try <em>mixer</em>, <em>gold</em> or <em>bath</em> — or ask Makhi.</p>`;
      track("search", { q, results: hits.length });
    };
    let t; input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => run(input.value), 140); });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter" && input.value.trim()) { e.preventDefault(); location.href = ROOT + "shop/?q=" + encodeURIComponent(input.value.trim()); } });
    $$("[data-q]", s).forEach((c) => c.addEventListener("click", () => { input.value = c.dataset.q; run(c.dataset.q); }));
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-search]")) { e.preventDefault(); s.classList.add("is-on"); lenis?.stop(); run(input.value); setTimeout(() => input.focus(), 100); }
    });
  }

  /* ---------- cursor + ripples ---------- */
  function initCursor() {
    if (!finePointer || reduce) return;
    doc.classList.add("has-cursor");
    const c = document.createElement("div");
    c.className = "cursor"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = `<div class="cursor__drop">${I.drop}</div><div class="cursor__ring"><span></span></div>`;
    document.body.appendChild(c);
    const label = $(".cursor__ring span", c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; c.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => c.classList.add("is-hidden"));
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, [role=button], input[type=range]");
      if (!t) { c.classList.remove("is-label", "is-link"); return; }
      const l = t.closest("[data-cursor]")?.dataset.cursor;
      if (l) { label.textContent = l; c.classList.add("is-label"); c.classList.remove("is-link"); }
      else { c.classList.remove("is-label"); c.classList.add("is-link"); }
    });
    // ripple canvas
    const cv = document.createElement("canvas"); cv.id = "ripples"; document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    let dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    size(); addEventListener("resize", size);
    const rips = []; let lastR = 0, active = false;
    const zones = () => $$("[data-ripple]");
    function inZone() { for (const z of zones()) { const r = z.getBoundingClientRect(); if (y > r.top && y < r.bottom && x > r.left && x < r.right) return true; } return false; }
    let px = x, py = y;
    function loop(t) {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      const moved = Math.hypot(x - px, y - py);
      if (t - lastR > 70 && moved > 6) { active = inZone(); if (active) { rips.push({ x, y, r: 2, a: 0.42 }); lastR = t; } px = x; py = y; }
      if (rips.length || ctx._dirty) {
        ctx.clearRect(0, 0, cv.width, cv.height); ctx._dirty = rips.length > 0;
        for (let i = rips.length - 1; i >= 0; i--) {
          const r = rips[i]; r.r += 1.6; r.a *= 0.962;
          ctx.beginPath(); ctx.arc(r.x * dpr, r.y * dpr, r.r * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(214,184,120,${r.a})`; ctx.lineWidth = dpr; ctx.stroke();
          ctx.beginPath(); ctx.arc(r.x * dpr, r.y * dpr, r.r * 0.6 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244,241,234,${r.a * 0.35})`; ctx.stroke();
          if (r.a < 0.01) rips.splice(i, 1);
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- magnetic ---------- */
  function initMagnetic() {
    if (!finePointer || reduce || !window.gsap) return;
    document.addEventListener("pointermove", (e) => { const b = e.target.closest && e.target.closest(".btn"); if (!b) return; const r = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - r.left) + "px"); b.style.setProperty("--my", (e.clientY - r.top) + "px"); }, { passive: true });
    $$("[data-magnetic], .btn:not(.btn--block), .fab").forEach((el) => {
      if (el._mag) return; el._mag = true;
      const s = Number(el.dataset.magnetic || 0.28);
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * s, y: (e.clientY - r.top - r.height / 2) * s, duration: 0.6, ease: "power3.out" }); });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,.4)" }));
    });
  }

  /* ---------- reveals ---------- */
  function splitLines(el) {
    if (el._split) return el._split;
    // wrap words, then group by offsetTop into lines
    const walk = (node, out) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) out.push(document.createTextNode(" ")); else { const s = document.createElement("span"); s.className = "w"; s.textContent = w; s.style.display = "inline-block"; out.push(s); } });
        } else if (n.nodeType === 1) {
          if (n.tagName === "BR") { out.push(n.cloneNode()); return; }
          const clone = n.cloneNode(false); const inner = []; walk(n, inner); inner.forEach((i) => clone.appendChild(i));
          clone.style.display = "inline-block"; out.push(clone);
        }
      });
    };
    const parts = []; walk(el, parts);
    el.innerHTML = ""; parts.forEach((p) => el.appendChild(p));
    const kids = Array.from(el.childNodes).filter((n) => n.nodeType === 1 && n.tagName !== "BR");
    const lines = []; let top = null, cur = null;
    kids.forEach((k) => { const t = k.offsetTop; if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; } cur.push(k); });
    el.innerHTML = "";
    lines.forEach((ln) => {
      const outer = document.createElement("span"); outer.className = "split-line";
      const inner = document.createElement("span");
      ln.forEach((k, i) => { inner.appendChild(k); if (i < ln.length - 1) inner.appendChild(document.createTextNode(" ")); });
      outer.appendChild(inner); el.appendChild(outer);
    });
    el._split = $$(".split-line > span", el);
    return el._split;
  }
  let waterFilterId = 0;
  function waterReveal(el) {
    // SVG displacement — "water surface" settling into sharp image
    const id = "wf" + (++waterFilterId);
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", 0); svg.setAttribute("height", 0); svg.style.position = "absolute";
    svg.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="${waterFilterId}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="80" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.appendChild(svg);
    const disp = svg.querySelector("feDisplacementMap"), turb = svg.querySelector("feTurbulence");
    const target = el.querySelector("img") || el;
    target.style.filter = `url(#${id})`;
    const st = { s: 80, f: 0.012 };
    gsap.fromTo(target, { scale: 1.18, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    gsap.to(st, { s: 0, f: 0.004, duration: 2.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true },
      onUpdate: () => { disp.setAttribute("scale", st.s.toFixed(2)); turb.setAttribute("baseFrequency", `${st.f.toFixed(4)} ${(st.f * 2.4).toFixed(4)}`); },
      onComplete: () => { target.style.filter = ""; svg.remove(); } });
  }
  function initReveals(scope = document) {
    if (!window.gsap || !window.ScrollTrigger) { $$(".rv", scope).forEach((e) => { e.style.opacity = 1; e.style.transform = "none"; }); return; }
    if (reduce) {
      $$(".rv", scope).forEach((e) => { e.style.opacity = 1; e.style.transform = "none"; });
      $$("[data-count]", scope).forEach((el) => { el.textContent = el.dataset.count; });
      return;
    }
    $$("[data-split]", scope).forEach((el) => {
      if (el._splitDone) return; el._splitDone = true;
      const lines = splitLines(el);
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.09, delay: Number(el.dataset.delay || 0),
        scrollTrigger: el.dataset.split === "now" ? null : { trigger: el, start: "top 88%", once: true } });
    });
    $$(".rv", scope).forEach((el) => {
      if (el._rv) return; el._rv = true;
      gsap.to(el, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", delay: Number(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    $$("[data-stagger]", scope).forEach((wrap) => {
      if (wrap._st) return; wrap._st = true;
      const kids = Array.from(wrap.children);
      gsap.set(kids, { opacity: 0, y: 50 });
      ScrollTrigger.batch(kids, { start: "top 92%", once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", stagger: 0.08 }) });
    });
    if (!isMobile()) $$(".rv-water", scope).forEach((el) => { if (el._w) return; el._w = true; waterReveal(el); });
    else $$(".rv-water", scope).forEach((el) => gsap.from(el, { opacity: 0, duration: 1.2, scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
    $$("[data-zoom]", scope).forEach((el) => {
      if (el._z) return; el._z = true;
      const img = el.querySelector("img"); if (!img) return;
      gsap.fromTo(img, { scale: 1.16 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-parallax]", scope).forEach((el) => {
      if (el._p) return; el._p = true;
      const amt = Number(el.dataset.parallax || 0.2);
      gsap.fromTo(el, { yPercent: -amt * 50 }, { yPercent: amt * 50, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-float]", scope).forEach((el) => {
      if (el._f) return; el._f = true;
      gsap.fromTo(el, { y: 40, rotate: -2 }, { y: -40, rotate: 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
    $$("[data-count]", scope).forEach((el) => {
      if (el._c) return; el._c = true;
      const end = Number(el.dataset.count), o = { v: 0 };
      gsap.to(o, { v: end, duration: 2.4, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
  }

  /* ---------- marquee ---------- */
  function initMarquees() {
    $$(".marquee").forEach((m) => {
      const track = $(".marquee__track", m); if (!track || track._m) return; track._m = true;
      track.innerHTML += track.innerHTML;
      if (reduce || !window.gsap) return;
      const speed = Number(m.dataset.speed || 60);
      const w = track.scrollWidth / 2;
      const tw = gsap.to(track, { x: -w, duration: w / speed, ease: "none", repeat: -1 });
      if (window.ScrollTrigger) ScrollTrigger.create({ trigger: m, start: "top bottom", end: "bottom top", onUpdate: (s) => { gsap.to(tw, { timeScale: 1 + Math.min(4, Math.abs(s.getVelocity()) / 400) * (s.direction), duration: 0.3, overwrite: true }); gsap.to(tw, { timeScale: 1, duration: 1.2, delay: 0.3 }); } });
    });
  }

  /* ---------- page transitions ---------- */
  function initTransitions() {
    // WebGL water: rises to cover on leave, drains away on arrival; page content settles through a water distortion
    const reveal = (fromCover) => waterSettle(fromCover);
    let gl = null, prog = null, cv = null, raf = 0, state = { level: -0.2, agit: 1 };
    const FRAG = `precision highp float;
      uniform vec2 uRes; uniform float uTime, uLevel, uAgit;
      float caustic(vec2 uv, float t){ vec2 p = mod(uv*6.2831, 6.2831) - 250.0; vec2 i = p; float c = 1.0; float inten = .005;
        for (int n = 0; n < 4; n++){ float tt = t * (1.0 - (3.5 / float(n+1))); i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
          c += 1.0/length(vec2(p.x / (sin(i.x+tt)/inten), p.y / (cos(i.y+tt)/inten))); }
        c /= 4.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0); }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / uRes.y;
        float x = uv.x * asp; float t = uTime;
        float w = (0.032*sin(x*5.0 + t*3.1) + 0.019*sin(x*11.0 - t*4.4) + 0.009*sin(x*23.0 + t*7.3)) * uAgit;
        float h = uLevel + w;
        float d = h - uv.y;
        if (d < -0.02) { gl_FragColor = vec4(0.0); return; }
        // spray glow just above the surface
        if (d < 0.0) { float g = smoothstep(-0.02, 0.0, d); gl_FragColor = vec4(vec3(1.0,0.9,0.7)*g*0.5, g*0.35); return; }
        vec3 deep = mix(vec3(0.045,0.05,0.058), vec3(0.012,0.013,0.017), clamp(d*1.6, 0.0, 1.0));
        float c = caustic(vec2(x*0.55, uv.y*0.9) + vec2(0.0, t*0.05), t*1.6);
        vec3 col = deep + vec3(0.86,0.69,0.4) * c * 0.55 * exp(-d*1.8) + vec3(0.45,0.62,0.72) * c * 0.12;
        col += vec3(1.0,0.92,0.75) * smoothstep(0.007, 0.0, d) * 0.95;      // bright surface line
        col += vec3(0.6,0.55,0.45) * smoothstep(0.06, 0.0, d) * 0.12;       // meniscus glow
        float aa = smoothstep(0.0, 0.003, d);
        gl_FragColor = vec4(col, aa);
      }`;
    function setup() {
      if (gl) return true;
      cv = document.createElement("canvas"); cv.className = "pt-water"; cv.setAttribute("aria-hidden", "true");
      document.body.appendChild(cv);
      gl = cv.getContext("webgl", { premultipliedAlpha: false, alpha: true, antialias: false });
      if (!gl) { cv.remove(); return false; }
      const sh = (t, src) => { const x = gl.createShader(t); gl.shaderSource(x, src); gl.compileShader(x); return x; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }"));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      const size = () => { const k = Math.min(1, 1100 / Math.max(innerWidth, 1)) * Math.min(devicePixelRatio || 1, 1.5); cv.width = innerWidth * k; cv.height = innerHeight * k; gl.viewport(0, 0, cv.width, cv.height); };
      size(); addEventListener("resize", size);
      return true;
    }
    const t0 = performance.now();
    function draw() {
      if (!gl) return;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(gl.getUniformLocation(prog, "uRes"), cv.width, cv.height);
      gl.uniform1f(gl.getUniformLocation(prog, "uTime"), (performance.now() - t0) / 1000);
      gl.uniform1f(gl.getUniformLocation(prog, "uLevel"), state.level);
      gl.uniform1f(gl.getUniformLocation(prog, "uAgit"), state.agit);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop() { draw(); raf = requestAnimationFrame(loop); }
    function run(from, to, dur, ease, done) {
      cancelAnimationFrame(raf); cv.style.display = "block"; state.level = from; loop();
      gsap.to(state, { level: to, duration: dur, ease, overwrite: true, onComplete: () => { if (to < 0) { cancelAnimationFrame(raf); draw(); cv.style.display = "none"; } done && done(); } });
      gsap.fromTo(state, { agit: 1.6 }, { agit: 0.7, duration: dur, ease: "sine.inOut" });
    }
    // content seen through water, settling sharp
    function waterSettle(strong) {
      const main = $("#main"); if (!main) return;
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg"); svg.setAttribute("width", 0); svg.setAttribute("height", 0); svg.style.position = "absolute";
      svg.innerHTML = '<filter id="ptWater" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.013" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>';
      document.body.appendChild(svg);
      const dm = svg.querySelector("feDisplacementMap"), tb = svg.querySelector("feTurbulence");
      main.style.filter = "url(#ptWater)";
      const o = { s: strong ? 30 : 18, f: 0.006 };
      gsap.to(o, { s: 0, f: 0.002, duration: strong ? 1.7 : 1.3, ease: "power2.out", delay: strong ? 0.35 : 0.05,
        onUpdate: () => { dm.setAttribute("scale", o.s.toFixed(1)); tb.setAttribute("baseFrequency", `${o.f.toFixed(4)} ${(o.f * 2.2).toFixed(4)}`); },
        onComplete: () => { main.style.filter = ""; svg.remove(); } });
    }
    const incoming = store.sget("pt") === "1";
    store.sset("pt", "0");
    if (!reduce && window.gsap && setup()) {
      const hasPre = !!$(".preloader") && store.sget("seen") !== "1";
      if (incoming) { run(1.18, -0.15, 1.35, "power2.inOut"); reveal(true); }
      else if (!hasPre) { run(0.42, -0.15, 1.1, "power2.out"); reveal(false); }
      else { document.addEventListener("makhi:ready", () => { run(0.5, -0.15, 1.2, "power2.out"); reveal(false); }, { once: true }); }
    }
    doc.classList.remove("pt-in");
    if (reduce || !window.gsap || !gl) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a"); if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /^(mailto|tel|https?:\/\/wa\.me)/.test(href)) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (url.href === location.href) { e.preventDefault(); return; }
      e.preventDefault();
      closeOverlays();
      store.sset("pt", "1");
      sound.drip(0.7);
      run(-0.15, 1.2, 0.95, "power2.in", () => { location.href = url.href; });
    });
    addEventListener("pageshow", (e) => { if (e.persisted && gl) { state.level = -0.2; draw(); cv.style.display = "none"; } });
  }

  /* ---------- preloader ---------- */
  function initPreloader() {
    const pl = $(".preloader");
    if (!pl) return Promise.resolve();
    if (store.sget("seen") === "1" || reduce) { pl.remove(); return Promise.resolve(); }
    store.sset("seen", "1");
    return new Promise((resolve) => {
      const pct = $(".preloader__pct span", pl), bar = $(".preloader__line i", pl);
      const fill = $("#plFill", pl), dropEl = $("#plDrop", pl), ripple = $("#plRipple", pl);
      const imgs = $$("img").filter((i) => !i.loading || i.loading !== "lazy").slice(0, 16);
      let loaded = 0; const total = Math.max(1, imgs.length);
      imgs.forEach((im) => { if (im.complete) loaded++; else { im.addEventListener("load", () => loaded++, { once: true }); im.addEventListener("error", () => loaded++, { once: true }); } });
      const st = { v: 0 }; const start = performance.now();
      const tl = gsap.timeline();
      tl.fromTo(dropEl, { y: -140, opacity: 0, scaleY: 1.3 }, { y: 0, opacity: 1, scaleY: 1, duration: 0.9, ease: "power2.in" })
        .to(dropEl, { scaleY: 0.3, scaleX: 1.8, opacity: 0, duration: 0.18 })
        .fromTo(ripple, { attr: { r: 2 }, opacity: 1 }, { attr: { r: 64 }, opacity: 0, duration: 1.2, ease: "power2.out" }, "-=.1");
      const tick = () => {
        const real = loaded / total, time = Math.min(1, (performance.now() - start) / 2200);
        const target = Math.min(real, time) * 100;
        st.v += (target - st.v) * 0.08;
        const v = Math.min(100, st.v + 0.4);
        pct.textContent = Math.floor(v);
        bar.style.transform = `scaleX(${v / 100})`;
        fill.setAttribute("y", 100 - v * 1.0);
        if (v >= 99.5) {
          pct.textContent = 100;
          gsap.timeline({ onComplete: () => { pl.remove(); resolve(); } })
            .to(".preloader__mark", { scale: 1.1, duration: 0.5, ease: "power2.out" })
            .to(pl, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "-=.1");
          return;
        }
        requestAnimationFrame(tick);
      };
      setTimeout(() => requestAnimationFrame(tick), 600);
      setTimeout(() => { loaded = total; }, 4500);
    });
  }

  /* ---------- cookie banner (POPIA) ---------- */
  function initCookies() {
    const c = $("#cookie"); if (!c) return;
    if (store.get("consent", null)) { c.remove(); return; }
    const show = () => { c.classList.add("is-on"); removeEventListener("scroll", onS); };
    const onS = () => { if (scrollY > innerHeight * 0.8) show(); };
    addEventListener("scroll", onS, { passive: true });
    setTimeout(show, 9000);
    c.addEventListener("click", (e) => {
      const b = e.target.closest("[data-consent]"); if (!b) return;
      store.set("consent", { level: b.dataset.consent, at: new Date().toISOString() });
      track("consent", { level: b.dataset.consent });
      c.classList.remove("is-on"); setTimeout(() => c.remove(), 900);
    });
  }

  /* ---------- forms ---------- */
  function initForms() {
    document.addEventListener("submit", (e) => {
      const f = e.target;
      if (f.matches("[data-newsletter]")) {
        e.preventDefault();
        const em = f.querySelector("input[type=email]");
        if (!em.value || !em.checkValidity()) { em.focus(); return; }
        track("newsletter_signup");
        f.reset();
        toast(`<div><b>You're on the list</b><span>Welcome to Makhi. New collections reach you first.</span></div><span></span>`, { plain: true });
        sound.drip(0.8);
      } else if (f.matches("[data-form]")) {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        const ok = document.getElementById(f.dataset.form);
        track("form_submit", { form: f.id || f.dataset.form });
        if (f.dataset.wa) {
          const data = new FormData(f); const lines = [f.dataset.wa];
          for (const [k, v] of data.entries()) if (v && typeof v === "string") lines.push(`${k}: ${v}`);
          window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
        }
        f.hidden = true; ok?.classList.add("is-on"); ok?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
  }

  /* ---------- delegated clicks ---------- */
  function initDelegates() {
    document.addEventListener("click", (e) => {
      const t = e.target;
      let el;
      if ((el = t.closest("[data-add]"))) { e.preventDefault(); addToCart(el.dataset.add, Number(el.dataset.qty || 1), el); return; }
      if ((el = t.closest("[data-add-many]"))) { e.preventDefault(); addMany(el.dataset.addMany.split(",").map(Number)); return; }
      if ((el = t.closest("[data-wish]"))) { e.preventDefault(); toggleWish(el.dataset.wish, el); return; }
      if ((el = t.closest("[data-qv]"))) { e.preventDefault(); quickView(el.dataset.qv); return; }
      if ((el = t.closest("[data-open-cart]"))) { e.preventDefault(); closeOverlays(); openCart(); return; }
      if ((el = t.closest("[data-close], #scrim"))) { e.preventDefault(); closeOverlays(); return; }
      if ((el = t.closest("[data-q][data-id]"))) { const c = cart.find((x) => x.id === Number(el.dataset.id)); if (c) { c.qty = Math.max(0, c.qty + Number(el.dataset.q)); if (!c.qty) cart = cart.filter((x) => x !== c); saveCart(); } return; }
      if ((el = t.closest("[data-rm]"))) { cart = cart.filter((x) => x.id !== Number(el.dataset.rm)); saveCart(); return; }
      if ((el = t.closest(".theme-btn"))) { toggleTheme({ currentTarget: el }); return; }
      if ((el = t.closest(".sound-btn"))) { sound.toggle(); return; }
      if ((el = t.closest("[data-chat]"))) { e.preventDefault(); window.MakhiConcierge?.open(el.dataset.chat || ""); return; }
      if ((el = t.closest('a[href*="wa.me"]'))) { track("whatsapp_click", { from: location.pathname }); }
      if ((el = t.closest("[data-checkout]"))) { track("begin_checkout", { value: cartTotal() }); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeOverlays(); window.MakhiConcierge?.close(); } });
  }

  /* ---------- boot ---------- */
  function boot() {
    const saved = store.get("theme", null);
    if (saved) doc.dataset.theme = saved;
    initScroll();
    initHeader(); initAnnouncement(); initMenu(); initSearch(); initDelegates(); initForms(); initFooter();
    updateCounts(); renderCart();
    sound.init();
    initTransitions();
    initCookies();
    initCursor();
    window.Makhi.ready = initPreloader().then(() => {
      initReveals(); initMarquees(); initMagnetic();
      document.dispatchEvent(new CustomEvent("makhi:ready"));
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 300);
    });
    addEventListener("load", () => window.ScrollTrigger && ScrollTrigger.refresh());
    track("page_view", { path: location.pathname, theme: doc.dataset.theme });
  }

  window.Makhi = {
    ROOT, P, byId, bySlug, purl, pimg, siblings, baseKey, TYPE_LABEL, FINISHES, metalFinishes, I, WA, PHONE, EMAIL,
    fmt, fmt0, esc, card, mini, swatchHTML, priceHTML, toast, track, store, sound,
    addToCart, addMany, openCart, closeOverlays, toggleWish, isWished, quickView,
    cart: () => cart, cartTotal, setCart: (c) => { cart = c; saveCart(); }, wish: () => wish,
    initReveals, initMagnetic, splitLines, reduce, isMobile, lenis: () => lenis, $, $$
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
