// Ruta de API: Extraer transcripción de YouTube
import { NextRequest, NextResponse } from 'next/server'
import { YouTubeService } from '@/lib/services/youtube'
import type { ApiResponse, YouTubeExtractResponse } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'URL de YouTube requerida',
        },
        { status: 400 }
      )
    }

    // Validar URL de YouTube
    if (!YouTubeService.isValidYouTubeUrl(url)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'URL de YouTube inválida. Usa: youtube.com/watch?v=..., youtu.be/..., o youtube.com/shorts/...',
        },
        { status: 400 }
      )
    }

    // Extraer transcripción
    const result = await YouTubeService.getTranscript(url)

    return NextResponse.json<ApiResponse<YouTubeExtractResponse>>(
      {
        success: true,
        data: {
          transcript: result.transcript,
          metadata: {
            title: result.title,
            duration: result.duration,
            language: result.language,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error extracting YouTube transcript:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al extraer transcripción de YouTube',
      },
      { status: 500 }
    )
  }
}
