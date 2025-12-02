"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, auth } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ user?: User; error?: string }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = auth.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await auth.signIn(email, password)
    if (result.user) {
      setUser(result.user)
    }
    return result
  }

  const signUp = async (email: string, password: string, name: string) => {
    const result = await auth.signUp(email, password, name)
    if (result.user) {
      setUser(result.user)
    }
    return result
  }

  const signOut = async () => {
    await auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
