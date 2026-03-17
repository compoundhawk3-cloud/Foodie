-- Foodie MVP — Initial Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  place_id TEXT, -- OSM or external place ID for dedup
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, city)
);

CREATE INDEX idx_restaurants_name ON public.restaurants USING gin (name gin_trgm_ops);
CREATE INDEX idx_restaurants_city ON public.restaurants(city);

-- Need pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ENTRIES (the core meal log)
-- ============================================================
CREATE TYPE public.meal_type AS ENUM (
  'breakfast', 'brunch', 'lunch', 'dinner', 'takeaway', 'snack', 'dessert'
);

CREATE TYPE public.food_type AS ENUM (
  'burger', 'pizza', 'pasta', 'sushi', 'ramen', 'curry', 'salad',
  'steak', 'seafood', 'sandwich', 'tacos', 'pho', 'dim_sum',
  'kebab', 'fried_chicken', 'bbq', 'thai', 'indian', 'chinese',
  'japanese', 'mexican', 'italian', 'french', 'mediterranean',
  'korean', 'vietnamese', 'british', 'american', 'middle_eastern',
  'african', 'caribbean', 'dessert', 'breakfast_food', 'cafe',
  'street_food', 'fine_dining', 'buffet', 'other'
);

CREATE TYPE public.portion_size AS ENUM ('small', 'medium', 'large');

CREATE TYPE public.price_level AS ENUM ('1', '2', '3', '4');

CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id),

  -- Core fields
  title TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type public.meal_type NOT NULL,
  food_type public.food_type NOT NULL,
  comment TEXT NOT NULL DEFAULT '',

  -- Ratings (0.5 increments, stored as numeric)
  foodie_rating NUMERIC(2,1) NOT NULL CHECK (foodie_rating >= 0.5 AND foodie_rating <= 5 AND foodie_rating * 2 = FLOOR(foodie_rating * 2)),
  service_rating NUMERIC(2,1) CHECK (service_rating IS NULL OR (service_rating >= 0.5 AND service_rating <= 5 AND service_rating * 2 = FLOOR(service_rating * 2))),

  -- Structured fields
  portion_size public.portion_size,
  price_level public.price_level NOT NULL,
  worth_it BOOLEAN NOT NULL DEFAULT true,

  -- Location (city-level)
  city TEXT NOT NULL DEFAULT '',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entries_user ON public.entries(user_id);
CREATE INDEX idx_entries_date ON public.entries(visit_date DESC);
CREATE INDEX idx_entries_restaurant ON public.entries(restaurant_id);
CREATE INDEX idx_entries_meal_type ON public.entries(meal_type);
CREATE INDEX idx_entries_food_type ON public.entries(food_type);

-- ============================================================
-- ENTRY PHOTOS
-- ============================================================
CREATE TABLE public.entry_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_entry ON public.entry_photos(entry_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: public read, self write
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Restaurants: public read, authenticated write
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Entries: public read (for social), self write
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entries are viewable by everyone"
  ON public.entries FOR SELECT
  USING (true);

CREATE POLICY "Users can create own entries"
  ON public.entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON public.entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.entries FOR DELETE
  USING (auth.uid() = user_id);

-- Photos: same as entries
ALTER TABLE public.entry_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone"
  ON public.entry_photos FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own entry photos"
  ON public.entry_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.entries
      WHERE entries.id = entry_id AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own entry photos"
  ON public.entry_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.entries
      WHERE entries.id = entry_id AND entries.user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run separately in Supabase dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('entry-photos', 'entry-photos', true);
--
-- Storage policies (run in SQL editor):
-- CREATE POLICY "Anyone can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'entry-photos');
-- CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'entry-photos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'entry-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
