/**
 * burger-animation.js — hambúrguer desconstruído controlado pela rolagem.
 *
 * Uma única timeline do GSAP é "scrubada" pelo ScrollTrigger enquanto a seção #experiencia
 * fica fixada (pin). Por isso a animação:
 *   • segue a posição real do scroll (nada é disparado "uma vez só");
 *   • é reversível ao rolar para cima;
 *   • é recalculada em resize/orientação (invalidateOnRefresh) sem saltos.
 *
 * gsap.matchMedia() cria 3 versões e destrói/recria cada uma ao mudar de breakpoint:
 *   desktop (texto à esq. + legendas ao lado das camadas), mobile (camadas mais próximas,
 *   uma legenda por vez) e movimento reduzido (layout estático, sem animação).
 *
 * ─── COMO AJUSTAR (ver também data/ingredients.js) ───────────────────────────────────
 *   Distância de cada camada ......... "explode" em data/ingredients.js
 *   Atraso/velocidade de cada camada . "delay" em data/ingredients.js
 *   Quanto rola até terminar ......... SCROLL_LENGTH abaixo (múltiplos da altura da tela)
 *   Ritmo geral ...................... constantes da seção CONFIG (tempos da timeline)
 *   Suavização do scrub .............. CONFIG.scrub (0 = colado ao scroll; maior = mais suave)
 */
