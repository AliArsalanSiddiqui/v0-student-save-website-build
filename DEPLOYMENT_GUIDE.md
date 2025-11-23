# StudentSave Deployment Guide

## What You Need to Do Manually

### 1. Supabase Setup
- Log in to your Supabase dashboard
- Go to the SQL Editor
- Copy and paste the contents of `scripts/01-create-tables.sql`
- Execute the SQL to create all tables with RLS policies
- Verify all tables are created successfully

### 2. Environment Variables
The following environment variables are already configured in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `POSTGRES_URL`

If deploying elsewhere, add these to your `.env.local`:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 3. Admin Account Creation
1. Go to Supabase Authentication
2. Create a user with email: `admin@studentbuzz.pk` (or your preferred admin email)
3. Then manually insert a profile record in the `profiles` table:
\`\`\`sql
INSERT INTO profiles (id, email, full_name, user_type, is_verified)
VALUES (
  'USER_ID_FROM_AUTH',
  'admin@studentbuzz.pk',
  'Admin User',
  'admin',
  TRUE
);
\`\`\`

### 4. Add Demo Data (Optional)
Add some demo vendors, offers, and QR codes to test the system:
- Go to Supabase SQL Editor
- Insert vendors with names, locations, and categories
- Create sample discount offers linked to vendors
- Generate QR codes for offers

### 5. Payment Gateway Integration (Stripe)
- Sign up for Stripe account
- Get your API keys
- Add to environment variables:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Create subscription products in Stripe matching your plans
- Implement Stripe checkout in `/app/subscriptions/checkout` route

### 6. Email Verification Setup
- Supabase has email configured by default
- For production, configure custom SMTP in Supabase settings
- Update email template for better branding

### 7. QR Code Generation
- The system is set up for manual QR code input
- To add automatic QR generation:
  1. Install `qrcode` library: `npm install qrcode`
  2. Create API route at `/api/generate-qr`
  3. Use in admin panel for vendors

### 8. Deployment
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel project settings
4. Deploy!

## File Structure
\`\`\`
app/
  ├── page.tsx                    # Homepage
  ├── auth/                       # Authentication pages
  │   ├── login/page.tsx
  │   ├── signup/page.tsx
  │   └── email-verification/page.tsx
  ├── dashboard/page.tsx          # Student dashboard
  ├── vendors/                    # Vendor browsing
  │   ├── page.tsx
  │   └── [id]/page.tsx          # Vendor detail (needs to be created)
  ├── scan/page.tsx              # QR code scanner
  ├── subscriptions/page.tsx      # Subscription plans
  ├── profile/page.tsx           # User profile
  └── admin/                      # Admin portal
      ├── login/page.tsx
      ├── dashboard/page.tsx
      ├── vendors/page.tsx       # Vendor management (needs to be created)
      ├── students/page.tsx      # Student management (needs to be created)
      ├── offers/page.tsx        # Offer management (needs to be created)
      └── announcements/page.tsx # Send announcements (needs to be created)

lib/
  ├── supabase/
  │   ├── client.ts
  │   ├── server.ts
  │   └── middleware.ts
  ├── auth-helpers.ts
  └── constants.ts

components/
  └── navbar.tsx

scripts/
  └── 01-create-tables.sql
\`\`\`

## Key Features Implemented
✓ Supabase authentication with email/password
✓ User profiles (student, admin)
✓ University email verification setup
✓ Vendor catalog with categories
✓ Discount offers management
✓ QR code scanner (manual input + camera ready)
✓ Subscription system with plans
✓ Discount redemption tracking
✓ Admin dashboard
✓ Student dashboard with stats
✓ Row Level Security for all tables

## Next Steps to Complete

### High Priority
1. Create admin vendor management pages (`/admin/vendors`)
2. Create admin student management pages (`/admin/students`)
3. Create admin offer management pages (`/admin/offers`)
4. Create vendor detail pages (`/vendors/[id]`)
5. Implement Stripe payment integration
6. Add QR code image generation

### Medium Priority
1. Implement actual QR code scanning (integrate html5-qrcode library)
2. Add push notifications
3. Implement student ID verification upload
4. Add analytics dashboard
5. Create announcement system

### Polish & Optimization
1. Add error boundaries
2. Implement loading states
3. Add success notifications
4. Optimize images
5. Add mobile responsiveness testing
6. Implement PWA features for offline QR scanning
7. Add analytics tracking

## Testing Checklist
- [ ] User signup and email verification
- [ ] Student login and dashboard
- [ ] Admin login and dashboard access control
- [ ] Vendor browsing and filtering
- [ ] QR code redemption
- [ ] Subscription purchase
- [ ] Profile management
- [ ] RLS policies (unauthorized access should fail)

## Security Notes
- All user data is protected by RLS policies
- Admin functions are role-based (verified at database level)
- Email confirmation required for signup
- Sensitive data (user IDs) never exposed to frontend
- CSRF protection via Next.js built-in features

## Support & Debugging
- Check Supabase logs for auth issues
- Verify RLS policies if data access fails
- Use browser DevTools Network tab to debug API calls
- Check Next.js logs for server-side errors
