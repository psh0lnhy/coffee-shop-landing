/* =========================================================
   Mleko & Miód — landing page interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Mobile navigation ---------- */
  const toggle = $(".nav-toggle");
  const nav = $("#nav");

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) closeNav();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  const header = $(".site-header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Opening hours (Europe/Warsaw) ---------- *
   * 0 = Sunday … 6 = Saturday
   * Each entry: [openHour, closeHour] in 24h decimal hours.
   */
  const HOURS = {
    0: [9, 18],   // Sunday
    1: [7, 20],   // Monday
    2: [7, 20],
    3: [7, 20],
    4: [7, 20],
    5: [7, 20],
    6: [8, 21],   // Saturday
  };

  const getWarsawNow = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: days[map.weekday] ?? new Date().getDay(),
      hour: Number(map.hour) % 24,
      minute: Number(map.minute),
    };
  };

  const formatHour = (value) => {
    const h = Math.floor(value);
    const m = Math.round((value - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const updateStatus = () => {
    const dot = $("#statusDot");
    const text = $("#statusText");
    if (!dot || !text) return;

    const { day, hour, minute } = getWarsawNow();
    const now = hour + minute / 60;
    const [open, close] = HOURS[day] ?? [0, 0];
    const isOpen = now >= open && now < close;

    dot.classList.toggle("is-open", isOpen);
    dot.classList.toggle("is-closed", !isOpen);

    if (isOpen) {
      const closingSoon = close - now <= 1;
      text.textContent = closingSoon
        ? `Open · closing at ${formatHour(close)}`
        : `Open now · until ${formatHour(close)}`;
    } else {
      // Find the next opening day (today if we open later, otherwise scan ahead).
      let nextDay = day;
      let nextOpen = open;
      if (now >= close) {
        for (let i = 1; i <= 7; i += 1) {
          const d = (day + i) % 7;
          if (HOURS[d]) {
            nextDay = d;
            nextOpen = HOURS[d][0];
            break;
          }
        }
      }
      const label = nextDay === day ? "today" : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][nextDay];
      text.textContent = `Closed · opens ${label} at ${formatHour(nextOpen)}`;
    }

    $$(".hours tr[data-days]").forEach((row) => {
      const days = (row.dataset.days || "").split(",").map(Number);
      row.classList.toggle("is-today", days.includes(day));
    });
  };

  updateStatus();
  window.setInterval(updateStatus, 60_000);

  /* ---------- Reveal on scroll ---------- */
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.children).filter((el) => el.classList.contains("reveal")) : [];
          const index = Math.max(0, siblings.indexOf(entry.target));
          entry.target.style.transitionDelay = `${Math.min(index, 5) * 70}ms`;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
  };

  /* ---------- Booking form ---------- */
  const form = $("#bookingForm");
  const status = $("#formStatus");
  const dateInput = $("#date");

  if (dateInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.min = now.toISOString().slice(0, 16);
  }

  const setError = (field, message) => {
    const error = $(`[data-error-for="${field.name}"]`);
    if (error) error.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const validators = {
    name: (value) => (value.trim().length >= 2 ? "" : "Please enter your name."),
    email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Please enter a valid email."),
    date: (value) => {
      if (!value) return "Pick a date and time.";
      return new Date(value).getTime() > Date.now() ? "" : "Please choose a future date.";
    },
  };

  if (form) {
    form.addEventListener("input", (event) => {
      const field = event.target;
      if (field.name in validators) setError(field, "");
      if (status) status.textContent = "";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let firstInvalid = null;

      Object.entries(validators).forEach(([name, validate]) => {
        const field = form.elements[name];
        if (!field) return;
        const message = validate(field.value);
        setError(field, message);
        if (message && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        showToast("Please fix the highlighted fields.");
        return;
      }

      // Demo only: no backend. Simulate a request.
      const button = form.querySelector("button[type=submit]");
      const original = button ? button.textContent : "";
      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }

      window.setTimeout(() => {
        if (button) {
          button.disabled = false;
          button.textContent = original;
        }
        if (status) status.textContent = "Request sent — we'll confirm by email within a day.";
        form.reset();
        if (dateInput) {
          const now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          dateInput.min = now.toISOString().slice(0, 16);
        }
        showToast("Booking request sent (demo).");
      }, 700);
    });
  }

  /* ---------- Footer year ---------- */
  const yearTarget = $("[data-year]");
  if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());
})();
