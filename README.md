# ATELIER VÉRA

A responsive rug showroom with ten original SVG weaves, combinable archive filters, a live architectural room studio, zoomable specifications, a persistent inquiry folio, and private or virtual consultation requests.

## Run

Requires Node.js 24 or newer.

```sh
npm ci
npm run build
npm start
```

Open `http://localhost:3000`. For development, run `npm run dev:api` and `npm run dev` in separate terminals; Vite proxies form submissions to the API on port 3000. `npm run preview` serves only the frontend; use `npm start` to exercise submissions.

## Requests and deployment

The Node server validates and durably stores inquiry and appointment requests in SQLite, returning a receipt reference only after a successful database write. Prices are recalculated from the archive on the server. Appointments are requests, not confirmed reservations. No payments or automated emails are sent.

Set `PUBLIC_ORIGIN` to the public HTTPS origin in production, place the app behind an HTTPS reverse proxy, and set `DATABASE_PATH` to a private, persistent volume outside the web root. `PORT` defaults to 3000; `HOST` defaults to `0.0.0.0`. The server includes JSON size limits, per-connection-IP rate limiting, security headers, and cross-site request rejection. `REQUEST_RATE_LIMIT` defaults to 10 requests per 15 minutes per connection IP. Behind a reverse proxy, enforce per-client rate limits at that proxy and set `REQUEST_RATE_LIMIT=0` to disable the shared application counter; do not expose the Node server directly in this configuration. Forwarded IP headers are deliberately not trusted.

Booking dates use the selected showroom's local calendar (New York, Copenhagen, or Milan); virtual requests use UTC. The frontend and API share the same date calculation.

Requests are not exposed through a public read API. Authorized operators can query the `requests` table with SQLite tooling (`reference`, `kind`, `created_at`, `payload`) to follow up with clients. Back up the database securely and implement an appropriate retention policy for personal information. Browser storage holds only folio piece IDs and dimensions, not contact details.

All rug and room art is local SVG. Cormorant Garamond, Inter, and JetBrains Mono are bundled locally under the SIL Open Font License; license notices are in `public/fonts`. There are no external image or font requests. The collection is an illustrative curated archive; replace its inventory and provenance with verified business records before commercial use.

## Verification

```sh
npm test
npm run build
```