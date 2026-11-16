# Mleko & Miód — Coffee Shop Landing Page

A concept landing page for a fictional neighbourhood espresso bar in Kraków, built as a
portfolio project. Single page, no build step, no dependencies — just HTML, CSS and vanilla JS.

**Live demo:** https://psh0lnhy.github.io/coffee-shop-landing/
**Repository:** https://github.com/psh0lnhy/coffee-shop-landing

Run locally: `node serve.js 8123` in this folder, then open http://127.0.0.1:8123

---

## Case study (copy for the Upwork portfolio)

**Project:** Landing page for a coffee shop
**Role:** Design and front-end development
**Stack:** HTML5, CSS3 (Grid/Flexbox, custom properties), vanilla JavaScript
**Type:** Concept project (fictional business)

### The task

A small coffee shop needs one page that answers the only three questions a customer has:
what do you serve, when are you open, and how do I get there. It has to load fast on a phone,
work on shaky café Wi-Fi, and be editable later without a CMS licence.

### What I built

- Responsive single-page layout (desktop, tablet, mobile) with a mobile navigation menu
- Menu with three categories and tabular price alignment
- Opening-hours logic in JavaScript: "Open now / Closed, opens Saturday at 08:00",
  calculated in the shop's timezone (Europe/Warsaw), with the current day highlighted
- Booking form with client-side validation (name, email, future date) and a success state
- Scroll-reveal animations, carousel-style marquee, and a CSS-only illustration —
  no image assets on the critical path
- Accessibility: semantic landmarks, skip link, visible focus states, ARIA labels,
  `prefers-reduced-motion` support

### Result

Zero-dependency page that renders instantly and needs no hosting beyond static files.
The hours feature removes the most common support question ("are you open right now?").

> This is a demo with a fictional business; the booking form does not send data anywhere.

---

## Structure

```
index.html    markup + content
styles.css    design tokens, layout, components, responsive rules
script.js     nav, opening-hours status, reveal animations, form validation
```

## Run locally

```bash
python -m http.server 8123
# open http://localhost:8123
```

## Notes for the portfolio listing

- Thumbnail suggestion: hero section at 1440×900.
- Link: a live URL (GitHub Pages / Netlify drop) + this repository.
- Say "concept project" in the description — honest framing still shows the skill.
