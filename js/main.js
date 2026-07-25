/**
 * DebunkIt — main.js
 * Sticky header, mobile nav, newsletter validation, scroll reveals
 */

(() => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const logoImage = document.querySelector("[data-logo-image]");
  const logoFallback = document.querySelector("[data-logo-fallback]");
  const yearEls = document.querySelectorAll("[data-year]");
  const year = String(new Date().getFullYear());
  yearEls.forEach((el) => {
    el.textContent = year;
  });
  const newsletter = document.querySelector("[data-newsletter]");

  /* Logo text fallback if SVG fails */
  if (logoImage && logoFallback) {
    logoImage.addEventListener("error", () => {
      logoImage.hidden = true;
      logoFallback.hidden = false;
    });
  }

  /* Sticky header shadow */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Hide header while footer is in view */
  const footer = document.querySelector(".site-footer");
  if (header && footer && "IntersectionObserver" in window) {
    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        const hide = entry.isIntersecting;
        header.classList.toggle("is-footer-hidden", hide);
        if (hide && menuToggle && mobileNav) {
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.setAttribute("aria-label", "Open menu");
          mobileNav.hidden = true;
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" }
    );
    footerObserver.observe(footer);
  }

  /* Mobile navigation */
  if (menuToggle && mobileNav) {
    const setOpen = (isOpen) => {
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      mobileNav.hidden = !isOpen;
    };

    menuToggle.addEventListener("click", () => {
      setOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 900px)").matches) setOpen(false);
    });
  }

  /* Newsletter form */
  if (newsletter) {
    const note = newsletter.querySelector("[data-form-note]");
    const emailInput = newsletter.querySelector('input[type="email"]');
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    newsletter.addEventListener("submit", (event) => {
      event.preventDefault();
      note?.classList.remove("is-success", "is-error");
      emailInput?.classList.remove("is-invalid");

      const email = emailInput?.value.trim() ?? "";
      if (!isValidEmail(email)) {
        emailInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Enter a valid email to subscribe.";
        emailInput?.focus();
        return;
      }

      note?.classList.add("is-success");
      if (note) note.textContent = "You're subscribed. Watch your inbox.";
      newsletter.reset();
    });
  }

  /* Back to top */
  const backToTop = document.querySelector("[data-back-to-top]");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* Scroll reveals — keep motion light and optional */
  const revealNodes = document.querySelectorAll("[data-reveal]");
  if (revealNodes.length) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      revealNodes.forEach((node) => observer.observe(node));
    }
  }
})();
