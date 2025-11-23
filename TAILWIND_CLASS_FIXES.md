# Tailwind Class Replacements for StudentSave

## Old → New Class Mappings

Replace ALL instances of these patterns:

| Old Pattern | New Pattern | Usage |
|------------|------------|-------|
| `bg-[var(--background)]` | `bg-background` | Main page background |
| `bg-[var(--card-bg)]` | `bg-card` | Card backgrounds |
| `text-[var(--foreground)]` | `text-foreground` | Main text color |
| `text-[var(--text-muted)]` | `text-muted` | Muted text |
| `text-[var(--primary)]` | `text-primary` | Primary accent text |
| `text-[var(--secondary)]` | `text-secondary` | Secondary accent |
| `border-[var(--border-color)]` | `border-[--border-color]` | Borders |
| `hover:text-[var(--foreground)]` | `hover:text-foreground` | Hover states |
| `hover:bg-[var(--primary)]` | `hover:bg-primary` | Hover backgrounds |
| `focus:border-[var(--primary)]` | `focus:border-primary` | Focus states |
| `bg-[var(--primary)]` | `bg-primary` | Primary button color |

## Quick Replace Commands (for VS Code)

Use Find & Replace (Ctrl+H or Cmd+H):

1. Find: `bg-\[var$$--background$$\]` → Replace: `bg-background`
2. Find: `bg-\[var$$--card-bg$$\]` → Replace: `bg-card`
3. Find: `text-\[var$$--foreground$$\]` → Replace: `text-foreground`
4. Find: `text-\[var$$--text-muted$$\]` → Replace: `text-muted`
5. Find: `text-\[var$$--primary$$\]` → Replace: `text-primary`
6. Find: `border-\[var$$--border-color$$\]` → Replace: `border-[--border-color]`
7. Find: `hover:text-\[var$$--foreground$$\]` → Replace: `hover:text-foreground`
8. Find: `focus:border-\[var$$--primary$$\]` → Replace: `focus:border-primary`

## Files That Need Updates

- [ ] app/auth/login/page.tsx
- [ ] app/auth/signup/page.tsx
- [ ] app/auth/email-verification/page.tsx
- [ ] app/dashboard/page.tsx
- [ ] app/profile/page.tsx
- [ ] app/scan/page.tsx
- [ ] app/subscriptions/page.tsx
- [ ] app/vendors/page.tsx
- [ ] app/vendors/[id]/page.tsx
- [ ] app/admin/login/page.tsx
- [ ] app/admin/dashboard/page.tsx
- [ ] components/navbar.tsx

## Why This Change?

- Tailwind v4 doesn't support arbitrary values with CSS variables
- Using semantic color names is cleaner and more maintainable
- The tailwind.config.js now maps these semantic names to CSS variables
- All styling continues to work exactly the same!
\`\`\`
