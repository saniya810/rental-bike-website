-- Rental Bike Platform - Supabase PostgreSQL Schema with RLS
-- Run this SQL in your Supabase SQL Editor if connecting a dedicated project

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Profile Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone TEXT,
  driving_license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Bikes Fleet Table
CREATE TABLE IF NOT EXISTS public.bikes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  bike_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery_urls TEXT[] DEFAULT '{}',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  hourly_price NUMERIC(10, 2) NOT NULL,
  daily_price NUMERIC(10, 2) NOT NULL,
  availability TEXT NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available', 'Rented', 'Maintenance')),
  bike_condition TEXT NOT NULL DEFAULT 'Excellent' CHECK (bike_condition IN ('Excellent', 'Good', 'Fair', 'Needs Inspection')),
  rating NUMERIC(3, 2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bike_id UUID REFERENCES public.bikes(id) ON DELETE RESTRICT NOT NULL,
  rental_type TEXT NOT NULL CHECK (rental_type IN ('hourly', 'daily')),
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  return_date DATE NOT NULL,
  return_time TIME NOT NULL,
  pickup_location TEXT NOT NULL,
  duration_hours INT DEFAULT 0,
  duration_days INT DEFAULT 0,
  rental_cost NUMERIC(10, 2) NOT NULL,
  security_deposit NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  taxes NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'upcoming' CHECK (booking_status IN ('upcoming', 'active', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'refunded')),
  payment_provider TEXT DEFAULT 'Pending Configuration',
  driving_license_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Inspections & Damage Records Table
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE NOT NULL,
  inspector_name TEXT NOT NULL,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('pre_rental', 'post_rental')),
  bike_condition TEXT NOT NULL,
  damage_details TEXT,
  damage_charges NUMERIC(10, 2) DEFAULT 0.00,
  inspected_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE (user_id, bike_id)
);

-- 8. Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE NOT NULL,
  rental_type TEXT NOT NULL DEFAULT 'hourly',
  pickup_date DATE,
  pickup_time TIME,
  return_date DATE,
  return_time TIME,
  pickup_location TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9. Rental Policies Table
CREATE TABLE IF NOT EXISTS public.rental_policies (
  id TEXT PRIMARY KEY DEFAULT 'default',
  security_deposit_standard NUMERIC(10, 2) DEFAULT 50.00,
  security_deposit_electric NUMERIC(10, 2) DEFAULT 100.00,
  damage_charges_policy TEXT NOT NULL,
  late_return_charges_policy TEXT NOT NULL,
  late_fee_per_hour NUMERIC(10, 2) DEFAULT 15.00,
  fuel_policy TEXT NOT NULL,
  cancellation_policy TEXT NOT NULL,
  rental_extension_charges_policy TEXT NOT NULL,
  traffic_fine_responsibility TEXT NOT NULL,
  driving_licence_requirements TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for high-performance availability checks
CREATE INDEX IF NOT EXISTS idx_bookings_bike_dates ON public.bookings(bike_id, pickup_date, return_date, booking_status);
CREATE INDEX IF NOT EXISTS idx_bikes_availability ON public.bikes(availability, bike_type, brand);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_booking ON public.inspections(booking_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can view their own profile; admins can view all profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bikes: Anyone can view bikes; Only admins can insert/update/delete
CREATE POLICY "Public bikes are viewable by everyone" ON public.bikes FOR SELECT USING (true);
CREATE POLICY "Admins can manage bikes" ON public.bikes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings: Users can view & create their own bookings; Admins can manage all
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own pending/upcoming bookings" ON public.bookings FOR UPDATE USING (
  auth.uid() = user_id AND booking_status IN ('upcoming')
);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Wishlist & Cart: Users can only manage their own items
CREATE POLICY "Users can view own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);

-- Reviews: Viewable by everyone; registered users can post
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inspections: Only admins can view and record inspections
CREATE POLICY "Admins can view and record inspections" ON public.inspections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies: Viewable by everyone; Admin can update
CREATE POLICY "Rental policies viewable by everyone" ON public.rental_policies FOR SELECT USING (true);
CREATE POLICY "Admins can update policies" ON public.rental_policies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
