// API Route: List all lessons from database
import { NextRequest, NextResponse } from 'next/server'
import { getModulos, getLeccionesByModulo } from '@/lib/supabase/crud'
import type { ApiResponse } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    // Get all modules
    const modulos = await getModulos()

    // Get lessons for each module
    const modulosWithLessons = await Promise.all(
      modulos.map(async (modulo) => {
        const lecciones = await getLeccionesByModulo(modulo.idmodulo)
        return {
          ...modulo,
          lecciones,
        }
      })
    )

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: modulosWithLessons,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error listing lessons:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener las lecciones',
      },
      { status: 500 }
    )
  }
}
