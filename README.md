# Foodie 🍽️

A food journal and social discovery web app. Log your dining experiences with photos, ratings, and reviews. Built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack

- **Next.js 14** (App Router) — React framework
- **TypeScript** — Type safety throughout
- **Tailwind CSS** — Utility-first styling
- **Supabase** — Auth, PostgreSQL database, file storage
- **Leaflet** — Maps (Phase 2, dependency installed)
- **PWA** — Installable on mobile devices

## Quick Start

### 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Create a storage bucket:
   - Go to **Storage** → **New bucket**
   - Name: `entry-photos`
   - Check "Public bucket"
4. Add storage policies (in SQL Editor):
   ```sql
   CREATE POLICY "Anyone can view photos" ON storage.objects
     FOR SELECT USING (bucket_id = 'entry-photos');
   CREATE POLICY "Authenticated users can upload photos" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'entry-photos' AND auth.role() = 'authenticated');
   CREATE POLICY "Users can delete own photos" ON storage.objects
     FOR DELETE USING (bucket_id = 'entry-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 2. Environment Variables

Copy the example and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Get the values from Supabase → Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

```bash
npx vercel
```

Set the same environment variables in the Vercel dashboard.

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (with bottom nav)
│   │   ├── write/          # Entry creation form
│   │   ├── journal/        # Journal feed (own entries)
│   │   ├── explore/        # Map view (Phase 2 placeholder)
│   │   └── profile/        # User profile + stats
│   ├── auth/
│   │   ├── login/          # Login page
│   │   ├── signup/         # Registration page
│   │   └── callback/       # OAuth callback handler
│   ├── layout.tsx          # Root layout (PWA meta, toaster)
│   └── page.tsx            # Redirects to /journal
├── components/
│   ├── entry/
│   │   └── EntryCard.tsx   # Journal entry card
│   ├── layout/
│   │   ├── AppShell.tsx    # Auth guard + layout wrapper
│   │   └── BottomNav.tsx   # Floating bottom navigation
│   └── ui/
│       ├── StarRating.tsx      # Half-star rating input
│       ├── PriceSelector.tsx   # £ to ££££ selector
│       ├── WorthItToggle.tsx   # Yes/No toggle
│       ├── PhotoUpload.tsx     # Multi-photo upload
│       ├── SelectField.tsx     # Styled dropdown select
│       ├── RestaurantSearch.tsx # Autofill restaurant search
│       └── CitySearch.tsx      # City dropdown/search
├── lib/
│   ├── hooks/
│   │   └── useAuth.ts     # Auth state hook
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       ├── server.ts       # Server Supabase client
│       └── middleware.ts   # Session refresh middleware
├── types/
│   └── database.ts         # TypeScript types + display labels
└── middleware.ts            # Next.js middleware (auth session)
```

## Design Language

| Element | Value |
|---------|-------|
| Primary | Forest green `#2E5B4E` |
| Accent | Bright green `#2DB67D` |
| Stars | Gold `#F5A623` |
| Background | Off-white `#F5F5F0` |
| Cards | White with subtle shadows |
| Nav | Dark floating bottom bar |

## Phase 1 Features (Current)

- ✅ User auth (signup / login)
- ✅ Entry creation with full form (photos, ratings, all fields)
- ✅ Half-star increment ratings (0.5 steps)
- ✅ Restaurant autofill search
- ✅ City-level location search
- ✅ Structured dropdowns for meal type, food type, portion size, price level
- ✅ Journal view with filters
- ✅ Profile page with stats
- ✅ Floating bottom navigation
- ✅ PWA manifest
- ✅ Mobile-first responsive design
- ✅ Row Level Security on all tables

## Coming Next

- **Phase 2:** Leaflet map integration, restaurant pins, location-based discovery
- **Phase 3:** Follow/unfollow, social feed, likes, comments
- **Phase 4:** Stats & insights, search improvements, native app wrapper
