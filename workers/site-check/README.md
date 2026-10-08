# Website check worker

Backend of the free website check at `/website-check/`. It fetches a site's home page
server-side (browsers can't, because of CORS), reports what it finds, and asks Google
PageSpeed Insights for the mobile scores. Scoring and all report texts live in the site
(`src/data/siteCheck.ts`); this worker only measures.

- `GET /check?url=example.hu` → HTTPS, redirect, security headers, robots.txt, sitemap and the page's SEO/mobile facts
- `GET /speed?url=example.hu` → PageSpeed mobile scores (10–30 s)

Results are cached for 10 minutes per address. CORS allows only softwaredevelopment.hu and localhost.

## Deploy (free plan)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**.
2. Name it **`softwaredevelopment-site-check`**, deploy the placeholder, then **Edit code**.
3. Replace everything with `worker.js` from this folder and **Deploy**.
4. The address becomes `https://softwaredevelopment-site-check.<account>.workers.dev`.
   It must match `checkEndpoint` in `src/data/site.ts` and the `connect-src` entry in `index.html`.

### Optional: a PageSpeed API key

Without a key Google allows a small shared quota, which is usually enough for a personal site.
For more: Google Cloud console → enable **PageSpeed Insights API** → **Credentials → API key**,
then in the worker **Settings → Variables and secrets** add a secret named `PSI_KEY`.
