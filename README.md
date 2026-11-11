# Share The Care

A complete local React website for Share The Care, San Ramon. Built with React, TypeScript, Vite, Tailwind CSS, GSAP/ScrollTrigger, the requested `@studio-freight/lenis`, Radix Dialog, and Lucide icons.

## Run locally

```sh
npm install
npm run dev -- --port 5173
```

Open **http://localhost:5173**. The development server binds to this computer's loopback address. It is running in the retained task session at delivery.

Website source, runtime assets, and tests are included in this repository. Local research archives, planning notes, and internal notes are kept outside Git and are not required to build or run the website.

```sh
npm test
npm run build
npm run preview
```

The production build is emitted to `dist/`. Node 22.12+ is required by the toolchain; this project was built and tested on Node 26.

## Structure and shadcn support

- `src/App.tsx`: the complete page and section composition.
- `src/index.css`: Tailwind entry point, theme, responsive design, and component styles.
- `src/data.ts`: the published 2025 roster and pickup listings.
- `components/ui/parallax-scrolling.tsx`: the supplied parallax pattern adapted to the actual San Ramon image, with scoped GSAP cleanup and reduced-motion behavior.
- `components/ui/clothing-rail.tsx`: pointer dragging, native touch scrolling, arrow controls, and four garment selectors for example drive stories.
- `components/drive-impact-dialog.tsx`: accessible example drive results, donation breakdown, activity story, and route map.
- `components/past-drives.tsx`: four drive cards with expandable map routes and the same shared stories.
- `components/ui/dialog.tsx`: shadcn-style accessible Radix dialog primitive.
- `components/pickup-dialog.tsx`: pickup inquiry and encoded email draft.
- `components/navigation.tsx`: responsive navigation with keyboard focus restoration.
- `lib/utils.ts`: conventional `cn` utility.
- `components.json`: shadcn configuration with `@` pointing to the project root.
- `public/images` and `public/fonts`: self-hosted website imagery and fonts.
- `tests/site.test.tsx`: visitor behavior and interaction regression tests.

The requested default component path is **`/components/ui`**, at the project root. Keeping reusable primitives there makes the supplied `@/components/ui/...` imports work and gives the shadcn CLI a consistent destination. CSS lives in **`/src/index.css`**. React, Tailwind, TypeScript, aliases, and shadcn configuration are already installed and configured; no additional setup is required. To add a shadcn primitive later, run `npx shadcn@latest add <component>` from this directory.

## Content and behavior

The original site's four pages were researched in `research/current-site/README.md`. The current roster follows the user's update: Anish Koppula and Brian Ayabe are Co-founder / President; Rahul Gopalasetty is Vice President. All other profiles were removed from the page. Anish’s and Rahul’s portraits use the photos supplied on November 11; names and roles are bold. Rahul’s photo is framed within the same rectangle as the other portraits, with its circular screenshot border cropped out in CSS. The current collection message covers clothing, shelf-stable food, unopened hygiene products, and baby essentials from doorstep pickups. The homepage, donation section, pickup inquiry, and page description all reflect these categories; historical drive records retain their original clothing and food details.

The trial contains four drive stories: Quail Run, The Bridges, Gale Ranch, and Windemere. All impact counts and activity stories remain **invented trial content**, explicitly requested by the user. The local presentation omits example badges at the user’s request; replace these placeholder results with verified records before using them as real impact. The first two dates come from the original site; the other event dates and collection routes are examples. All four maps now use consistent Esri basemaps showing actual San Ramon geography. Edit the shared `drives` records in `src/data.ts` to replace example content with verified results. No invented delivery claims are attributed to named partner organizations.

The inquiry dialog **prepares an email draft**, addressed to `anishkoppula@gmail.com`; the visitor sends it in their email application. It does not store information, send messages automatically, take payment, or confirm pickups. The phone is (650) 680-6214; the social link retains the original published handle. Route details include links to the complete map images.

Motion honors `prefers-reduced-motion`. Without motion, all content and garment buttons remain usable. Animation cleanup removes only this component's triggers/ticker and destroys its Lenis instance. The specifically requested Lenis package is deprecated upstream in favor of `lenis`; it is retained here to match the supplied integration.

## Assets

- Supplied San Ramon photograph: preserved at `research/provided-assets/san-ramon-original.png`; optimized website copy at `public/images/san-ramon.webp`.
- Generated transparent clothing sheet: `research/generated-assets/garment-rail.png`; optimized website sprite at `public/images/garment-rail.webp`. It was created with the built-in image generation tool. The complete prompt is in `research/generated-assets/PROMPT.md`.
- Original portraits and historical maps: downloaded from the organization's existing site, with source inventory in `research/current-site/rendered-inventory.json`. Anish’s replacement source is `research/provided-assets/anish-koppula-new.png`; the website copy is `public/images/anish-koppula-new.webp`. Rahul’s supplied portrait is preserved at `public/images/rahul-gopalasetty.png`.
- All four current maps: local Esri World Street Map exports; URLs, bounds, attribution, and example-route notes are in `research/example-drive-maps.json`.
- Supplied stacked logo: the original screenshot is preserved at `research/provided-assets/share-the-care-logo-original.png`. `public/images/share-the-care-logo.svg` embeds the exact artwork, frames out the screenshot margins, and suppresses the pale background during rendering. The shared `BrandLogo` component appears in the header, footer, and pickup inquiry; `public/favicon.svg` uses the same artwork for the browser icon.
- Fraunces and Manrope: locally hosted font files in `public/fonts`.

## Validation

Seven automated interaction tests cover email encoding, inquiry and drive-dialog focus restoration, all four garment stories and maps, the Give Fresh Start action, expanded collection copy and updated roster, four drive cards, mobile navigation, and the mouse-release regression. The production build also performs a strict TypeScript check.

Browser QA covered desktop at 1440px, mobile at 390px, actual GSAP parallax movement, drag/arrow garment scrolling, route expansion, all image loads, dialog containment and Escape, mobile menu, zero horizontal page overflow, and reduced-motion behavior. QA captures are in `.playwright-mcp/`.
