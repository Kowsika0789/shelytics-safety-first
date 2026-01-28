-- Create zone_suggestions table for user-submitted zone reports
CREATE TABLE public.zone_suggestions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION NOT NULL DEFAULT 200,
    suggested_risk_level public.risk_level NOT NULL DEFAULT 'at_risk',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.zone_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view their own suggestions
CREATE POLICY "Users can view their own suggestions"
ON public.zone_suggestions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own suggestions
CREATE POLICY "Users can insert suggestions"
ON public.zone_suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their pending suggestions
CREATE POLICY "Users can update their pending suggestions"
ON public.zone_suggestions FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their pending suggestions
CREATE POLICY "Users can delete their pending suggestions"
ON public.zone_suggestions FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all suggestions
CREATE POLICY "Admins can view all suggestions"
ON public.zone_suggestions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any suggestion (approve/reject)
CREATE POLICY "Admins can update all suggestions"
ON public.zone_suggestions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_zone_suggestions_updated_at
BEFORE UPDATE ON public.zone_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();