// Ruta de API: Limpiar texto con Gemini
import { createGeminiService } from '@/lib/services/gemini';
import type { ApiResponse } from '@/types/database';
import { NextRequest, NextResponse } from 'next/server';

interface CleanTextResponse {
  cleanedText: string;
  originalWordCount: number;
  cleanedWordCount: number;
  processingTime: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Texto requerido',
        },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'El texto no puede estar vacío',
        },
        { status: 400 }
      );
    }

    // Crear servicio de Gemini
    const geminiService = createGeminiService();

    // Limpiar texto
    const result = await geminiService.cleanText(text);

    return NextResponse.json<ApiResponse<CleanTextResponse>>(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cleaning text:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al limpiar el texto con Gemini',
      },
      { status: 500 }
    );
  }
}

