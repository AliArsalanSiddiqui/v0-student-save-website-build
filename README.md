# StudentSave - Exclusive Student Discounts Platform

A complete full-stack platform connecting verified students with exclusive discounts at restaurants, cafes, and entertainment venues. Built with Next.js, Supabase, and Tailwind CSS.

![StudentSave](/images/logo.png)

## Features

### 🎓 Student Portal
- **Easy Sign Up** - University email verification
- **Browse Discounts** - Filter by category, search vendors
- **QR Code Redemption** - Scan QR codes to claim discounts
- **Subscription Plans** - Free trial, monthly, semester, yearly options
- **Dashboard** - Track redeemed discounts and subscription status
- **Favorites** - Bookmark favorite vendors
- **Transaction History** - View all discount usage

### 🏪 Vendor Management
- **Vendor Catalog** - Restaurants, cafes, arcades, bowling, clothing
- **Detailed Profiles** - Logo, location, hours, contact info
- **Multiple Discounts** - Each vendor can offer multiple discounts
- **Discount Types** - Percentage off or fixed amount
- **Usage Tracking** - Monitor max uses and current redemptions

### 👨‍💼 Admin Portal
- **Dashboard** - Real-time statistics and analytics
- **Vendor Management** - Add/edit/delete vendors
- **Student Management** - Verify and manage students
- **Discount Management** - Create and manage offers
- **Subscription Management** - Configure plans and pricing
- **Announcements** - Send notifications to students
- **Activity Logs** - Track all platform activity

### 🔐 Security
- **Row Level Security (RLS)** - Database-level access control
- **Email Verification** - Confirms student identity
- **Role-Based Access** - Student vs Admin restrictions
- **Encrypted Passwords** - Secure authentication
- **Session Management** - Automatic token refresh

## Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (Email/Password)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <your-repo-url>
cd student-save
npm install
\`\`\`

2. **Set up Supabase**
   - Create Supabase project
   - Run `/scripts/01-create-tables.sql` in SQL Editor
   - Copy your credentials

3. **Configure environment variables**
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
\`\`\`

4. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

5. **Open browser**
\`\`\`
http://localhost:3000
\`\`\`

## Database Schema

### Tables
- **profiles** - User information and roles
- **vendors** - Restaurant/cafe profiles
- **discount_offers** - Discount details
- **qr_codes** - QR code data
- **subscription_plans** - Subscription tiers
- **student_subscriptions** - Active subscriptions
- **discount_redemptions** - Usage tracking
- **favorite_vendors** - Bookmarked vendors
- **activity_logs** - Audit trail
- **announcements** - Admin notifications
- **promo_codes** - Promotion codes

All tables have Row Level Security enabled for data protection.

## Key Pages

### Public Routes
- `/` - Homepage
- `/auth/signup` - Student registration
- `/auth/login` - Login page
- `/vendors` - Browse all vendors
- `/vendors/[id]` - Vendor details

### Student Routes (Protected)
- `/dashboard` - Student dashboard
- `/scan` - QR code scanner
- `/subscriptions` - Subscription plans
- `/profile` - User profile management

### Admin Routes (Protected)
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin overview
- `/admin/vendors` - Vendor management
- `/admin/students` - Student management
- `/admin/offers` - Offer management

## API Routes

Key server-side functions in `lib/auth-helpers.ts`:
- `signUpStudent()` - User registration
- `signInWithEmail()` - User login
- `getCurrentUser()` - Get session user
- `getUserProfile()` - Fetch user profile

## Testing

### Test Student Flow
1. Sign up with test email
2. Verify email
3. Browse vendors
4. View subscription plans
5. Scan QR code (use manual entry)

### Test Admin Flow
1. Login with admin credentials
2. View dashboard statistics
3. Add test vendor
4. Create test discount offer

## Environment Variables

Required variables:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase public key
SUPABASE_SERVICE_ROLE_KEY        # Supabase admin key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL # Dev email redirect (optional)
\`\`\`

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

\`\`\`bash
npm run build
\`\`\`

## Contributing

Contributions welcome! Please submit pull requests or open issues.

## License

MIT License - See LICENSE file

## Support

For issues or questions:
- Check the documentation in `/DEPLOYMENT_GUIDE.md`
- Review the setup checklist in `/SETUP_CHECKLIST.md`
- Refer to Supabase docs: https://supabase.com/docs

## Roadmap

- [ ] Stripe payment integration
- [ ] Push notifications
- [ ] Student ID verification
- [ ] Analytics dashboard
- [ ] Referral system
- [ ] In-app messaging
- [ ] GPS-based recommendations
- [ ] Mobile app (React Native)

---

**Built with ❤️ for students by v0**
