'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUserServer() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error }
  }

  return { user, error: null }
}

export async function getUserProfileServer(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    return { profile: null, error }
  }

  return { profile: data, error: null }
}

export async function checkAdminAccess() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.user_type !== "admin") {
    redirect("/")
  }

  return { user, profile }
}
