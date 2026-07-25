(() => {
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const bindForm = (form, options = {}) => {
    if (!form) return;
    const note = form.querySelector("[data-form-note]");
    const emailInput = form.querySelector('input[type="email"]');

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      note?.classList.remove("is-success", "is-error");
      form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

      let valid = true;
      const email = emailInput?.value.trim() ?? "";

      if (emailInput && !isValidEmail(email)) {
        emailInput.classList.add("is-invalid");
        valid = false;
      }

      if (options.requireName) {
        const name = form.querySelector("#name");
        if (name && !name.value.trim()) {
          name.classList.add("is-invalid");
          valid = false;
        }
      }

      if (options.requireMessage) {
        const message = form.querySelector("#message");
        if (message && !message.value.trim()) {
          message.classList.add("is-invalid");
          valid = false;
        }
      }

      if (!valid) {
        note?.classList.add("is-error");
        if (note) note.textContent = options.errorMessage || "Please fix the highlighted fields.";
        form.querySelector(".is-invalid")?.focus();
        return;
      }

      note?.classList.add("is-success");
      if (note) note.textContent = options.successMessage || "You're subscribed.";
      form.reset();
    });
  };

  bindForm(document.querySelector("[data-waitlist]"), {
    successMessage: "You're subscribed. Watch your inbox.",
    errorMessage: "Enter a valid email to subscribe.",
  });

  bindForm(document.querySelector("[data-contact-form]"), {
    requireName: true,
    requireMessage: true,
    successMessage: "Message sent. We'll reply soon.",
    errorMessage: "Please complete all required fields.",
  });
})();
