'use client'

import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const testConnection = async () => {
    try {
      console.log('🧪 Testing Supabase connection...')

      const supabase = createClient()
      console.log('✅ Supabase client created successfully')

      // Probar una consulta simple
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ Error getting session:', error)
        alert(`Error: ${error.message}`)
        return
      }

      console.log('✅ Successfully connected to Supabase!')
      console.log('Session:', data)
      alert('✅ Supabase connection successful! Check console for details.')
    } catch (error) {
      console.error('❌ Test failed:', error)
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>

      <div className="space-y-2 rounded-lg border p-4 text-sm">
        <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MISSING'}</p>
        <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ MISSING'}</p>
      </div>

      <button
        onClick={testConnection}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Test Connection
      </button>

      <p className="text-sm text-neutral-600">
        Open browser console (F12) to see detailed logs
      </p>
    </div>
  )
}
