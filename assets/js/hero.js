/* MAKHI — hero.js : boots WebGL scenes once core is ready. */
import { initDrop, initFinishStage, webglOK } from "./tap3d.js?v=15";

const start = () => {
  const M = window.Makhi;
  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  const ok = webglOK();
  const drop = document.getElementById("drop");
  if (drop) {
    if (!ok) drop.classList.add("no-webgl", "is-static");
    else {
      try { initDrop(drop, { gsap, ScrollTrigger, reduce: M.reduce, mobile: window.innerWidth < 900 }); }
      catch (err) { console.warn("Drop hero fallback:", err); drop.classList.add("no-webgl", "is-static"); }
    }
  }
  const stage = document.querySelector(".fsw__stage");
  if (stage && ok) {
    try {
      const fs = initFinishStage(stage, { gsap, finish: "chrome" });
      document.addEventListener("makhi:finish", (e) => fs.setFinish(e.detail));
    } catch (err) { console.warn("Finish stage fallback:", err); }
  }
  ScrollTrigger && ScrollTrigger.refresh();
};

const wait = () => (window.Makhi && window.Makhi.ready ? window.Makhi.ready.then(start) : setTimeout(wait, 50));
wait();
