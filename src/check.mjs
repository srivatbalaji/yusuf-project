// Checks content files and the built site. Run after `npm run build`.
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadContent } from "./build.mjs";
import { SECTIONS } from "./render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ---------- 1. Content ----------
const { site, years } = await loadContent();
if (!years[site.currentYear]) fail(`content/site.js: currentYear ${site.currentYear} has no content/years file`);

for (const [year, { file, data: c }] of Object.entries(years)) {
  const need = (value, field) => {
    if (value === undefined || value === null || value === "") fail(`${file}: "${field}" is required`);
  };
  need(c.name, "name");
  need(c.edition, "edition");
  need(c.host, "host");
  need(c.venue?.street, "venue.street");
  need(c.venue?.city, "venue.city");
  if (String(c.year) !== year) fail(`${file}: year is ${c.year} but the file is named ${year}.js`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date?.iso ?? "")) fail(`${file}: date.iso must look like YYYY-MM-DD`);
  else {
    const d = new Date(`${c.date.iso}T12:00:00Z`);
    const weekday = WEEKDAYS[d.getUTCDay()];
    if (!c.date.display.startsWith(weekday)) fail(`${file}: date.display "${c.date.display}" but ${c.date.iso} is a ${weekday}`);
    if (d.getUTCFullYear() !== c.year) fail(`${file}: date.iso year does not match year ${c.year}`);
  }
  for (const t of ["startTime", "endTime"]) {
    if (!/^\d{2}:\d{2}$/.test(c.date?.[t] ?? "")) fail(`${file}: date.${t} must look like HH:MM (24-hour)`);
  }

  for (const p of c.organizers ?? []) {
    if (p.email !== null && !EMAIL.test(p.email ?? "")) fail(`${file}: organizer "${p.name}" has an invalid email "${p.email}"`);
  }
  for (const [label, url] of [
    ["registration.url", c.registration?.url],
    ["sponsorship.url", c.sponsorship?.url],
  ]) {
    if (url !== null && url !== undefined && !/^https:\/\/\S+$/.test(url)) fail(`${file}: ${label} must be null or a full https:// link`);
  }
  if (c.sponsorship?.contact && !EMAIL.test(c.sponsorship.contact)) fail(`${file}: sponsorship.contact is not a valid email`);
  for (const l of c.logos ?? []) {
    if (l.logo && !existsSync(path.join(root, "assets", l.logo))) fail(`${file}: logo file assets/${l.logo} not found`);
  }
  for (const s of [c.speakers?.keynote, ...(c.speakers?.list ?? [])].filter(Boolean)) {
    if (!s.name) fail(`${file}: every speaker needs a name`);
    if (s.photo && !existsSync(path.join(root, "assets", s.photo))) fail(`${file}: speaker photo assets/${s.photo} not found`);
  }
  if (c.agenda?.published && c.agenda.items.some((i) => !i.time)) {
    warnings.push(`${file}: agenda.published is true but some items have no time`);
  }
}

// ---------- 2. Built output ----------
const dist = path.join(root, "dist");
if (!existsSync(path.join(dist, "index.html"))) {
  fail("dist/index.html missing: run `npm run build` first");
} else {
  const pages = ["index.html"];
  for (const entry of await readdir(dist, { withFileTypes: true })) {
    if (entry.isDirectory() && existsSync(path.join(dist, entry.name, "index.html"))) pages.push(`${entry.name}/index.html`);
  }
  for (const page of pages) {
    const html = await readFile(path.join(dist, page), "utf8");
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    if (!/<html lang="en">/.test(html)) fail(`${page}: missing <html lang>`);
    if (!/<meta name="viewport"/.test(html)) fail(`${page}: missing viewport meta`);
    if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(`${page}: must have exactly one <h1>`);
    for (const [id] of SECTIONS) if (!ids.has(id)) fail(`${page}: section #${id} missing`);
    const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
    if (dupes.length) fail(`${page}: duplicate ids ${[...new Set(dupes)].join(", ")}`);
    for (const [, href] of html.matchAll(/href="#([^"]*)"/g)) {
      if (!ids.has(href)) fail(`${page}: link to #${href} has no matching id`);
    }
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt="[^"]+"/.test(tag)) fail(`${page}: image without alt text: ${tag}`);
    }
    // Local (relative) files referenced by the page must exist in dist.
    for (const [, ref] of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) {
      if (ref.startsWith("//") || ref.startsWith("mailto")) continue;
      const target = path.join(dist, path.dirname(page), ref);
      const resolved = ref.endsWith("/") ? path.join(target, "index.html") : target;
      if (!existsSync(resolved)) fail(`${page}: broken local link "${ref}"`);
    }
    if (/lorem ipsum|example\.com/i.test(html)) fail(`${page}: contains filler text or example.com links`);
  }
}

// ---------- 3. Color contrast (WCAG AA: 4.5 normal text, 3.0 large/UI) ----------
const css = await readFile(path.join(root, "src/styles.css"), "utf8");
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const PAIRS = [
  ["gray", "teal", 4.5, "hero, contact section, badges, nav hover (white on teal fails)"],
  ["teal", "gray", 3.0, "header/footer accents, hero card title (large/bold)"],
  ["white", "gray", 4.5, "header, footer, buttons, hero title"],
  ["gray", "white", 4.5, "body text, links"],
  ["gray", "gray-5", 4.5, "alternate sections, notices"],
  ["gray", "teal-tint", 4.5, "chips"],
  ["gray-75", "white", 4.5, "secondary text"],
  ["gray-75", "gray-5", 4.5, "secondary text on alternate sections"],
  ["tbc-ink", "tbc-bg", 4.5, "To be confirmed labels"],
];
for (const [fg, bg, min, use] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) { fail(`contrast: token --${fg} or --${bg} not found in styles.css`); continue; }
  const r = ratio(tokens[fg], tokens[bg]);
  if (r < min) fail(`contrast: --${fg} on --${bg} is ${r.toFixed(2)}:1, needs ${min}:1 (${use})`);
}

// ---------- Report ----------
for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ content, ${Object.keys(years).length} year file(s), built pages, links, and ${PAIRS.length} color-contrast pairs all passed.`);
