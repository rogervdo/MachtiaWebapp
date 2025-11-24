// Ruta de API: Dividir texto en segmentos
import { NextRequest, NextResponse } from 'next/server'
import { ChunkingService } from '@/lib/services/chunking'
import type { ApiResponse, ChunkingResponse } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, options } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Texto requerido',
        },
        { status: 400 }
      )
    }

    if (text.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'El texto no puede estar vacío',
        },
        { status: 400 }
      )
    }

    // Dividir texto con opciones personalizadas opcionales
    const chunks = ChunkingService.chunkText(text, options)

    // Obtener estadísticas
    const stats = ChunkingService.getChunkStatistics(chunks)

    return NextResponse.json<ApiResponse<ChunkingResponse>>(
      {
        success: true,
        data: {
          chunks,
          metadata: {
            totalWords: stats.totalWords,
            totalChunks: stats.totalChunks,
            averageWordsPerChunk: stats.averageWords,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error chunking text:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al dividir el texto en fragmentos',
      },
      { status: 500 }
    )
  }
}