(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn("GSAP/ScrollTrigger não carregaram — exibindo o hambúrguer montado, sem animação.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ===== CONFIG ===== */
  var CONFIG = {
    scrub: 0.8,
    scrollLength: { desktop: 6.5, mobile: 5 },   // em alturas de tela
    time: {                                       // unidades da timeline (relativas entre si)
      heroOut: 0,       // texto do hero sai e o hambúrguer vai ao centro
      explodeStart: 1.0, explodeDur: 3.0,
      captionsStart: 4.6, captionStep: 0.55,
      reassembleStart: 10.3, reassembleDur: 1.8,
      outroIn: 11.6
    },
    desktop: { spread: 1.0, maxScale: 1.15, startXRatio: 0.22, finalScale: 0.92 },
    mobile:  { spread: 0.55, maxScale: 1.7, startYRatio: 0.30, finalScale: 1.25, captionReserve: 150 }
  };

  var BOX = window.BURGER_BOX;
  var DATA = window.INGREDIENTS;
  var R = window.BurgerRender;

  var section = document.getElementById("experiencia");
  var copy = document.getElementById("hero-copy");
  var wrap = document.getElementById("burger-wrap");
  var tilt = document.getElementById("burger-tilt");
  var cue = document.getElementById("scroll-cue");
  var outro = document.getElementById("outro");
  var nav = document.getElementById("nav");
  var layers = R.layers;
  var captions = R.captions;

  var activeTrigger = null;

  /** Mede o palco e calcula escala/posições (reavaliado a cada refresh). */
  function measure(cfg, isMobile) {
    var stageH = section.clientHeight;
    var stageW = section.clientWidth;
    var navH = nav.offsetHeight;
    var ppu = wrap.offsetWidth / BOX.w; // pixels por unidade

    var minTop = Infinity, maxBottom = -Infinity;
    DATA.forEach(function (d) {
      var e = d.explode * cfg.spread;
      minTop = Math.min(minTop, d.y + e);
      maxBottom = Math.max(maxBottom, d.y + d.h + e);
    });
    var extent = maxBottom - minTop;
    var centerUnits = (minTop + maxBottom) / 2;

    var reserve = isMobile ? cfg.captionReserve : 40;
    var avail = stageH - navH - reserve - 24;
    var scale = Math.min(cfg.maxScale, avail / (extent * ppu));
    var targetCenterY = navH + 12 + avail / 2;
    var endY = targetCenterY - stageH / 2 - scale * (centerUnits - BOX.h / 2) * ppu;

    var finalScale = cfg.finalScale;
    if (isMobile) finalScale = Math.min(finalScale, (stageW * 0.9) / wrap.offsetWidth);

    return {
      stageH: stageH, stageW: stageW, ppu: ppu, scale: scale, endY: endY,
      startX: isMobile ? 0 : stageW * cfg.startXRatio,
      startY: isMobile ? stageH * cfg.startYRatio : 0,
      finalScale: finalScale,
      finalY: -stageH * (isMobile ? 0.07 : 0.04)
    };
  }

  /** Posiciona cada legenda na altura da sua camada (desktop). */
  function layoutCaptions(cfg) {
    var m = measure(cfg, false);
    var half = m.scale * m.ppu * (BOX.w / 2) * 0.85 + 56;
    DATA.forEach(function (d, i) {
      var centerUnits = d.y + d.h / 2 + d.explode * cfg.spread;
      var y = m.stageH / 2 + m.endY + m.scale * (centerUnits - BOX.h / 2) * m.ppu;
      // top = centro da camada − metade da altura da legenda (sem CSS translate, que o GSAP sobrescreve)
      captions[i].style.setProperty("--top", (y - captions[i].offsetHeight / 2).toFixed(1) + "px");
      captions[i].style.setProperty("--half", half.toFixed(1) + "px");
    });
  }

  /** Monta a timeline principal. */
  function buildTimeline(isMobile) {
    var cfg = isMobile ? CONFIG.mobile : CONFIG.desktop;
    var T = CONFIG.time;
    var M = function () { return measure(cfg, isMobile); };

    gsap.set(layers, { y: 0, opacity: 1, scale: 1 });
    gsap.set(captions, { opacity: 0 });
    gsap.set(outro, { autoAlpha: 0 });

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: function () {
          return "+=" + Math.round(window.innerHeight * (isMobile ? CONFIG.scrollLength.mobile : CONFIG.scrollLength.desktop));
        },
        pin: true,
        scrub: CONFIG.scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: function () { if (!isMobile) layoutCaptions(cfg); }
      }
    });
    activeTrigger = tl.scrollTrigger;

    /* 1) Hero sai, hambúrguer vai para o centro */
    tl.to(copy, { opacity: 0, x: isMobile ? 0 : -70, y: isMobile ? -30 : 0, duration: 1.1, ease: "power1.in" }, T.heroOut);
    tl.to(cue, { autoAlpha: 0, duration: 0.4 }, T.heroOut);
    tl.fromTo(wrap,
      { x: function () { return M().startX; }, y: function () { return M().startY; }, scale: 1 },
      { x: 0, y: function () { return M().endY; }, scale: function () { return M().scale; }, duration: T.explodeStart + T.explodeDur, ease: "power2.inOut" },
      T.heroOut);

    /* 2) Cada camada se afasta no seu ritmo (explode/delay vêm de data/ingredients.js) */
    layers.forEach(function (layer, i) {
      var d = DATA[i];
      tl.to(layer, {
        y: function () { return d.explode * cfg.spread * M().ppu; },
        duration: T.explodeDur, ease: "power2.inOut"
      }, T.explodeStart + d.delay);
    });

    /* 3) Legendas: cada ingrediente é destacado em sequência */
    DATA.forEach(function (d, i) {
      var t = T.captionsStart + i * T.captionStep;
      tl.to(captions, {
        opacity: function (j) {
          if (isMobile) return j === i ? 1 : 0;
          return j === i ? 1 : (j < i ? 0.4 : 0);
        },
        y: function (j) { return j === i || j < i ? 0 : 10; },
        duration: 0.3, ease: "power1.out"
      }, t);
      tl.to(layers, {
        opacity: function (j) { return j === i ? 1 : 0.4; },
        scale: function (j) { return j === i ? 1.045 : 1; },
        duration: 0.3, ease: "power1.out"
      }, t);
    });

    /* 4) Remontagem: camadas voltam ao lugar e o hambúrguer fecha */
    var tEnd = T.captionsStart + DATA.length * T.captionStep;
    tl.to(layers, { opacity: 1, scale: 1, duration: 0.4, ease: "power1.out" }, tEnd);
    tl.to(captions, { opacity: 0, duration: 0.5, ease: "power1.in" }, tEnd + 0.1);
    layers.forEach(function (layer, i) {
      var spreadFromCenter = Math.abs(i - 5);
      tl.to(layer, { y: 0, duration: T.reassembleDur, ease: "power2.inOut" }, T.reassembleStart + spreadFromCenter * 0.04);
    });
    tl.to(wrap, {
      scale: function () { return M().finalScale; },
      y: function () { return M().finalY; },
      duration: T.reassembleDur, ease: "power2.inOut"
    }, T.reassembleStart);
    tl.to(outro, { autoAlpha: 1, duration: 0.6, ease: "power1.out" }, T.outroIn);

    return tl;
  }

  /** Leve movimento do hambúrguer acompanhando o cursor (somente desktop com mouse). */
  function enableMouseTilt() {
    var rotY = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
    var rotX = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
    function onMove(e) {
      var rx = e.clientX / window.innerWidth - 0.5;
      var ry = e.clientY / window.innerHeight - 0.5;
      rotY(rx * 12);
      rotX(-ry * 7);
    }
    function onLeave() { rotY(0); rotX(0); }
    section.addEventListener("mousemove", onMove, { passive: true });
    section.addEventListener("mouseleave", onLeave);
    return function () {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      gsap.set(tilt, { clearProps: "transform" });
    };
  }

  function teardown() {
    activeTrigger = null;
    section.classList.remove("is-animated");
    captions.forEach(function (c) { c.style.removeProperty("--top"); c.style.removeProperty("--half"); });
    gsap.set([copy, wrap, cue, outro].concat(layers, captions), { clearProps: "transform,opacity,visibility" });
  }

  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px)", function () {
    section.classList.add("is-animated");
    buildTimeline(false);
    var stopTilt = window.matchMedia("(hover: hover)").matches ? enableMouseTilt() : null;
    return function () { if (stopTilt) stopTilt(); teardown(); };
  });

  mm.add("(prefers-reduced-motion: no-preference) and (max-width: 900px)", function () {
    section.classList.add("is-animated");
    buildTimeline(true);
    return teardown;
  });

  // prefers-reduced-motion: reduce → nada é registrado: o layout estático mostra o hambúrguer
  // montado e a seção "Cada camada tem uma história" apresenta todos os ingredientes.

  /* Recalcula quando imagens e fontes terminam de carregar (evita medidas erradas). */
  var refresh = function () { ScrollTrigger.refresh(); };
  R.imagesReady.then(refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh);

  /** Botão "Explorar nosso hambúrguer": rola até o ponto em que as camadas já estão separadas. */
  window.BurgerAnimation = {
    explore: function () {
      if (activeTrigger) {
        var total = CONFIG.time.outroIn + 0.6;
        var target = activeTrigger.start + (activeTrigger.end - activeTrigger.start) * ((CONFIG.time.captionsStart + 0.4) / total);
        window.scrollTo({ top: target, behavior: "smooth" });
      } else {
        var next = document.getElementById("ingredientes");
        if (next) next.scrollIntoView({ behavior: "auto" });
      }
    }
  };
})();
