-- Create snippets table for storing code snippets
CREATE TABLE public.snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required as per user request)
CREATE POLICY "Anyone can view snippets" 
ON public.snippets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create snippets" 
ON public.snippets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update snippets" 
ON public.snippets 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete snippets" 
ON public.snippets 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_snippets_updated_at
BEFORE UPDATE ON public.snippets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();