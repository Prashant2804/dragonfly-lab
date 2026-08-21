# Deploying dragonflylab.in

Eighteen steps from local code to an indexed live site. `deploy-runbook.html` in this repo is
the same checklist as a page you can tick through in a browser.

## Before the site is public

Four decisions, none of which block a preview deploy:

1. A phone number → `src/data/site.mjs`
2. An email on the domain, not gmail.com
3. Real warranty, lead time and service turnaround → `src/data/commerce.mjs` (these are promises)
4. Legal entity name and address → `src/data/site.mjs` → `legal` (four `TODO`s)

## 1 · GitHub

Create an **empty** private repo (no README, no .gitignore — this project has them), then:

```bash
git remote add origin https://github.com/<you>/dragonflylab.git
git push -u origin main
```

## 2 · Vercel

1. [vercel.com/new](https://vercel.com/new) → import the repo
2. Framework preset **Other**. Change nothing else — `vercel.json` already declares
   `npm run build` → `public`. Overriding it in the dashboard is the usual cause of a failed build.
3. Deploy. You get a `*.vercel.app` URL in about a minute.

> **Vercel's Hobby plan is non-commercial personal use only.** A company site needs Pro
> ($20/user/month; there is a free trial). Cloudflare Pages allows commercial use on its free
> tier, but `api/lead.js` would need rewriting for its runtime — a real decision, not a toggle.

## 3 · Lead pipeline

All three destinations are individually optional, but **at least one must work** or the form
shows visitors an error rather than silently losing their enquiry. That is deliberate.

**Google Sheet** — new sheet, first tab `Leads`, row 1:

```
Timestamp (IST) | Intent | Use case | Name | Organisation | Email | Phone |
City / Country | Message | Marketing consent | Source page | Referrer | UTM
```

Then [console.cloud.google.com](https://console.cloud.google.com) → new project → enable
**Google Sheets API** → Credentials → Service account → Keys → Add key → JSON. Take
`client_email` and `private_key` from the file.

**Share the sheet with that `client_email`, as Editor.** Everyone forgets this; without it every
write returns 403. Share only this sheet with it.

**Resend** — verify `dragonflylab.in` as a sending domain, create an API key.
**Apollo** — Settings → Integrations → API.

Then in Vercel → Settings → Environment Variables (tick Production **and** Preview):

| Variable | Notes |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON |
| `GOOGLE_PRIVATE_KEY` | The whole `-----BEGIN PRIVATE KEY-----` block |
| `GOOGLE_SHEET_ID` | From the sheet URL, between `/d/` and `/edit` |
| `GOOGLE_SHEET_TAB` | Optional, defaults to `Leads` |
| `APOLLO_API_KEY` | |
| `RESEND_API_KEY` | |
| `NOTIFY_EMAIL` | Where lead alerts go |
| `NOTIFY_FROM` | A verified sender |

Variables only apply to a new build → Deployments → ⋯ → **Redeploy**.

## 4 · Domain

Vercel → Settings → Domains → add `dragonflylab.in` and `www.dragonflylab.in`. Set the **bare
domain as primary** — every canonical URL on the site is written without `www`, and disagreeing
splits ranking signals across two addresses.

At your registrar, either point nameservers at `ns1.vercel-dns.com` / `ns2.vercel-dns.com`, or
keep your DNS and add `A @ → 76.76.21.21` plus `CNAME www → cname.vercel-dns.com`. Confirm the
current values in Vercel's dashboard rather than trusting these — they change.

The site sends a two-year HSTS header with `preload`. Once it is live over HTTPS, browsers will
refuse plain HTTP for this domain. Be sure about the domain first.

## 5 · Verify on the live domain

- Submit a real enquiry. Confirm a Sheet row, an Apollo contact, and the alert email.
- Send yourself the link on WhatsApp and check the preview card renders.
- Open it on a real mid-range Android on mobile data, not the responsive simulator.

## 6 · Get found

- [Search Console](https://search.google.com/search-console): add `dragonflylab.in` as a
  **Domain** property, verify by TXT, submit `https://dragonflylab.in/sitemap.xml`. This is also
  where your free keyword data comes from.
- Bing Webmaster Tools imports from Search Console in two clicks.
- Confirm Ahrefs Web Analytics is receiving. It is cookie-free, which is why this site needs no
  consent banner — **adding GA4 or Clarity would change that.**

## Afterwards

Edit → commit → push; Vercel redeploys itself. Run `npm run check` before every push. Re-verify
`src/data/compare.mjs` quarterly and bump `verifiedOn`. Post a Company update monthly. Delete
leads older than 36 months, because the privacy policy promises it.
