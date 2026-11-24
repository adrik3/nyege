# Nyege backend: setup (about 30 minutes)

Flow: buyer pays on Flutterwave -> Flutterwave tells your server -> server checks with Flutterwave -> only then tickets are created.

## 1. Supabase
1. New project. Open SQL Editor, paste `supabase.sql`, Run.
2. Settings > API: copy the **Project URL** and the **service_role** key (keep it secret).

## 2. Flutterwave
1. Dashboard > Settings > API: copy the **Secret key**.
2. Settings > Webhooks: URL = `https://YOUR-SITE.vercel.app/api/flw-webhook`, and choose a **Secret hash** (any long random text). Save it.
3. Test with test keys first, then switch to live keys.

## 3. Vercel
1. Put this whole folder in a GitHub repo and import it in Vercel (or run `vercel` in this folder).
2. Project > Settings > Environment Variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `FLW_SECRET_KEY`
   - `FLW_SECRET_HASH` (same text as in step 2.2)
   - `SITE_URL` (for example `https://nyege.vercel.app`, no trailing slash)
3. Redeploy.

## 4. Test
Buy the free event (id 5): you should get a ticket at once. Then buy a paid ticket in Flutterwave test mode.

## Not built yet
QR codes, gate scanner, SMS delivery, organizer page, refunds. Events are still listed in `public/index.html` and must match the rows in the `events` table (same id, tier names, prices).
