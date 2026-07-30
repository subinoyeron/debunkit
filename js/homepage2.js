(() => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const logoImage = document.querySelector("[data-logo-image]");
  const logoFallback = document.querySelector("[data-logo-fallback]");
  const hero = document.querySelector("[data-hero]");

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  if (logoImage && logoFallback) {
    logoImage.addEventListener("error", () => {
      logoImage.hidden = true;
      logoFallback.hidden = false;
    });
  }

  const setScrolled = () => {
    if (!header) return;
    const threshold = hero
      ? Math.max(24, Math.min(hero.offsetHeight * 0.55, 420))
      : 4;
    header.classList.toggle("is-scrolled", window.scrollY > threshold);
  };

  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });
  window.addEventListener("resize", setScrolled, { passive: true });

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

  const revealables = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }

  const initAboutDemo = () => {
    const root = document.querySelector("[data-about-demo]");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = root.querySelector("[data-demo-post]") || root;
    const claim = root.querySelector("[data-demo-claim]");
    const cursor = root.querySelector("[data-demo-cursor]");
    const chip = root.querySelector("[data-demo-chip]");
    const likesEl = root.querySelector("[data-demo-likes]");
    const commentsEl = root.querySelector("[data-demo-comments]");
    const sharesEl = root.querySelector("[data-demo-shares]");
    const timeEl = root.querySelector(".about-demo__time");
    if (!claim || !cursor || !chip) return;

    /* Claim copy is drawn as wireframe bars: each number is one word width. */
    const STATUSES = [
      {
        words: [44, 66, 38, 58, 34, 72, 26, 52],
        likes: "128",
        comments: "47",
        shares: "19",
        time: 62,
        width: 360,
        chip: "top-right",
      },
      {
        words: [36, 58, 30, 68, 42, 24, 60, 46, 32],
        likes: "2.4K",
        comments: "891",
        shares: "312",
        time: 54,
        width: 400,
        chip: "mid-left",
      },
      {
        words: [52, 40, 62, 28, 46, 70, 34],
        likes: "56",
        comments: "12",
        shares: "8",
        time: 68,
        width: 340,
        chip: "below-start",
      },
    ];

    let statusIndex = 0;
    let activeStatus = STATUSES[0];

    const buildBars = (widths) => {
      claim.textContent = "";
      return widths.map((width) => {
        const bar = document.createElement("span");
        bar.className = "about-demo__bar";
        bar.style.width = `${width}px`;
        const fill = document.createElement("span");
        fill.className = "about-demo__bar-fill";
        bar.appendChild(fill);
        claim.appendChild(bar);
        return bar;
      });
    };

    const setSelection = (progress) => {
      const total = activeStatus.words.reduce((sum, w) => sum + w, 0);
      const covered = total * progress;
      let before = 0;

      bars.forEach((bar, i) => {
        const width = activeStatus.words[i];
        const ratio = Math.max(0, Math.min(1, (covered - before) / width));
        const fill = bar.firstElementChild;
        if (fill) fill.style.transform = `scaleX(${ratio})`;
        before += width;
      });
    };

    const applyStatus = (status) => {
      activeStatus = status;
      stage.style.width = `min(100%, ${status.width}px)`;
      if (timeEl) timeEl.style.width = `${status.time}px`;
      if (likesEl) likesEl.textContent = `Like · ${status.likes}`;
      if (commentsEl) commentsEl.textContent = `Comment · ${status.comments}`;
      if (sharesEl) sharesEl.textContent = `Share · ${status.shares}`;
      return buildBars(status.words);
    };

    let bars = applyStatus(STATUSES[0]);

    const pointInStage = (el, edge = "start") => {
      const stageRect = stage.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const x =
        edge === "end"
          ? rect.right - stageRect.left - 2
          : edge === "center"
            ? rect.left + rect.width / 2 - stageRect.left
            : rect.left - stageRect.left;
      const y = rect.bottom - stageRect.top - 1;
      return { x, y };
    };

    /* Follows the sweeping highlight, so the cursor tracks bars across wrapped lines. */
    const pointAtProgress = (progress) => {
      const stageRect = stage.getBoundingClientRect();
      const total = activeStatus.words.reduce((sum, w) => sum + w, 0);
      const covered = total * progress;
      let before = 0;

      for (let i = 0; i < bars.length; i += 1) {
        const width = activeStatus.words[i];
        if (covered <= before + width || i === bars.length - 1) {
          const rect = bars[i].getBoundingClientRect();
          const within = Math.max(0, Math.min(1, (covered - before) / width));
          return {
            x: rect.left + rect.width * within - stageRect.left,
            y: rect.bottom - stageRect.top - 1,
          };
        }
        before += width;
      }

      return { x: 0, y: 0 };
    };

    const setCursor = (x, y, withTransition = true) => {
      cursor.style.transition = withTransition
        ? "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease"
        : "opacity 0.25s ease";
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    const boxesOverlap = (a, b, pad = 10) =>
      !(
        a.right + pad < b.left ||
        a.left - pad > b.right ||
        a.bottom + pad < b.top ||
        a.top - pad > b.bottom
      );

    const chipSlotPos = (mode, stageRect, chipW, chipH) => {
      const first = bars[0].getBoundingClientRect();
      const claimRect = claim.getBoundingClientRect();
      const clampPos = (x, y) => ({
        x: Math.max(10, Math.min(x, stageRect.width - chipW - 10)),
        y: Math.max(10, Math.min(y, stageRect.height - chipH - 10)),
      });

      if (mode === "top-right") {
        return clampPos(stageRect.width - chipW - 12, 12);
      }
      if (mode === "mid-left") {
        return clampPos(
          12,
          claimRect.top - stageRect.top + claimRect.height / 2 - chipH / 2
        );
      }
      return clampPos(
        first.left - stageRect.left,
        claimRect.bottom - stageRect.top + 10
      );
    };

    const placeChip = (mode = activeStatus.chip) => {
      if (!bars.length) return;

      const stageRect = stage.getBoundingClientRect();
      const chipW = chip.offsetWidth || 92;
      const chipH = chip.offsetHeight || 36;
      const pos = chipSlotPos(mode, stageRect, chipW, chipH);

      chip.style.transform = "";
      chip.style.left = `${pos.x}px`;
      chip.style.top = `${pos.y}px`;

      const chipBox = {
        left: pos.x,
        top: pos.y,
        right: pos.x + chipW,
        bottom: pos.y + chipH,
      };
      const end = pointInStage(bars[bars.length - 1], "end");
      const start = pointInStage(bars[0], "start");
      let rest = { x: end.x, y: end.y };

      if (mode === "top-right") {
        rest = { x: start.x, y: end.y + 22 };
      } else if (mode === "mid-left") {
        rest = { x: end.x, y: end.y };
      } else {
        rest = { x: end.x, y: Math.max(start.y - 8, 18) };
      }

      const cursorApprox = {
        left: rest.x,
        top: rest.y,
        right: rest.x + 78,
        bottom: rest.y + 36,
      };
      if (boxesOverlap(chipBox, cursorApprox, 12)) {
        if (mode === "below-start") {
          rest = { x: stageRect.width - 88, y: 16 };
        } else if (mode === "mid-left") {
          rest = { x: stageRect.width - 88, y: end.y };
        } else {
          rest = { x: 16, y: end.y + 28 };
        }
      }

      setCursor(rest.x, rest.y, true);
    };

    if (reduceMotion) {
      root.classList.add("is-post-in", "is-chip-in", "is-cursor-on");
      setSelection(1);
      placeChip();
      return;
    }

    let timers = [];
    let rafId = 0;
    let running = false;

    const clearTimers = () => {
      timers.forEach((id) => clearTimeout(id));
      timers = [];
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const resetVisuals = () => {
      root.classList.remove("is-post-in", "is-cursor-on", "is-chip-in", "is-fading");
      setSelection(0);
      chip.style.left = "";
      chip.style.top = "";
      const stageRect = stage.getBoundingClientRect();
      setCursor(stageRect.width - 36, stageRect.height - 28, false);
    };

    const runLoop = async () => {
      if (!running) return;

      const status = STATUSES[statusIndex % STATUSES.length];
      statusIndex += 1;
      bars = applyStatus(status);
      resetVisuals();

      await wait(180);
      if (!running) return;

      root.classList.add("is-post-in");
      await wait(900);
      if (!running) return;

      const start = pointInStage(bars[0], "start");
      const end = pointInStage(bars[bars.length - 1], "end");

      root.classList.add("is-cursor-on");
      const stageRect = stage.getBoundingClientRect();
      setCursor(stageRect.width - 36, stageRect.height - 28, false);
      await wait(40);
      setCursor(start.x, start.y, true);
      await wait(600);
      if (!running) return;

      const totalWidth = status.words.reduce((sum, w) => sum + w, 0);
      const selectDuration = Math.max(1400, Math.min(2000, totalWidth * 4));
      const startTime = performance.now();

      await new Promise((resolve) => {
        const tick = (now) => {
          if (!running) {
            resolve();
            return;
          }
          const t = Math.min(1, (now - startTime) / selectDuration);
          const eased = 1 - Math.pow(1 - t, 2.2);

          setSelection(eased);
          const point = pointAtProgress(eased);
          setCursor(point.x, point.y, false);

          if (t < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            setSelection(1);
            setCursor(end.x, end.y, false);
            resolve();
          }
        };
        rafId = requestAnimationFrame(tick);
      });

      if (!running) return;
      await wait(300);

      placeChip(status.chip);
      root.classList.add("is-chip-in");
      await wait(2200);
      if (!running) return;

      root.classList.add("is-fading");
      await wait(500);
      if (!running) return;

      runLoop();
    };

    const startDemo = () => {
      if (running) return;
      running = true;
      runLoop();
    };

    const stop = () => {
      running = false;
      clearTimers();
    };

    if ("IntersectionObserver" in window) {
      const demoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) startDemo();
            else stop();
          });
        },
        { threshold: 0.35 }
      );
      demoObserver.observe(root);
    } else {
      startDemo();
    }
  };

  initAboutDemo();

  const newsletter = document.querySelector("[data-newsletter]");
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

  const serviceCards = document.querySelectorAll("[data-service-card]");
  serviceCards.forEach((card) => {
    card.addEventListener("click", () => {
      const willOpen = !card.classList.contains("is-open");
      serviceCards.forEach((other) => {
        const open = other === card && willOpen;
        other.classList.toggle("is-open", open);
        other.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  });
})();
