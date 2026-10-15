-- Run this once in Supabase SQL Editor to enable seller hero advertisements.
CREATE TABLE IF NOT EXISTS public.advertisements (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL DEFAULT '',
  product_id BIGINT REFERENCES public.products(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_active ON public.advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_seller ON public.advertisements(seller_id);

-- Ask PostgREST (Supabase's API) to refresh its cached database schema.
NOTIFY pgrst, 'reload schema';
