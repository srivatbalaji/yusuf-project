// Turns one year's content object into a complete HTML page.
// Organizers should not need to edit this file; edit content/ instead.

export const SECTIONS = [
  ["about", "About"],
  ["organizers", "Organizers"],
  ["agenda", "Agenda"],
  ["speakers", "Speakers"],
  ["registration", "Registration"],
  ["sponsorship", "Sponsorship"],
  ["directions", "Directions & Parking"],
  ["contact", "Contact"],
  ["previous-years", "Previous Years"],
];

export function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Relative path from the page being rendered to the site root ("" or "../").
let base = "";

const TBC = '<span class="tbc">To be confirmed</span>';

// Renders a value, or a visible "To be confirmed" label when it is null/empty.
function orTbc(value) {
  return value === null || value === undefined || value === "" ? TBC : esc(value);
}

function fullTitle(c) {
  return `${c.edition} ${c.name}`;
}

export function mapsUrl(venue) {
  const q = encodeURIComponent(`${venue.street}, ${venue.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function appleMapsUrl(venue) {
  return `https://maps.apple.com/?q=${encodeURIComponent(`${venue.street}, ${venue.city}`)}`;
}

const ARROW = '<span class="arrow" aria-hidden="true">→</span>';

function registerButton(c, extraClass = "") {
  if (c.registration.url) {
    return `<a class="btn btn-primary ${extraClass}" href="${esc(c.registration.url)}">Register now ${ARROW}</a>`;
  }
  return `<a class="btn btn-primary ${extraClass}" href="#registration">Registration details ${ARROW}</a>`;
}

// UTC offset (e.g. "-07:00") of a local date/time in an IANA time zone, for the countdown.
function utcOffset(iso, time, timeZone) {
  const at = new Date(`${iso}T${time}:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName").value;
  return name === "GMT" ? "Z" : name.slice(3);
}

function header(c, { archived, homeHref }) {
  const link = ([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`;
  const links = SECTIONS.map(link).join("");
  // On desktop, Registration is the header button instead of a plain link.
  const desktopLinks = SECTIONS.filter(([id]) => id !== "registration").map(link).join("");
  return `
<a class="skip-link" href="#main">Skip to main content</a>
${archived ? `<div class="archive-banner">You are viewing the ${esc(c.year)} archive. <a href="${homeHref}">Go to the current symposium</a></div>` : ""}
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="#top">
      <span class="brand-mark" aria-hidden="true">${esc(String(c.year))}</span>
      <span class="brand-text"><span class="brand-long">Pacific Coast Pediatric Ophthalmology &amp; Strabismus Symposium</span><span class="brand-short">Pacific Coast Symposium</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Main">
      <ul>${desktopLinks}</ul>
    </nav>
    <a class="btn btn-cta header-cta" href="#registration">Register ${ARROW}</a>
    <details class="nav-mobile">
      <summary><span class="menu-icon" aria-hidden="true"></span>Menu</summary>
      <nav aria-label="Main (mobile)"><ul>${links}</ul></nav>
    </details>
  </div>
</header>`;
}

function hero(c, { icsHref }) {
  const v = c.venue;
  const start = `${c.date.iso}T${c.date.startTime}:00${utcOffset(c.date.iso, c.date.startTime, c.date.timezone)}`;
  return `
<section class="hero" id="top">
  <div class="wrap">
    <p class="eyebrow">${esc(c.edition)} · Save the date</p>
    <h1 class="hero-title">${esc(c.name)}</h1>
    <div class="hero-meta">
      <p>${esc(v.name)}<br>${esc(v.street)}, ${esc(v.city)}</p>
      <p>${esc(c.date.display)}<br>${esc(c.date.timeDisplay)}<br><span class="countdown" id="countdown" data-start="${start}" hidden></span></p>
    </div>
    ${registerButton(c, "btn-xl")}
    <ul class="hero-links plain">
      ${c.registration.url ? "" : "<li>Registration opens soon</li>"}
      <li><a href="${icsHref}" download>Add to calendar</a></li>
      <li><a href="#directions">Directions &amp; parking</a></li>
    </ul>
    <p class="hero-note">${esc(c.announcement)} Hosted by ${esc(c.host)}.</p>
  </div>
</section>`;
}

// Two-column section: heading (plus an optional action) on the left, content on the right.
function section(id, title, body, { variant = "", aside = "" } = {}) {
  return `
<section id="${id}" class="section ${variant}" aria-labelledby="${id}-title">
  <div class="wrap section-grid">
    <div class="section-head">
      <h2 id="${id}-title">${esc(title)}</h2>
      ${aside}
    </div>
    <div class="section-body">${body}</div>
  </div>
</section>`;
}

function aboutSection(c) {
  return section(
    "about",
    "About the symposium",
    `<div class="prose">${c.about.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    <h3>Join us</h3>
    <ul class="check-list">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
    <h3>Focus areas</h3>
    <ul class="chips">${c.topics.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`,
  );
}

function logoStrip(c) {
  if (!c.logos.length) return "";
  const items = c.logos
    .map((l) =>
      l.logo
        ? `<li><img src="${esc(base + l.logo)}" alt="${esc(l.name)}" height="56"></li>`
        : `<li class="logo-text">${esc(l.name)}</li>`,
    )
    .join("");
  return `<h3>Shown on the symposium flyer</h3><ul class="logo-strip">${items}</ul>`;
}

function organizersSection(c) {
  const people = c.organizers
    .map(
      (p) => `<li>
        <div>
          <p class="row-title">${esc(p.name)}</p>
          <p class="row-sub">${p.role ? esc(p.role) : "Role: " + TBC}</p>
        </div>
        <a class="person-email" href="mailto:${esc(p.email)}">${esc(p.email)}</a>
      </li>`,
    )
    .join("");
  return section(
    "organizers",
    "Organizers",
    `<p class="lead">Hosted by <strong>${esc(c.host)}</strong>.</p>
    <ul class="rows rows-split">${people}</ul>
    ${logoStrip(c)}`,
  );
}

function agendaSection(c, { icsHref }) {
  const a = c.agenda;
  const status = a.published
    ? ""
    : `<p class="notice"><strong>Schedule coming soon.</strong> The detailed program agenda will be released. Times and order below are not final.</p>`;
  const items = a.items
    .map(
      (i) => `<li>
        <span class="row-label">${i.time ? esc(i.time) : "Time TBA"}</span>
        <div><p class="row-title">${esc(i.title)}</p>${i.details ? `<p class="row-sub">${esc(i.details)}</p>` : ""}</div>
      </li>`,
    )
    .join("");
  return section(
    "agenda",
    "Agenda",
    `<p class="lead"><strong>${esc(c.date.display)}</strong> · ${esc(c.date.timeDisplay)}</p>
    ${status}
    <${a.published ? "ol" : "ul"} class="rows">${items}</${a.published ? "ol" : "ul"}>`,
    { aside: `<a class="btn btn-light" href="${icsHref}" download>Add to calendar ${ARROW}</a>` },
  );
}

function speakerRow(s, label) {
  return `<li>
    <span class="row-label">${label ? esc(label) : "Speaker"}</span>
    <div class="speaker">
      ${s.photo ? `<img class="speaker-photo" src="${esc(base + s.photo)}" alt="Photo of ${esc(s.name)}" width="96" height="96">` : ""}
      <div>
        <p class="row-title">${esc(s.name)}${s.credentials ? `, ${esc(s.credentials)}` : ""}</p>
        ${s.affiliation ? `<p class="row-sub">${esc(s.affiliation)}</p>` : ""}
        ${s.talk ? `<p><strong>${esc(s.talk)}</strong></p>` : ""}
        ${s.bio ? `<p>${esc(s.bio)}</p>` : ""}
      </div>
    </div>
  </li>`;
}

function speakersSection(c) {
  const { keynote, list } = c.speakers;
  const rows = [keynote ? speakerRow(keynote, "Keynote") : "", ...list.map((s) => speakerRow(s))].join("");
  const body = rows
    ? `<ul class="rows">${rows}</ul>`
    : `<ul class="rows"><li>
        <span class="row-label">Keynote</span>
        <div><p class="row-title">${TBC}</p><p class="row-sub">The Strabismus Session will feature a keynote speaker. Speakers will be announced with the program agenda.</p></div>
      </li></ul>`;
  return section("speakers", "Speakers", body);
}

function registrationSection(c) {
  const r = c.registration;
  const action = r.url
    ? `<a class="btn btn-primary" href="${esc(r.url)}">Register now ${ARROW}</a>`
    : `<div class="placeholder" role="note">
        <p class="placeholder-title">Registration link: not yet available</p>
        <p>Registration details will be released with the program agenda. This is a placeholder, not a working form.</p>
      </div>`;
  return section(
    "registration",
    "Registration",
    `<dl class="rows">
      <div><dt class="row-label">Registration opens</dt><dd>${orTbc(r.opens)}</dd></div>
      <div><dt class="row-label">Fee</dt><dd>${orTbc(r.fee)}</dd></div>
      <div><dt class="row-label">CME credit</dt><dd>Offered. Credit amount: ${orTbc(r.cmeCredits)}</dd></div>
      <div><dt class="row-label">Included</dt><dd>${r.included.map(esc).join(" · ")}</dd></div>
    </dl>
    <div class="after-rows">${action}</div>`,
  );
}

function sponsorshipSection(c) {
  const s = c.sponsorship;
  const body = s.url
    ? `<p>${s.details ? esc(s.details) : ""}</p><a class="btn btn-primary" href="${esc(s.url)}">Sponsorship information ${ARROW}</a>`
    : `<div class="placeholder" role="note">
        <p class="placeholder-title">Sponsorship information: not yet available</p>
        <p>Sponsorship opportunities, levels, and contacts have not been announced. This is a placeholder.</p>
        ${s.contact ? `<p>Inquiries: <a href="mailto:${esc(s.contact)}">${esc(s.contact)}</a></p>` : `<p>Sponsorship contact: ${TBC}. For general questions, see <a href="#contact">Contact</a>.</p>`}
      </div>`;
  return section("sponsorship", "Sponsorship", body);
}

function directionsSection(c) {
  const v = c.venue;
  const d = c.directions;
  return section(
    "directions",
    "Directions & Parking",
    `<address class="venue">
      <strong>${esc(v.name)}</strong><br>
      ${esc(v.street)}<br>
      ${esc(v.city)}
    </address>
    <dl class="rows">
      <div><dt class="row-label">Room / building</dt><dd>${orTbc(v.room)}</dd></div>
      <div><dt class="row-label">Date &amp; time</dt><dd>${esc(c.date.display)}, ${esc(c.date.timeDisplay)}</dd></div>
      <div><dt class="row-label">Parking</dt><dd>${orTbc(d.parking)}</dd></div>
      <div><dt class="row-label">Public transit</dt><dd>${d.transit ? esc(d.transit) : `${TBC} Plan a trip with <a href="https://511.org/transit/trip-planner" rel="noopener" target="_blank">511.org</a>.`}</dd></div>
      <div><dt class="row-label">Entrance &amp; check-in</dt><dd>${orTbc(d.entrance)}</dd></div>
      <div><dt class="row-label">Accessibility</dt><dd>${orTbc(d.accessibility)}</dd></div>
    </dl>`,
    {
      aside: `<div class="head-actions">
        <a class="btn btn-primary" href="${mapsUrl(v)}" rel="noopener" target="_blank">Google Maps ${ARROW}</a>
        <a class="btn btn-light" href="${appleMapsUrl(v)}" rel="noopener" target="_blank">Apple Maps ${ARROW}</a>
      </div>`,
    },
  );
}

function contactSection(c) {
  const rows = c.organizers
    .map(
      (p) => `<li><p class="row-title">${esc(p.name)}</p>
        <a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>`,
    )
    .join("");
  return section("contact", "Contact us", `<ul class="rows rows-split">${rows}</ul>`, { variant: "section-dark" });
}

function previousYearsSection(site, c, { yearHref }) {
  const past = site.archive.filter((a) => a.year !== c.year);
  const items = past
    .map((a) => {
      const page = yearHref(a.year);
      return `<li>
        <span class="row-label">${a.year ? esc(a.year) : TBC}</span>
        <div>
          <p class="row-title">${esc(a.edition)} Symposium</p>
          <p class="row-sub">${a.summary ? esc(a.summary) : `Recap: ${TBC}`}</p>
          ${page ? `<p><a href="${page}">View the ${esc(a.year)} page</a></p>` : ""}
          ${a.link ? `<p><a href="${esc(a.link)}" rel="noopener">More about this year</a></p>` : ""}
        </div>
      </li>`;
    })
    .join("");
  return section(
    "previous-years",
    "Previous Years",
    items ? `<ul class="rows">${items}</ul>` : "<p>No previous years listed yet.</p>",
  );
}

function footer(c) {
  return `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <p class="footer-title">${esc(fullTitle(c))}</p>
    <p>${esc(c.date.display)}<br>${esc(c.date.timeDisplay)}</p>
    <p>${esc(c.venue.name)}<br>${esc(c.venue.street)}, ${esc(c.venue.city)}</p>
    <p><a href="#top">Back to top ↑</a></p>
  </div>
</footer>
<nav class="quick-bar" aria-label="Quick links">
  <a href="#agenda">Agenda</a>
  <a href="#directions">Directions</a>
  <a href="#registration">Register</a>
  <a href="#contact">Contact</a>
</nav>`;
}

// Small progressive enhancements; the page works fully without them.
// Countdown to the start time, current-section highlight in the nav, and
// closing the mobile menu after a link is chosen.
const PAGE_SCRIPT = `
(() => {
  const cd = document.getElementById("countdown");
  if (cd) {
    const start = Date.parse(cd.dataset.start);
    const tick = () => {
      const s = Math.floor((start - Date.now()) / 1000);
      if (!(s > 0)) { cd.hidden = true; return; }
      const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
      cd.textContent = d + "d " + h + "h " + m + "m to go";
      cd.hidden = false;
    };
    tick();
    setInterval(tick, 30000);
  }
  const links = [...document.querySelectorAll(".nav-desktop a, .nav-mobile a")];
  if ("IntersectionObserver" in window) {
    const seen = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        for (const a of links) {
          if (a.hash === "#" + e.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        }
      }
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach((s) => seen.observe(s));
  }
  const menu = document.querySelector(".nav-mobile");
  menu?.addEventListener("click", (e) => { if (e.target.closest("a")) menu.open = false; });
})();
`;

export function renderPage(c, site, opts) {
  const { icsFile, archived, homeHref, yearHref } = opts;
  base = opts.base;
  const cssHref = `${base}styles.css`;
  const icsHref = `${base}${icsFile}`;
  const title = `${c.year} Pacific Coast Pediatric Ophthalmology & Strabismus Symposium`;
  const description = `${c.date.display}, ${c.date.timeDisplay}. Hosted by ${c.host}, ${c.venue.street}, ${c.venue.city}.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: fullTitle(c),
    startDate: `${c.date.iso}T${c.date.startTime}`,
    endDate: `${c.date.iso}T${c.date.endTime}`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: c.venue.name,
      address: `${c.venue.street}, ${c.venue.city}`,
    },
    organizer: { "@type": "Organization", name: c.host },
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#262324">
<meta property="og:title" content="${esc(fullTitle(c))}">
<meta property="og:description" content="${esc(description)}">
${archived ? '<meta name="robots" content="noindex">' : ""}
<link rel="stylesheet" href="${cssHref}">
<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll("<", "\\u003c")}</script>
</head>
<body>
${header(c, { archived, homeHref })}
<main id="main">
${hero(c, { icsHref })}
${aboutSection(c)}
${organizersSection(c)}
${agendaSection(c, { icsHref })}
${speakersSection(c)}
${registrationSection(c)}
${sponsorshipSection(c)}
${directionsSection(c)}
${contactSection(c)}
${previousYearsSection(site, c, { yearHref })}
</main>
${footer(c)}
<script>${PAGE_SCRIPT}</script>
</body>
</html>
`;
}
