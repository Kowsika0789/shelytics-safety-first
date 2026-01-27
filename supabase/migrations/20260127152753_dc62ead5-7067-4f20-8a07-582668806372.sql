-- Create enum types for risk levels and alert types
CREATE TYPE public.risk_level AS ENUM ('safe', 'at_risk', 'emergency');
CREATE TYPE public.alert_type AS ENUM ('sos', 'auto_risk_zone', 'speed_alert');
CREATE TYPE public.alert_status AS ENUM ('pending', 'acknowledged', 'resolved');
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    gps_enabled BOOLEAN NOT NULL DEFAULT false,
    notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create location_logs table for tracking user locations
CREATE TABLE public.location_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION DEFAULT 0,
    accuracy DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_zones table for storing high-risk areas
CREATE TABLE public.risk_zones (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION NOT NULL DEFAULT 500,
    risk_score INTEGER NOT NULL DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level NOT NULL DEFAULT 'at_risk',
    incident_count INTEGER NOT NULL DEFAULT 0,
    time_factors JSONB DEFAULT '{"night_multiplier": 1.5, "weekend_multiplier": 1.2}'::jsonb,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create incidents table for tracking safety incidents
CREATE TABLE public.incidents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    alert_type alert_type NOT NULL,
    status alert_status NOT NULL DEFAULT 'pending',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    risk_level risk_level,
    description TEXT,
    audio_url TEXT,
    police_notified BOOLEAN NOT NULL DEFAULT false,
    contacts_notified BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create police_stations table for emergency services
CREATE TABLE public.police_stations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
    ON public.user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Emergency contacts policies
CREATE POLICY "Users can view their own emergency contacts"
    ON public.emergency_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts"
    ON public.emergency_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
    ON public.emergency_contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
    ON public.emergency_contacts FOR DELETE
    USING (auth.uid() = user_id);

-- Location logs policies
CREATE POLICY "Users can view their own location logs"
    ON public.location_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own location logs"
    ON public.location_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Risk zones policies (public read, admin write)
CREATE POLICY "Anyone can view active risk zones"
    ON public.risk_zones FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage risk zones"
    ON public.risk_zones FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Incidents policies
CREATE POLICY "Users can view their own incidents"
    ON public.incidents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incidents"
    ON public.incidents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incidents"
    ON public.incidents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all incidents"
    ON public.incidents FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- Police stations policies (public read)
CREATE POLICY "Anyone can view police stations"
    ON public.police_stations FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage police stations"
    ON public.police_stations FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_zones_updated_at
    BEFORE UPDATE ON public.risk_zones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert sample risk zones for demonstration
INSERT INTO public.risk_zones (name, latitude, longitude, radius_meters, risk_score, risk_level, incident_count, description) VALUES
('Downtown Night Zone', 40.7128, -74.0060, 800, 85, 'emergency', 45, 'High incident area during night hours'),
('Industrial Area', 40.7200, -74.0100, 600, 65, 'at_risk', 22, 'Moderate risk industrial zone'),
('Park District', 40.7300, -73.9950, 400, 35, 'safe', 5, 'Well-lit park area with security'),
('Transit Hub', 40.7150, -74.0000, 500, 70, 'at_risk', 30, 'Busy transit area with occasional incidents'),
('Residential Safe Zone', 40.7250, -73.9900, 700, 20, 'safe', 2, 'Safe residential neighborhood');

-- Insert sample police stations
INSERT INTO public.police_stations (name, phone, latitude, longitude, address) VALUES
('Central Police Station', '911', 40.7130, -74.0055, '123 Main Street'),
('North Precinct', '911', 40.7280, -73.9920, '456 North Avenue'),
('South Precinct', '911', 40.7050, -74.0120, '789 South Boulevard');

-- Enable realtime for incidents and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;