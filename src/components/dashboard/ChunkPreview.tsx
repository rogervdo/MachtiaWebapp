'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TextChunk } from '@/types/database'
import { cn } from '@/lib/utils'

interface ChunkPreviewProps {
  chunks: TextChunk[]
}

export function ChunkPreview({ chunks }: ChunkPreviewProps) {
  const [selectedChunk, setSelectedChunk] = useState<TextChunk | null>(chunks[0] || null)

  const getQualityColor = (quality: 'ideal' | 'short' | 'long') => {
    switch (quality) {
      case 'ideal':
        return 'bg-green-100 border-green-300 text-green-900'
      case 'short':
        return 'bg-orange-100 border-orange-300 text-orange-900'
      case 'long':
        return 'bg-red-100 border-red-300 text-red-900'
    }
  }

  const getQualityLabel = (quality: 'ideal' | 'short' | 'long') => {
    switch (quality) {
      case 'ideal':
        return 'Ideal'
      case 'short':
        return 'Corto'
      case 'long':
        return 'Largo'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Vista Previa de Fragmentos ({chunks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Lista de Fragmentos */}
          <div className="space-y-2 lg:col-span-1">
            <div className="max-h-[600px] space-y-2 overflow-y-auto rounded-md border p-2">
              {chunks.map((chunk, index) => (
                <button
                  key={chunk.id}
                  onClick={() => setSelectedChunk(chunk)}
                  className={cn(
                    'w-full rounded-md border-2 p-3 text-left transition-all',
                    getQualityColor(chunk.quality),
                    selectedChunk?.id === chunk.id && 'ring-2 ring-blue-500'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Fragmento {index + 1}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {chunk.wordCount} palabras
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className="text-xs">
                      {getQualityLabel(chunk.quality)}
                    </Badge>
                    {chunk.hasOverlap && (
                      <Badge variant="secondary" className="text-xs">
                        Con superposición
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Leyenda de Calidad */}
            <div className="space-y-1 rounded-md border bg-neutral-50 p-3 text-sm">
              <p className="font-medium">Calidad:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs text-neutral-600">
                    Ideal (300-500 palabras)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-xs text-neutral-600">
                    Corto (&lt;300 palabras)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs text-neutral-600">
                    Largo (&gt;500 palabras)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle del Fragmento Seleccionado */}
          <div className="lg:col-span-2">
            {selectedChunk ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Fragmento {selectedChunk.position + 1} de {chunks.length}
                  </h3>
                  <div className="flex gap-2">
                    <Badge className={cn(
                      getQualityColor(selectedChunk.quality).split(' ')[0],
                      'border'
                    )}>
                      {selectedChunk.wordCount} palabras
                    </Badge>
                    <Badge variant="outline">
                      {getQualityLabel(selectedChunk.quality)}
                    </Badge>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto rounded-md border bg-white p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                    {selectedChunk.text}
                  </p>
                </div>

                {selectedChunk.hasOverlap && (
                  <p className="text-xs text-neutral-600">
                    ℹ️ Este fragmento tiene superposición con el fragmento anterior
                    para mantener continuidad semántica.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border bg-neutral-50">
                <p className="text-neutral-600">Selecciona un fragmento para ver su contenido</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
