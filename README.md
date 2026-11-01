# who18k website

Personal brand site: free Starter Kit and weekly email, digital products sold through Stripe, paid 1:1 calls
through Cal.com, and the 18K Club waitlist. Next.js 16 (App Router) · React 19 · TypeScript. Node 22 (`.nvmrc`).

## What it does

- **Email signups** (`POST /api/subscribe`): hero (kit), footer (newsletter) and community (waitlist) forms.
  Each sends its own email through Resend and saves the contact to the "who18k list" segment with a `source`.
- **Products** (`src/content.ts`): name, copy, price and a `live` switch. A product only sells when `live: true`
  and its `ACCESS_URL_<SLUG>` is set; until then the card says "Coming soon" and points to the list.
- **Checkout** (`POST /api/checkout`): Stripe Checkout with the price taken from `content.ts` on the server.
- **Delivery** (`POST /api/stripe/webhook`): on payment, emails the buyer their access link, saves them as a
  customer and emails you a sale notification. The signature check uses `STRIPE_WEBHOOK_SECRET`.
- **1:1 calls**: the button opens your paid Cal.com event (`CAL_CONSULT_URL`) with the chosen focus as notes.
- **Proof sections**: stats, videos and testimonials stay hidden until you add real ones to `content.ts`.

## Run locally

```bash
nvm use
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

## Deploy on Vercel

1. vercel.com → Add New → Project → import `Bookyourbooth/who18k-site`. Framework preset: Next.js.
2. Add everything from `.env.example` under Settings → Environment Variables, then deploy.
3. Settings → Domains → add your domain and follow the DNS records Vercel shows.
4. Resend → Domains: add the same domain, then point `RESEND_FROM` at it.

`CAL_CONSULT_URL` is read when the page is built, so redeploy after changing it.

## Stripe

1. Start in test mode: `STRIPE_SECRET_KEY=sk_test_…`.
2. Developers → Webhooks → Add endpoint: `https://<your-domain>/api/stripe/webhook`,
   events `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Set a product's final price and `live: true` in `src/content.ts`, set its `ACCESS_URL_…`, push.
4. Buy it with card `4242 4242 4242 4242` and check the access email arrives. Then repeat steps 1–2 with live keys.

## Cal.com

Create a 60-minute paid event, install the Stripe app in Cal.com so it charges at booking, and put the
event link in `CAL_CONSULT_URL`. Set `consult.priceLabel` in `content.ts` to show the price on the card.
