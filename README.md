# 18K Intelligence website

Personal brand site: free Starter Kit and weekly email, digital products sold through Stripe, paid 1:1 calls
through Cal.com, and the 18K Club waitlist. Next.js 16 (App Router) · React 19 · TypeScript. Node 22 (`.nvmrc`).

## What it does

- **Email signups** (`POST /api/subscribe`): hero (kit), footer (newsletter) and community (waitlist) forms.
  Each sends its own email through Resend and saves the contact to the "18K Intelligence list" segment with a `source`.
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

## Deploy on Hostinger

1. hPanel → Websites → Add website → Node.js app → import from GitHub, and pick `Bookyourbooth/18kintelligence-site` (branch `main`).
2. Node version: **22**. Build command: `npm run build`. Start command: `npm start`.
3. Add every variable from `.env.example` in the app's environment settings, then deploy.
   Every push to `main` redeploys.
4. Connect `18kintelligence.com`. Keep DNS at GoDaddy and add the A/CNAME records Hostinger shows.
   Don't switch the domain's nameservers to Hostinger without first copying the four Resend
   records (`resend._domainkey`, `send` MX and TXT, `rsend`) across, or email stops sending.

`next.config.ts` runs Turbopack's plugin work on threads, because Hostinger's build host kills the
child processes it would otherwise spawn. Don't remove it.

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

## Meta Pixel

Set `NEXT_PUBLIC_META_PIXEL_ID` to the "18K Intelligence website" dataset ID from Events Manager, then
redeploy: the value is read when the site is built. Until it's set there's no Pixel, no cookie question
and no Meta wording in the privacy policy (`src/lib/meta-pixel.ts`).

- Nothing loads until the visitor presses Accept. Decline, or "Cookie settings" in the footer, turns it off again.
  A yes given before 5 Nov 2026 (cookie value `accepted`) no longer counts, so those visitors are asked again.
- Meta gets a PageView for each page, one Lead per visit when an email reaches the list, named after the form,
  and an InitiateCheckout when someone presses Buy now. The Lead carries the email address, scrambled (SHA-256)
  in the browser first (`src/lib/meta-match.ts`). "Automatic website matching" is on for this dataset in
  Events Manager, so Meta's code takes it from the form the same way.
- It never runs on `/thanks`, because Stripe's return address there carries the checkout session.
- Each event is also sent from the server through Meta's Conversions API (`src/app/api/meta-events`), so it
  still counts when a browser blocks Meta's script. A sale is sent from the server alone: `/api/checkout`
  keeps an event id, Meta's cookies, IP and browser in the Checkout session's metadata for a buyer who said
  yes, and the webhook sends a Purchase with the amount and the scrambled email, name and country once it's paid.
- All of the server side needs `META_CONVERSIONS_API_TOKEN`: in Events Manager, open the dataset's Settings,
  then "Generate access token" under Conversions API. It's a secret, so never in a `NEXT_PUBLIC_` variable.
  Without it, nothing is sent from the server and nothing extra is kept in Stripe.
- To check it end to end, open any page with `?meta_test=TEST12345`, using the code shown in Events Manager's
  Test events tab: that visit's server copies show up there.
- The privacy policy says all of this. Change one, change the other.
