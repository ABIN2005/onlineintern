import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user role from database
  const { data: userData } = await supabase
    .from("users")
    .select("*, companies(*), students(*)")
    .eq("id", user.id)
    .single()

  return userData
}

export async function requireAuth(role?: string) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (role && user.role !== role) {
    redirect("/unauthorized")
  }

  return user
}

export async function requireCompanyAuth() {
  return requireAuth("company")
}

export async function requireStudentAuth() {
  return requireAuth("student")
}

export async function requireAdminAuth() {
  return requireAuth("super_admin")
}
