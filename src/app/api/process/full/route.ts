// API Route: Full processing pipeline
// YouTube → Extract → Clean (optional) → Chunk → Ready for DB
import { NextRequest, NextResponse } from 'next/server'
import { YouTubeService } from '@/lib/services/youtube'
import { createGeminiService } from '@/lib/services/gemini'
import { ChunkingService } from '@/lib/services/chunking'
import type { ApiResponse, ProcessedContent } from '@/types/database'

interface FullProcessRequest {
  sourceType: 'youtube' | 'text'
  sourceContent: string // URL or text content
  useTextCleaning: boolean
  title?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FullProcessRequest = await request.json()
    const { sourceType, sourceContent, useTextCleaning, title } = body

    if (!sourceContent || typeof sourceContent !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Contenido requerido',
        },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    let originalText = ''
    let metadata: any = {}

    // Step 1: Get text content
    if (sourceType === 'youtube') {
      const transcriptResult = await YouTubeService.getTranscript(sourceContent)
      originalText = transcriptResult.transcript
      metadata = {
        url: sourceContent,
        duration: transcriptResult.duration,
        language: transcriptResult.language,
      }
    } else {
      originalText = sourceContent
    }

    // Step 2: Optional text cleaning with Gemini
    let cleanedText: string | undefined
    let cleaningMetadata = {}

    if (useTextCleaning) {
      const geminiService = createGeminiService()
      const cleanResult = await geminiService.cleanText(originalText)
      cleanedText = cleanResult.cleanedText
      cleaningMetadata = {
        originalWordCount: cleanResult.originalWordCount,
        cleanedWordCount: cleanResult.cleanedWordCount,
        cleaningTime: cleanResult.processingTime,
      }
    }

    // Step 3: Chunk the text (use cleaned if available, otherwise original)
    const textToChunk = cleanedText || originalText
    const chunks = ChunkingService.chunkText(textToChunk)
    const chunkStats = ChunkingService.getChunkStatistics(chunks)

    const processingTime = Date.now() - startTime

    const result: ProcessedContent = {
      originalText,
      cleanedText,
      chunks,
      metadata: {
        totalWords: chunkStats.totalWords,
        totalChunks: chunkStats.totalChunks,
        processingTime,
        ...metadata,
        ...cleaningMetadata,
      },
    }

    return NextResponse.json<ApiResponse<ProcessedContent>>(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in full processing pipeline:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar el contenido',
      },
      { status: 500 }
    )
  }
}
