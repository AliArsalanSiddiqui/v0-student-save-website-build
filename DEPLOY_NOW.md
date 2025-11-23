# Deploy StudentSave in 15 Minutes

## Step-by-Step Deployment Guide

### STEP 1: Setup Supabase Database (5 min)

**1.1 Create Supabase Project**
- Go to https://supabase.com
- Click "New Project"
- Choose organization and project name
- Set password
- Select region closest to you
- Click "Create new project"
- Wait for project to be created (2-3 minutes)

**1.2 Run Database Setup SQL**
- In Supabase, click "SQL Editor" in left sidebar
- Click "New Query"
- Open file: `/scripts/01-create-tables.sql` from your project
- Copy ALL the SQL code
- Paste into Supabase SQL Editor
- Click "Run" button
- Wait for completion
- You should see: "11 tables created successfully"

✅ **Database is now ready!**

---

### STEP 2: Create Admin Account (3 min)

**2.1 Create Admin User**
- In Supabase, go to "Authentication" → "Users"
- Click "Create a new user"
- Email: `admin@studentbuzz.pk`
- Password: `AdminPass123!` (or your choice - save it!)
- Click "Create user"

**2.2 Copy User ID**
- In the Users list, find the admin user
- Click on it
- Copy the "User ID" (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

**2.3 Create Admin Profile**
- Go back to "SQL Editor"
- Click "New Query"
- Paste this SQL (replace `USER_ID_HERE` with the ID you copied):

\`\`\`sql
INSERT INTO profiles (id, email, full_name, user_type, is_verified, university)
VALUES (
  'USER_ID_HERE',
  'admin@studentbuzz.pk',
  'Admin',
  'admin',
  TRUE,
  'StudentSave'
);
\`\`\`

- Click "Run"
- You should see: "1 row inserted"

✅ **Admin account created!**

---

### STEP 3: Get Your API Keys (2 min)

**3.1 Get Project URL**
- In Supabase, click "Project Settings" (gear icon)
- Click "API" in left sidebar
- Copy "Project URL" (looks like: `https://xxxxx.supabase.co`)
- Save it somewhere safe

**3.2 Get API Keys**
- Still in API settings
- Find "Project API keys" section
- Copy "anon public" key (starts with `eyJ...`)
- Copy "service_role" key (starts with `eyJ...`)
- Save both somewhere safe

You now have 3 keys:
1. Project URL
2. Anon public key
3. Service role key

✅ **Keys obtained!**

---

### STEP 4: Deploy to Vercel (5 min)

**4.1 Push Code to GitHub**
\`\`\`bash
git add .
git commit -m "Initial StudentSave deployment"
git push origin main
\`\`\`

**4.2 Create Vercel Project**
- Go to https://vercel.com
- Click "New Project"
- Click "Import Git Repository"
- Select your GitHub repository
- Click "Import"

**4.3 Add Environment Variables**
- You should see "Configure Project" page
- Scroll to "Environment Variables"
- Add these 3 variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL from Step 3.1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Step 3.2 |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Step 3.2 |

**4.4 Deploy**
- Click "Deploy"
- Wait for deployment to complete (2-3 minutes)
- You'll see "Congratulations! Your project has been successfully deployed"
- Click the URL to visit your live site!

✅ **Your site is now LIVE!**

---

## Verify Everything Works

### Test 1: Homepage
- Visit your Vercel URL
- Should see StudentSave homepage
- Click "I'm a Student" button

### Test 2: Student Signup
- Fill in signup form:
  - Full Name: Test User
  - University: Bahria University Karachi
  - Email: test@example.com
  - Password: Test123!
- Click "Create Account"
- Should see "Check your email to verify your account"

### Test 3: Admin Login
- Go to `/admin/login` on your site
- Email: `admin@studentbuzz.pk`
- Password: The one you set in Step 2.1
- Should see Admin Dashboard

### Test 4: Add Test Vendor
- Go back to Supabase SQL Editor
- Click "New Query"
- Paste this:

\`\`\`sql
INSERT INTO vendors (name, category, location, description, is_active)
VALUES (
  'Test Pizza Place',
  'restaurant',
  'Test Location, Karachi',
  'Delicious test pizzas',
  TRUE
);
\`\`\`

- Click "Run"
- Go to your site `/vendors` page
- Should see "Test Pizza Place" vendor

✅ **Everything is working!**

---

## What's Next?

### Immediate (Today)
- [ ] Test all pages work
- [ ] Verify email verification works
- [ ] Test admin login
- [ ] Add a few test vendors

### This Week
- [ ] Add real vendor data
- [ ] Create real discount offers
- [ ] Invite first students
- [ ] Test QR code scanning

### This Month
- [ ] Setup Stripe for payments
- [ ] Add more vendors
- [ ] Launch marketing campaign
- [ ] Monitor user feedback

---

## Troubleshooting

### "Deployment failed"
- Check Vercel logs (click "Deployments" → "View Logs")
- Make sure all environment variables are set
- Try redeploying

### "Can't login to admin"
- Verify you created the profile in Step 2.3
- Check email is exactly: `admin@studentbuzz.pk`
- Try resetting password in Supabase

### "Email verification not working"
- Check Supabase Project Settings → Email Templates
- Verify SMTP is configured
- Check spam folder

### "Vendors not showing"
- Make sure you added vendors in SQL
- Check `is_active = TRUE`
- Refresh the page

---

## You're Done! 🎉

Your StudentSave platform is now live and ready to use!

**What you have:**
- ✅ Complete student portal
- ✅ Admin dashboard
- ✅ Vendor management
- ✅ QR code scanner
- ✅ Subscription system
- ✅ Secure database
- ✅ Email verification
- ✅ Beautiful UI

**Share your site:**
- Send the Vercel URL to friends
- Have them sign up as students
- Test the full flow

**Questions?**
- Check DEPLOYMENT_GUIDE.md
- Check QUICK_START.md
- Review README.md

---

**Congratulations on launching StudentSave!** 🚀
