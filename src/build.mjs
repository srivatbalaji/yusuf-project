// Builds the static site into dist/.
//   dist/index.html          current year (content/site.js -> currentYear)
//   dist/<year>/index.html   archived page for every other content/years/<year>.js
//   dist/symposium-<year>.ics calendar file for each year
import { cp, mkdir, readdir, rm, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { renderPage } from "./render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

export async function loadContent() {
  const site = (await import(pathToFileURL(path.join(root, "content/site.js")))).default;
  const dir = path.join(root, "content/years");
  const years = {};
  for (const file of (await readdir(dir)).filter((f) => /^\d{4}\.js$/.test(f))) {
    const data = (await import(pathToFileURL(path.join(dir, file)))).default;
    years[data.year] = { file: `content/years/${file}`, data };
  }
  return { site, years };
}

// Converts a wall-clock time in an IANA time zone to a UTC "YYYYMMDDTHHMMSSZ" stamp.
function toUtcStamp(isoDate, time, timeZone) {
  const naive = new Date(`${isoDate}T${time}:00Z`);
  const offsetPart = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(naive)
    .find((p) => p.type === "timeZoneName").value; // e.g. "GMT-07:00"
  const m = offsetPart.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMin = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
  const utc = new Date(naive.getTime() - offsetMin * 60000);
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function renderIcs(c) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pacific Coast Pediatric Ophthalmology & Strabismus Symposium//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:symposium-${c.year}@pacific-coast-peds-ophtho`,
    `DTSTAMP:${toUtcStamp(c.date.iso, c.date.startTime, c.date.timezone)}`,
    `DTSTART:${toUtcStamp(c.date.iso, c.date.startTime, c.date.timezone)}`,
    `DTEND:${toUtcStamp(c.date.iso, c.date.endTime, c.date.timezone)}`,
    `SUMMARY:${icsEscape(`${c.edition} ${c.name}`)}`,
    `LOCATION:${icsEscape(`${c.venue.name}, ${c.venue.street}, ${c.venue.city}`)}`,
    `DESCRIPTION:${icsEscape(`Hosted by ${c.host}. Registration details and program agenda to follow.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

async function build() {
  const { site, years } = await loadContent();
  const current = years[site.currentYear];
  if (!current) throw new Error(`content/site.js currentYear is ${site.currentYear}, but content/years/${site.currentYear}.js was not found.`);

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  if (existsSync(path.join(root, "assets"))) await cp(path.join(root, "assets"), dist, { recursive: true });
  await copyFile(path.join(root, "src/styles.css"), path.join(dist, "styles.css"));
  await writeFile(path.join(dist, ".nojekyll"), "");

  const yearHrefFrom = (base) => (y) => (y && years[y] && y !== site.currentYear ? `${base}${y}/` : null);

  for (const [year, { data }] of Object.entries(years)) {
    const isCurrent = Number(year) === site.currentYear;
    const base = isCurrent ? "" : "../";
    const icsFile = `symposium-${year}.ics`;
    const html = renderPage(data, site, {
      base,
      icsFile,
      archived: !isCurrent,
      homeHref: isCurrent ? "./" : "../",
      yearHref: yearHrefFrom(base),
    });
    const outDir = isCurrent ? dist : path.join(dist, year);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html.replace(/[ \t]+$/gm, ""));
    await writeFile(path.join(dist, icsFile), renderIcs(data));
    console.log(`built ${path.relative(root, path.join(outDir, "index.html"))}${isCurrent ? " (current year)" : ""}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
