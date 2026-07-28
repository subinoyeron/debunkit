(() => {
  const yearEls = document.querySelectorAll("[data-year]");
  yearEls.forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
  }

  // Solution tabs removed — static cards on live site


  // Industries carousel
  const track = document.querySelector("[data-industry-track]");
  const prev = document.querySelector("[data-industry-prev]");
  const next = document.querySelector("[data-industry-next]");

  const scrollByCard = (dir) => {
    if (!track) return;
    const card = track.querySelector(".industry-card");
    const amount = card ? card.getBoundingClientRect().width + 16 : 300;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  prev?.addEventListener("click", () => scrollByCard(-1));
  next?.addEventListener("click", () => scrollByCard(1));

  // Soft header contrast when scrolling past hero
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
