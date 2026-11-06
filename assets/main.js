/* =========================================================
   SECOR e.V. – site configuration
   Fill in these values when they are available; the page
   switches from the "coming soon" notes to the real data.
   ========================================================= */
var SECOR_CONFIG = {
  bank: { holder: "SECOR e.V.", iban: "", bic: "", bankName: "", reference: "Spende SECOR" },
  paypalUrl: "",          // e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX
  facebookUrl: "",        // e.g. https://www.facebook.com/asociatiasecor
  romania: {              // Romanian partner (for 3.5% / 20% / RON donations)
    name: "", cif: "", iban: "", bank: "", form230Url: ""
  }
};

(function () {
  "use strict";
  var I18N = window.SECOR_I18N || {};
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* ---------- i18n ---------- */
  var ro = { _title: doc.title, _desc: $('meta[name="description"]').content };
  $$("[data-i18n]").forEach(function (el) { ro[el.getAttribute("data-i18n")] = el.innerHTML; });
  $$("[data-i18n-alt]").forEach(function (el) { ro[el.getAttribute("data-i18n-alt")] = el.alt; });
  I18N.ro = Object.assign(ro, I18N.ro || {});
  var lang = "ro";
  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.ro[key] || ""; }

  function setLang(l) {
    if (!I18N[l]) l = "ro";
    lang = l;
    doc.documentElement.lang = l;
    $$("[data-i18n]").forEach(function (el) { var v = t(el.getAttribute("data-i18n")); if (v) el.innerHTML = v; });
    $$("[data-i18n-alt]").forEach(function (el) { var v = t(el.getAttribute("data-i18n-alt")); if (v) el.alt = v; });
    doc.title = t("_title");
    $('meta[name="description"]').content = t("_desc");
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    try { localStorage.setItem("secor-lang", l); } catch (e) {}
    applyConfig();
    updateSummary();
  }
  $$(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang); }); });

  /* ---------- config → page ---------- */
  function applyConfig() {
    var c = SECOR_CONFIG, b = c.bank;
    var hasBank = !!b.iban;
    $("#bankPending").hidden = hasBank;
    $("#bankDetails").hidden = !hasBank;
    if (hasBank) {
      $("#bHolder").textContent = b.holder;
      $("#bIban").textContent = b.iban;
      $("#bBic").textContent = b.bic || "—";
      $("#bRef").textContent = b.reference;
    }
    var pp = $("#paypalBtn");
    $("#paypalPending").hidden = !!c.paypalUrl;
    pp.hidden = !c.paypalUrl;
    if (c.paypalUrl) pp.href = c.paypalUrl;
    if (!c.paypalUrl) $("#t-paypal").hidden = true;
    if (c.facebookUrl) $("#fbLink").href = c.facebookUrl;
    var r = c.romania, hasRo = !!(r.name && (r.cif || r.iban));
    $("#roPending").hidden = hasRo;
    var box = $("#roDetails");
    box.hidden = !hasRo;
    if (hasRo) {
      box.innerHTML = "";
      [["Asociația", r.name], ["CIF", r.cif], ["IBAN (RON)", r.iban], ["Banca", r.bank]].forEach(function (row, i) {
        if (!row[1]) return;
        var d = doc.createElement("div"); d.className = "bank-row";
        d.innerHTML = '<div><small></small><code id="ro' + i + '"></code></div><button class="copy" data-copy="ro' + i + '"></button>';
        d.querySelector("small").textContent = row[0];
        d.querySelector("code").textContent = row[1];
        d.querySelector("button").textContent = t("copy");
        box.appendChild(d);
      });
      if (r.form230Url) {
        var a = doc.createElement("a"); a.className = "btn btn-gold"; a.href = r.form230Url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = lang === "ro" ? "Completează Formularul 230" : lang === "de" ? "Formular 230 ausfüllen" : "Fill in Form 230";
        box.appendChild(a);
      }
    }
  }

  /* ---------- donation amounts ---------- */
  var amount = 35, impactKey = "a35";
  function updateSummary() {
    var s = $("#summary");
    if (!SECOR_CONFIG.bank.iban) { s.hidden = true; return; }
    s.hidden = false;
    var impact = impactKey ? t(impactKey) : "";
    s.innerHTML = t("sumText").replace("{amount}", amount).replace(" – {impact}", impact ? " – " + impact : "") + '<br><small>' + t("sumHint") + "</small>";
  }
  $$(".amount[data-amount]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".amount[data-amount]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      amount = +btn.dataset.amount; impactKey = btn.querySelector("[data-i18n]").getAttribute("data-i18n");
      $("#customAmount").value = "";
      updateSummary();
    });
  });
  $("#customAmount").addEventListener("input", function (e) {
    var v = parseInt(e.target.value, 10);
    if (v > 0) {
      $$(".amount[data-amount]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      amount = v; impactKey = null; updateSummary();
    }
  });

  /* ---------- tabs ---------- */
  $$('[role="tab"]').forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$('[role="tab"]').forEach(function (x) { x.setAttribute("aria-selected", "false"); $("#" + x.getAttribute("aria-controls")).hidden = true; });
      tab.setAttribute("aria-selected", "true");
      $("#" + tab.getAttribute("aria-controls")).hidden = false;
    });
  });

  /* ---------- copy buttons ---------- */
  doc.addEventListener("click", function (e) {
    var b = e.target.closest(".copy"); if (!b) return;
    var txt = $("#" + b.dataset.copy).textContent.trim();
    var done = function () { b.textContent = t("copied"); b.classList.add("ok"); setTimeout(function () { b.textContent = t("copy"); b.classList.remove("ok"); }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
  });

  /* ---------- header, menu, sticky donate ---------- */
  var header = $(".site-header"), sticky = $(".sticky-donate"), donate = $("#doneaza");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
    var r = donate.getBoundingClientRect();
    var inDonate = r.top < window.innerHeight && r.bottom > 0;
    sticky.classList.toggle("show", window.scrollY > window.innerHeight * 0.8 && !inDonate);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var toggle = $(".menu-toggle"), links = $("#navlinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open));
  });
  $$("#navlinks a").forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }); });

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- counters ---------- */
  var counted = false;
  var stats = $(".stats");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting || counted) return; counted = true; o.disconnect();
      $$("[data-count]").forEach(function (el) {
        var end = +el.dataset.count, t0 = performance.now();
        (function step(now) { var p = Math.min(1, (now - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
      });
    }, { threshold: 0.4 }).observe(stats);
  }

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), group = [], idx = 0;
  function show(i) { idx = (i + group.length) % group.length; var im = group[idx]; lbImg.src = im.dataset.full || im.src; lbImg.alt = im.alt; lbCap.textContent = im.alt; }
  $$(".project-media button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      group = $$("img", btn.parentNode); show(group.indexOf(btn.querySelector("img")));
      if (lb.showModal) lb.showModal();
    });
  });
  $(".dlg-nav.prev").addEventListener("click", function () { show(idx - 1); });
  $(".dlg-nav.next").addEventListener("click", function () { show(idx + 1); });
  lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });

  /* ---------- legal dialogs ---------- */
  $$("[data-open]").forEach(function (b) { b.addEventListener("click", function () { var d = $("#" + b.dataset.open); if (d.showModal) d.showModal(); }); });
  $$("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d || e.target.hasAttribute("data-close")) d.close(); });
  });

  /* ---------- contact form → mailto ---------- */
  $("#contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var subject = "[SECOR] " + f.topic.value + " – " + f.name.value;
    var body = f.message.value + "\n\n— " + f.name.value;
    location.href = "mailto:asociatiasecor@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- initial language ---------- */
  var saved = null;
  try { saved = localStorage.getItem("secor-lang"); } catch (e) {}
  var q = (location.search.match(/[?&]lang=(ro|de|en)/) || [])[1];
  var nav = (navigator.language || "ro").slice(0, 2).toLowerCase();
  setLang(q || saved || (nav === "de" ? "de" : nav === "en" ? "en" : "ro"));
})();
