/* ============================================================
   Parallax backdrop + scroll reveal

   Travel is driven by scroll PROGRESS (0..1), not raw pixels, so the
   full landscape reveal happens across whatever length the page is.
   Each layer declares data-travel in vh — how far it rises between the
   top of the page and the bottom.

   All reads/writes are batched into one rAF frame, listeners are
   passive, nothing queries the DOM per event, and the whole thing
   switches off for prefers-reduced-motion and while the tab is hidden.
   ============================================================ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- scroll reveal ---------------- */

  // Only armed once JS is confirmed running, so the page stays fully
  // readable if this file fails to load.
  document.documentElement.classList.add("js");

  var revealables = document.querySelectorAll(".reveal");

  function showAll() {
    for (var i = 0; i < revealables.length; i++) revealables[i].classList.add("seen");
  }

  if (reduced.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var el = entries[i].target;
          el.classList.add("seen");
          io.unobserve(el);
          // Drop the compositor layer once the card has arrived. Leaving
          // will-change on keeps every card promoted for the life of the
          // page - eight extra layers a phone has to composite on every
          // frame of a fast scroll, long after they stopped moving.
          el.addEventListener("transitionend", function done(ev) {
            if (ev.propertyName !== "transform") return;
            el.style.willChange = "auto";
            el.removeEventListener("transitionend", done);
          });
        }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    for (var j = 0; j < revealables.length; j++) io.observe(revealables[j]);
  }

  /* ---------------- parallax ---------------- */

  // Queried once. Never inside an event handler.
  var layers = [].map.call(document.querySelectorAll("[data-travel]"), function (el) {
    return {
      el: el,
      travel: parseFloat(el.dataset.travel) || 0,  // vh across the whole page
      mouse: parseFloat(el.dataset.mouse) || 0,    // px of pointer drift
      lastY: null,
      lastX: null
    };
  });

  // Layers whose OPACITY tracks scroll progress - the night/dawn cross-fade.
  var fades = [].map.call(document.querySelectorAll("[data-fade]"), function (el) {
    return {
      el: el,
      dir: el.dataset.fade,                        // "in" | "out"
      from: parseFloat(el.dataset.from) || 0,      // progress where it starts
      to: parseFloat(el.dataset.to) || 1,          // progress where it finishes
      last: null
    };
  });

  // Scroll-driven card stack (projects page only).
  var stackSec = document.querySelector(".stack-section");
  var cards = stackSec ? [].slice.call(stackSec.querySelectorAll(".scard")) : [];
  var pips = stackSec ? [].slice.call(stackSec.querySelectorAll(".stack-pips li")) : [];
  var stackBox = stackSec ? stackSec.querySelector(".stack") : null;
  var stackP = 0, lastPip = -1, stackW = 0, stackH = 0;
  var cardState = cards.map(function () { return { t: null, o: null }; });

  if (!layers.length && !fades.length && !cards.length) return;

  var progress = 0;      // 0 at page top, 1 at page bottom
  var vh = 1;            // viewport height in px
  var mx = 0, my = 0;    // eased pointer offset, -1..1
  var tmx = 0, tmy = 0;  // pointer target
  var ticking = false;
  var running = false;

  function measure() {
    vh = window.innerHeight || document.documentElement.clientHeight;
    var doc = document.documentElement;
    var max = (doc.scrollHeight || 0) - vh;
    var y = window.pageYOffset || doc.scrollTop || 0;
    progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

    if (stackBox) {
      stackW = stackBox.offsetWidth;
      stackH = stackBox.offsetHeight;
    }

    if (stackSec) {
      // how far through the tall section we are: 0 when its top reaches the
      // top of the viewport, 1 when its bottom does
      var travel = stackSec.offsetHeight - vh;
      var passed = -stackSec.getBoundingClientRect().top;
      stackP = travel > 0 ? Math.min(1, Math.max(0, passed / travel)) : 0;
    }
  }

  function paint() {
    ticking = false;

    // ease the pointer so it glides rather than snaps
    mx += (tmx - mx) * 0.10;
    my += (tmy - my) * 0.10;

    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      var rise = progress * l.travel * vh / 100;
      var y = Math.round((-rise + my * l.mouse) * 100) / 100;
      var x = Math.round((mx * l.mouse) * 100) / 100;

      // skip the style write entirely when a layer has not moved
      if (y !== l.lastY || x !== l.lastX) {
        l.el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
        l.lastY = y;
        l.lastX = x;
      }
    }

    for (var f = 0; f < fades.length; f++) {
      var d = fades[f];
      var t = (progress - d.from) / (d.to - d.from);
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      t = t * t * (3 - 2 * t);                     // smoothstep, no hard start/stop
      var o = Math.round((d.dir === "in" ? t : 1 - t) * 1000) / 1000;
      if (o !== d.last) { d.el.style.opacity = o; d.last = o; }
    }

    if (cards.length) {
      var n = cards.length;
      var pos = stackP * (n - 1);          // which card is at the front
      for (var c = 0; c < n; c++) {
        var d = c - pos;                   // 0 = front, >0 waiting, <0 already passed
        // a card you have moved past recedes slightly faster than one still
        // waiting, so the deck never looks evenly spaced
        var back = d >= 0 ? d : -d * 1.1;
        var sc = 1 - 0.08 * back;
        var ty = -(stackH * 0.105) * back;
        var tx = -(stackW * 0.068) * back;
        var op = d >= 0 ? Math.max(0, 1 - 0.24 * d) : Math.max(0.12, 1 + d * 0.55);

        var t = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + sc.toFixed(4) + ")";
        var o = op.toFixed(3);
        var st = cardState[c];
        if (t !== st.t) { cards[c].style.transform = t; st.t = t; }
        if (o !== st.o) {
          cards[c].style.opacity = o;
          cards[c].style.zIndex = String(100 - Math.round(back * 10));
          st.o = o;
        }
      }
      var active = Math.round(pos);
      if (active !== lastPip) {
        for (var q = 0; q < pips.length; q++) pips[q].classList.toggle("on", q === active);
        lastPip = active;
      }
    }

    // keep going only while the pointer is still settling
    if (Math.abs(tmx - mx) > 0.001 || Math.abs(tmy - my) > 0.001) request();
  }

  function request() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paint);
    }
  }

  function onScroll() { measure(); request(); }

  function onPointer(e) {
    tmx = (e.clientX / window.innerWidth) * 2 - 1;
    tmy = (e.clientY / window.innerHeight) * 2 - 1;
    request();
  }

  function start() {
    if (running) return;
    running = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    onScroll();
  }

  function stop() {
    if (!running) return;
    running = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    window.removeEventListener("pointermove", onPointer);
    for (var i = 0; i < layers.length; i++) {
      layers[i].el.style.transform = "";
      layers[i].lastY = layers[i].lastX = null;
    }
    // Clearing the inline opacity drops every fading layer back to its CSS
    // default, which is the night state: dawn sky and sun at 0, stars,
    // aurora and moon fully visible. A coherent still scene, not a freeze
    // halfway through a cross-fade.
    for (var k = 0; k < fades.length; k++) {
      fades[k].el.style.opacity = "";
      fades[k].last = null;
    }
  }

  function sync() { if (reduced.matches) stop(); else start(); }

  if (reduced.addEventListener) reduced.addEventListener("change", sync);
  else if (reduced.addListener) reduced.addListener(sync);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else sync();
  });

  // Late-loading webfonts change page height, which changes progress.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (running) onScroll(); });
  }
  window.addEventListener("load", function () { if (running) onScroll(); });

  sync();
})();


