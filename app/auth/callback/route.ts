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
          .select('id')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || '',
            university: user.user_metadata.university || '',
            user_type: user.user_metadata.user_type || 'student',
            is_verified: true,
          })
        } else {
          // Update verification status
          await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', user.id)
        }
      }
    }
  }

  // Redirect to dashboard after successful verification
  return NextResponse.redirect(new URL('/dashboard', request.url))
}