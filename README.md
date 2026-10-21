# ATELIER VÉRA

A luxury editorial rug atelier with an asymmetrical 60/40 hero, an alternating room/portrait gallery, ten original SVG weaves, private inquiry drawers, a three-room preview modal, combinable archive filters, and private or virtual consultation requests.

## Boutique showroom experience

- Warm bone (`#F7F5F0`), white gallery cards, antique brass accents and hairline borders. Cormorant Garamond and Plus Jakarta Sans are requested from Google Fonts in the HTML head; bundled serif and sans-serif fonts provide fallbacks.
- Mobile-collapsible discovery controls combine origin, style, material, sizes (including 5 × 8 ft), color swatches, search and curated edits. Active badges, clear-all and counts stay synchronized. The Indigo and Charcoal swatches correctly return an empty state when no matching demo inventory exists.
- Sort by price, arrival order, largest available dimensions or knot density. Demo arrival order is illustrative, not a verified acquisition date. All demo rugs offer the same sizes, so size sorting preserves their order; flatweaves appear after knotted pieces when sorting by knot density.
- The editorial gallery alternates two-column room styling studies and 4:5 portrait views. Hover or keyboard focus cross-fades into an illustrative fringe/detail crop. Visible “Visualize in Room” and “Inquire” actions work without hover.
- Each piece opens a native, keyboard-accessible preview modal with living, dining and bedroom furniture and a rug projected onto the floor. A separate slide-over inquiry drawer shows SKU, thumbnail, dimensions, weave and material details.
- The drawer accepts a name, email or phone and an optional home-trial request. It builds a WhatsApp draft, not a checkout or stored lead; the visitor must review and send it. No home trial is confirmed automatically. English is the initial language; a saved Farsi preference is retained.
- Product inspection includes full layout, room, illustrative reverse and cropped fringe views, a keyboard/touch magnifier, and metric/imperial dimensions. Room previews update with the selected size.
- Product-specific viewing and high-resolution video/swatch requests open a contact/date/time form. Requests use the existing appointment API; SKU, selected size, request purpose and preferred local time are stored in the appointment note. Media requests use the date/time as a preferred follow-up. A receipt appears only after storage succeeds; no video, swatch shipment or appointment is automatically fulfilled.

The archive remains a **clearly labeled illustration-based product demo**, not photographic evidence of actual stock. Reverse views are generic weave illustrations, not authenticated rug backs. Replace artwork with owned/licensed full, room, reverse and fringe photography and verify inventory and shipping/showroom claims before pitching a live retailer deployment. WhatsApp requires the gallery configuration below; static GitHub Pages cannot receive lead forms without an API deployment.

## Currency and VIP gallery integration

- `src/currencyService.js` normalizes USD-based prices into USD, EUR, AED, TRY, CAD and **IRT (toman)**. One toman is ten Iranian rials; IRR is never silently treated as IRT.
- `src/currencyStore.js` persists the selected currency and publishes loading/rate updates. Cards, inspection, selection totals and WhatsApp quotations share the same formatter. A refresh does not replace open forms or discard typed contact details.
- Rates use a validated, versioned four-hour `localStorage` cache, bounded requests, in-flight deduplication, public fallback, then expired cached rates or explicitly illustrative baseline rates. Storage failures do not block browsing. Source, retrieval time, stale status and the illustrative toman warning appear beneath the archive.
- The public fallback is `https://open.er-api.com/v6/latest/USD`. Its official IRR rate is deliberately **not** used as an Iranian street-market quote: international fiat rates can be live while the toman rate remains illustrative.

### AlanChand adapter

Set `VITE_ALANCHAND_ENDPOINT` at build time to your HTTPS, CORS-enabled AlanChand adapter, or a same-origin adapter path. No undocumented AlanChand endpoint or response format is assumed, and no paid API dependency is required. Without this setting the public fallback is used directly.

The adapter must obtain authorized AlanChand data and return `{ "base": "USD", "rates": { "USD": 1, "EUR": 0.92, "AED": 3.6725, "TRY": 38, "CAD": 1.39, "IRT": 100000 } }`. These numbers illustrate the **contract only**, not current market rates. `base` may also be `IRT` or `IRR`, with each rate expressed as quote-currency units per one base unit. All five fiat currencies must be present. For a USD base, supply either `IRT` or `IRR` (which is divided by ten). Return finite positive JSON numbers, not localized price strings.

Implement the upstream adapter in your hosting infrastructure: this repository does not guess AlanChand's private API, scrape its website, or provide an open proxy. Keep provider credentials on that server, never in `VITE_*` variables. Configure provider-side caching, licensing, freshness checks and CORS for your actual origin. Only send requests to a trusted adapter; its response is treated as a market-rate snapshot.

When running `npm start`, also set the same `VITE_ALANCHAND_ENDPOINT` in the server environment so its CSP allows that HTTPS origin. The server always allows the public fallback origin. For other hosts, configure an equivalent `connect-src` policy. GitHub Pages requires a public CORS-enabled external adapter; it cannot run a same-origin API.

