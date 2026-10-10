/**
 * ui.js — interações da página: menu mobile, rolagem suave, seção ativa na navegação,
 * entrada gradual de textos/cards e modal do cardápio.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Rolagem suave para âncoras ---------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href").slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    var top = id === "experiencia" ? 0 : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    history.replaceState(null, "", "#" + id);
  });

  /* ---------- Botão "Explorar nosso hambúrguer" ---------- */
  document.getElementById("btn-explore").addEventListener("click", function () {
    if (window.BurgerAnimation) window.BurgerAnimation.explore();
    else document.getElementById("ingredientes").scrollIntoView();
  });

  /* ---------- Seção atual na navegação ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on && a.classList.contains("nav__brand") === false);
      if (on && a.closest(".nav__menu")) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["experiencia", "ingredientes", "cardapio", "contato"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  /* ---------- Entrada gradual de textos e cards ---------- */
  if (hasGsap && !reduceMotion.matches) {
    gsap.utils.toArray("[data-reveal]").forEach(function (node) {
      gsap.from(node, {
        opacity: 0, y: 40, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: node, start: "top 90%", toggleActions: "play none none none" }
      });
    });
    // Entrada do hero ao carregar (nos filhos, para não interferir na animação do container)
    gsap.from("#hero-copy > *", { opacity: 0, y: 34, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.15, clearProps: "transform,opacity" });
    gsap.from("#burger-wrap", { opacity: 0, scale: 0.94, duration: 1.2, ease: "power3.out", delay: 0.1, immediateRender: false });
  }

  /* ---------- Modal do cardápio ---------- */
  var modal = document.getElementById("menu-modal");
  var mImg = document.getElementById("modal-img");
  var mTitle = document.getElementById("modal-title");
  var mDesc = document.getElementById("modal-desc");
  var mList = document.getElementById("modal-list");
  var mPrice = document.getElementById("modal-price");
  var R = window.BurgerRender;

  document.getElementById("menu-grid").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-menu-id]");
    if (!btn) return;
    var item = window.MENU_ITEMS.filter(function (m) { return m.id === btn.dataset.menuId; })[0];
    if (!item) return;

    mImg.removeAttribute("data-used-fallback");
    mImg.onerror = function () { if (!mImg.dataset.usedFallback) { mImg.dataset.usedFallback = "1"; mImg.src = item.fallback; } };
    mImg.src = item.image;
    mImg.alt = item.name;
    mTitle.textContent = item.name;
    mDesc.textContent = item.description;
    mPrice.textContent = R.brl.format(item.price);
    mList.textContent = "";
    item.details.forEach(function (d) {
      var li = document.createElement("li");
      li.textContent = d;
      mList.appendChild(li);
    });
    modal.showModal();
  });

  modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
})();
