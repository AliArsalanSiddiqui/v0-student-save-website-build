-- Enable UUID and other extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTHENTICATION RELATED TABLES
-- ============================================

-- Profile table to store additional user info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  university TEXT,
  student_id TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'admin', 'vendor')),
  is_verified BOOLEAN DEFAULT FALSE,
  student_id_verified BOOLEAN DEFAULT FALSE,
  profile_picture_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  phone_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- VENDOR RELATED TABLES
-- ============================================

-- Vendors (restaurants, cafes, etc)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'cafe', 'arcade', 'bowling', 'clothing', 'other')),
  logo_url TEXT,
  banner_url TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_time TIME,
  closing_time TIME,
  phone_number TEXT,
  email TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Discount offers from vendors
CREATE TABLE IF NOT EXISTS discount_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  terms_and_conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscription_required BOOLEAN DEFAULT FALSE,
  min_subscription_tier TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- QR codes for vendors
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  discount_offer_id UUID REFERENCES discount_offers(id) ON DELETE SET NULL,
  qr_code_data TEXT NOT NULL UNIQUE,
  qr_code_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTION RELATED TABLES
-- ============================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Student subscriptions
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DISCOUNT REDEMPTION TABLES
-- ============================================

-- Track discount usage
CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_offer_id UUID NOT NULL REFERENCES discount_offers(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES qr_codes(id),
  redeemed_at TIMESTAMP DEFAULT NOW(),
  discount_amount DECIMAL(10, 2),
  notes TEXT
);

-- ============================================
-- STUDENT FAVORITES/BOOKMARKS
-- ============================================

-- Favorite vendors
CREATE TABLE IF NOT EXISTS favorite_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- ============================================
-- ADMIN & LOGS
-- ============================================

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  announcement_type TEXT CHECK (announcement_type IN ('general', 'offer', 'maintenance', 'urgent')),
  scheduled_for TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  discount_fixed_amount DECIMAL(10, 2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- VENDORS POLICIES (Public read for active vendors)
CREATE POLICY "Anyone can view active vendors" ON vendors FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage vendors" ON vendors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- DISCOUNT OFFERS POLICIES
CREATE POLICY "Anyone can view active discounts" ON discount_offers FOR SELECT
  USING (is_active = TRUE AND valid_until > NOW());

CREATE POLICY "Admin can manage discounts" ON discount_offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- QR CODES POLICIES
CREATE POLICY "Anyone can view active QR codes" ON qr_codes FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage QR codes" ON qr_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- SUBSCRIPTION PLANS POLICIES
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans FOR SELECT
  USING (is_active = TRUE);

-- STUDENT SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own subscriptions" ON student_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON student_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all subscriptions" ON student_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- DISCOUNT REDEMPTIONS POLICIES
CREATE POLICY "Users can view own redemptions" ON discount_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions" ON discount_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all redemptions" ON discount_redemptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- FAVORITE VENDORS POLICIES
CREATE POLICY "Users can manage own favorites" ON favorite_vendors FOR ALL
  USING (auth.uid() = user_id);

-- ACTIVITY LOGS POLICIES
CREATE POLICY "Admin can view logs" ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Anyone can insert logs" ON activity_logs FOR INSERT
  WITH CHECK (TRUE);

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Anyone can view announcements" ON announcements FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage announcements" ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- PROMO CODES POLICIES
CREATE POLICY "Anyone can view active promo codes" ON promo_codes FOR SELECT
  USING (is_active = TRUE AND valid_until > NOW());

CREATE POLICY "Admin can manage promo codes" ON promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_is_active ON vendors(is_active);
CREATE INDEX idx_discount_offers_vendor_id ON discount_offers(vendor_id);
CREATE INDEX idx_discount_offers_valid_until ON discount_offers(valid_until);
CREATE INDEX idx_student_subscriptions_user_id ON student_subscriptions(user_id);
CREATE INDEX idx_student_subscriptions_is_active ON student_subscriptions(is_active);
CREATE INDEX idx_discount_redemptions_user_id ON discount_redemptions(user_id);
CREATE INDEX idx_favorite_vendors_user_id ON favorite_vendors(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_qr_codes_vendor_id ON qr_codes(vendor_id);

-- ============================================
-- SEED DEMO DATA (Optional - can be removed)
-- ============================================

-- Insert some demo universities for verification
-- Note: This is just reference data for the app

-- Insert demo subscription plans
INSERT INTO subscription_plans (name, description, duration_days, price, discount_percentage, is_active, order_priority) VALUES
('Free Trial', 'Experience StudentSave for free', 7, 0, 0, TRUE, 3),
('Monthly Plan', 'Access all discounts for one month', 30, 999, 0, TRUE, 2),
('Semester Plan', '4 months of exclusive student discounts', 120, 2999, 10, TRUE, 1),
('Yearly Plan', 'Full year of benefits', 365, 5999, 20, TRUE, 0)
ON CONFLICT DO NOTHING;
