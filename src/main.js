import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
// ?capture: kare kare kayıt için (Reels), HD kareler ve sabit zaman
const capture = new URLSearchParams(location.search).has("capture");
if (capture) document.documentElement.classList.add("capture");
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// ---------- yumuşak kaydırma ----------
let lenis = null;
if (!reduced && !capture) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const goTo = (target) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else document.querySelector(target === 0 ? "#ust" : target)?.scrollIntoView();
};
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    e.preventDefault();
    goTo(id === "#ust" ? 0 : id);
  })
);

// ---------- hero: iki Flow videosu, 379 kare, kaydırmaya bağlı ----------
const FRAMES = 379;
const small = matchMedia("(max-width: 820px)").matches;
// geniş/yoğun ekranda 1920px kareler, telefonda 1280px
const hd = capture || (!small && innerWidth * (devicePixelRatio || 1) > 1400);
const src = (i) => `/${hd ? "frames-hd" : "frames"}/f${String(i + 1).padStart(3, "0")}.webp`;
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");
const frames = new Array(FRAMES);
let current = -1;
let wanted = 0;

function load(i) {
  if (frames[i]) return frames[i];
  const img = new Image();
  img.decoding = "async";
  img.src = src(i);
  img.addEventListener("load", () => { if (Math.abs(i - wanted) < 4) draw(wanted, true); });
  frames[i] = img;
  return img;
}
// önce ilk kare, sonra her 8. kare (kaba önizleme), sonra hepsi sırayla
load(0);
const order = [];
for (let i = 8; i < FRAMES; i += 8) order.push(i);
for (let i = 1; i < FRAMES; i++) if (i % 8) order.push(i);
(function queue(k = 0) {
  if (k >= order.length) return;
  const batch = order.slice(k, k + 6).map((i) => new Promise((r) => {
    const im = load(i);
    if (im.complete) r(); else { im.addEventListener("load", r, { once: true }); im.addEventListener("error", r, { once: true }); }
  }));
  Promise.all(batch).then(() => queue(k + 6));
})();

function nearestLoaded(i) {
  for (let d = 0; d < FRAMES; d++) {
    const a = frames[i - d], b = frames[i + d];
    if (a && a.complete && a.naturalWidth) return a;
    if (b && b.complete && b.naturalWidth) return b;
  }
  return null;
}

function sizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, capture ? 3 : 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  draw(wanted, true);
}

function draw(i, force = false) {
  wanted = i;
  const img = nearestLoaded(i);
  if (!img || (!force && i === current)) return;
  current = i;
  const cw = canvas.width, ch = canvas.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  // dar ekranda kutu ortada kalsın, biraz yukarı kaydır ki alttaki metne yer açılsın
  const y = small ? (ch - h) / 2 - ch * 0.06 : (ch - h) / 2;
  ctx.drawImage(img, (cw - w) / 2, y, w, h);
}
addEventListener("resize", sizeCanvas);
sizeCanvas();

const beats = [...document.querySelectorAll(".beat")].map((el) => ({ el, a: +el.dataset.in, b: +el.dataset.out }));
const bar = document.getElementById("hero-bar");
const FADE = 0.045;

function heroUpdate(p) {
  draw(Math.round(p * (FRAMES - 1)));
  bar.style.transform = `scaleX(${p.toFixed(4)})`;
  for (const { el, a, b } of beats) {
    const fin = a === 0 ? 1 : clamp01((p - a) / FADE);
    const fout = b >= 1 ? 1 : clamp01((b - p) / FADE);
    const o = Math.min(fin, fout);
    el.style.opacity = o.toFixed(3);
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
    if (!reduced) el.style.transform = `translateY(${((1 - o) * 22).toFixed(1)}px)`;
  }
}

ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom bottom",
  scrub: capture ? true : 0.4,
  onUpdate: (self) => heroUpdate(self.progress),
});
heroUpdate(0);

// ---------- menü: hero bitince açık renge geçer ----------
const nav = document.getElementById("nav");
ScrollTrigger.create({
  trigger: "#tatlar",
  start: "top 72px",
  endTrigger: "#icindekiler",
  end: "top 72px",
  toggleClass: { targets: nav, className: "is-light" },
});
ScrollTrigger.create({
  trigger: "#siparis",
  start: "top 72px",
  end: "bottom top",
  toggleClass: { targets: nav, className: "is-light" },
});

// ---------- sipariş formu ----------
const form = document.getElementById("order-form");
const label = document.getElementById("sum-label");
const price = document.getElementById("sum-price");
const note = document.getElementById("order-note");
const names = { karisik: "karışık", nane: "Kivi & Nane", mango: "Mango & Çarkıfelek" };
const sizeName = { 6: "6'lı", 12: "12'li", 24: "24'lü" };
const tl = (n) => "₺" + n.toLocaleString("tr-TR");
function sum() {
  const size = form.querySelector('input[name="size"]:checked');
  const tat = form.querySelector('input[name="tat"]:checked').value;
  label.textContent = `${sizeName[size.value]} ${names[tat]} kasa`;
  price.textContent = tl(+size.dataset.price);
  return { size, tat };
}
form.addEventListener("change", sum);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const { size, tat } = sum();
  const free = +size.dataset.price >= 750 ? " Kargo ücretsiz." : "";
  note.textContent = `${sizeName[size.value]} ${names[tat]} kasa sepete eklendi.${free}`;
});
document.querySelectorAll("[data-pick]").forEach((b) =>
  b.addEventListener("click", () => {
    form.querySelector(`input[name="tat"][value="${b.dataset.pick}"]`).checked = true;
    sum();
    goTo("#siparis");
  })
);

// önizleme: ?p=0.5 hero'yu o noktada açar
const qp = parseFloat(new URLSearchParams(location.search).get("p"));
if (!Number.isNaN(qp)) {
  history.scrollRestoration = "manual";
  addEventListener("load", () => {
    const hero = document.querySelector(".hero");
    const y = qp * (hero.offsetHeight - innerHeight);
    if (lenis) lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y);
    ScrollTrigger.update();
  });
}

if (capture) {
  gsap.globalTimeline.pause();
  window.__ready = () => Promise.all(Array.from({ length: FRAMES }, (_, i) => {
    const im = load(i);
    return im.complete && im.naturalWidth ? im.decode().catch(() => {}) : new Promise((r) => im.addEventListener("load", () => im.decode().then(r, r), { once: true }));
  }));
  window.__step = (y, t) => { window.scrollTo(0, y); ScrollTrigger.update(); gsap.globalTimeline.time(t); };
  window.__heroEnd = () => document.querySelector(".hero").offsetHeight - innerHeight;
}
