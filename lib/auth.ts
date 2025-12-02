"use client"

export type UserRole = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

// Mock users storage (in production, this would be a database)
const STORAGE_KEY = "app_users"
const SESSION_KEY = "current_user"

// Default admin user (email: admin@app.com, password: admin123)
const DEFAULT_ADMIN: User = {
  id: "1",
  email: "admin@app.com",
  name: "Admin User",
  role: "admin",
  createdAt: new Date().toISOString(),
}

// Initialize default admin
if (typeof window !== "undefined") {
  const users = localStorage.getItem(STORAGE_KEY)
  if (!users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...DEFAULT_ADMIN, password: "admin123" }]))
  }
}

export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, name: string): Promise<{ user?: User; error?: string }> => {
    if (typeof window === "undefined") return { error: "Client only" }

    const usersData = localStorage.getItem(STORAGE_KEY)
    const users = usersData ? JSON.parse(usersData) : []

    // Check if user exists
    if (users.find((u: any) => u.email === email)) {
      return { error: "User already exists" }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: "user",
      createdAt: new Date().toISOString(),
    }

    users.push({ ...newUser, password })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))

    return { user: newUser }
  },

  // Sign in
  signIn: async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
    if (typeof window === "undefined") return { error: "Client only" }

    const usersData = localStorage.getItem(STORAGE_KEY)
    const users = usersData ? JSON.parse(usersData) : []

    const userWithPassword = users.find((u: any) => u.email === email && u.password === password)

    if (!userWithPassword) {
      return { error: "Invalid credentials" }
    }

    const { password: _, ...user } = userWithPassword
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))

    return { user }
  },

  // Sign out
  signOut: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY)
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null

    const userData = localStorage.getItem(SESSION_KEY)
    return userData ? JSON.parse(userData) : null
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    const user = auth.getCurrentUser()
    return user?.role === "admin"
  },
}
