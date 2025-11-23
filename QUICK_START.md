# StudentSave - Quick Start Guide

## What This Project Includes

✅ **Complete Database Schema** - 11 tables with Row Level Security
✅ **Authentication System** - Email/password signup and login with email verification  
✅ **Student Portal** - Browse vendors, view discounts, redeem via QR codes
✅ **Admin Portal** - Manage vendors, students, and offers
✅ **Subscription System** - Multiple subscription tiers for students
✅ **QR Code Scanner** - Built with camera support and manual code entry
✅ **Beautiful UI** - Dark theme matching your design with purple and pink accents

## What You Need to Do Before Deploying

### Step 1: Set Up Supabase Database (5 minutes)
1. Go to https://supabase.com and create an account
2. Create a new project
3. Go to SQL Editor
4. Open file: `/scripts/01-create-tables.sql`
5. Copy ALL the SQL and paste into Supabase SQL Editor
6. Click "Run" to execute

### Step 2: Create Admin Account (3 minutes)
1. In Supabase, go to Authentication → Users
2. Click "Create a new user"
3. Email: `admin@studentbuzz.pk`
4. Password: Something strong
5. Copy the User ID (shown in the user list)
6. Go back to SQL Editor and run:
\`\`\`sql
INSERT INTO profiles (id, email, full_name, user_type, is_verified, university)
VALUES (
  'PASTE_THE_USER_ID_HERE',
  'admin@studentbuzz.pk',
  'Admin',
  'admin',
  TRUE,
  'StudentSave'
);
\`\`\`

### Step 3: Get Your Keys (2 minutes)
1. Go to Supabase Project Settings → API
2. Copy `Project URL` and save it
3. Copy `anon public` key and save it
4. Copy `service_role` key and save it

### Step 4: Deploy to Vercel (5 minutes)
1. Push your code to GitHub (if not already)
2. Go to https://vercel.com
3. Click "New Project" and select your GitHub repo
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Project URL from Step 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key from Step 3
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key from Step 3
5. Click Deploy!

## Testing Your Site

1. **Test Student Signup**
   - Go to https://yourdomain.com/auth/signup
   - Create account with university email
   - Check email for verification link
   - Click verification link

2. **Test Admin Login**
   - Go to https://yourdomain.com/admin/login
   - Email: `admin@studentbuzz.pk`
   - Password: The one you set in Step 2

3. **Add Test Vendor** (Admin Portal)
   - Go to Admin Dashboard
   - Click "Vendor Management"
   - Add a test vendor with location and category
   - Create a test discount offer

4. **Test Student Features**
   - Login as student
   - Go to Dashboard
   - Browse Vendors
   - Try subscription page (no payment needed to test)
   - Test QR code scanning

## Key Files Explained

| File | Purpose |
|------|---------|
| `/scripts/01-create-tables.sql` | Database setup - RUN THIS FIRST |
| `/app/page.tsx` | Homepage |
| `/app/auth/` | Login/Signup pages |
| `/app/dashboard/` | Student dashboard |
| `/app/vendors/` | Browse vendors |
| `/app/scan/page.tsx` | QR code scanner |
| `/app/subscriptions/` | Subscription plans |
| `/app/admin/` | Admin portal |
| `/lib/supabase/` | Database connection files |
| `/lib/auth-helpers.ts` | Authentication functions |

## Important: RLS (Row Level Security)

The database has RLS enabled on all tables. This means:
- ✅ Students can only see their own data
- ✅ Admins can see all data
- ✅ All discount offers are public but redemptions are private
- ✅ Very secure by default

## What's Pre-Built and Ready

✓ Email verification
✓ Student/Admin role separation  
✓ Vendor catalog with categories
✓ Discount management
✓ QR code redemption tracking
✓ Subscription system
✓ Beautiful responsive UI
✓ Dark theme with purple accents

## What You Still Need to Add (Optional)

- [ ] Stripe payment integration for subscriptions
- [ ] Automatic QR code generation (library ready)
- [ ] Student ID verification upload
- [ ] Push notifications
- [ ] Admin email for announcements
- [ ] More admin management pages

## Useful Commands

\`\`\`bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
\`\`\`

## Database Connection Details

Your Supabase database is automatically connected via:
- `lib/supabase/client.ts` - For browser (client components)
- `lib/supabase/server.ts` - For server (server components/actions)
- `middleware.ts` - For session management

No additional setup needed!

## Troubleshooting

**"Email verification not working"**
- Check Supabase Project Settings → Email Templates
- Verify SMTP is configured (or use default Supabase SMTP)

**"Can't login to admin"**
- Make sure you created the profile in the profiles table
- Check user_type is set to 'admin'

**"Vendors not showing"**
- Add vendors through Supabase SQL Editor or admin panel
- Ensure is_active = true

**"QR scanning not working"**
- Browser needs camera permission (allow when prompted)
- Can manually enter code instead of scanning

## Next Steps After Deployment

1. Add real vendor data to your database
2. Invite first students to test
3. Set up Stripe for payments (optional)
4. Create marketing materials
5. Set up email customization
6. Monitor analytics

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs  
- **Vercel Docs:** https://vercel.com/docs

---

**You're all set! Your StudentSave platform is ready to launch.** 🚀
