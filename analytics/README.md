# Homepage visitor counter

The homepage remains on GitHub Pages. This Worker stores its own statistics in
Cloudflare D1. The frontend configuration is
`../static/data/visitor-config.json`; no API secret belongs in that file.

## Counting

`POST /v1/visit` accepts a UUID page-load event, an optional random browser UUID,
and the event's creation timestamp in milliseconds. Database constraints and
triggers atomically count each event once, including concurrent retries. A
returning browser adds a page view but no additional lifetime visitor.

The browser identifier is first-party local storage. If storage is unavailable,
only page views are counted. This estimates browser profiles, not people.
Visitor IDs are HMAC-hashed before storage. Do not rotate the HMAC secret
casually: changing it changes every returning browser's stored identity.

`GET /v1/totals` only reads statistics. The refresh button and snapshot script
use this endpoint and never increment counts. Neither the frontend nor the API
collects full referrers, query strings, or browsing paths. Raw IPs are not
written to D1; a daily keyed digest is used in the platform's short-lived rate
limiter. Application request logging is disabled.

The public endpoint applies CORS restrictions, payload limits, basic bot
filtering and per-IP rate limits. These reduce abuse; they cannot prove a
request came from a human. CORS is not authentication.

Events may be retried for seven days. The scheduled cleanup deletes event
records after eight days, retaining a buffer for clock skew and the retry
window. Hashed visitor keys and totals remain so lifetime deduplication works.

## Local checks

Use Node.js 22.12 or newer:

```sh
npm ci
npm test
```

The tests use real SQLite/D1 through Miniflare, including simultaneous visits
and duplicate events. Frontend behavior is tested from the repository root:

```sh
node --test tests/visitors.test.mjs
```

For local Worker development, apply migrations locally and put a development
HMAC secret in ignored `.dev.vars`. Use a separate local origin configuration;
the production homepage deliberately never tracks localhost or file previews.

## Deployment

1. Authenticate Wrangler in the intended personal Cloudflare account.
2. Create the `weijue-visitors` D1 database and save its returned database ID in
   `wrangler.jsonc`. Database IDs are public configuration, not credentials.
3. Apply the migration with `npm run migrate`.
4. Set the `VISITOR_HMAC_KEY` Worker secret to at least 32 random bytes. Keep the
   secret stable and outside this repository. Cloudflare OAuth credentials
   also stay outside the repository.
5. Deploy with `npm run deploy`. Verify `/healthz`, totals, CORS, deduplication,
   and reachability before updating the homepage's API URL.
6. Put the deployed base URL and provider `weijue-analytics-v1` in the frontend
   config. From the repository root, run `node scripts/snapshot-visitors.mjs`
   to save a genuine read-only fallback. Publish the homepage only after the
   backend and config work together.

Keep Cloudflare resources on the free plan unless paid resources are explicitly
authorized. No GitHub credential is required in a visitor's browser.

## Fallback and migration

Only records marked `weijue-analytics-v1` are accepted by the new frontend.
Local cached readings and the published JSON fallback retain their actual
timestamps. Failure displays "Live stats unavailable" and the saved date;
missing counts display a dash rather than zero.

The old Busuanzi readings are archived in
`../static/data/visitor-totals-legacy.json` and are never added to the new
counter. New statistics start on the actual migration date.

Aggregate JSON snapshots are display fallbacks, not full database backups.
D1 database export/recovery is managed separately. Do not commit visitor keys,
event records, credentials, or raw database exports to the public repository.

## Rollback

If the new endpoint fails, the homepage preserves dated new-provider readings.
To restore the old implementation, revert only the visitor migration commit;
do not delete the Worker or database as part of frontend rollback. They retain
the statistics needed for a later recovery.
