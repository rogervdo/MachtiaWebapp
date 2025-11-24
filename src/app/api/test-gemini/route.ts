// Ruta de API: Probar API de Gemini y listar modelos disponibles
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY not configured',
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Probar con una inicialización simple del modelo
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    return NextResponse.json({
      success: true,
      message: 'Gemini API connection successful',
      model: 'gemini-2.0-flash-exp',
    });
  } catch (error) {
    console.error('Error listing Gemini models:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

