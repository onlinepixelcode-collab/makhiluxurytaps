/* ==========================================================================
   MAKHI — pages.js : per-page behaviour
   ========================================================================== */
(() => {
  "use strict";
  const run = () => {
    const M = window.Makhi; if (!M) return setTimeout(run, 40);
    const { $, $$, P, byId, bySlug, fmt, esc, card, mini, pimg, purl, TYPE_LABEL, I, track, store } = M;
    const gsap = window.gsap, ST = window.ScrollTrigger;
    const page = document.body.dataset.page;
    const qs = new URLSearchParams(location.search);
    const FIN_TXT = {
      gold: ["Gold", "Warm, jewel-like and quietly opulent. Gold glows under soft light and pairs beautifully with marble, walnut and stone."],
      black: ["Black", "Matte and architectural. Black draws a confident line against white ceramics, concrete and pale timber."],
      silver: ["Silver", "Soft, brushed brightness that never dates — easy to match with existing fittings and every colour palette."],
      chrome: ["Chrome", "Mirror-bright and crisp. Chrome reflects light around the room and is the easiest finish to keep sparkling."],
      stainless: ["Stainless Steel", "Brushed, hard-wearing and honest. The natural partner for busy kitchens and steel sinks."]
    };

    /* ---------- common: sliders ---------- */
    $$(".pslider").forEach((sl) => {
      let down = false, sx = 0, sl0 = 0, moved = false;
      sl.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl0 = sl.scrollLeft; });
      addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; sl.classList.add("is-drag"); } sl.scrollLeft = sl0 - dx; });
      addEventListener("pointerup", () => { if (!down) return; down = false; sl.classList.remove("is-drag"); });
      sl.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      const sec = sl.closest("section") || sl.parentElement;
      $$("[data-slide]", sec).forEach((b) => b.addEventListener("click", () => sl.scrollBy({ left: Number(b.dataset.slide) * sl.clientWidth * 0.8, behavior: "smooth" })));
    });
    $$(".guide").forEach((g) => new IntersectionObserver(([en], o) => { if (en.isIntersecting) { g.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.3 }).observe(g));
    /* hotspots */
    document.addEventListener("click", (e) => {
      const d = e.target.closest(".hotspot__dot");
      $$(".hotspot.is-open").forEach((h) => { if (!d || h !== d.parentElement) h.classList.remove("is-open"); });
      if (d) {
        e.preventDefault();
        const hs = d.parentElement; hs.classList.toggle("is-open");
        // keep the product card fully on screen (phones especially)
        const c = hs.querySelector(".hotspot__card"); c.style.marginLeft = "0px";
        requestAnimationFrame(() => { const r = c.getBoundingClientRect(), pad = 12; let dx = 0; if (r.right > innerWidth - pad) dx = innerWidth - pad - r.right; if (r.left + dx < pad) dx = pad - r.left; c.style.marginLeft = dx + "px"; });
      }
    });
    /* reviews */
    $$(".rev").forEach((rev) => {
      const items = $$(".rev__item", rev), dots = $$(".rev__nav button", rev.parentElement);
      let i = 0, t;
      const go = (n) => { items[i].classList.remove("is-on"); dots[i]?.classList.remove("is-on"); i = (n + items.length) % items.length; items[i].classList.add("is-on"); dots[i]?.classList.add("is-on"); };
      dots.forEach((d, n) => d.addEventListener("click", () => { go(n); clearInterval(t); }));
      t = setInterval(() => go(i + 1), 7000);
    });
    /* accordions */
    document.addEventListener("click", (e) => {
      const q = e.target.closest(".acc__q"); if (!q) return;
      const it = q.parentElement, a = $(".acc__a", it), open = !it.classList.contains("is-open");
      it.classList.toggle("is-open", open); q.setAttribute("aria-expanded", open);
      a.style.height = open ? a.scrollHeight + "px" : "0px";
      setTimeout(() => ST && ST.refresh(), 650);
    });
    /* tabs */
    $$("[data-tabs]").forEach((tb) => {
      const btns = $$("[role=tab]", tb), panels = $$("[role=tabpanel]", tb);
      btns.forEach((b, i) => b.addEventListener("click", () => {
        btns.forEach((x) => x.setAttribute("aria-selected", x === b)); panels.forEach((p, j) => p.classList.toggle("is-on", j === i));
        setTimeout(() => ST && ST.refresh(), 100);
      }));
    });

    /* ======================= HOME ======================= */
    function home() {
      // Discover by room — crossfade background on hover/focus
      const rooms = $("#rooms");
      if (rooms) {
        const imgs = $$(".rooms__bg img", rooms), lis = $$(".rooms__list li", rooms), peek = $(".rooms__peek", rooms);
        const set = (li) => {
          const i = li.dataset.i;
          lis.forEach((l) => l.classList.toggle("is-on", l === li));
          imgs.forEach((im) => im.classList.toggle("is-on", im.dataset.i === i));
          if (peek && li.dataset.peek) { $("b", peek).textContent = li.dataset.peek; $("span", peek).textContent = li.dataset.peekPrice; $("img", peek).src = M.ROOT + li.dataset.peekImg; }
          M.sound.drip(0.25);
        };
        lis.forEach((li) => { li.addEventListener("mouseenter", () => set(li)); $("a", li).addEventListener("focus", () => set(li)); });
        if (!M.reduce && gsap) gsap.from($$(".rooms__list li", rooms), { y: 60, opacity: 0, duration: 1.3, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: rooms, start: "top 70%", once: true } });
      }
      // Signature collections — pinned horizontal strip
      const colls = $("#collections");
      if (colls) {
        const track = $(".colls__track", colls), names = $$(".cname", colls), cards = $$(".ccard", colls);
        const blurb = $(".colls__blurb", colls), link = $(".colls__link", colls), idx = $(".colls__i", colls);
        // --- background tone per card: sampled from lifestyle photos, finish-matched for product shots
        // literal item colours — the section takes on the colour of the piece in the centre
        const FIN_TONE = { gold: [190, 152, 86], black: [17, 17, 19], silver: [206, 209, 213], chrome: [222, 226, 230], stainless: [184, 188, 192], white: [238, 234, 226], blackwhite: [20, 20, 22] };
        const deepen = ([r, g, b]) => [r, g, b].map((v) => Math.round(v));
        const sample = (img) => new Promise((res) => {
          const go = () => { try { const c = document.createElement("canvas"); c.width = c.height = 24; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } res(deepen([r / n, g / n, b / n])); } catch (e) { res([14, 14, 16]); } };
          img.complete && img.naturalWidth ? go() : (img.addEventListener("load", go, { once: true }), img.loading = "eager");
        });
        const tones = cards.map((cd) => {
          const pid = cd.getAttribute("href").match(/product\/([^/]+)\//);
          const p = pid && bySlug.get(pid[1]);
          if (p) return Promise.resolve(FIN_TONE[p.finish] || [18, 18, 20]);
          const im = cd.querySelector(":scope > img");
          return im ? sample(im) : Promise.resolve([14, 14, 16]);
        });
        let toneArr = cards.map(() => [11, 11, 12]);
        Promise.all(tones).then((t) => { toneArr = t; });
        const bgNow = [11, 11, 12];
        let cur = -1;
        const setColl = (c) => {
          if (c === cur) return; cur = c;
          names.forEach((n) => { const on = Number(n.dataset.c) === c; n.classList.toggle("is-on", on); n.setAttribute("aria-hidden", !on); });
          const n = names[c];
          blurb.textContent = n.dataset.blurb; link.href = M.ROOT + n.dataset.link; idx.textContent = String(c + 1).padStart(2, "0");
        };
        // every frame while the section is on screen: blend background between the two cards nearest centre
        let live = false;
        new IntersectionObserver(([en]) => { live = en.isIntersecting; }).observe(colls);
        const tick = () => {
          requestAnimationFrame(tick);
          if (!live) return;
          const mid = innerWidth / 2; const ds = cards.map((cd) => { const r = cd.getBoundingClientRect(); return { cd, d: r.left + r.width / 2 - mid, w: r.width }; });
          ds.sort((a, b) => Math.abs(a.d) - Math.abs(b.d));
          const A = ds[0], B = ds[1] || ds[0];
          const ia = cards.indexOf(A.cd), ib = cards.indexOf(B.cd);
          // weight by distance so the colour glides as cards pass the centre
          const wa = Math.abs(B.d) / (Math.abs(A.d) + Math.abs(B.d) + 0.001);
          const target = toneArr[ia].map((v, i) => v * wa + toneArr[ib][i] * (1 - wa));
          for (let i = 0; i < 3; i++) bgNow[i] += (target[i] - bgNow[i]) * 0.08;
          colls.style.setProperty("--coll-bg", `rgb(${bgNow.map(Math.round).join(",")})`);
          // flip type & UI for light vs dark colours (with hysteresis so it doesn't flicker)
          const lum = (0.2126 * bgNow[0] + 0.7152 * bgNow[1] + 0.0722 * bgNow[2]) / 255;
          const isLight = colls.classList.contains("is-light");
          if (!isLight && lum > 0.56) { colls.classList.add("is-light"); colls.classList.remove("on-dark"); }
          else if (isLight && lum < 0.48) { colls.classList.remove("is-light"); colls.classList.add("on-dark"); }
          setColl(Number(A.cd.dataset.c));
        };
        requestAnimationFrame(tick);
        if (!M.isMobile() && !M.reduce && gsap && ST) {
          const dist = () => track.scrollWidth - innerWidth * 0.5 + innerWidth * 0.1;
          gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: colls, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } });
          cards.forEach((cd, i) => gsap.fromTo(cd, { y: i % 2 ? 40 : -30 }, { y: i % 2 ? -40 : 30, ease: "none", scrollTrigger: { trigger: colls, start: "top top", end: "bottom bottom", scrub: 1 } }));
        }
      }
      // Cobra: wordmark drifts, disc settles into place as you scroll
      const cx = $(".cx");
      if (cx && window.gsap && ST && !M.reduce) {
        gsap.fromTo($(".cx__word span", cx), { xPercent: 10 }, { xPercent: -14, ease: "none", scrollTrigger: { trigger: cx, start: "top bottom", end: "bottom top", scrub: 1 } });
        gsap.fromTo($(".cx__disc", cx), { scale: .84, rotate: -8 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: cx, start: "top 85%", end: "center center", scrub: 1 } });
        gsap.fromTo($(".cx__medal img", cx), { yPercent: 8 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: cx, start: "top bottom", end: "bottom top", scrub: 1 } });
      }
      // Finish switcher copy + list
      const fsw = $("#finish-switcher");
      if (fsw) {
        const story = $(".fsw__story", fsw), list = $(".fsw__list", fsw), all = $(".fsw__all", fsw), nameEl = $(".fsw__fin", fsw), sweep = $(".fsw__sweep", fsw);
        const render = (f) => {
          const items = P.filter((p) => p.finish === f && p.type !== "combo").slice(0, 8);
          list.innerHTML = items.length ? items.map(mini).join("") : '<p class="muted">Coming soon in this finish — ask Makhi for alternatives.</p>';
          all.href = M.ROOT + "shop/?finish=" + f; all.firstChild.textContent = `Shop all ${FIN_TXT[f][0].toLowerCase()} `;
        };
        render("chrome");
        $$(".sw-pick", fsw).forEach((b) => b.addEventListener("click", () => {
          const f = b.dataset.finish;
          $$(".sw-pick", fsw).forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
          document.dispatchEvent(new CustomEvent("makhi:finish", { detail: f }));
          nameEl.textContent = FIN_TXT[f][0];
          if (gsap) {
            gsap.fromTo(sweep, { xPercent: -120 }, { xPercent: 120, duration: 1.2, ease: "power2.inOut" });
            gsap.to(story, { opacity: 0, y: 12, duration: 0.25, onComplete: () => { story.innerHTML = `<h3 class="serif">${FIN_TXT[f][0]}</h3><p>${FIN_TXT[f][1]}</p>`; gsap.to(story, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }); } });
          }
          render(f); M.sound.drip(0.8);
          track("finish_switch", { finish: f, where: "home" });
        }));
      }
    }

    /* ======================= SHOP ======================= */
    function shop() {
      const grid = $("#grid"); if (!grid) return;
      const CATS = [["all", "All"], ["kitchen-faucet", "Kitchen Faucets"], ["basin-mixer", "Basin Mixers"], ["bath-mixer", "Bath Mixers"], ["freestanding-mixer", "Freestanding Mixers"], ["shower-mixer", "Shower Mixers"], ["shower-column", "Shower Columns"], ["walk-in", "Showers"], ["bath", "Baths"], ["basin", "Basins"], ["vanity", "Vanities"], ["toilet", "Toilets"], ["wall-tap", "Wall Taps"], ["combo", "Combo Deals"]];
      const st = { cat: qs.get("cat") || "all", finish: qs.get("finish") ? qs.get("finish").split(",") : [], room: qs.get("room") || "", coll: qs.get("collection") || "", mount: "", max: 30000, stock: false, q: qs.get("q") || "", sort: "featured", shown: 12 };
      if (st.cat === "walk-in") st.cat = "showers";
      const maxPrice = Math.max(...P.map((p) => p.price));
      const pills = $("#pills");
      pills.innerHTML = CATS.map(([k, l]) => `<button class="chip" data-cat="${k === "walk-in" ? "showers" : k}" aria-pressed="${(k === "walk-in" ? "showers" : k) === st.cat}">${l}</button>`).join("");
      pills.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (!b) return; st.cat = b.dataset.cat; st.shown = 12; $$("[data-cat]", pills).forEach((x) => x.setAttribute("aria-pressed", x === b)); apply(); });
      // filter panel
      const panel = $("#filters");
      $$("[data-open-filters]").forEach((b) => b.addEventListener("click", () => { panel.classList.add("is-on"); $("#scrim").classList.add("is-on"); M.lenis()?.stop(); }));
      const fFin = $("#fFinish"), fRoom = $("#fRoom"), fColl = $("#fColl"), fMount = $("#fMount"), fPrice = $("#fPrice"), fPriceV = $("#fPriceV"), fStock = $("#fStock");
      fPrice.max = Math.ceil(maxPrice / 500) * 500; fPrice.value = fPrice.max; st.max = Number(fPrice.max);
      const syncUI = () => {
        $$(".sw-pick", fFin).forEach((b) => { const on = st.finish.includes(b.dataset.finish); b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
        $$("[data-room]", fRoom).forEach((b) => b.setAttribute("aria-pressed", b.dataset.room === st.room));
        $$("[data-coll]", fColl).forEach((b) => b.setAttribute("aria-pressed", b.dataset.coll === st.coll));
        $$("[data-mount]", fMount).forEach((b) => b.setAttribute("aria-pressed", b.dataset.mount === st.mount));
        fPriceV.textContent = st.max >= Number(fPrice.max) ? "Any price" : "Up to " + fmt(st.max);
        fStock.checked = st.stock;
      };
      fFin.addEventListener("click", (e) => { const b = e.target.closest("[data-finish]"); if (!b) return; const f = b.dataset.finish; st.finish = st.finish.includes(f) ? st.finish.filter((x) => x !== f) : [...st.finish, f]; apply(); });
      fRoom.addEventListener("click", (e) => { const b = e.target.closest("[data-room]"); if (!b) return; st.room = st.room === b.dataset.room ? "" : b.dataset.room; apply(); });
      fColl.addEventListener("click", (e) => { const b = e.target.closest("[data-coll]"); if (!b) return; st.coll = st.coll === b.dataset.coll ? "" : b.dataset.coll; apply(); });
      fMount.addEventListener("click", (e) => { const b = e.target.closest("[data-mount]"); if (!b) return; st.mount = st.mount === b.dataset.mount ? "" : b.dataset.mount; apply(); });
      fPrice.addEventListener("input", () => { st.max = Number(fPrice.value); apply(); });
      fStock.addEventListener("change", () => { st.stock = fStock.checked; apply(); });
      $("#fReset").addEventListener("click", () => { Object.assign(st, { cat: "all", finish: [], room: "", coll: "", mount: "", max: Number(fPrice.max), stock: false, q: "" }); $$("[data-cat]", pills).forEach((x) => x.setAttribute("aria-pressed", x.dataset.cat === "all")); apply(); });
      $("#sort").addEventListener("change", (e) => { st.sort = e.target.value; apply(); });
      $("#more").addEventListener("click", () => { st.shown += 12; render(false); });
      $("#chips").addEventListener("click", (e) => {
        const c = e.target.closest("[data-rm-f]"); if (!c) return; const [k, v] = c.dataset.rmF.split(":");
        if (k === "finish") st.finish = st.finish.filter((x) => x !== v); else if (k === "cat") { st.cat = "all"; $$("[data-cat]", pills).forEach((x) => x.setAttribute("aria-pressed", x.dataset.cat === "all")); } else if (k === "max") st.max = Number(fPrice.max); else if (k === "stock") st.stock = false; else st[k] = "";
        apply();
      });
      let list = [];
      function filter() {
        let l = P.slice();
        if (st.cat === "showers") l = l.filter((p) => p.type === "walk-in" || p.type === "enclosed-shower");
        else if (st.cat !== "all") l = l.filter((p) => p.type === st.cat);
        if (st.finish.length) l = l.filter((p) => st.finish.includes(p.finish) || (st.finish.includes("silver") && p.finish === "chrome" && false));
        if (st.room) l = l.filter((p) => p.room === st.room || p.room === "both");
        if (st.coll === "cobra") l = l.filter((p) => p.collection === "cobra"); else if (st.coll === "combo") l = l.filter((p) => p.type === "combo");
        if (st.mount) l = l.filter((p) => (p.mount || "").toLowerCase().startsWith(st.mount));
        l = l.filter((p) => p.price <= st.max);
        if (st.stock) l = l.filter((p) => p.stock);
        if (st.q) { const w = st.q.toLowerCase().split(/\s+/); l = l.filter((p) => w.every((x) => (p.name + " " + (p.title || "") + " " + (TYPE_LABEL[p.type] || "") + " " + (p.finishLabel || "")).toLowerCase().includes(x))); }
        const s = st.sort;
        if (s === "low") l.sort((a, b) => a.price - b.price); else if (s === "high") l.sort((a, b) => b.price - a.price);
        else if (s === "new") l.sort((a, b) => b.id - a.id); else if (s === "sale") l.sort((a, b) => (b.was ? b.was - b.price : 0) - (a.was ? a.was - a.price : 0));
        else l.sort((a, b) => (b.stock - a.stock) || 0);
        return l;
      }
      const EDITORIALS = [
        { img: "assets/img/ls/kitchen-marble.webp", eyebrow: "The kitchen edit", h: "Spring, pull-out, <em>perfect.</em>", p: "Naledi, Andy and Veja — kitchen faucets that work as hard as they look.", href: "kitchen/", cta: "Explore kitchen" },
        { img: "assets/img/ls/bath-black-tub.webp", eyebrow: "Freestanding", h: "The bath as <em>sculpture.</em>", p: "Quartz-stone and fluted acrylic baths with floor-standing mixers to match.", href: "shop/?cat=bath", cta: "Shop baths" },
        { img: "assets/img/ls/bath-stone-vanity.webp", eyebrow: "Combo deals", h: "A whole suite, <em>one price.</em>", p: "Bath, mixer, vanity, toilet and shower — matched and bundled by our team.", href: "combo-deals/", cta: "See combo deals" }
      ];
      function editorial(i) {
        const e = EDITORIALS[i % EDITORIALS.length];
        return `<div class="editorial"><div class="editorial__img rv-water"><img src="${M.ROOT + e.img}" alt="" loading="lazy"></div><div class="editorial__copy"><span class="eyebrow">${e.eyebrow}</span><h3 class="serif">${e.h}</h3><p>${e.p}</p><a class="btn" href="${M.ROOT + e.href}">${e.cta} ${I.arrow}</a></div></div>`;
      }
      function render(reset = true) {
        const slice = list.slice(0, st.shown);
        let html = "";
        slice.forEach((p, i) => { html += card(p); if ((i + 1) % 6 === 0 && i + 1 < slice.length && list.length > 8) html += editorial(Math.floor(i / 6)); });
        grid.innerHTML = html || `<div class="empty-state" style="grid-column:1/-1"><div class="drop-ico">${I.logo}</div><h4>Nothing in this combination.</h4><p>Loosen a filter — or ask Makhi to find the closest match.</p><button class="btn mt-m" data-chat="">Ask Makhi</button></div>`;
        $("#count").textContent = `${list.length} piece${list.length === 1 ? "" : "s"}`;
        const more = $("#more"); more.hidden = st.shown >= list.length;
        $(".load-more__bar i").style.transform = `scaleX(${Math.min(1, st.shown / Math.max(1, list.length))})`;
        $(".load-more__txt").textContent = `Showing ${Math.min(st.shown, list.length)} of ${list.length}`;
        M.initReveals(grid);
        if (gsap && !M.reduce) gsap.from($$(".pcard", grid).slice(reset ? 0 : st.shown - 12), { opacity: 0, y: 40, duration: 1, ease: "expo.out", stagger: 0.04 });
        ST && ST.refresh();
      }
      function chipsUI() {
        const c = [];
        if (st.cat !== "all") c.push([`cat:${st.cat}`, (CATS.find((x) => x[0] === st.cat) || [0, "Showers"])[1]]);
        st.finish.forEach((f) => c.push([`finish:${f}`, f[0].toUpperCase() + f.slice(1)]));
        if (st.room) c.push([`room:${st.room}`, st.room === "kitchen" ? "Kitchen" : "Bathroom"]);
        if (st.coll) c.push([`coll:${st.coll}`, st.coll === "cobra" ? "Cobra Range" : "Combo Deals"]);
        if (st.mount) c.push([`mount:${st.mount}`, st.mount[0].toUpperCase() + st.mount.slice(1)]);
        if (st.max < Number(fPrice.max)) c.push([`max:${st.max}`, "Up to " + fmt(st.max)]);
        if (st.stock) c.push(["stock:1", "In stock"]);
        if (st.q) c.push([`q:${st.q}`, `“${st.q}”`]);
        $("#chips").innerHTML = c.map(([k, l]) => `<button class="chip" data-rm-f="${esc(k)}">${esc(l)}</button>`).join("") + `<span class="result-count" id="count"></span>`;
        $("#fCount").textContent = c.length ? `(${c.length})` : "";
      }
      function apply() {
        list = filter(); chipsUI(); syncUI(); render();
        const u = new URLSearchParams();
        if (st.cat !== "all") u.set("cat", st.cat); if (st.finish.length) u.set("finish", st.finish.join(",")); if (st.room) u.set("room", st.room); if (st.coll) u.set("collection", st.coll); if (st.q) u.set("q", st.q);
        history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
        track("filter", { ...st, results: list.length });
      }
      apply();
      const h1 = $("#shopTitle");
      if (h1 && st.q) h1.innerHTML = `Results for <em>${esc(st.q)}</em>`;
    }

    /* ======================= PRODUCT ======================= */
    function product() {
      const root = $("[data-product]"); if (!root) return;
      const p = bySlug.get(root.dataset.product); if (!p) return;
      const stage = $(".stage", root), mainImg = $(".stage .tile img", root), thumbs = $$(".thumbs button[data-img]", root);
      let idx = 0;
      const show = (i, dir = 1) => {
        idx = (i + p.images.length) % p.images.length;
        thumbs.forEach((t, j) => t.classList.toggle("is-on", j === idx));
        if (gsap && !M.reduce) gsap.fromTo(mainImg, { opacity: 0, x: 30 * dir }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" });
        mainImg.src = M.ROOT + p.images[idx];
        $(".stage__counter", root).textContent = `${String(idx + 1).padStart(2, "0")} / ${String(p.images.length).padStart(2, "0")}`;
      };
      thumbs.forEach((t, j) => t.addEventListener("click", () => { stage.classList.remove("is-flow", "is-spin"); show(j, j > idx ? 1 : -1); }));
      // zoom
      const tileEl = $(".stage .tile", root);
      tileEl.addEventListener("click", () => { if (stage.classList.contains("is-spin")) return; stage.classList.toggle("is-zoom"); });
      tileEl.addEventListener("pointermove", (e) => { const r = tileEl.getBoundingClientRect(); stage.style.setProperty("--zx", ((e.clientX - r.left) / r.width * 100) + "%"); stage.style.setProperty("--zy", ((e.clientY - r.top) / r.height * 100) + "%"); });
      tileEl.addEventListener("pointerleave", () => stage.classList.remove("is-zoom"));
      // 360 drag through angles
      const spinBtn = $("[data-spin]", root);
      spinBtn?.addEventListener("click", () => { stage.classList.remove("is-flow", "is-zoom"); stage.classList.toggle("is-spin"); track("viewer_360", { id: p.id }); });
      let sx = null, si = 0;
      tileEl.addEventListener("pointerdown", (e) => { if (!stage.classList.contains("is-spin")) return; sx = e.clientX; si = idx; tileEl.setPointerCapture(e.pointerId); });
      tileEl.addEventListener("pointermove", (e) => { if (sx === null) return; const step = Math.round((e.clientX - sx) / 60); const n = (si + step + p.images.length * 10) % p.images.length; if (n !== idx) { idx = n; mainImg.src = M.ROOT + p.images[idx]; thumbs.forEach((t, j) => t.classList.toggle("is-on", j === idx)); } });
      tileEl.addEventListener("pointerup", () => { sx = null; });
      // water flow
      const flowBtn = $("[data-flow]", root);
      let flowMounted = false;
      flowBtn?.addEventListener("click", () => {
        stage.classList.remove("is-spin", "is-zoom"); stage.classList.toggle("is-flow");
        if (!flowMounted && window.MakhiWater) { window.MakhiWater.mount($(".stage__flow canvas", root), { warm: p.finish === "gold" ? 0.9 : 0.2, scale: 0.6 }); flowMounted = true; }
      });
      // finish swatches → sibling variants
      $$(".pdp__fins .sw-pick", root).forEach((b) => b.addEventListener("click", (e) => {
        if (b.disabled || b.classList.contains("is-active")) return;
        const href = b.dataset.href; if (!href) return;
        e.preventDefault();
        track("finish_switch", { from: p.finish, to: b.dataset.finish, where: "product" });
        const wipe = $(".stage__wipe", root);
        if (gsap && !M.reduce && wipe) {
          wipe.style.background = getComputedStyle($(".sw", b)).backgroundImage;
          gsap.fromTo(wipe, { clipPath: "circle(0% at 50% 100%)" }, { clipPath: "circle(150% at 50% 100%)", duration: 0.9, ease: "expo.inOut", onComplete: () => { location.href = href; } });
        } else location.href = href;
      }));
      // qty / add / buy
      let qty = 1; const qEl = $("#pdpQty");
      $$("[data-pq]", root).forEach((b) => b.addEventListener("click", () => { qty = Math.max(1, Math.min(20, qty + Number(b.dataset.pq))); qEl.textContent = qty; $("#pdpAdd").dataset.qty = qty; }));
      $("#pdpBuy")?.addEventListener("click", () => { M.addToCart(p.id, qty, $("#pdpBuy")); track("buy_now", { id: p.id }); setTimeout(() => { location.href = M.ROOT + "checkout/"; }, 700); });
      // postal code
      $("#postalBtn")?.addEventListener("click", () => {
        const v = $("#postal").value.trim(), out = $("#postalRes");
        if (!/^\d{4}$/.test(v)) { out.textContent = "Please enter a 4-digit South African postal code."; return; }
        const n = Number(v); const gp = (n >= 1 && n <= 299) || (n >= 1400 && n <= 2199);
        out.innerHTML = gp ? `We deliver to ${v} — Gauteng. <span class="placeholder">Delivery time: client to confirm</span>` : `We deliver nationwide to ${v}. <span class="placeholder">Delivery time &amp; fee: client to confirm</span>`;
        track("delivery_estimate", { code: v });
      });
      // sticky ATC (mobile)
      const bar = $(".atc-bar");
      if (bar && ST) ST.create({ trigger: "#pdpAdd", start: "bottom top", onEnter: () => bar.classList.add("is-on"), onLeaveBack: () => bar.classList.remove("is-on") });
      // recently viewed
      const rv = store.get("recent", []).filter((x) => x !== p.id); rv.unshift(p.id); store.set("recent", rv.slice(0, 12));
      track("view_item", { id: p.id, name: p.name, price: p.price });
      // ask on WhatsApp
      $$("[data-ask]", root).forEach((a) => { a.href = `https://wa.me/${M.WA}?text=${encodeURIComponent(`Hi Makhi, I'm interested in the ${p.name} (${fmt(p.price)}).\n${location.href}`)}`; });
    }

    /* ======================= VISUALISER ======================= */
    function visualiser() {
      const host = $("#viz"); if (!host) return;
      const metal = new Set(["gold", "black", "silver", "chrome", "stainless"]);
      const SCENES = {
        bathroom: [
          { k: "mirror", label: "Vanity & basin", types: ["vanity"], def: "vanity-set-006-800mm-black" },
          { k: "basin", label: "Basin", types: ["basin"], def: "aiyi-round-basin-black-and-white" },
          { k: "mixer", label: "Basin mixer", types: ["basin-mixer"], def: "swan-tall-gold-basin-mixer", metal: true },
          { k: "shower", label: "Shower", types: ["walk-in", "enclosed-shower"], def: "nebula-walkin-shower-1200x2000-tinted-black" },
          { k: "column", label: "Shower column", types: ["shower-column", "shower-mixer"], def: "multifunctional-shower-column-matt-black", metal: true },
          { k: "toilet", label: "Toilet", types: ["toilet"], def: "luxus-closed-coupled-suite-black" },
          { k: "fmixer", label: "Freestanding mixer", types: ["freestanding-mixer"], def: "muda-gold-freestanding-bath-mixer", metal: true },
          { k: "bath", label: "Bath", types: ["bath"], def: "amor-freestanding-quartz-stone-bath-black-and-white" }
        ],
        kitchen: [
          { k: "kfaucet", label: "Kitchen faucet", types: ["kitchen-faucet"], def: "naledi-gold-spring-kitchen-mixer", metal: true },
          { k: "wtap", label: "Wall-mounted tap", types: ["wall-tap"], def: "zula-flexible-wall-mounted-faucets", metal: true },
          { k: "sink", label: "Kitchen sink", types: ["sink"], def: null }
        ]
      };
      const saved = store.get("vizLast", null);
      const state = { scene: qs.get("room") === "kitchen" ? "kitchen" : "bathroom", pick: {}, sel: null };
      Object.entries(SCENES).forEach(([sc, slots]) => slots.forEach((s) => { const d = bySlug.get(s.def); state.pick[s.k] = d ? d.id : null; }));
      if (saved && saved.pick) Object.assign(state.pick, saved.pick);
      const add = qs.get("add") && bySlug.get(qs.get("add"));
      if (add) { for (const [sc, slots] of Object.entries(SCENES)) { const s = slots.find((x) => x.types.includes(add.type)); if (s) { state.scene = sc; state.pick[s.k] = add.id; state.sel = s.k; } } }

      const grad = (f) => ({ gold: "url(#vGold)", black: "url(#vBlack)", silver: "url(#vSilver)", chrome: "url(#vChrome)", stainless: "url(#vSteel)" }[f] || "url(#vChrome)");
      const cer = (p, part = "outer") => { if (!p) return "#e9e6e0"; if (p.finish === "black") return "#141416"; if (p.finish === "blackwhite") return part === "outer" ? "#141416" : "#f2efe9"; return "#f2efe9"; };
      const pk = (k) => byId.get(state.pick[k]);

      function bathroomSVG() {
        const mx = pk("mixer"), bs = pk("basin"), vn = pk("mirror"), sh = pk("shower"), col = pk("column"), wc = pk("toilet"), fm = pk("fmixer"), bt = pk("bath");
        const mF = grad(mx?.finish), cF = grad(col?.finish), fF = grad(fm?.finish);
        const tall = mx && /tall/i.test(mx.name);
        const tint = sh && /tinted|nebula/i.test(sh.name);
        const enclosed = sh && sh.type === "enclosed-shower";
        const fluted = bt && /fluted/i.test(bt.name);
        const slipper = bt && /carol|curved/i.test(bt.name);
        const bathPath = slipper ? "M935 560 Q930 520 970 515 L1240 515 Q1300 500 1310 470 Q1325 520 1300 560 Q1280 640 1200 650 L1010 650 Q945 640 935 560z"
          : "M920 535 Q920 515 945 515 L1290 515 Q1315 515 1315 535 Q1310 640 1210 652 L1025 652 Q925 640 920 535z";
        const column = col && col.type === "shower-mixer"
          ? `<circle cx="560" cy="430" r="26" fill="${cF}"/><rect x="556" y="404" width="8" height="18" rx="3" fill="${cF}"/><path d="M560 250 L560 210 L600 210" stroke="${cF}" stroke-width="6" fill="none"/><rect x="590" y="206" width="44" height="8" rx="3" fill="${cF}"/>`
          : `<rect x="548" y="220" width="22" height="300" rx="6" fill="${cF}"/><rect x="540" y="216" width="70" height="10" rx="4" fill="${cF}"/><circle cx="559" cy="330" r="6" fill="#0b0b0c" opacity=".35"/><circle cx="559" cy="360" r="6" fill="#0b0b0c" opacity=".35"/><circle cx="559" cy="390" r="6" fill="#0b0b0c" opacity=".35"/>`;
        const vanityColor = vn ? (vn.finish === "black" ? "#161618" : "#efebe4") : "#efebe4";
        return `
        <defs>${gradsDefs()}
          <linearGradient id="vWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--viz-wall-1)"/><stop offset="1" stop-color="var(--viz-wall-2)"/></linearGradient>
          <radialGradient id="vSpot" cx=".5" cy="0" r=".8"><stop offset="0" stop-color="#fff6e0" stop-opacity=".22"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></radialGradient>
          <pattern id="vTiles" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="var(--viz-line)" stroke-width="1"/></pattern>
        </defs>
        <rect width="1400" height="800" fill="url(#vWall)"/>
        <rect width="1400" height="650" fill="url(#vTiles)" opacity=".7"/>
        <ellipse cx="260" cy="0" rx="300" ry="520" fill="url(#vSpot)"/><ellipse cx="1110" cy="0" rx="340" ry="560" fill="url(#vSpot)"/>
        <path d="M0 650 H1400 V800 H0z" fill="var(--viz-floor)"/><path d="M0 650 H1400" stroke="var(--viz-gold)" stroke-width="1"/>
        <path d="M860 120 Q1110 40 1360 120 V650 H860z" fill="var(--viz-niche)" opacity=".7"/>
        ${slot("mirror", vn, `<g><ellipse cx="270" cy="250" rx="70" ry="110" fill="none" stroke="var(--viz-gold)" stroke-width="2"/><ellipse cx="270" cy="250" rx="62" ry="102" fill="var(--viz-mirror)"/>
          <rect x="120" y="470" width="300" height="130" rx="10" fill="${vanityColor}" class="outline" stroke="transparent"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${132 + i * 20} 480 V590" stroke="${vn?.finish === "black" ? "#2a2a2d" : "#d9d3c8"}" stroke-width="2"/>`).join("")}
          <rect x="110" y="458" width="320" height="14" rx="3" fill="${vn?.finish === "black" ? "#222" : "#e2ddd3"}"/></g>`, 270, 540)}
        ${slot("basin", bs, `<path d="M205 458 Q205 410 270 410 Q335 410 335 458z" fill="${cer(bs)}" class="outline" stroke="transparent"/><path d="M215 452 Q215 420 270 420 Q325 420 325 452z" fill="${cer(bs, "inner")}" opacity=".9"/>`, 270, 430)}
        ${slot("mixer", mx, tall
          ? `<g fill="${mF}"><rect x="341" y="330" width="16" height="130" rx="4"/><path d="M349 335 V250 Q349 205 305 205 Q275 205 272 240" stroke="${mF}" stroke-width="7" fill="none"/><path d="M272 236 q-8 18 0 30 q8 -12 0 -30z" /><rect x="356" y="380" width="26" height="4" rx="2" transform="rotate(-35 356 380)"/></g>`
          : `<g fill="${mF}"><rect x="341" y="400" width="16" height="60" rx="4"/><path d="M349 405 V375 Q349 345 315 345 Q298 345 296 365" stroke="${mF}" stroke-width="7" fill="none"/><path d="M296 362 q-7 14 0 24 q7 -10 0 -24z"/><rect x="356" y="430" width="22" height="4" rx="2" transform="rotate(-35 356 430)"/></g>`, 349, tall ? 280 : 380)}
        ${slot("shower", sh, enclosed
          ? `<g><rect x="470" y="170" width="200" height="480" fill="${tint ? "rgba(20,20,22,.45)" : "rgba(180,210,225,.14)"}" stroke="var(--viz-frame)" stroke-width="5"/><path d="M570 170 V650" stroke="var(--viz-frame)" stroke-width="3"/><rect x="560" y="390" width="4" height="60" fill="var(--viz-frame)"/></g>`
          : `<g><rect x="640" y="170" width="20" height="480" fill="${tint ? "rgba(20,20,22,.55)" : "rgba(180,210,225,.2)"}" stroke="var(--viz-frame)" stroke-width="4"/><rect x="470" y="170" width="190" height="480" fill="${tint ? "rgba(20,20,22,.4)" : "rgba(180,210,225,.12)"}" stroke="var(--viz-frame)" stroke-width="4"/>${tint ? "" : `<path d="M470 290 H660 M470 410 H660 M470 530 H660" stroke="var(--viz-frame)" stroke-width="2"/>`}</g>`, 565, 600)}
        ${slot("column", col, column, 560, 300)}
        ${slot("toilet", wc, /wall/i.test(wc?.name || "") ? `<g><rect x="700" y="420" width="120" height="120" rx="6" fill="var(--viz-niche)" opacity=".6"/><path d="M710 540 H830 Q835 600 790 610 H735 Q705 600 710 540z" fill="${cer(wc)}" class="outline" stroke="transparent"/></g>`
          : `<g><rect x="712" y="430" width="100" height="120" rx="10" fill="${cer(wc)}" class="outline" stroke="transparent"/><path d="M700 552 H830 Q830 600 795 612 L790 650 H735 L730 612 Q700 600 700 552z" fill="${cer(wc)}"/><rect x="745" y="440" width="34" height="6" rx="3" fill="var(--viz-gold)" opacity=".6"/></g>`, 765, 520)}
        ${slot("bath", bt, `<g><path d="${bathPath}" fill="${cer(bt)}" class="outline" stroke="transparent"/>${fluted ? Array.from({ length: 18 }, (_, i) => `<path d="M${950 + i * 19} 525 Q${948 + i * 19} 600 ${960 + i * 19} 645" stroke="#d8d3ca" stroke-width="2" fill="none"/>`).join("") : ""}<path d="M940 530 H1295" stroke="${cer(bt, "inner")}" stroke-width="10" stroke-linecap="round" opacity=".95"/></g>`, 1115, 590)}
        ${slot("fmixer", fm, `<g fill="${fF}"><ellipse cx="880" cy="650" rx="24" ry="5"/><rect x="874" y="380" width="12" height="270" rx="4"/><path d="M880 385 Q880 352 915 352 L945 352 Q960 352 960 368 L960 380" stroke="${fF}" stroke-width="8" fill="none"/><rect x="866" y="470" width="28" height="10" rx="4"/><path d="M860 470 L860 430" stroke="${fF}" stroke-width="6"/></g>`, 880, 450)}`;
      }
      function kitchenSVG() {
        const kf = pk("kfaucet"), wt = pk("wtap");
        const kF = grad(kf?.finish), wF = grad(wt?.finish);
        const spring = kf && /naledi|spring/i.test(kf.name);
        return `
        <defs>${gradsDefs()}<linearGradient id="vWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--viz-wall-1)"/><stop offset="1" stop-color="var(--viz-wall-2)"/></linearGradient>
          <pattern id="vSub" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 0H60M0 15H60M30 0V15M0 15V30" fill="none" stroke="var(--viz-line)" stroke-width="1"/></pattern></defs>
        <rect width="1400" height="800" fill="url(#vWall)"/>
        <rect x="0" y="170" width="1400" height="300" fill="url(#vSub)" opacity=".8"/>
        <rect x="0" y="0" width="1400" height="170" fill="var(--viz-niche)"/>${[200, 520, 840, 1160].map((x) => `<rect x="${x}" y="20" width="260" height="130" rx="4" fill="none" stroke="var(--viz-line)" stroke-width="2"/>`).join("")}
        <path d="M700 0 V120" stroke="var(--viz-gold)" stroke-width="1.5"/><path d="M660 120 h80 l-14 40 h-52z" fill="var(--viz-gold)"/><ellipse cx="700" cy="180" rx="160" ry="30" fill="#fff6e0" opacity=".12"/>
        <rect x="0" y="470" width="1400" height="26" fill="var(--viz-counter)"/><rect x="0" y="496" width="1400" height="304" fill="var(--viz-cab)"/>
        ${[0, 280, 560, 840, 1120].map((x) => `<rect x="${x + 14}" y="512" width="252" height="270" rx="4" fill="none" stroke="var(--viz-line)" stroke-width="2"/><rect x="${x + 120}" y="530" width="40" height="4" rx="2" fill="var(--viz-gold)"/>`).join("")}
        ${slot("sink", null, `<rect x="560" y="462" width="280" height="16" rx="4" fill="#a9adb2" class="outline" stroke="transparent"/><rect x="580" y="470" width="240" height="8" fill="#6f747a"/>`, 700, 470)}
        ${slot("kfaucet", kf, spring
          ? `<g fill="${kF}"><ellipse cx="760" cy="462" rx="22" ry="5"/><rect x="752" y="380" width="16" height="84" rx="4"/><path d="M760 385 V250 Q760 205 715 205 Q680 205 680 245 V300" stroke="${kF}" stroke-width="8" fill="none"/>${Array.from({ length: 12 }, (_, i) => `<ellipse cx="760" cy="${262 + i * 10}" rx="12" ry="3" fill="none" stroke="${kF}" stroke-width="3"/>`).join("")}<rect x="672" y="296" width="16" height="34" rx="5"/><rect x="768" y="420" width="30" height="5" rx="2" transform="rotate(-30 768 420)"/></g>`
          : `<g fill="${kF}"><ellipse cx="760" cy="462" rx="22" ry="5"/><rect x="752" y="400" width="16" height="64" rx="4"/><path d="M760 405 V280 Q760 230 710 230 Q675 230 672 270 V300" stroke="${kF}" stroke-width="9" fill="none"/><rect x="664" y="296" width="16" height="30" rx="5"/><rect x="768" y="430" width="30" height="5" rx="2" transform="rotate(-30 768 430)"/></g>`, 740, 320)}
        ${slot("wtap", wt, `<g fill="${wF}"><circle cx="1080" cy="260" r="14"/><path d="M1080 260 H1050 Q1020 260 1020 300 V330" stroke="${wF}" stroke-width="8" fill="none"/>${Array.from({ length: 6 }, (_, i) => `<ellipse cx="${1060 - i * 6}" cy="${262 + i * 6}" rx="4" ry="7" fill="none" stroke="${wF}" stroke-width="2"/>`).join("")}<rect x="1012" y="326" width="16" height="12" rx="3"/></g>`, 1050, 300)}`;
      }
      function gradsDefs() {
        return `<linearGradient id="vGold" x1="0" x2="1"><stop offset="0" stop-color="#8E6C2E"/><stop offset=".35" stop-color="#F3DFA6"/><stop offset=".6" stop-color="#C8A45D"/><stop offset="1" stop-color="#7c5d24"/></linearGradient>
          <linearGradient id="vBlack" x1="0" x2="1"><stop offset="0" stop-color="#0a0a0b"/><stop offset=".4" stop-color="#3a3a3e"/><stop offset=".6" stop-color="#151517"/><stop offset="1" stop-color="#050505"/></linearGradient>
          <linearGradient id="vSilver" x1="0" x2="1"><stop offset="0" stop-color="#8d9096"/><stop offset=".4" stop-color="#ffffff"/><stop offset=".65" stop-color="#c9cbcf"/><stop offset="1" stop-color="#7d8086"/></linearGradient>
          <linearGradient id="vChrome" x1="0" x2="1"><stop offset="0" stop-color="#6f7881"/><stop offset=".3" stop-color="#ffffff"/><stop offset=".5" stop-color="#9aa3ac"/><stop offset=".7" stop-color="#ffffff"/><stop offset="1" stop-color="#5f6770"/></linearGradient>
          <linearGradient id="vSteel" x1="0" x2="1"><stop offset="0" stop-color="#8f9398"/><stop offset=".5" stop-color="#d6d8db"/><stop offset="1" stop-color="#8f9398"/></linearGradient>`;
      }
      function slot(k, p, inner, px, py) {
        const sel = state.sel === k ? " is-sel" : "";
        return `<g class="fit${sel}" data-slot="${k}" tabindex="0" role="button" aria-label="Change ${esc(slotDef(k).label)}${p ? ": " + esc(p.name) : ""}">${inner}<g class="pin" transform="translate(${px} ${py})"><circle class="r" r="9"/><circle class="p" r="7"/></g></g>`;
      }
      const slotDef = (k) => SCENES[state.scene].find((s) => s.k === k) || SCENES.bathroom.concat(SCENES.kitchen).find((s) => s.k === k);
      const svg = $("#vizSvg"), side = $("#vizList"), pickBox = $("#vizPick"), total = $("#vizTotal");
      const fitSvg = () => svg.setAttribute("preserveAspectRatio", M.isMobile() ? "xMidYMid meet" : "xMidYMid slice");
      fitSvg(); addEventListener("resize", fitSvg);
      function draw() {
        svg.innerHTML = state.scene === "kitchen" ? kitchenSVG() : bathroomSVG();
        const slots = SCENES[state.scene];
        side.innerHTML = slots.map((s) => {
          const p = pk(s.k);
          return `<div class="viz__row${state.sel === s.k ? " is-sel" : ""}" data-slot="${s.k}" role="button" tabindex="0">${p ? `<div class="tile"><img src="${pimg(p)}" alt=""></div>` : `<div class="tile" style="display:grid;place-items:center;color:var(--gold-text)">—</div>`}<div><b>${s.label}</b><span>${p ? esc(p.name) : (s.k === "sink" ? "Coming soon" : "Choose")}</span></div><span class="price">${p ? fmt(p.price) : ""}</span></div>`;
        }).join("");
        const sum = slots.reduce((a, s) => a + (pk(s.k)?.price || 0), 0);
        total.textContent = fmt(sum);
        $$("[data-scene]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.scene === state.scene));
        drawPick();
        store.set("vizLast", { pick: state.pick });
      }
      function drawPick() {
        if (!state.sel) { pickBox.classList.remove("is-on"); return; }
        const s = slotDef(state.sel);
        pickBox.classList.add("is-on");
        $("h4", pickBox).textContent = "Choose " + s.label.toLowerCase();
        const opts = P.filter((p) => s.types.includes(p.type));
        $(".viz__opts", pickBox).innerHTML = opts.length ? opts.map((p) => `<button class="viz__opt${state.pick[s.k] === p.id ? " is-on" : ""}" data-opt="${p.id}"><div class="tile"><img src="${pimg(p)}" alt="" loading="lazy"></div><span>${esc(p.name)}</span><small>${fmt(p.price)}${p.stock ? "" : " · sold out"}</small></button>`).join("")
          : `<p style="font-size:14px">Kitchen sinks are coming soon to Makhi. <a href="https://wa.me/${M.WA}?text=${encodeURIComponent("Hi Makhi, which kitchen sinks do you have available?")}" target="_blank" rel="noopener" style="color:var(--gold-text);text-decoration:underline">Ask our team on WhatsApp</a>.</p>`;
      }
      host.addEventListener("click", (e) => {
        const sl = e.target.closest("[data-slot]"); if (sl) { state.sel = sl.dataset.slot; draw(); track("visualiser_select", { slot: state.sel }); M.sound.drip(0.4); if (M.isMobile()) pickBox.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
        const op = e.target.closest("[data-opt]"); if (op) { state.pick[state.sel] = Number(op.dataset.opt); draw(); track("visualiser_swap", { slot: state.sel, id: op.dataset.opt }); M.sound.drip(0.6); return; }
        const sc = e.target.closest("[data-scene]"); if (sc) { state.scene = sc.dataset.scene; state.sel = null; draw(); return; }
        const mf = e.target.closest("[data-match]"); if (mf) { matchFinish(mf.dataset.match); $$("[data-match]").forEach((b) => b.classList.toggle("is-on", b === mf)); return; }
      });
      host.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-slot]")) { e.preventDefault(); e.target.click(); } });
      function matchFinish(f) {
        let changed = 0, missing = [];
        SCENES[state.scene].forEach((s) => {
          if (!s.metal) return;
          const cur = pk(s.k);
          const same = P.filter((p) => s.types.includes(p.type) && p.finish === f);
          if (!same.length) { missing.push(s.label); return; }
          const pref = cur && same.find((p) => M.baseKey(p) === M.baseKey(cur));
          state.pick[s.k] = (pref || same.find((p) => p.stock) || same[0]).id; changed++;
        });
        draw();
        track("visualiser_match", { finish: f });
        M.toast(`<div><b>Matched to ${f}</b><span>${changed} fitting${changed === 1 ? "" : "s"} switched${missing.length ? ` · not stocked in ${f}: ${missing.join(", ")}` : ""}.</span></div><span></span>`, { plain: true });
      }
      $("#vizAdd").addEventListener("click", () => { const ids = SCENES[state.scene].map((s) => state.pick[s.k]).filter((id) => id && byId.get(id)?.stock); M.addMany(ids); track("visualiser_add_room", { count: ids.length }); });
      $("#vizSave").addEventListener("click", () => {
        const ds = store.get("designs", []);
        ds.unshift({ at: new Date().toISOString(), scene: state.scene, ids: SCENES[state.scene].map((s) => state.pick[s.k]).filter(Boolean) });
        store.set("designs", ds.slice(0, 20));
        M.toast(`<div><b>Design saved</b><span>Find it any time under Account → Saved designs.</span></div><a href="${M.ROOT}account/#designs">View</a>`, { plain: true });
        track("visualiser_save");
      });
      $("#vizWa").addEventListener("click", (e) => {
        const items = SCENES[state.scene].map((s) => pk(s.k)).filter(Boolean);
        const sum = items.reduce((a, p) => a + p.price, 0);
        const msg = [`Hi Makhi, here's the ${state.scene} I designed on your website:`, ...items.map((p) => `• ${p.name} — ${fmt(p.price)}`), `Total: ${fmt(sum)}`].join("\n");
        e.currentTarget.href = `https://wa.me/${M.WA}?text=${encodeURIComponent(msg)}`;
        track("visualiser_whatsapp");
      });
      if (qs.get("finish")) { matchFinish(qs.get("finish")); }
      draw();
      track("visualiser_open");
    }

    /* ======================= WISHLIST ======================= */
    function wishlist() {
      const g = $("#wishGrid"); if (!g) return;
      const r = () => {
        const ids = M.wish();
        g.innerHTML = ids.length ? ids.map((id) => byId.get(id)).filter(Boolean).map((p) => card(p)).join("")
          : `<div class="empty-state" style="grid-column:1/-1"><div class="drop-ico">${I.heart}</div><h4>Nothing saved — yet.</h4><p>Tap the heart on any piece to keep it here.</p><a class="btn mt-m" href="${M.ROOT}shop/">Explore the collection ${I.arrow}</a></div>`;
        $("#wishCount").textContent = ids.length;
        $("#wishAll").hidden = !ids.length;
        $("#wishAll").dataset.addMany = ids.join(",");
      };
      r(); document.addEventListener("makhi:wish", () => setTimeout(r, 300));
    }

    /* ======================= CHECKOUT ======================= */
    function checkout() {
      const sum = $("#coItems"); if (!sum) return;
      const draw = () => {
        const c = M.cart();
        if (!c.length) { $("#coWrap").hidden = true; $("#coEmpty").hidden = false; return; }
        sum.innerHTML = c.map((x) => { const p = byId.get(x.id); return p ? `<div class="ci" style="grid-template-columns:64px 1fr auto"><div class="tile"><img src="${pimg(p)}" alt=""></div><div><span class="ci__name" style="font-size:18px">${esc(p.name)}</span><span class="ci__meta">Qty ${x.qty}</span></div><span class="price">${fmt(p.price * x.qty)}</span></div>` : ""; }).join("");
        const sub = M.cartTotal();
        $("#coSub").textContent = fmt(sub);
        $("#coTotal").textContent = fmt(sub);
      };
      draw();
      $$("input[name=method]").forEach((r) => r.addEventListener("change", () => { $("#coAddress").hidden = r.value === "collect" && r.checked; $("#coShip").textContent = r.value === "collect" ? "Free — collect in Edenvale" : "Confirmed by our team"; }));
      $("#coForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.target;
        if ($("#coAddress").hidden) $$("#coAddress [required]").forEach((i) => i.removeAttribute("required"));
        if (!f.checkValidity()) { f.reportValidity(); return; }
        const no = "MK-" + String(Date.now()).slice(-6);
        const order = { no, at: Date.now(), items: M.cart(), total: M.cartTotal(), stage: 0, name: f.fname.value, pay: (new FormData(f)).get("pay") };
        const orders = store.get("orders", []); orders.unshift(order); store.set("orders", orders);
        track("purchase", { no, value: order.total, items: order.items.length, payment: order.pay });
        M.setCart([]);
        $("#coWrap").hidden = true;
        const ok = $("#coDone"); ok.hidden = false;
        $("#coNo").textContent = no;
        $("#coTrack").href = M.ROOT + "track-order/?no=" + no;
        window.scrollTo({ top: 0, behavior: "smooth" });
        M.sound.drip(1);
      });
    }

    /* ======================= TRACKING / ACCOUNT ======================= */
    const STEPS = ["Placed", "Packed", "Dispatched", "Delivered"];
    const stageOf = (o) => Math.min(3, Math.floor((Date.now() - o.at) / (1000 * 60 * 2)));
    function timeline(o) {
      const s = stageOf(o);
      return `<div class="tl">${STEPS.map((n, i) => `<div class="tl__s${i <= s ? " done" : ""}${i === s ? " now" : ""}"><i>${I.check}</i><b>${n}</b><small>${i <= s ? new Date(o.at + i * 120000).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</small></div>`).join("")}<span class="tl__fill" style="width:${s / 3 * 76}%"></span></div>`;
    }
    function orderCard(o) {
      return `<div class="order-card"><div class="order-card__h"><div><span class="label" style="color:var(--gold-text)">Order</span><br><b>${esc(o.no)}</b></div><div class="ta-c"><span class="label">Items</span><br>${o.items.reduce((a, b) => a + b.qty, 0)}</div><div style="text-align:right"><span class="label">Total</span><br><span class="price">${fmt(o.total)}</span></div></div>${timeline(o)}</div>`;
    }
    function trackPage() {
      const f = $("#trackForm"); if (!f) return;
      const out = $("#trackOut");
      const find = (no) => {
        const o = store.get("orders", []).find((x) => x.no.toLowerCase() === no.trim().toLowerCase());
        track("track_order", { found: !!o });
        out.innerHTML = o ? orderCard(o) + `<p class="muted" style="font-size:13px">Demo tracking — live courier updates connect here in production.</p>`
          : `<div class="order-card"><h3 class="serif" style="font-size:30px">We couldn't find ${esc(no)} on this device.</h3><p>Our team can check it for you right away.</p><a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${M.WA}?text=${encodeURIComponent("Hi Makhi, please could you check order " + no)}">${I.wa} Ask on WhatsApp</a></div>`;
      };
      f.addEventListener("submit", (e) => { e.preventDefault(); find(f.no.value); });
      if (qs.get("no")) { f.no.value = qs.get("no"); find(qs.get("no")); }
    }
    function account() {
      const tabs = $$(".acct__nav button"); if (!tabs.length) return;
      const panels = $$(".acct__panel");
      const show = (id) => { tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.t === id)); panels.forEach((p) => p.classList.toggle("is-on", p.id === "p-" + id)); };
      tabs.forEach((t) => t.addEventListener("click", () => { show(t.dataset.t); history.replaceState(null, "", "#" + t.dataset.t); }));
      if (location.hash) show(location.hash.slice(1));
      const orders = store.get("orders", []);
      $("#accOrders").innerHTML = orders.length ? orders.map(orderCard).join("") : `<div class="empty-state"><div class="drop-ico">${I.logo}</div><h4>No orders yet.</h4><p>When you order, you'll follow it here — placed, packed, dispatched, delivered.</p><a class="btn mt-m" href="${M.ROOT}shop/">Start shopping ${I.arrow}</a></div>`;
      $("#accWish").innerHTML = M.wish().map((id) => byId.get(id)).filter(Boolean).map((p) => card(p)).join("") || `<p class="muted">Your wishlist is empty.</p>`;
      const ds = store.get("designs", []);
      if ($("#accDesigns")) $("#accDesigns").innerHTML = ds.length ? ds.map((d, i) => { const ps = d.ids.map((id) => byId.get(id)).filter(Boolean); const tot = ps.reduce((a, p) => a + p.price, 0); return `<div class="order-card"><div class="order-card__h"><div><span class="label" style="color:var(--gold-text)">${d.scene}</span><br><b>Design ${ds.length - i}</b></div><div class="price">${fmt(tot)}</div></div><div class="flex gap-s wrap-f">${ps.map((p) => `<div class="tile" style="width:72px;height:72px" title="${esc(p.name)}"><img src="${pimg(p)}" alt="${esc(p.name)}"></div>`).join("")}</div><div class="flex gap-s wrap-f mt-m"><button class="btn btn--sm" data-add-many="${ps.filter((p) => p.stock).map((p) => p.id).join(",")}">Add all to cart</button><a class="btn btn--sm btn--ghost" href="${M.ROOT}design-your-space/">Open visualiser</a></div></div>`; }).join("") : `<p class="muted">No saved designs yet. <a href="${M.ROOT}design-your-space/" style="color:var(--gold-text);text-decoration:underline">Design your space</a>.</p>`;
      const addr = store.get("address", null);
      const af = $("#addrForm");
      if (addr) Object.entries(addr).forEach(([k, v]) => { if (af[k]) af[k].value = v; });
      af.addEventListener("submit", (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(af).entries()); store.set("address", d); M.toast(`<div><b>Address saved</b><span>We'll pre-fill it at checkout.</span></div><span></span>`, { plain: true }); });
    }

    /* ======================= FAQ search ======================= */
    function faqs() {
      const inp = $("#faqQ"); if (!inp) return;
      inp.addEventListener("input", () => {
        const q = inp.value.toLowerCase().trim();
        $$(".acc__item").forEach((it) => { it.hidden = q && !it.textContent.toLowerCase().includes(q); });
        $$(".faq-cat").forEach((c) => { c.hidden = !$$(".acc__item", c).some((i) => !i.hidden); });
        $("#faqNone").hidden = $$(".acc__item").some((i) => !i.hidden);
      });
    }

    /* ======================= ABOUT story ======================= */
    function about() {
      const imgs = $$(".story__img > *"); if (!imgs.length || !ST) return;
      $$(".story__chapters > div").forEach((ch, i) => ST.create({ trigger: ch, start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive) imgs.forEach((im, j) => im.classList.toggle("is-on", j === i)); } }));
    }

    /* ======================= Cobra / collection pages ======================= */
    function finishPages() {
      $$(".fin-swap").forEach((wrap) => {
        $$(".sw-pick", wrap).forEach((b) => b.addEventListener("click", () => {
          $$(".sw-pick", wrap).forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
          const f = b.dataset.finish;
          const grid = document.getElementById(wrap.dataset.target);
          $$(".pcard", grid).forEach((c) => { const p = byId.get(Number(c.dataset.pid)); c.hidden = f !== "all" && p.finish !== f; });
          track("finish_switch", { finish: f, where: page });
        }));
      });
    }

    const PAGES = { home, shop, product, visualiser, wishlist, checkout, track: trackPage, account, faqs, about };
    const go = () => { (PAGES[page] || (() => {}))(); finishPages(); };
    (M.ready || Promise.resolve()).then(go);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
