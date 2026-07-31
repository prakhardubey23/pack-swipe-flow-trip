CREATE TYPE public.item_status AS ENUM ('pending', 'packed', 'decide_later', 'skipped');

CREATE TABLE public.trip_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
GRANT SELECT ON public.trip_templates TO authenticated, anon;
GRANT ALL ON public.trip_templates TO service_role;
ALTER TABLE public.trip_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trip templates are readable by everyone" ON public.trip_templates FOR SELECT TO authenticated, anon USING (true);

CREATE TABLE public.template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_template_id TEXT NOT NULL REFERENCES public.trip_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  note TEXT,
  category TEXT NOT NULL DEFAULT 'Essentials',
  sort_order INTEGER NOT NULL
);
CREATE INDEX template_items_template_idx ON public.template_items (trip_template_id, sort_order);
GRANT SELECT ON public.template_items TO authenticated, anon;
GRANT ALL ON public.template_items TO service_role;
ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Template items are readable by everyone" ON public.template_items FOR SELECT TO authenticated, anon USING (true);

CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  trip_template_id TEXT NOT NULL REFERENCES public.trip_templates(id),
  days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX trips_user_idx ON public.trips (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own trips" ON public.trips FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  note TEXT,
  category TEXT NOT NULL DEFAULT 'Essentials',
  status public.item_status NOT NULL DEFAULT 'pending',
  included BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL
);
CREATE INDEX items_trip_idx ON public.items (trip_id, sort_order);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage items on their own trips" ON public.items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = items.trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = items.trip_id AND t.user_id = auth.uid()));

INSERT INTO public.trip_templates (id, name, tagline, sort_order) VALUES
  ('beach', 'Beach', 'Sun, sand, and swimsuits', 1),
  ('business', 'Business', 'Suits, laptops, and meetings', 2),
  ('weekend', 'Weekend', 'Light carry-on, quick getaway', 3);

INSERT INTO public.template_items (trip_template_id, name, note, category, sort_order) VALUES
  ('beach', 'Swimsuit', 'Bring 2 if the trip is over 4 days', 'Clothing', 1),
  ('beach', 'Reef-safe sunscreen SPF 50+', 'Reef-safe formula only', 'Skincare', 2),
  ('beach', 'Flip-flops / sandals', 'Easy on, easy off', 'Footwear', 3),
  ('beach', 'Beach towel', 'Quick-dry, not the hotel towel', 'Gear', 4),
  ('beach', 'Sunglasses', 'Essential for the beach', 'Accessories', 5),
  ('beach', 'Wide-brim hat or cap', 'Shade for long beach days', 'Accessories', 6),
  ('beach', 'Aloe vera / after-sun gel', 'For the sunburn you swore you would avoid', 'Skincare', 7),
  ('beach', 'Waterproof phone pouch', 'Photos in the water, safely', 'Tech', 8),
  ('beach', 'Light cover-up / sarong', 'Beach to lunch in one step', 'Clothing', 9),
  ('beach', 'Insect repellent', 'Dusk near water gets busy', 'Health', 10),
  ('business', 'Blazer or suit jacket', 'Pack it on top to avoid creases', 'Clothing', 1),
  ('business', 'Dress shirts', '1 per day plus 1 spare', 'Clothing', 2),
  ('business', 'Laptop + charger', 'Do not leave the charger behind', 'Tech', 3),
  ('business', 'Portfolio or notebook', 'For meetings and notes', 'Work', 4),
  ('business', 'Dress shoes', 'Stuff socks inside to save space', 'Footwear', 5),
  ('business', 'Belt matching shoes', 'Small detail, big difference', 'Accessories', 6),
  ('business', 'Business cards', 'Check you have enough', 'Work', 7),
  ('business', 'Phone charger + power bank', 'Long travel days drain fast', 'Tech', 8),
  ('business', 'Wrinkle-release spray or steamer', 'Hotel irons are unreliable', 'Gear', 9),
  ('business', 'Neutral tie or accessory', 'If applicable to the dress code', 'Accessories', 10),
  ('business', 'Backup outfit', 'For an unexpected dinner or event', 'Clothing', 11),
  ('weekend', 'Versatile outfits', 'One per day plus one spare', 'Clothing', 1),
  ('weekend', 'Comfortable walking shoes', 'You will walk more than you think', 'Footwear', 2),
  ('weekend', 'Phone charger', 'The most forgotten item', 'Tech', 3),
  ('weekend', 'Toiletry bag', 'Travel-size only', 'Toiletries', 4),
  ('weekend', 'Light jacket or layer', 'For temperature swings', 'Clothing', 5),
  ('weekend', 'Reusable water bottle', 'Fill up after security', 'Gear', 6),
  ('weekend', 'Cash / cards / ID', 'Check the expiry date', 'Essentials', 7),
  ('weekend', 'Headphones', 'Plus the charging case', 'Tech', 8),
  ('weekend', 'Sleepwear', 'Easy to forget when packing fast', 'Clothing', 9);