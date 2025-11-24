'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Crear cliente de Supabase una sola vez
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Verificar sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting signin for:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('📊 Signin response:', { data, error })

    if (error) {
      console.error('❌ Signin error:', error)
      throw error
    }

    console.log('✅ Signin successful')
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string) => {
    console.log('🔐 Attempting signup for:', email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log('📊 Signup response:', { data, error })

    if (error) {
      console.error('❌ Signup error:', error)
      throw error
    }

    console.log('✅ Signup successful:', data)
    router.push('/dashboard')
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
