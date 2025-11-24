// Ruta de API: Guardar lección procesada en la base de datos
import { saveCompleteLesson } from '@/lib/supabase/crud';
import type { ApiResponse, SaveLessonRequest, SaveLessonResponse } from '@/types/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body: SaveLessonRequest = await request.json();

    // Validar campos requeridos
    if (!body.moduloTitulo || !body.contenidoTitulo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Título del módulo y contenido son requeridos',
        },
        { status: 400 }
      );
    }

    if (!body.chunks || body.chunks.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Se requiere al menos un fragmento de texto',
        },
        { status: 400 }
      );
    }

    // Guardar estructura completa de la lección
    const result = await saveCompleteLesson(body);

    return NextResponse.json<ApiResponse<SaveLessonResponse>>(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving lesson:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al guardar la lección en la base de datos',
      },
      { status: 500 }
    );
  }
}

