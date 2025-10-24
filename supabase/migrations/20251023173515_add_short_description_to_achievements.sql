ALTER TABLE public.achievements ADD COLUMN short_description TEXT;
UPDATE public.achievements SET short_description = 'Default short description' WHERE short_description IS NULL;
ALTER TABLE public.achievements ALTER COLUMN short_description SET NOT NULL;