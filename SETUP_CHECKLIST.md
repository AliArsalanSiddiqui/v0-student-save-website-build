# StudentSave Setup Checklist

## Pre-Deployment Checklist

### Database Setup (Supabase)
- [ ] Login to Supabase dashboard
- [ ] Open SQL Editor
- [ ] Copy all SQL from `/scripts/01-create-tables.sql`
- [ ] Execute the SQL to create tables
- [ ] Verify all 11 tables are created
- [ ] Check that Row Level Security is enabled on all tables
- [ ] Check that all policies are in place

### Create Admin Account
- [ ] Go to Supabase Authentication section
- [ ] Create user with email: `admin@studentbuzz.pk`
- [ ] Copy the generated User ID
- [ ] Go to SQL Editor and run:
\`\`\`sql
INSERT INTO profiles (id, email, full_name, user_type, is_verified, university)
VALUES (
  'PASTE_USER_ID_HERE',
  'admin@studentbuzz.pk',
  'Admin',
  'admin',
  TRUE,
  'StudentSave Admin'
);
\`\`\`

### Environment Variables (Vercel/Deployment)
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` from Supabase Project Settings
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Project Settings
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` from Supabase Project Settings

### Test Locally
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` to start development server
- [ ] Test homepage loads at `http://localhost:3000`
- [ ] Test signup flow at `/auth/signup`
- [ ] Test login flow at `/auth/login`
- [ ] Test admin login at `/admin/login`

### Before Going Live
- [ ] Verify email verification works (check Supabase email templates)
- [ ] Test with actual Supabase (not local/emulated)
- [ ] Test all RLS policies work correctly
- [ ] Test student and admin role separation
- [ ] Add initial vendor data through database
- [ ] Test vendor browsing
- [ ] Test subscription page (before payment integration)

### Deploy to Vercel
- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy
- [ ] Test all pages on live site

## Post-Deployment

### Add Initial Data
1. **Subscription Plans** - Already seeded in migration, verify in database
2. **Sample Vendors** - Add via Supabase SQL:
\`\`\`sql
INSERT INTO vendors (name, category, location, description)
VALUES 
  ('Pizza Palace', 'restaurant', 'Defence, Karachi', 'Authentic Italian pizzas'),
  ('Coffee Corner', 'cafe', 'Clifton, Karachi', 'Premium coffee and pastries'),
  ('Game Zone', 'arcade', 'Mall Road, Lahore', 'Fun games and entertainment');
\`\`\`

3. **Sample Offers** - Create discount offers for vendors

### Monitor
- [ ] Check Supabase logs for errors
- [ ] Monitor user signups
- [ ] Test QR code redemption flow
- [ ] Verify email notifications work

## Optional Enhancements

### Payment Integration (Stripe)
- [ ] Create Stripe account
- [ ] Add Stripe keys to environment variables
- [ ] Create subscription products in Stripe
- [ ] Implement checkout flow in `/api/checkout`
- [ ] Test payment flow

### QR Code Generation
- [ ] Install `qrcode` library
- [ ] Create `/api/generate-qr` endpoint
- [ ] Add QR generation to vendor management

### Push Notifications
- [ ] Setup Firebase Cloud Messaging
- [ ] Implement service worker
- [ ] Add notification subscribe button

### Email Customization
- [ ] Go to Supabase Email Templates
- [ ] Customize verification email
- [ ] Add StudentSave branding

## Troubleshooting

### RLS Policy Errors
- Verify user is authenticated
- Check policy conditions match your use case
- Ensure user ID is correct in policies

### Email Not Sending
- Check Supabase email settings
- Verify SMTP configuration if using custom
- Check email templates in Supabase dashboard

### QR Scan Not Working
- Ensure camera permissions are granted
- Test with manual code input first
- Check QR code data format in database

### Subscription Not Saving
- Verify user is authenticated
- Check subscription table has data
- Verify RLS policy allows insert

## Support
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
