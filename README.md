# Pacific Coast Pediatric Ophthalmology & Strabismus Symposium website

A static website for the symposium, built for GitHub Pages. There is no framework and there are no dependencies. Only [Node.js](https://nodejs.org) 20 or newer is needed.

The source of truth for content is the organizers' flyer. The 2027 "Save the Date" flyers are kept in [`reference/`](reference/).

## Updating content (no coding needed)

All event details live in plain data files:

| File | What it holds |
| --- | --- |
| `content/years/2027.js` | Everything for the 2027 symposium: date, venue, agenda, speakers, registration, sponsorship, parking, contacts |
| `content/site.js` | Which year is shown on the home page (`currentYear`) and the **Previous Years** list |
| `assets/` | Images. Put approved logos in `assets/logos/` and speaker photos in `assets/photos/` |

Rules:

- Anything **not confirmed** should be `null`. The site then shows a yellow **"To be confirmed"** label. Never fill in a guess.
- **Registration link:** set `registration.url` to the real `https://` link. The "Register now" buttons turn on automatically. While it is `null`, the site shows a clearly labeled placeholder.
- **Sponsorship:** same idea with `sponsorship.url` and `sponsorship.contact`.
- **Agenda:** fill in each item's `time`, put the items in running order, then set `agenda.published: true`.
- **Speakers:** add entries only for confirmed speakers, using bios they provided. See the comment in the file for the fields.
- **Logos:** show only organizations whose logo or endorsement is on the flyer. Once you have an approved logo file, save it as, for example, `assets/logos/sutter-health.svg` and set `logo: "logos/sutter-health.svg"`.

### Starting a new year

1. Copy `content/years/2027.js` to `content/years/2028.js` and update every field from the new flyer. Set anything unknown to `null`.
2. In `content/site.js`, set `currentYear: 2028` and add a 2027 entry to `archive`.
3. The 2027 page remains available at `/2027/` as an archive.

## Build, check, and preview

```bash
npm run build     # writes the site to dist/
npm run check     # validates content, links, and color contrast
npm test          # build + check
npm run preview   # build, then serve at http://localhost:4173
```

`npm run check` catches common mistakes: a weekday that doesn't match the date, bad email addresses, non-`https` links, missing logo or photo files, broken in-page links, and text colors with too little contrast.

## Deploying to GitHub Pages

1. Put this folder in its own GitHub repository and push to the `main` branch.
2. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Each push to `main` runs `.github/workflows/deploy.yml`, which builds, checks, and publishes `dist/`. If the check fails, nothing is published.

All links are relative, so the site works at `https://<user>.github.io/<repo>/` or on a custom domain.
