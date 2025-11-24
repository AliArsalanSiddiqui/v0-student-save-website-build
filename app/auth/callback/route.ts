import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user and create/update their profile
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, is_verified, email')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // Create new profile with email verified status
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || '',
            university: user.user_metadata.university || '',
            user_type: user.user_metadata.user_type || 'student',
            is_verified: true, // Auto-verify email confirmation
          })
        } else {
          // Update existing profile to verified if email is confirmed
          if (!existingProfile.is_verified && user.email_confirmed_at) {
            await supabase
              .from('profiles')
              .update({ 
                is_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
          }
        }

        // Log the verification activity
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

  // Redirect to dashboard after successful verification
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
