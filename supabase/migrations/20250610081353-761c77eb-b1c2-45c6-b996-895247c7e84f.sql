
-- Create a table to store photo metadata
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read photos (for public photo wall)
CREATE POLICY "Anyone can view photos" ON public.photos
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert photos (for public uploads)
CREATE POLICY "Anyone can upload photos" ON public.photos
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to delete photos (for admin cleanup)
CREATE POLICY "Anyone can delete photos" ON public.photos
  FOR DELETE USING (true);

-- Create a storage bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Enable realtime for the photos table
ALTER TABLE public.photos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
