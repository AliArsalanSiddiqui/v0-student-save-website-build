import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Fetch the authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const emailVerified = !!user.email_confirmed_at

        // Check existing profile row
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // Create a new profile
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || '',
            university: user.user_metadata.university || '',
            user_type: user.user_metadata.user_type || 'student',
            is_verified: emailVerified, // <-- uses Supabase verification status
            updated_at: new Date().toISOString()
          })
        } else {
          // Update profile verification if needed
          if (!existingProfile.is_verified && emailVerified) {
            await supabase
              .from('profiles')
              .update({
                is_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
          }
        }

        // Log the verification event
        if (emailVerified) {
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'email_verified',
            entity_type: 'profile',
            entity_id: user.id,
            details: {
              email: user.email,
              verified_at: new Date().toISOString()
            }
          })
        }
      }
    }
  }

  // Redirect the user to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