/* ============================================================
   Snowball page transition

   Intercepts the PROJECTS link, throws a snowball at it, splashes on
   impact, expands the splash until it covers the viewport, and only
   then navigates. A sessionStorage flag tells the next page to start
   under the snow and wipe it away.

   The link keeps a real href, so with JavaScript off - or reduced
   motion on - it is an ordinary navigation.
   ============================================================ */

(function () {
  "use strict";

  var link = document.querySelector(".to-projects");
  if (!link) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var THROW = 460;   // ms, ball in flight
  var DIM   = 640;   // ms, screen fading down to black
  var HOLD  = 60;    // ms, held dark before the swap
  var busy  = false;

  function px(n) { return n.toFixed(1) + "px"; }

  link.addEventListener("click", function (e) {
    // let modified clicks (new tab, middle click) behave normally
    if (reduced.matches || busy || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    busy = true;

    var href = link.getAttribute("href");
    var r = link.getBoundingClientRect();
    var tx = r.left + r.width / 2;      // impact point: the link itself
    var ty = r.top + r.height / 2;
    var vw = window.innerWidth, vh = window.innerHeight;

    var stage = document.createElement("div");
    stage.className = "sb-stage";

    // --- the throw: X moves linearly, Y arcs, so the path is a lob ---
    var wrapX = document.createElement("div");
    wrapX.className = "sb-x";
    wrapX.style.setProperty("--throw", THROW + "ms");
    wrapX.style.setProperty("--x0", px(vw * 0.1));
    wrapX.style.setProperty("--x1", px(tx));
    var wrapY = document.createElement("div");
    wrapY.className = "sb-y";
    wrapY.style.setProperty("--throw", THROW + "ms");
    wrapY.style.setProperty("--y0", px(vh + 90));
    wrapY.style.setProperty("--y1", px(ty));
    var ball = document.createElement("div");
    ball.className = "sb-ball";
    ball.style.setProperty("--throw", THROW + "ms");
    ball.style.setProperty("--r", "28px");
    wrapY.appendChild(ball);
    wrapX.appendChild(wrapY);
    stage.appendChild(wrapX);
    document.body.appendChild(stage);

    setTimeout(function () {
      stage.removeChild(wrapX);

      // --- impact: a small spray at the link ---
      for (var i = 0; i < 14; i++) {
        var a = (Math.PI * 2 * i) / 14 + (i % 2 ? 0.2 : -0.2);
        var d = 60 + (i % 5) * 22;
        var f = document.createElement("div");
        f.className = "sb-fleck";
        f.style.setProperty("--sx", px(tx));
        f.style.setProperty("--sy", px(ty));
        f.style.setProperty("--fx", px(Math.cos(a) * d));
        f.style.setProperty("--fy", px(Math.sin(a) * d - 22));
        stage.appendChild(f);
      }

      // --- and the lights go down ---
      var dim = document.createElement("div");
      dim.className = "dimmer";
      dim.style.setProperty("--dim", DIM + "ms");
      document.body.appendChild(dim);

      // Navigate while the screen is fully dark, so the swap itself has
      // nothing visible to stutter through.
      try { sessionStorage.setItem("snowfall", "1"); } catch (err) {}
      setTimeout(function () { window.location.href = href; }, DIM + HOLD);
    }, THROW);
  });
})();
