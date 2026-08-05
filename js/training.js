(() => {
  const form = document.querySelector("[data-training-form]");
  if (!form) return;

  const note = form.querySelector("[data-form-note]");
  const formatGroup = form.querySelector("[data-train-format]");
  const budgetGroup = form.querySelector("[data-train-budget]");
  const stepPanels = [...form.querySelectorAll("[data-train-step]")];
  const stepCurrentEl = form.querySelector("[data-train-step-current]");
  const progressBar = form.querySelector("[data-train-progress-bar]");
  const progressFill = form.querySelector("[data-train-progress-fill]");
  const stepIntro = form.querySelector("[data-train-step-intro]");
  const stepTitle = form.querySelector("[data-train-step-title]");
  const stepCopy = form.querySelector("[data-train-step-copy]");
  const backBtn = form.querySelector("[data-train-back]");
  const nextBtn = form.querySelector("[data-train-next]");
  const submitBtn = form.querySelector("[data-train-submit]");
  const totalSteps = 3;
  let currentStep = 1;

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const fields = {
    name: form.querySelector("#train-name"),
    email: form.querySelector("#train-email"),
    org: form.querySelector("#train-org"),
    participants: form.querySelector("#train-participants"),
    goals: form.querySelector("#train-goals"),
  };

  const stepCopyMap = {
    2: {
      title: "Tell us about yourself",
      copy: "Share your contact details and organization so we know who to reach and how to plan your training.",
    },
    3: {
      title: "Plan your training",
      copy: "Share your preferred format, audience, goals, and any funding information so we can prepare the right session.",
    },
  };

  const clearFieldError = (input) => {
    if (!input) return;
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    const errorId = input.getAttribute("aria-describedby");
    if (!errorId) return;
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = "";
  };

  const setFieldError = (input, message) => {
    if (!input) return;
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    const errorId = input.getAttribute("aria-describedby");
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl) errorEl.textContent = message;
  };

  const clearRadioError = (group, errorId) => {
    group?.classList.remove("is-invalid");
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = "";
  };

  const setRadioError = (group, errorId, message) => {
    group?.classList.add("is-invalid");
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = message;
  };

  const clearAll = () => {
    Object.values(fields).forEach(clearFieldError);
    clearRadioError(formatGroup, "train-format-error");
    clearRadioError(budgetGroup, "train-budget-error");
    note?.classList.remove("is-success", "is-error");
    if (note) note.textContent = "";
  };

  const selectedRadio = (name) =>
    form.querySelector(`input[name="${name}"]:checked`);

  const showStep = (step) => {
    currentStep = step;
    stepPanels.forEach((panel) => {
      const isActive = Number(panel.dataset.trainStep) === step;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });

    if (stepCurrentEl) stepCurrentEl.textContent = String(step);
    if (progressFill) progressFill.style.width = `${(step / totalSteps) * 100}%`;
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(step));

    const meta = stepCopyMap[step];
    if (stepIntro) stepIntro.hidden = !meta;
    if (stepTitle) stepTitle.textContent = meta?.title ?? "";
    if (stepCopy) stepCopy.textContent = meta?.copy ?? "";

    if (backBtn) backBtn.hidden = step === 1;
    if (nextBtn) {
      nextBtn.hidden = step === totalSteps;
      nextBtn.textContent = "Next";
    }
    if (submitBtn) submitBtn.hidden = step !== totalSteps;

    const firstField = form
      .querySelector(`[data-train-step="${step}"]`)
      ?.querySelector("input, select, textarea, button");
    firstField?.focus?.({ preventScroll: true });
    form.querySelector(".training-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const validateAboutStep = () => {
    clearAll();
    const name = fields.name?.value.trim() ?? "";
    const email = fields.email?.value.trim() ?? "";
    const org = fields.org?.value.trim() ?? "";
    let firstInvalid = null;

    const fail = (el, message) => {
      setFieldError(el, message);
      if (!firstInvalid) firstInvalid = el;
    };

    if (!name) fail(fields.name, "Please enter your full name.");
    if (!email) fail(fields.email, "Please enter your email address.");
    else if (!isValidEmail(email))
      fail(fields.email, "Enter a valid email address.");
    if (!org) fail(fields.org, "Please enter your organization name.");

    if (firstInvalid) {
      note?.classList.add("is-error");
      if (note) note.textContent = "Please fix the highlighted fields to continue.";
      firstInvalid.focus?.();
      return false;
    }
    return true;
  };

  const validateDetailsStep = () => {
    clearAll();
    const participants = fields.participants?.value.trim() ?? "";
    const goals = fields.goals?.value.trim() ?? "";
    const format = selectedRadio("format");
    const budget = selectedRadio("budget");
    let firstInvalid = null;

    const fail = (el, message) => {
      setFieldError(el, message);
      if (!firstInvalid) firstInvalid = el;
    };

    if (!format) {
      setRadioError(formatGroup, "train-format-error", "Please choose a preferred format.");
      if (!firstInvalid) firstInvalid = formatGroup?.querySelector("input");
    }
    if (!participants)
      fail(fields.participants, "Please estimate the number of participants.");
    if (!goals) fail(fields.goals, "Please share your training goals.");
    if (!budget) {
      setRadioError(budgetGroup, "train-budget-error", "Please select a budget option.");
      if (!firstInvalid) firstInvalid = budgetGroup?.querySelector("input");
    }

    if (firstInvalid) {
      note?.classList.add("is-error");
      if (note) note.textContent = "Please fix the highlighted fields and try again.";
      firstInvalid.focus?.();
      return false;
    }
    return true;
  };

  Object.values(fields).forEach((input) => {
    input?.addEventListener("input", () => clearFieldError(input));
    input?.addEventListener("change", () => clearFieldError(input));
  });

  formatGroup?.addEventListener("change", () =>
    clearRadioError(formatGroup, "train-format-error")
  );
  budgetGroup?.addEventListener("change", () =>
    clearRadioError(budgetGroup, "train-budget-error")
  );

  nextBtn?.addEventListener("click", () => {
    if (currentStep === 1) {
      showStep(2);
      return;
    }
    if (currentStep === 2 && validateAboutStep()) showStep(3);
  });

  backBtn?.addEventListener("click", () => {
    clearAll();
    showStep(Math.max(1, currentStep - 1));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentStep === 1) {
      showStep(2);
      return;
    }
    if (currentStep === 2) {
      if (validateAboutStep()) showStep(3);
      return;
    }
    if (!validateDetailsStep()) return;

    note?.classList.add("is-success");
    if (note) {
      note.textContent =
        "Thanks — we received your training request and will reply within five working days.";
    }
    form.reset();
    showStep(1);
  });

  showStep(1);
})();
