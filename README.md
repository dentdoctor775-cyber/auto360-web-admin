# AUTO360 Web Admin (Next.js)

## Local dev
1. Copy `.env.example` to `.env.local` and fill in values.
2. Install deps:
   ```bash
   npm install
   ```
3. Run:
   ```bash
   npm run dev
   ```

## Deploy to Vercel (recommended)
- Import this folder as a Vercel project.
- Set env vars in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Supabase prerequisites
- Ensure you have the base schema already created (stores, store_users, settings_store, parts_master_catalog, devices, intake_files, etc.)
- Run `/supabase/003_auto360_expand.sql` from the root of this ZIP.

## Create Storage bucket
In Supabase → Storage:
- Create a private bucket named: `intake`

## What works right now
- Login
- Setup Wizard (settings_store)
- Catalog Upload (Excel → upsert into parts_master_catalog)
- Catalog Search
- Devices (create device keys)
- Agent Intake Monitor
- Info Hub (notes/links)
