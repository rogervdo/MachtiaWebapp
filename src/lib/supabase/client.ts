// Cliente de Supabase para operaciones del lado del navegador
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔧 Creating Supabase client with:', {
    url: url ? `${url.substring(0, 20)}...` : 'MISSING',
    key: key ? `${key.substring(0, 20)}...` : 'MISSING',
  })

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
    )
  }

  return createBrowserClient(url, key)
}
