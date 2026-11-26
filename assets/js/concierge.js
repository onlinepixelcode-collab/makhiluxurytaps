/* ==========================================================================
   MAKHI CONCIERGE — on-page AI assistant
   Runs on a built-in catalogue reasoning engine (no data leaves the page).
   Swap `think()` for a call to your LLM endpoint in production.
   ========================================================================== */
(() => {
  "use strict";
  const M = window.Makhi; if (!M) return;
  const { P, fmt, esc, pimg, purl, TYPE_LABEL, I, WA, track, store } = M;

  const ctx = { room: null, finish: null, budget: null, type: null, last: [], history: [], awaiting: null };

  const FIN = { gold: ["gold", "brass", "golden"], black: ["black", "matte", "matt", "noir", "dark"], silver: ["silver", "brushed"], chrome: ["chrome", "shiny", "polished"], stainless: ["stainless", "steel"], white: ["white"], blackwhite: ["black and white", "black & white", "two-tone", "two tone"] };
  const TYPES = [
    ["kitchen-faucet", ["kitchen tap", "kitchen faucet", "kitchen mixer", "sink tap", "sink faucet", "pull-out", "pullout", "pull out", "pull-down", "spring"]],
    ["freestanding-mixer", ["freestanding mixer", "floor standing", "floor-standing", "freestanding bath mixer", "freestanding tap", "bath filler"]],
    ["bath-mixer", ["bath mixer", "bath tap", "wall bath"]],
    ["shower-mixer", ["shower mixer", "diverter", "concealed"]],
    ["shower-column", ["shower column", "column", "rain shower", "shower panel"]],
    ["basin-mixer", ["basin mixer", "basin tap", "vanity tap", "bathroom tap", "mixer", "tall tap", "gooseneck"]],
    ["walk-in", ["walk-in", "walk in", "walkin", "screen"]],
    ["enclosed-shower", ["enclosure", "enclosed", "pivot", "cubicle", "shower door"]],
    ["bath", ["bath", "bathtub", "tub"]],
    ["basin", ["basin", "bowl", "vessel"]],
    ["vanity", ["vanity", "cabinet"]],
    ["toilet", ["toilet", "loo", "wc", "suite", "close coupled", "closed coupled", "wall hung", "wall-hung"]],
    ["wall-tap", ["wall mounted tap", "wall tap", "wall-mounted"]],
    ["combo", ["combo", "bundle", "package", "deal"]]
  ];

  const has = (s, arr) => arr.some((w) => s.includes(w));
  const parseFinish = (s) => { for (const [k, ws] of Object.entries(FIN)) if (k === "blackwhite" && has(s, ws)) return k; for (const [k, ws] of Object.entries(FIN)) if (k !== "blackwhite" && has(s, ws)) return k; return null; };
  const parseType = (s) => { for (const [k, ws] of TYPES) if (has(s, ws)) return k; return null; };
  const parseBudget = (s) => {
    const m = s.replace(/,/g, "").match(/(?:under|below|less than|max|budget|up to|within|around|r)\s*r?\s*(\d+(?:\.\d+)?)\s*(k)?/i) || s.replace(/,/g, "").match(/r\s?(\d{3,6})/i);
    if (!m) return null; let v = parseFloat(m[1]); if (m[2] || (v < 100 && /k\b/i.test(s))) v *= 1000; return v >= 200 ? v : null;
  };
  const parseRoom = (s) => (/(kitchen|sink|cook)/.test(s) ? "kitchen" : /(bathroom|bath|shower|en-?suite|loo|toilet|basin|vanity)/.test(s) ? "bathroom" : null);

  function find({ type, finish, budget, room, limit = 4, stockFirst = true }) {
    let list = P.filter((p) => p.type !== "combo" || type === "combo");
    if (type) list = list.filter((p) => p.type === type);
    if (room && !type) list = list.filter((p) => p.room === room || p.room === "both");
    if (finish) { const f = list.filter((p) => p.finish === finish); if (f.length) list = f; }
    if (budget) { const b = list.filter((p) => p.price <= budget); list = b.length ? b : list.sort((a, c) => a.price - c.price).slice(0, 2); }
    list.sort((a, c) => (stockFirst ? (c.stock - a.stock) : 0) || (budget ? c.price - a.price : (c.was ? 1 : 0) - (a.was ? 1 : 0)) || a.price - c.price);
    return list.slice(0, limit);
  }

  /* ---------- UI ---------- */
  let el, body, input;
  function build() {
    el = document.createElement("section");
    el.className = "chat"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Ask Makhi chat"); el.setAttribute("aria-modal", "false");
    el.innerHTML = `
      <header class="chat__head">
        <div class="chat__avatar">${I.logo}</div>
        <div class="chat__title"><b>Ask Makhi</b></div>
        <a class="icon-btn" href="https://wa.me/${WA}" target="_blank" rel="noopener" aria-label="Continue on WhatsApp" data-wa-handoff>${I.wa}</a>
        <button class="icon-btn" data-chat-close aria-label="Close chat">${I.close}</button>
      </header>
      <div class="chat__body" aria-live="polite"></div>
      <div class="chat__chips"></div>
      <form class="chat__form" autocomplete="off"><label class="sr-only" for="chatIn">Message Ask Makhi</label><input id="chatIn" placeholder="Ask about taps, finishes, delivery…" maxlength="300"><button type="button" class="chat__mic" aria-label="Speak to Ask Makhi" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg><i class="chat__wave" aria-hidden="true"></i></button><button aria-label="Send">${I.arrow}</button></form>`;
    document.body.appendChild(el);
    body = el.querySelector(".chat__body"); input = el.querySelector("input");
    el.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ""; user(v); });
    el.addEventListener("click", (e) => {
      const c = e.target.closest("[data-say]"); if (c) { user(c.dataset.say); return; }
      if (e.target.closest("[data-chat-close]")) close();
      const wa = e.target.closest("[data-wa-handoff]"); if (wa) { wa.href = waLink(); track("whatsapp_click", { from: "concierge" }); }
    });
    el.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
    initVoice();
    greet();
  }
  function chips(list) {
    el.querySelector(".chat__chips").innerHTML = list.map((c) => `<button class="chip" data-say="${esc(c)}">${esc(c)}</button>`).join("");
  }
  function bot(html, extra = "") {
    const t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(t); scroll();
    const delay = Math.min(1400, 450 + html.length * 3);
    return new Promise((res) => setTimeout(() => {
      t.remove();
      const m = document.createElement("div"); m.className = "msg msg--bot";
      m.innerHTML = `<div class="bubble">${html}</div>${extra}`;
      body.appendChild(m); scroll(); ctx.history.push({ who: "bot", text: m.textContent.slice(0, 240) });
      if (ctx.voice) speak(m.querySelector(".bubble").textContent);
      res();
    }, delay));
  }
  /* ---------- voice: speak to Ask Makhi, hear the answer ---------- */
  let rec = null;
  function initVoice() {
    const btn = el.querySelector(".chat__mic");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { btn.addEventListener("click", () => bot("Voice input isn't supported in this browser yet — try Chrome or Safari, or type your question.")); return; }
    rec = new SR(); rec.lang = "en-ZA"; rec.interimResults = true; rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e) => { let t = ""; for (const r of e.results) t += r[0].transcript; input.value = t; finalText = t; };
    rec.onend = () => { btn.classList.remove("is-on"); btn.setAttribute("aria-pressed", "false"); const v = finalText.trim(); finalText = ""; if (v) { input.value = ""; ctx.voice = true; user(v); } };
    rec.onerror = () => { btn.classList.remove("is-on"); };
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-on")) { rec.stop(); return; }
      window.speechSynthesis && speechSynthesis.cancel();
      try { rec.start(); btn.classList.add("is-on"); btn.setAttribute("aria-pressed", "true"); input.placeholder = "Listening…"; track("ai_voice"); } catch (e) {}
      setTimeout(() => { input.placeholder = "Ask about taps, finishes, delivery…"; }, 6000);
    });
    input.addEventListener("keydown", () => { ctx.voice = false; });
  }
  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace(/\s+/g, " ").slice(0, 400));
    u.lang = "en-ZA"; u.rate = 1; u.pitch = 1;
    const v = speechSynthesis.getVoices().find((x) => /en-ZA|en-GB/.test(x.lang) && /female|samantha|serena|kate|google uk/i.test(x.name)) || speechSynthesis.getVoices().find((x) => /^en/.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  function user(text) {
    const m = document.createElement("div"); m.className = "msg msg--user"; m.innerHTML = `<div class="bubble">${esc(text)}</div>`;
    body.appendChild(m); scroll(); ctx.history.push({ who: "you", text });
    track("ai_chat", { q: text.slice(0, 80) });
    think(text);
  }
  function scroll() { requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; }); }
  const cards = (list) => `<div class="chat-cards">${list.map((p) => `<div class="chat-card"><a href="${purl(p)}" class="tile"><img src="${pimg(p)}" alt="" loading="lazy"></a><div class="chat-card__b"><a href="${purl(p)}" class="chat-card__n">${esc(p.type === "combo" ? p.title : p.name)}</a><div class="chat-card__row"><span>${fmt(p.price)}</span>${p.stock ? `<button data-add="${p.id}">Add</button>` : '<small class="muted">Sold out</small>'}</div></div></div>`).join("")}</div>`;

  function waLink() {
    const lines = ["Hi Makhi, I was chatting to Ask Makhi on your website."];
    if (ctx.room) lines.push(`Room: ${ctx.room}`);
    if (ctx.finish) lines.push(`Finish: ${ctx.finish}`);
    if (ctx.budget) lines.push(`Budget: ${fmt(ctx.budget)}`);
    if (ctx.last.length) lines.push("Products I liked:", ...ctx.last.slice(0, 6).map((p) => `• ${p.name} — ${fmt(p.price)}`));
    const asked = ctx.history.filter((h) => h.who === "you").slice(-4).map((h) => `• ${h.text}`);
    if (asked.length) lines.push("My questions:", ...asked);
    return `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  /* ---------- the brain ---------- */
  async function think(raw) {
    const s = " " + raw.toLowerCase() + " ";
    const finish = parseFinish(s), type = parseType(s), budget = parseBudget(s), room = parseRoom(s);
    if (finish) ctx.finish = finish; if (budget) ctx.budget = budget; if (room) ctx.room = room;

    // awaiting order number
    if (ctx.awaiting === "order") {
      const num = (raw.match(/mk-?\d{4,}|\d{4,}/i) || [])[0];
      if (num) { ctx.awaiting = null; return trackOrder(num); }
    }
    if (ctx.awaiting === "trade" && raw.length > 8) {
      ctx.awaiting = null;
      return bot(`Thank you — that's everything our trade desk needs to start. I've prepared a WhatsApp message with your project brief so a specialist can quote you directly.`, `<div class="chat-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent("Trade / project enquiry from the website:\n" + raw)}">${I.wa} Send to trade desk</a><a class="btn btn--ghost" href="${M.ROOT}trade/">Trade &amp; Projects</a></div>`);
    }

    if (/^\s*(hi|hello|hey|howzit|sawubona|molo|dumela|good (morning|afternoon|evening))\b/.test(raw.toLowerCase())) {
      chips(["Kitchen", "Bathroom", "Find my perfect tap", "Delivery & returns"]);
      return bot("Hello, and welcome to Makhi. Are we designing a <strong>kitchen</strong> or a <strong>bathroom</strong> today?");
    }
    if (has(s, ["whatsapp", "human", "real person", "agent", "speak to", "talk to", "call me", "consultant"])) return handoff();
    if (has(s, ["track", "where is my order", "order status", "my order", "delivery status", "order number"])) {
      const num = (raw.match(/mk-?\d{4,}|\d{5,}/i) || [])[0];
      if (num) return trackOrder(num);
      ctx.awaiting = "order";
      chips(["I don't have it", "Talk to us on WhatsApp"]);
      return bot("Of course. Please share your <strong>order number</strong> (it starts with MK and is in your confirmation email) and I'll check where it is.");
    }
    if (ctx.awaiting === "order" && has(s, ["don't have", "dont have", "lost", "no number"])) { ctx.awaiting = null; return handoff("No problem — our team can find it with your name or phone number."); }
    if (has(s, ["return", "refund", "exchange", "cooling", "change my mind", "defect", "broken", "damaged"])) return returns();
    if (has(s, ["warranty", "guarantee"])) return warranty();
    if (has(s, ["pay", "payment", "payjustnow", "laybuy", "lay-by", "layby", "eft", "card", "instalment", "installment", "cash"])) return payments();
    if (has(s, ["deliver", "shipping", "courier", "collect", "pickup", "pick up", "how long"])) return delivery();
    if (has(s, ["trade", "bulk", "developer", "contractor", "architect", "plumber", "interior designer", "project", "wholesale", "quote"])) {
      ctx.awaiting = "trade";
      return bot(`Wonderful — we supply developers, architects, interior designers, plumbers and contractors. Tell me in one message: <strong>your company, the project, quantities</strong> and <strong>which products or finishes</strong> you have in mind, and I'll pass it straight to our trade desk.`);
    }
    if (has(s, ["clean", "care", "maintain", "maintenance", "scratch", "limescale", "tarnish"])) return care(finish);
    if (has(s, ["install", "plumber", "fit it", "fitting", "installation"])) return install();
    if (has(s, ["address", "showroom", "store", "visit", "where are you", "location", "hours", "open"])) return visit();

    // compatibility
    if (has(s, ["compatible", "compatibility", "will it fit", "suit my basin", "which mixer for", "my basin"]) && !has(s, ["vessel", "countertop", "undermount", "inset"])) {
      chips(["Vessel / countertop basin", "Inset / undermount basin", "Wall-mounted vs deck-mounted", "Pull-out faucet for my sink"]);
      return bot("Happy to check. What kind of basin or sink is it — a <strong>vessel (sits on the counter)</strong>, an <strong>inset/undermount</strong> basin, or a <strong>kitchen sink</strong>? And is the tap going on the <strong>deck or the wall</strong>?");
    }
    if (has(s, ["vessel", "countertop", "countertop basin", "counter top", "above counter", "sit on", "bowl basin", "on top of"])) {
      const list = find({ type: "basin-mixer", finish: ctx.finish }).filter((p) => /tall/i.test(p.name));
      const fallback = list.length ? list : P.filter((p) => /swan tall/i.test(p.name));
      ctx.last = fallback;
      chips(["Show short mixers", "Plan my bathroom", "Match a finish"]);
      return bot(`For a <strong>vessel or countertop basin</strong> you'll want a <strong>tall mixer</strong> so the spout clears the rim and lands near the centre of the bowl. Our Swan Tall has a high gooseneck made exactly for this.${ctx.finish ? "" : " Here they are in every finish:"}`, cards(fallback));
    }
    if (has(s, ["undermount", "under mount", "inset", "drop-in basin", "recessed", "built-in basin", "short mixer"])) {
      const list = P.filter((p) => /swan short/i.test(p.name) && (!ctx.finish || p.finish === ctx.finish));
      ctx.last = list.length ? list : P.filter((p) => /swan short/i.test(p.name));
      return bot("For an <strong>inset, under-mounted or semi-recessed basin</strong>, a <strong>short (standard-height) deck mixer</strong> is right — the spout sits over the bowl without splashing.", cards(ctx.last));
    }
    if (has(s, ["wall-mounted vs", "wall mounted vs", "deck vs", "deck-mounted", "deck mounted", "difference between wall", "wall or deck"])) {
      return bot(`<p><strong>Deck-mounted</strong> taps sit on the basin or counter — easiest to install and replace, ideal for vanities and kitchen sinks.</p><p><strong>Wall-mounted</strong> taps come out of the wall — a cleaner, more architectural look that frees up counter space, but plumbing must be chased into the wall before tiling.</p><p>Tip: with a wall tap, the spout should overhang the bowl by roughly a third of the basin depth.</p>`, cards([...P.filter((p) => p.mount === "Wall-mounted" && p.type !== "shower-column").slice(0, 2), ...P.filter((p) => /swan short/i.test(p.name)).slice(0, 2)]));
    }
    if (has(s, ["pull-out", "pullout", "pull out", "pull-down", "spray", "rinse"]) || (type === "kitchen-faucet" && has(s, ["sink"]))) {
      const list = find({ type: "kitchen-faucet", finish: ctx.finish, budget: ctx.budget, limit: 5 });
      ctx.last = list;
      chips(["Show me gold", "Under R1,000", "Match a finish"]);
      return bot(`Pull-out and spring kitchen faucets suit any single-hole sink. The <strong>Naledi</strong> spring faucets give you spray and stream with a pro-kitchen look; <strong>Andy</strong> and <strong>Veja</strong> have a sleek pull-out head that retracts neatly.${ctx.budget ? ` Within ${fmt(ctx.budget)}:` : ""}`, cards(list));
    }

    // build a set
    if (has(s, ["plan my bathroom", "full bathroom", "whole bathroom", "complete bathroom", "matching set", "build", "set in", "full set", "everything in", "design my", "plan my kitchen", "full kitchen"])) {
      if (ctx.room === "kitchen" || has(s, ["kitchen"])) return kitchenSet(ctx.finish);
      if (!ctx.finish) { ctx.awaiting = "setfinish"; chips(["Gold", "Black", "Silver", "Chrome"]); return bot("Let's design it together. Which <strong>finish</strong> would you like to carry through the whole room?"); }
      return bathroomSet(ctx.finish, ctx.budget);
    }
    if (ctx.awaiting === "setfinish" && finish) { ctx.awaiting = null; return ctx.room === "kitchen" ? kitchenSet(finish) : bathroomSet(finish, ctx.budget); }
    if (has(s, ["match a finish", "match my finish", "which finish", "finishes", "compare finish", "gold or black", "black or gold"]) && !type) return finishes();
    if (has(s, ["find my perfect tap", "perfect tap", "recommend", "suggest", "help me choose", "which tap"]) && !type) {
      chips(["Kitchen tap", "Basin mixer", "Freestanding bath mixer", "Shower mixer"]);
      return bot("With pleasure. Which tap are we choosing — for the <strong>kitchen sink</strong>, a <strong>basin</strong>, a <strong>freestanding bath</strong> or the <strong>shower</strong>? You can also tell me a finish and budget, e.g. <em>“black basin mixer under R1,500”</em>.");
    }

    // room only
    if ((raw.trim().toLowerCase() === "kitchen" || raw.trim().toLowerCase() === "bathroom") || (room && !type && !finish && raw.split(" ").length <= 3)) {
      ctx.room = room;
      if (room === "kitchen") { chips(["Pull-out faucet", "Show me gold", "Plan my kitchen", "Under R1,000"]); return bot("Beautiful. For the kitchen we have spring and pull-out faucets in gold, black, silver and chrome, plus flexible wall-mounted taps. What matters most — <strong>a finish</strong>, <strong>a pull-out spray</strong>, or <strong>budget</strong>?"); }
      chips(["Basin mixer", "Freestanding bath", "Shower column", "Plan my bathroom"]);
      return bot("Lovely. A bathroom can be anything from a single basin mixer to a full suite. Shall I suggest a <strong>basin mixer</strong>, a <strong>freestanding bath</strong>, a <strong>shower</strong> — or <strong>plan the whole bathroom</strong> in one finish?");
    }

    // product name lookup
    const words = raw.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const named = P.filter((p) => words.some((w) => p.name.toLowerCase().split(/[\s—]+/).includes(w) && !["mixer", "basin", "black", "gold", "silver", "chrome", "white", "bath", "kitchen", "faucet", "shower", "the", "and", "freestanding"].includes(w)));
    if (named.length && !type) {
      ctx.last = named.slice(0, 5);
      return bot(`Here's what I found for “${esc(raw)}”:`, cards(ctx.last));
    }

    // recommendation by type/finish/budget
    if (type || finish || budget) {
      const t = type || ctx.type; if (type) ctx.type = type;
      const list = find({ type: t, finish: ctx.finish, budget: ctx.budget, room: ctx.room, limit: 5 });
      if (!list.length) return bot("I couldn't find an exact match — shall I show you the closest pieces, or ask our team on WhatsApp?", `<div class="chat-actions"><button class="btn btn--ghost" data-say="Show me everything">Show the closest</button></div>`);
      ctx.last = list;
      const label = t ? (TYPE_LABEL[t] || "pieces").toLowerCase() + (t === "combo" ? "s" : "s") : "pieces";
      const fl = ctx.finish ? ` in <strong>${ctx.finish === "blackwhite" ? "black & white" : ctx.finish}</strong>` : "";
      const bl = ctx.budget ? ` within <strong>${fmt(ctx.budget)}</strong>` : "";
      const note = t && ctx.finish && !list.some((p) => p.finish === ctx.finish) ? `<p class="muted" style="margin-top:8px">We don't currently stock this in ${ctx.finish}, so here are the closest alternatives.</p>` : "";
      chips(["Plan my bathroom", "Is it compatible with my basin?", "Delivery & returns", "Talk to us on WhatsApp"]);
      return bot(`My pick of ${label}${fl}${bl}:${note}`, cards(list));
    }
    if (has(s, ["thank", "thanks", "dankie", "ngiyabonga", "cheers"])) return bot("It's a pleasure. If you'd like, I can send everything we discussed to our team on WhatsApp so they can help you finalise.", `<div class="chat-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink()}">${I.wa} Send summary</a></div>`);
    if (has(s, ["everything", "show me all", "all products"])) { ctx.last = find({ limit: 6 }); return bot("A few signature pieces to start with:", cards(ctx.last)); }

    chips(["Find my perfect tap", "Match a finish", "Plan my bathroom", "Track my order", "Delivery & returns", "Talk to us on WhatsApp"]);
    return bot(`I want to get this right for you. Try telling me the <strong>room</strong>, <strong>finish</strong> and <strong>budget</strong> — e.g. <em>“gold freestanding bath mixer”</em> or <em>“kitchen tap under R1,000”</em> — or I can hand you to our team on WhatsApp.`);
  }

  function bathroomSet(fin, budget) {
    const pick = (type, pref) => {
      let l = P.filter((p) => p.type === type && p.stock);
      const f = l.filter((p) => p.finish === fin); if (f.length) l = f;
      if (pref) { const pr = l.filter(pref); if (pr.length) l = pr; }
      return l.sort((a, b) => a.price - b.price)[0];
    };
    const ceramic = fin === "black" ? "black" : (fin === "gold" ? "white" : "white");
    const set = [
      pick("basin-mixer"),
      pick("freestanding-mixer"),
      pick("shower-column") || pick("shower-mixer"),
      (() => { let l = P.filter((p) => p.type === "bath" && p.stock); const c = l.filter((p) => p.finish === (fin === "black" ? "blackwhite" : "white")); return (c.length ? c : l).sort((a, b) => a.price - b.price)[0]; })(),
      (() => { let l = P.filter((p) => p.type === "basin" && p.stock); const c = l.filter((p) => fin === "black" ? /black/i.test(p.name) : true); return (c.length ? c : l)[0]; })(),
      (() => { let l = P.filter((p) => p.type === "toilet" && p.stock); const c = l.filter((p) => fin === "black" ? /black/i.test(p.name) : /white|ts021/i.test(p.name)); return (c.length ? c : l).sort((a, b) => a.price - b.price)[0]; })()
    ].filter(Boolean);
    ctx.last = set;
    const total = set.reduce((a, b) => a + b.price, 0);
    const finTxt = fin === "blackwhite" ? "black & white" : fin;
    const missing = set.filter((p) => ["basin-mixer", "freestanding-mixer", "shower-column", "shower-mixer"].includes(p.type) && p.finish !== fin).length;
    track("ai_set_built", { finish: fin, total });
    return bot(`Here's a complete bathroom carried through in <strong>${finTxt}</strong>: basin mixer, freestanding bath mixer, shower, bath, basin and toilet.${missing ? ` <span class="muted">(A piece or two isn't stocked in ${finTxt}, so I've chosen the closest match.)</span>` : ""}${budget && total > budget ? ` <p class="muted" style="margin-top:8px">It comes in above your ${fmt(budget)} budget — our <strong>Combo Deals</strong> bundle similar suites at one price.</p>` : ""}`,
      cards(set) + `<div class="chat-total"><span>Set total</span><b>${fmt(total)}</b></div><div class="chat-actions"><button class="btn" data-add-many="${set.map((p) => p.id).join(",")}">Add whole set</button><a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink()}">${I.wa} WhatsApp it</a></div>`);
  }
  function kitchenSet(fin) {
    const fau = P.filter((p) => p.type === "kitchen-faucet" && p.stock && (!fin || p.finish === fin));
    const set = [...(fau.length ? fau : P.filter((p) => p.type === "kitchen-faucet" && p.stock)).slice(0, 2), ...P.filter((p) => p.type === "wall-tap")].slice(0, 3);
    ctx.last = set;
    return bot(`For the kitchen${fin ? ` in <strong>${fin}</strong>` : ""}: a statement sink faucet plus a flexible wall-mounted tap for filling pots. <span class="muted">Kitchen sinks are coming soon — ask our team for current options.</span>`,
      cards(set) + `<div class="chat-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink()}">${I.wa} Ask about sinks</a></div>`);
  }
  function finishes() {
    chips(["Show me gold", "Show me black", "Care for my finish", "Plan my bathroom"]);
    return bot(`<p><strong>Gold</strong> — warm and jewel-like; beautiful with marble, walnut and soft lighting.</p><p><strong>Black</strong> — matte and architectural; striking against white ceramics and concrete.</p><p><strong>Silver &amp; Chrome</strong> — bright, timeless and the easiest to match with existing fittings.</p><p><strong>Stainless steel</strong> — brushed and hard-wearing for busy kitchens.</p><p>Tell me which finish you're leaning towards and I'll show you every piece in it.</p>`);
  }
  function care(fin) {
    return bot(`<p>To keep any Makhi finish looking new:</p><ul><li>Wipe with a soft cloth and a mix of <strong>half dish-washing liquid, half water</strong>, then rinse.</li><li>No polishing needed — <strong>never use aggressive cleaners, bleach or scourers</strong>.</li><li>Dry after use in hard-water areas to prevent limescale spots.</li></ul>${fin === "black" ? "<p>Matte black especially benefits from gentle cleaning only — abrasives can leave a sheen.</p>" : ""}<p class="muted">Note: the warranty doesn't cover limescale or damage from harsh cleaners.</p>`);
  }
  function returns() {
    chips(["Warranty", "Payments", "Talk to us on WhatsApp"]);
    return bot(`<p><strong>Change of mind (7 days):</strong> return unused, uninstalled items in original packaging within 7 days of delivery or collection. A 15% handling fee applies; the delivery fee is non-refundable.</p><p><strong>Defective, damaged or wrong item:</strong> under the Consumer Protection Act you have 6 months for defects — report within 48 hours with photos and we'll repair, replace or refund.</p><p>Start a return by WhatsApp or calling <strong>068 146 5775</strong> with your order number and photos. Approved refunds are paid in 7–10 working days.</p>`, `<div class="chat-actions"><a class="btn btn--ghost" href="${M.ROOT}refund-returns/">Full policy</a></div>`);
  }
  function warranty() {
    return bot(`<ul><li><strong>Taps, mixers &amp; shower columns:</strong> 2-year warranty against manufacturing defects</li><li><strong>Freestanding baths &amp; basins:</strong> 2 years</li><li><strong>Toilets:</strong> 1 year on mechanisms</li></ul><p class="muted">Must be installed by a qualified plumber (proof required). Excludes wear &amp; tear, limescale and incorrect installation.</p>`);
  }
  function payments() {
    return bot(`You can pay securely by <strong>card</strong> or <strong>EFT</strong>, spread the cost with <strong>PayJustNow</strong>, or reserve with <strong>Laybuy</strong>. Cash on delivery and in-store payment are also available.`, `<div class="chat-actions"><a class="btn btn--ghost" href="${M.ROOT}faqs/#payments">Payment FAQs</a></div>`);
  }
  function delivery() {
    chips(["Track my order", "Returns", "Talk to us on WhatsApp"]);
    return bot(`We deliver nationwide across South Africa, and you're welcome to collect from our Edenvale store. Delivery time and fee depend on your area and the items — our team confirms both when you order. <p class="muted" style="margin-top:8px">Please inspect your goods with the driver and note any damage on the delivery note.</p>`, `<div class="chat-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink()}">${I.wa} Get a delivery quote</a></div>`);
  }
  function install() {
    return bot(`Our fittings are standard South African connections, and the warranty requires installation by a <strong>qualified plumber</strong>. Need a recommendation in your area? Our team can help on WhatsApp.`, `<div class="chat-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink()}">${I.wa} Ask our team</a></div>`);
  }
  function visit() {
    return bot(`<strong>Makhi Luxury Taps</strong><br>93 Van Riebeeck Avenue, Edenvale Ext 1, Edenvale, 1645<br>${M.PHONE} · ${M.EMAIL}`, `<div class="chat-actions"><a class="btn btn--ghost" href="${M.ROOT}contact/">Map &amp; contact</a></div>`);
  }
  function trackOrder(num) {
    const orders = store.get("orders", []);
    const o = orders.find((x) => x.no.toLowerCase().replace("-", "") === num.toLowerCase().replace("-", ""));
    track("track_order", { found: !!o });
    if (!o) return bot(`I can't see order <strong>${esc(num)}</strong> from this device. Our team can look it up instantly on WhatsApp.`, `<div class="chat-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent("Hi Makhi, please could you check order " + num)}">${I.wa} Check with the team</a></div>`);
    const steps = ["Placed", "Packed", "Dispatched", "Delivered"];
    return bot(`Order <strong>${esc(o.no)}</strong> is currently <strong>${steps[o.stage]}</strong>.`, `<ul class="timeline-mini">${steps.map((s, i) => `<li class="${i <= o.stage ? "done" : ""}">${s}</li>`).join("")}</ul><div class="chat-actions"><a class="btn btn--ghost" href="${M.ROOT}track-order/?no=${encodeURIComponent(o.no)}">Full tracking</a></div>`);
  }
  function handoff(pre) {
    return bot(`${pre ? pre + " " : ""}I'll hand you to a Makhi specialist on WhatsApp with a summary of our chat, so you won't need to repeat yourself.`, `<div class="chat-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink()}">${I.wa} Continue on WhatsApp</a></div>`);
  }
  function greet() {
    chips(["Find my perfect tap", "Match a finish", "Plan my bathroom", "Track my order", "Delivery & returns", "Talk to us on WhatsApp"]);
    const m = document.createElement("div"); m.className = "msg msg--bot";
    m.innerHTML = `<div class="bubble"><p>Welcome to Makhi. Are we designing a <strong>kitchen</strong> or a <strong>bathroom</strong> today?</p></div>`;
    body.appendChild(m);
  }

  /* liquid reveal: displacement ripples while the panel floods open / drains closed */
  function liquid(opening) {
    const visible = (n) => n && n.getClientRects().length && getComputedStyle(n).display !== "none";
    const fab = [document.querySelector(".fab--ai"), document.querySelector(".bnav .ai")].find(visible);
    const r = fab ? fab.getBoundingClientRect() : { left: innerWidth / 2 - 33, top: innerHeight - 80, width: 66, height: 66 };
    let rings = document.querySelector(".chat-rings");
    if (!rings) { rings = document.createElement("div"); rings.className = "chat-rings"; rings.innerHTML = "<i></i><i></i><i></i>"; document.body.appendChild(rings); }
    rings.style.left = (r.left + r.width / 2) + "px"; rings.style.top = (r.top + r.height / 2) + "px";
    rings.classList.remove("go"); void rings.offsetWidth; rings.classList.add("go");
    const dm = document.querySelector("#chatWater feDisplacementMap"), tb = document.querySelector("#chatWater feTurbulence");
    if (!dm || !window.gsap || M.reduce) return;
    el.classList.add("is-liquid");
    const o = { s: opening ? 70 : 0, f: 0.012 };
    gsap.to(o, { s: opening ? 0 : 80, f: opening ? 0.004 : 0.02, duration: opening ? 1.1 : 0.8, ease: opening ? "power2.out" : "power2.in",
      onUpdate: () => { dm.setAttribute("scale", o.s.toFixed(1)); tb.setAttribute("baseFrequency", `${o.f.toFixed(4)} ${(o.f * 2.4).toFixed(4)}`); },
      onComplete: () => { el.classList.remove("is-liquid"); dm.setAttribute("scale", "0"); } });
    M.sound.drip(opening ? 0.9 : 0.6);
  }
  function open(prefill) {
    if (!el) build();
    liquid(true);
    document.body.classList.add("chat-open");
    track("ai_chat_open", { from: location.pathname });
    setTimeout(() => { if (prefill) user(prefill); else input.focus({ preventScroll: true }); }, 450);
  }
  function close() { if (!document.body.classList.contains("chat-open")) return; liquid(false); document.body.classList.remove("chat-open"); window.speechSynthesis && speechSynthesis.cancel(); }

  window.MakhiConcierge = { open, close };
})();
