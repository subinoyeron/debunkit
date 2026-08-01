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

  if (location.hash === "#search") {
    const searchInput = document.querySelector("#fc-search-input");
    searchInput?.focus({ preventScroll: false });
  }

  const headerSearch = document.querySelector("[data-header-search]");
  if (headerSearch) {
    const toggle = headerSearch.querySelector("[data-header-search-toggle]");
    const overlay = headerSearch.querySelector("[data-header-search-overlay]");
    const input = headerSearch.querySelector(".header-search__input");
    const searchIcon = headerSearch.querySelector(
      '[data-header-search-icon="search"]'
    );
    const closeIcon = headerSearch.querySelector(
      '[data-header-search-icon="close"]'
    );

    const setOpen = (isOpen) => {
      headerSearch.classList.toggle("is-open", isOpen);
      if (overlay) overlay.hidden = !isOpen;
      toggle?.setAttribute("aria-expanded", String(isOpen));
      toggle?.setAttribute("aria-label", isOpen ? "Close search" : "Open search");
      if (searchIcon) searchIcon.hidden = isOpen;
      if (closeIcon) closeIcon.hidden = !isOpen;
      if (isOpen) {
        input?.focus();
      } else if (input) {
        input.value = "";
        input.blur();
      }
    };

    toggle?.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(!headerSearch.classList.contains("is-open"));
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && headerSearch.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    document.addEventListener("click", (event) => {
      if (
        headerSearch.classList.contains("is-open") &&
        !headerSearch.contains(event.target)
      ) {
        setOpen(false);
      }
    });
  }

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

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const note = contactForm.querySelector("[data-form-note]");
    const nameInput = contactForm.querySelector("#contact-name");
    const emailInput = contactForm.querySelector("#contact-email");
    const subjectInput = contactForm.querySelector("#contact-subject");
    const messageInput = contactForm.querySelector("#contact-message");
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      note?.classList.remove("is-success", "is-error");
      [nameInput, emailInput, subjectInput, messageInput].forEach((el) =>
        el?.classList.remove("is-invalid")
      );

      const name = nameInput?.value.trim() ?? "";
      const email = emailInput?.value.trim() ?? "";
      const subject = subjectInput?.value.trim() ?? "";
      const message = messageInput?.value.trim() ?? "";

      if (!name) {
        nameInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Please enter your name.";
        nameInput?.focus();
        return;
      }

      if (!isValidEmail(email)) {
        emailInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Enter a valid email address.";
        emailInput?.focus();
        return;
      }

      if (!subject) {
        subjectInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Please add a subject.";
        subjectInput?.focus();
        return;
      }

      if (!message) {
        messageInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Please write a short message.";
        messageInput?.focus();
        return;
      }

      note?.classList.add("is-success");
      if (note) note.textContent = "Thanks — we'll get back to you soon.";
      contactForm.reset();
    });
  }

  const claimForm = document.querySelector("[data-claim-form]");
  if (claimForm) {
    const note = claimForm.querySelector("[data-form-note]");
    const platformInput = claimForm.querySelector("#claim-platform");
    const linkInput = claimForm.querySelector("#claim-link");
    const claimInput = claimForm.querySelector("#claim-text");
    const targetInput = claimForm.querySelector("#claim-target");
    const emailInput = claimForm.querySelector("#claim-email");
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isValidUrl = (value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };

    claimForm.addEventListener("submit", (event) => {
      event.preventDefault();
      note?.classList.remove("is-success", "is-error");
      [platformInput, linkInput, claimInput, targetInput, emailInput].forEach(
        (el) => el?.classList.remove("is-invalid")
      );

      const platform = platformInput?.value.trim() ?? "";
      const link = linkInput?.value.trim() ?? "";
      const claim = claimInput?.value.trim() ?? "";
      const target = targetInput?.value.trim() ?? "";
      const email = emailInput?.value.trim() ?? "";

      if (!platform) {
        platformInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Please enter the platform name.";
        platformInput?.focus();
        return;
      }

      if (!isValidUrl(link)) {
        linkInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Paste a valid URL (including https://).";
        linkInput?.focus();
        return;
      }

      if (!claim) {
        claimInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Please describe what the claim says.";
        claimInput?.focus();
        return;
      }

      if (!target) {
        targetInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Please say who this targets.";
        targetInput?.focus();
        return;
      }

      if (email && !isValidEmail(email)) {
        emailInput?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Enter a valid email, or leave it blank.";
        emailInput?.focus();
        return;
      }

      note?.classList.add("is-success");
      if (note) {
        note.textContent = email
          ? "Thanks — we received your claim and may follow up by email."
          : "Thanks — we received your claim.";
      }
      claimForm.reset();
    });
  }

  const searchResults = document.querySelector("[data-search-results]");
  if (searchResults) {
    const queryEl = document.querySelector("[data-search-query]");
    const items = [...searchResults.querySelectorAll("[data-search-item]")];
    const sections = [...searchResults.querySelectorAll("[data-search-section]")];
    const query = (new URLSearchParams(location.search).get("q") ?? "").trim();
    const queryLower = query.toLowerCase();

    if (queryEl) queryEl.textContent = query;

    const headerInput = document.querySelector("#header-search-input");
    if (headerInput && query) headerInput.value = query;

    items.forEach((item) => {
      const title =
        (
          item.querySelector(".fc-card__title, .report-card__title")?.textContent ??
          ""
        )
          .trim()
          .toLowerCase();
      const match = Boolean(queryLower) && title.includes(queryLower);
      item.classList.toggle("is-hidden", !match);
    });

    sections.forEach((section) => {
      const hasVisible = [...section.querySelectorAll("[data-search-item]")].some(
        (item) => !item.classList.contains("is-hidden")
      );
      section.hidden = !hasVisible;
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

  const initContentHub = ({
    filtersSel,
    gridSel,
    emptySel,
    searchSel,
    paginationSel,
    titleSel,
    pageBtnClass,
    pageSize = 16,
  }) => {
    const filters = document.querySelector(filtersSel);
    const grid = document.querySelector(gridSel);
    if (!filters || !grid) return;

    const filterButtons = [...filters.querySelectorAll("[data-filter]")];
    const cards = [...grid.querySelectorAll("[data-category]")];
    const empty = document.querySelector(emptySel);
    const searchForm = document.querySelector(searchSel);
    const searchInput = searchForm?.querySelector('input[type="search"]');
    const pagination = document.querySelector(paginationSel);
    const pageNumbers = pagination?.querySelector("[data-page-numbers]");
    const prevBtn = pagination?.querySelector("[data-page-prev]");
    const nextBtn = pagination?.querySelector("[data-page-next]");
    let activeFilter = "all";
    let query = "";
    let currentPage = 1;

    const matchingCards = () =>
      cards.filter((card) => {
        const categoryMatch =
          activeFilter === "all" || card.dataset.category === activeFilter;
        const title =
          card.querySelector(titleSel)?.textContent.toLowerCase() ?? "";
        const searchMatch = !query || title.includes(query);
        return categoryMatch && searchMatch;
      });

    const render = () => {
      const matched = matchingCards();
      const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageSet = new Set(matched.slice(start, end));

      cards.forEach((card) => {
        card.classList.toggle("is-hidden", !pageSet.has(card));
      });

      empty?.classList.toggle("is-visible", matched.length === 0);

      if (pagination && pageNumbers) {
        const showPager = matched.length > pageSize;
        pagination.hidden = !showPager || matched.length === 0;
        pageNumbers.innerHTML = "";
        for (let page = 1; page <= totalPages; page += 1) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = pageBtnClass;
          btn.dataset.page = String(page);
          btn.textContent = String(page);
          btn.setAttribute("aria-label", `Page ${page}`);
          if (page === currentPage) {
            btn.classList.add("is-active");
            btn.setAttribute("aria-current", "page");
          }
          pageNumbers.appendChild(btn);
        }
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
      }

      filterButtons.forEach((btn) => {
        const active = btn.dataset.filter === activeFilter;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    };

    filters.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn || !filters.contains(btn)) return;
      activeFilter = btn.dataset.filter;
      currentPage = 1;
      render();
    });

    searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      query = (searchInput?.value ?? "").trim().toLowerCase();
      currentPage = 1;
      render();
    });

    searchInput?.addEventListener("input", () => {
      if ((searchInput.value ?? "").trim() === "" && query) {
        query = "";
        currentPage = 1;
        render();
      }
    });

    pagination?.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target || !pagination.contains(target)) return;

      const matched = matchingCards();
      const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));

      if (target.matches("[data-page-prev]")) {
        currentPage = Math.max(1, currentPage - 1);
      } else if (target.matches("[data-page-next]")) {
        currentPage = Math.min(totalPages, currentPage + 1);
      } else if (target.dataset.page) {
        currentPage = Number(target.dataset.page) || 1;
      } else {
        return;
      }
      render();
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const urlQuery = new URLSearchParams(location.search).get("q");
    if (urlQuery && searchInput) {
      searchInput.value = urlQuery;
      query = urlQuery.trim().toLowerCase();
    }

    render();
  };

  initContentHub({
    filtersSel: "[data-factcheck-filters]",
    gridSel: "[data-factcheck-grid]",
    emptySel: "[data-factcheck-empty]",
    searchSel: "[data-factcheck-search]",
    paginationSel: "[data-factcheck-pagination]",
    titleSel: ".fc-card__title",
    pageBtnClass: "fc-pagination__btn",
  });

  initContentHub({
    filtersSel: "[data-report-filters]",
    gridSel: "[data-report-grid]",
    emptySel: "[data-report-empty]",
    searchSel: "[data-report-search]",
    paginationSel: "[data-report-pagination]",
    titleSel: ".report-card__title",
    pageBtnClass: "rp-pagination__btn",
  });
})();