### Gallery configuration and inventory

Set `VITE_WHATSAPP_NUMBER` before building to the gallery's international WhatsApp number, including country code (digits, or familiar phone punctuation). No recipient is invented: the VIP link stays hidden and the drawer's WhatsApp button stays disabled with a configuration notice and a private-viewing alternative until a valid number is supplied. Each link contains the selected rug name, SKU/ID, size and current indicative currency price. Drawer messages also contain the visitor's name, contact and home-trial preference. These contact details are not placed in browser storage. The visitor must review and send the message in WhatsApp; clicking the link does not complete a purchase.

`src/rugs.js` contains illustrative foundation, pile, dyes, age/condition, city, dominant color and broad style categories. Flatweaves are not presented as knotted rugs. The existing foot dimensions are retained alongside runners, 2 × 3 m and 3 × 4 m options. `dimensions` is the shared metric source for the room simulator and size-based quotes; the simulator has a matching five-foot scale and living, dining and bedroom settings.

`src/catalog.js`, `src/magnifier.js` and `src/inquiry.js` isolate combinable filtering, pointer/touch/keyboard inspection and safe lead-link construction. The magnifier samples the resolution-independent original SVG with a movable lens. These are **illustrations, not ultra-high-resolution rug photographs**: replace demo inventory, material/dye claims, prices and artwork with verified records and actual detail photography before commercial launch. Vintage/antique-inspired examples are new, not certified antique stock.

## Run

Requires Node.js 24 or newer.

```sh
npm ci
npm run build
npm start
```

Open `http://localhost:3000`. For development, run `npm run dev:api` and `npm run dev` in separate terminals; Vite proxies form submissions to the API on port 3000. `npm run preview` serves only the frontend; use `npm start` to exercise submissions.

## GitHub Pages

The site is built and deployed to GitHub Pages from `main` by the `Deploy to GitHub Pages` workflow. Set the repository's Pages source to **GitHub Actions**. GitHub Pages hosts only the static frontend; inquiry and appointment submissions require the Node server and are not available on Pages.

The repository's Pages source must be **GitHub Actions**. The deployment workflow builds the site and uploads only `dist`, with asset URLs prefixed by `/rug-showroom/`, but it cannot change the repository's Pages setting. If Pages is publishing from a branch, a repository administrator must select **Settings → Pages → Build and deployment → Source → GitHub Actions**, then run **Actions → Deploy to GitHub Pages → Run workflow → main**. Do not rerun the separate **pages build and deployment** Jekyll workflow; it can replace the built site with unbuilt source files. The source entry point uses subpath-relative URLs to avoid asset 404s if that occurs. Once the Actions deployment succeeds, hard-refresh https://ehsanshrz.github.io/rug-showroom/.

## Requests and deployment

The Node server validates and durably stores inquiry and appointment requests in SQLite, returning a receipt reference only after a successful database write. Prices are recalculated from the archive on the server. Appointments are requests, not confirmed reservations. No payments or automated emails are sent.

Set `PUBLIC_ORIGIN` to the public HTTPS origin in production, place the app behind an HTTPS reverse proxy, and set `DATABASE_PATH` to a private, persistent volume outside the web root. `PORT` defaults to 3000; `HOST` defaults to `0.0.0.0`. The server includes JSON size limits, per-connection-IP rate limiting, security headers, and cross-site request rejection. `REQUEST_RATE_LIMIT` defaults to 10 requests per 15 minutes per connection IP. Behind a reverse proxy, enforce per-client rate limits at that proxy and set `REQUEST_RATE_LIMIT=0` to disable the shared application counter; do not expose the Node server directly in this configuration. Forwarded IP headers are deliberately not trusted.

Booking dates use the selected showroom's local calendar (New York, Copenhagen, or Milan); virtual requests use UTC. The frontend and API share the same date calculation.

Requests are not exposed through a public read API. Authorized operators can query the `requests` table with SQLite tooling (`reference`, `kind`, `created_at`, `payload`) to follow up with clients. Back up the database securely and implement an appropriate retention policy for personal information. Browser storage holds only folio piece IDs and dimensions, not contact details.

Rug and detail artwork and the three room previews are local SVG illustrations. The hero and wide cards progressively enhance room studies with an external [Unsplash interior image](https://images.unsplash.com/photo-1600210492486-724fe5c67fb0) served by `images.unsplash.com`; the SVG scene remains visible if the photo is unavailable. Rugs are illustrative overlays, not rugs actually photographed in that room. Replace these composites with owned/licensed product and room photography for a commercial launch.

Google Fonts requests go to `fonts.googleapis.com` and `fonts.gstatic.com`. The Node server CSP allows only these font hosts and the Unsplash image host in addition to the existing sources; mirror those rules on other hosts. Bundled Cormorant Garamond, Inter, and JetBrains Mono remain available under the SIL Open Font License; license notices are in `public/fonts`. The collection is an illustrative curated archive; replace inventory, provenance and service/location claims with verified business records before commercial use.

## Verification

```sh
npm test
npm run build
```