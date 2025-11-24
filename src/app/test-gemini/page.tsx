'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface GeminiTestResponse {
  success: boolean
  message?: string
  model?: string
  error?: string
}

export default function TestGeminiPage() {
  const [response, setResponse] = useState<GeminiTestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/test-gemini')
      const data: GeminiTestResponse = await res.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setResponse(data)
      console.log('Gemini API test result:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error testing connection')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Gemini API Connection</h1>

      <Button onClick={testConnection} disabled={loading} className="mb-4">
        {loading ? 'Testing...' : 'Test Gemini Connection'}
      </Button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {response && (
        <div className="space-y-4">
          <div className="border rounded p-4 bg-green-50 border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-2">✓ Connection Successful</h2>
            <p className="text-sm text-neutral-600">{response.message}</p>
            {response.model && (
              <p className="text-sm text-neutral-600 mt-2">
                Using model: <code className="font-mono text-blue-600">{response.model}</code>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-neutral-100 rounded text-sm">
        <p className="font-semibold mb-2">Current Model Configuration:</p>
        <ul className="list-disc list-inside space-y-1 text-neutral-700">
          <li>Text Cleaning: <code>gemini-2.0-flash</code></li>
          <li>Test Endpoint: <code>gemini-2.0-flash-exp</code></li>
        </ul>
      </div>
    </div>
  )
}
