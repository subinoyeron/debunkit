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

  const darkHeaderBodyClasses = [
    "submit-page",
    "contact-page",
    "training-page",
    "search-page",
    "factchecks-page",
  ];

  const usesLightLogo = () => {
    if (!header || header.classList.contains("is-scrolled")) return false;
    if (hero) return true;
    return darkHeaderBodyClasses.some((cls) => document.body.classList.contains(cls));
  };

  const updateLogo = () => {
    if (!logoImage?.dataset.logoColor || !logoImage?.dataset.logoWhite || !header) return;
    const next = usesLightLogo() ? logoImage.dataset.logoWhite : logoImage.dataset.logoColor;
    if (logoImage.getAttribute("src") !== next) {
      logoImage.setAttribute("src", next);
    }
  };

  const setScrolled = () => {
    if (!header) return;
    const threshold = hero
      ? Math.max(24, Math.min(hero.offsetHeight * 0.55, 420))
      : 4;
    header.classList.toggle("is-scrolled", window.scrollY > threshold);
    updateLogo();
  };

  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });
  window.addEventListener("resize", setScrolled, { passive: true });

  const footer = document.querySelector(".site-footer");
  if (header && footer && "IntersectionObserver" in window) {
    const updateFooterHide = (isIntersecting) => {
      // Keep the nav visible on short pages (e.g. empty search) where the
      // footer is already in view without scrolling.
      const hide = Boolean(isIntersecting) && window.scrollY > 48;
      header.classList.toggle("is-footer-hidden", hide);
      if (hide && menuToggle && mobileNav) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        mobileNav.hidden = true;
      }
    };

    let footerInView = false;
    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        footerInView = entry.isIntersecting;
        updateFooterHide(footerInView);
      },
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" }
    );
    footerObserver.observe(footer);
    window.addEventListener(
      "scroll",
      () => updateFooterHide(footerInView),
      { passive: true }
    );
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

    /* Real claim copy cycles through three common false narratives. */
    const STATUSES = [
      {
        claim: "Haitian immigrants in Ohio are stealing and eating pets.",
        likes: "128",
        comments: "47",
        shares: "19",
        time: 62,
        width: 380,
        chip: "top-right",
      },
      {
        claim: "Muslims are imposing Sharia law in Texas.",
        likes: "2.4K",
        comments: "891",
        shares: "312",
        time: 54,
        width: 360,
        chip: "mid-left",
      },
      {
        claim: "Indian immigrants are taking all American tech jobs.",
        likes: "56",
        comments: "12",
        shares: "8",
        time: 68,
        width: 400,
        chip: "below-start",
      },
    ];

    let statusIndex = 0;
    let activeStatus = STATUSES[0];

    const buildChars = (text) => {
      claim.textContent = "";
      return [...text].map((ch) => {
        const span = document.createElement("span");
        span.className = "about-demo__char";
        span.textContent = ch;
        claim.appendChild(span);
        return span;
      });
    };

    const applyStatus = (status) => {
      activeStatus = status;
      stage.style.width = `min(100%, ${status.width}px)`;
      if (timeEl) timeEl.style.width = `${status.time}px`;
      if (likesEl) likesEl.textContent = `Like · ${status.likes}`;
      if (commentsEl) commentsEl.textContent = `Comment · ${status.comments}`;
      if (sharesEl) sharesEl.textContent = `Share · ${status.shares}`;
      return buildChars(status.claim);
    };

    let chars = applyStatus(STATUSES[0]);

    const pointInStage = (el, edge = "start") => {
      const stageRect = stage.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const x =
        edge === "end"
          ? rect.right - stageRect.left - 2
          : edge === "center"
            ? rect.left + rect.width / 2 - stageRect.left
            : rect.left - stageRect.left;
      const y = rect.top + rect.height * 0.65 - stageRect.top;
      return { x, y };
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
      const first = chars[0].getBoundingClientRect();
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
      if (!chars.length) return;

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
      const end = pointInStage(chars[chars.length - 1], "end");
      const start = pointInStage(chars[0], "start");
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
      chars.forEach((span) => span.classList.add("is-selected"));
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
      chars.forEach((span) => span.classList.remove("is-selected"));
      chip.style.left = "";
      chip.style.top = "";
      const stageRect = stage.getBoundingClientRect();
      setCursor(stageRect.width - 36, stageRect.height - 28, false);
    };

    const runLoop = async () => {
      if (!running) return;

      const status = STATUSES[statusIndex % STATUSES.length];
      statusIndex += 1;
      chars = applyStatus(status);
      resetVisuals();

      await wait(180);
      if (!running) return;

      root.classList.add("is-post-in");
      await wait(900);
      if (!running) return;

      const start = pointInStage(chars[0], "start");
      const end = pointInStage(chars[chars.length - 1], "end");

      root.classList.add("is-cursor-on");
      const stageRect = stage.getBoundingClientRect();
      setCursor(stageRect.width - 36, stageRect.height - 28, false);
      await wait(40);
      setCursor(start.x, start.y, true);
      await wait(600);
      if (!running) return;

      const selectDuration = Math.max(1400, Math.min(2000, status.claim.length * 32));
      const startTime = performance.now();

      await new Promise((resolve) => {
        const tick = (now) => {
          if (!running) {
            resolve();
            return;
          }
          const t = Math.min(1, (now - startTime) / selectDuration);
          const eased = 1 - Math.pow(1 - t, 2.2);
          const count = Math.floor(eased * chars.length);

          chars.forEach((span, i) => {
            span.classList.toggle("is-selected", i < count);
          });

          setCursor(
            start.x + (end.x - start.x) * eased,
            start.y + (end.y - start.y) * eased,
            false
          );

          if (t < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            chars.forEach((span) => span.classList.add("is-selected"));
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
    const linkList = claimForm.querySelector("[data-link-list]");
    const addLinkBtn = claimForm.querySelector("[data-add-link]");
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
    const linkInputs = () => [...(linkList?.querySelectorAll('input[name="link[]"]') ?? [])];
    const renumberLinks = () => {
      linkInputs().forEach((input, index) => {
        input.setAttribute("aria-label", `Link ${index + 1}`);
        if (index === 0) {
          input.id = "claim-link";
          input.required = true;
        } else {
          input.removeAttribute("id");
          input.required = false;
        }
      });
    };
    const addLinkRow = () => {
      if (!linkList) return;
      const index = linkInputs().length + 1;
      const row = document.createElement("div");
      row.className = "submit-links__row";
      row.innerHTML = `
        <input
          name="link[]"
          type="url"
          inputmode="url"
          autocomplete="url"
          placeholder="Paste another URL"
          aria-label="Link ${index}"
        />
        <button class="submit-links__remove" type="button" aria-label="Remove link">×</button>
      `;
      linkList.appendChild(row);
      renumberLinks();
      row.querySelector("input")?.focus();
    };

    addLinkBtn?.addEventListener("click", addLinkRow);
    linkList?.addEventListener("click", (event) => {
      const removeBtn = event.target.closest(".submit-links__remove");
      if (!removeBtn || !linkList.contains(removeBtn)) return;
      removeBtn.closest(".submit-links__row")?.remove();
      renumberLinks();
    });

    claimForm.addEventListener("submit", (event) => {
      event.preventDefault();
      note?.classList.remove("is-success", "is-error");
      [platformInput, claimInput, targetInput, emailInput, ...linkInputs()].forEach(
        (el) => el?.classList.remove("is-invalid")
      );

      const platform = platformInput?.value.trim() ?? "";
      const links = linkInputs()
        .map((input) => input.value.trim())
        .filter(Boolean);
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

      if (!links.length) {
        const first = linkInputs()[0];
        first?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Paste at least one valid URL (including https://).";
        first?.focus();
        return;
      }

      const invalidLink = linkInputs().find((input) => {
        const value = input.value.trim();
        return value && !isValidUrl(value);
      });
      if (invalidLink || !links.every(isValidUrl)) {
        (invalidLink ?? linkInputs()[0])?.classList.add("is-invalid");
        note?.classList.add("is-error");
        if (note) note.textContent = "Paste a valid URL (including https://).";
        (invalidLink ?? linkInputs()[0])?.focus();
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
      // Reset to a single link row after successful submit
      if (linkList) {
        [...linkList.querySelectorAll(".submit-links__row")].slice(1).forEach((row) => row.remove());
        renumberLinks();
      }
    });
  }

  const searchResults = document.querySelector("[data-search-results]");
  if (searchResults) {
    const queryEl = document.querySelector("[data-search-query]");
    const emptyEl = document.querySelector("[data-search-empty]");
    const items = [...searchResults.querySelectorAll("[data-search-item]")];
    const sections = [...searchResults.querySelectorAll("[data-search-section]")];
    const query = (new URLSearchParams(location.search).get("q") ?? "").trim();
    const queryLower = query.toLowerCase();

    if (queryEl) queryEl.textContent = query;

    const headerInput = document.querySelector("#header-search-input");
    if (headerInput && query) headerInput.value = query;

    const pageSearchInput = document.querySelector("#page-search-input");
    if (pageSearchInput) pageSearchInput.value = query;

    let visibleCount = 0;
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
      if (match) visibleCount += 1;
    });

    sections.forEach((section) => {
      const hasVisible = [...section.querySelectorAll("[data-search-item]")].some(
        (item) => !item.classList.contains("is-hidden")
      );
      section.hidden = !hasVisible;
    });

    if (emptyEl) {
      emptyEl.hidden = visibleCount > 0;
    }
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
    loadMoreSel,
    titleSel,
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
    const loadMoreBtn = document.querySelector(loadMoreSel);
    let activeFilter = "all";
    let query = "";
    let visibleCount = pageSize;

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
      if (visibleCount > matched.length) visibleCount = matched.length || pageSize;

      const visibleSet = new Set(matched.slice(0, visibleCount));

      cards.forEach((card) => {
        card.classList.toggle("is-hidden", !visibleSet.has(card));
      });

      empty?.classList.toggle("is-visible", matched.length === 0);

      if (loadMoreBtn) {
        const showMore = matched.length > visibleCount;
        loadMoreBtn.hidden = !showMore;
      }

      filterButtons.forEach((btn) => {
        const active = btn.dataset.filter === activeFilter;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    };

    const resetVisible = () => {
      visibleCount = pageSize;
      render();
    };

    filters.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn || !filters.contains(btn)) return;
      activeFilter = btn.dataset.filter;
      resetVisible();
    });

    searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      query = (searchInput?.value ?? "").trim().toLowerCase();
      resetVisible();
    });

    searchInput?.addEventListener("input", () => {
      if ((searchInput.value ?? "").trim() === "" && query) {
        query = "";
        resetVisible();
      }
    });

    loadMoreBtn?.addEventListener("click", () => {
      visibleCount += pageSize;
      render();
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
    loadMoreSel: "[data-factcheck-load-more]",
    titleSel: ".fc-card__title",
  });

  initContentHub({
    filtersSel: "[data-report-filters]",
    gridSel: "[data-report-grid]",
    emptySel: "[data-report-empty]",
    searchSel: "[data-report-search]",
    loadMoreSel: "[data-report-load-more]",
    titleSel: ".report-card__title",
  });

  const newsletterModal = document.querySelector("[data-newsletter-modal]");
  if (newsletterModal) {
    const STORAGE_KEY = "debunkit-newsletter-popup";
    const modalForm = newsletterModal.querySelector("[data-newsletter-modal-form]");
    const modalEmail = newsletterModal.querySelector("#newsletter-modal-email");
    const modalNote = newsletterModal.querySelector("[data-form-note]");
    const closeButton = newsletterModal.querySelector("[data-newsletter-modal-close]");
    const backdrop = newsletterModal.querySelector("[data-newsletter-modal-backdrop]");
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    let showTimer;

    const hasSeenModal = () => {
      try {
        return Boolean(localStorage.getItem(STORAGE_KEY));
      } catch {
        return false;
      }
    };

    const rememberModal = (status) => {
      try {
        localStorage.setItem(STORAGE_KEY, status);
      } catch {
        /* ignore storage errors */
      }
    };

    const openModal = () => {
      if (!newsletterModal.hidden) return;
      newsletterModal.hidden = false;
      document.body.classList.add("is-modal-open");
      window.setTimeout(() => modalEmail?.focus(), 50);
    };

    const closeModal = (status = "dismissed") => {
      if (newsletterModal.hidden) return;
      newsletterModal.hidden = true;
      document.body.classList.remove("is-modal-open");
      rememberModal(status);
      window.clearTimeout(showTimer);
    };

    if (!hasSeenModal()) {
      showTimer = window.setTimeout(openModal, 4000);
    }

    closeButton?.addEventListener("click", () => closeModal("dismissed"));

    backdrop?.addEventListener("click", () => closeModal("dismissed"));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !newsletterModal.hidden) {
        closeModal("dismissed");
      }
    });

    modalForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      modalNote?.classList.remove("is-success", "is-error");
      modalEmail?.classList.remove("is-invalid");

      const email = modalEmail?.value.trim() ?? "";
      if (!isValidEmail(email)) {
        modalEmail?.classList.add("is-invalid");
        modalNote?.classList.add("is-error");
        if (modalNote) modalNote.textContent = "Enter a valid email to subscribe.";
        modalEmail?.focus();
        return;
      }

      modalNote?.classList.add("is-success");
      if (modalNote) modalNote.textContent = "You're subscribed. Watch your inbox.";
      modalForm.reset();
      window.setTimeout(() => closeModal("subscribed"), 1200);
    });
  }
})();
