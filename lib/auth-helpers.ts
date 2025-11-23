import { createClient } from "@/lib/supabase/client"

export async function signUpStudent(
  email: string,
  password: string,
  fullName: string,
  university: string,
  userType: "student" | "admin" | "vendor" = "student",
) {
  const supabase = createClient()

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          university,
          user_type: userType,
        },
      },
    })

    if (authError) throw authError

    // Note: We don't create profile here because user needs email confirmation first
    // Profile will be created via trigger or on first login

    return { data: authData, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export async function getCurrentUser() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return { profile: data, error: null }
  } catch (error) {
    return { profile: null, error }
  }
}
