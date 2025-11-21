'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestGeminiPage() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listModels = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/test-gemini')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setModels(data.models)
      console.log('Available Gemini models:', data.models)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error listing models')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Gemini API - List Models</h1>

      <Button onClick={listModels} disabled={loading} className="mb-4">
        {loading ? 'Loading...' : 'List Available Models'}
      </Button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {models.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Models ({models.length}):</h2>
          <div className="space-y-2">
            {models.map((model, index) => (
              <div key={index} className="border rounded p-4 bg-white">
                <p className="font-mono text-sm text-blue-600">{model.name}</p>
                {model.displayName && (
                  <p className="text-sm text-neutral-600">{model.displayName}</p>
                )}
                {model.description && (
                  <p className="text-xs text-neutral-500 mt-1">{model.description}</p>
                )}
                {model.supportedGenerationMethods && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Methods: {model.supportedGenerationMethods.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-neutral-100 rounded text-sm">
        <p className="font-semibold mb-2">Common Model Names to Try:</p>
        <ul className="list-disc list-inside space-y-1 text-neutral-700">
          <li><code>gemini-pro</code></li>
          <li><code>gemini-1.5-pro</code></li>
          <li><code>gemini-1.5-pro-latest</code></li>
          <li><code>gemini-1.0-pro</code></li>
        </ul>
      </div>
    </div>
  )
}
