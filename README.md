# Olayinka Boja Enterprise

A dark, mobile-first fabric catalogue. Customers browse the fabrics, tap **Buy
now**, and land in WhatsApp with the item already written out. She uploads the
photos herself from her phone.

## How Buy now works

WhatsApp's click-to-chat link carries **text only**. There is no way to attach
an image to it — that is a limit on WhatsApp's side, not something the code can
work around. So Buy now takes the best route the shopper's phone allows:

1. **Share sheet with the real photo.** Where the browser supports sharing
   files (Android Chrome, most Android browsers), the fabric photo goes across
   as a genuine attachment next to the message. The shopper picks WhatsApp from
   the sheet.
2. **A `wa.me` link.** Everywhere else, including most iPhones. The message
   carries the fabric name, price, item code, and a link to the product page.
   WhatsApp reads that page's OpenGraph tags and draws a preview card with the
   photo inside the chat.

Either way the message that reaches her looks like this, and the item code
identifies the exact roll even if the preview image fails to load:

```
Hello Olayinka Boja Enterprise, I want to buy this fabric.

Swiss voile lace
Price: ₦45,000
Item: OBE-0042

https://yoursite.com/product/8f2c...
```

## Setup

You need Node.js 18.18 or newer, from [nodejs.org](https://nodejs.org) (take the
LTS build).

### 1. Install

```bash
cd olayinka-boja && npm install
```

### 2. Create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a project. The
   free tier is enough — it covers 500 MB of database and 1 GB of file storage,
   and compressed fabric photos run about 250 KB each.
2. Open **SQL Editor**, click **New query**, paste in everything from
   [supabase/schema.sql](supabase/schema.sql), and press **Run**. That builds
   the products table, the image bucket, and the security rules that keep the
   catalogue readable by everyone but writable only by her.

### 3. Create her login

In the Supabase dashboard: **Authentication → Users → Add user**. Give it her
email and a password, and tick **Auto Confirm User**.

There is no public signup anywhere on the site, so this is the only account
that will ever exist unless you add another one here.

### 4. Fill in the settings

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and set:

| Setting | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page. The anon public key, not the service role key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Her number, digits only, country code first. `0803 123 4567` becomes `2348031234567` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Leave it blank locally and on Vercel; set it only once a custom domain exists |
| `NEXT_PUBLIC_STORE_LOCATION` | Optional. Shown in the footer |

The WhatsApp number matters: get it wrong and Buy now opens a chat with nobody.
Test it by tapping Buy now on your own phone before handing the site over.

### 5. Run it

```bash
npm run dev
```

Open http://localhost:3000. The catalogue is empty until you sign in at
`/login` and upload something.

## Going live

Vercel's free tier covers this comfortably.

### 1. Push to GitHub

Create an empty repository at [github.com/new](https://github.com/new). Do not
let it add a README or a `.gitignore` — this folder already has both. Then, with
`YOU` and `REPO` replaced:

```bash
git remote add origin https://github.com/YOU/REPO.git
```

```bash
git push -u origin main
```

### 2. Import to Vercel

Go to [vercel.com/new](https://vercel.com/new) and pick the repository. Vercel
detects Next.js on its own, so leave the build settings alone. Under
**Environment Variables**, add the values from your `.env.local`:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | same as local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same as local |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | same as local |
| `NEXT_PUBLIC_STORE_LOCATION` | same as local, if you set one |

Leave `NEXT_PUBLIC_SITE_URL` out. Without it the site falls back to Vercel's own
production domain, which is what you want until a custom domain exists. Never
add the Supabase **service role** key — the anon key is the only one this site
needs, and Row Level Security is what protects the data.

### 3. Point Supabase at the live site

Supabase → **Authentication → URL Configuration** → set **Site URL** to the
Vercel address. Sign-in emails and password resets use it.

### 4. If you add a custom domain

Add the domain in Vercel, then set `NEXT_PUBLIC_SITE_URL` to it (for example
`https://olayinkaboja.com`, no trailing slash) and redeploy. Product links
already sitting in customers' WhatsApp history keep working, because the Vercel
domain stays valid alongside the custom one.

Whenever you change an environment variable, redeploy — Vercel bakes
`NEXT_PUBLIC_` values in at build time, so an existing deployment will not pick
them up.

### 5. Check it

Open the live site on a phone and tap **Buy now**. WhatsApp should open with the
message filled in, and the product link in it should load. That link is what
draws the fabric photo into the chat.

## How she uses it

Send her to `yoursite.com/admin` and tell her to add it to her home screen so
it opens like an app.

- **Choose photos** — she can select many at once from her gallery. They are
  shrunk in the browser before upload, so a slow connection still works.
- **Fabric type for all** — sets the type on every photo in one go, which is
  quicker when she has just photographed a whole batch of the same lace.
- **Name** is required. Price is optional — leave it blank and the card reads
  "Ask for price" instead.
- **In stock / Sold out** — one tap. Sold fabrics stay visible with a Sold out
  badge, so customers stop asking for them but can still see her range.
- **Remove** deletes the fabric and its photo for good.

Item codes (`OBE-0042`) are assigned automatically and never reused, so a code
in a WhatsApp message always points at one specific fabric.

## Notes

- The catalogue page caches for 60 seconds, so a new upload appears within about
  a minute rather than instantly.
- Search and the type filters run in the browser against the already-loaded
  catalogue, so filtering costs the shopper no extra data.
- Photos are capped at 1600px on the long edge at 82% JPEG quality. To change
  that, edit `MAX_EDGE` and `QUALITY` in [lib/compress.ts](lib/compress.ts).
- Fabric type suggestions live in `FABRIC_SUGGESTIONS` in
  [lib/types.ts](lib/types.ts). The field accepts anything she types; the list
  is only a shortcut.
