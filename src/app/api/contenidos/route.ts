// Rutas de API para operaciones CRUD de Contenido
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST crear nuevo contenido con párrafos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      idmodulo,
      titulo,
      descripcion,
      tipo,
      video_url,
      chunks,
    } = body

    if (!titulo || !tipo) {
      return NextResponse.json(
        { success: false, error: 'Título y tipo son requeridos' },
        { status: 400 }
      )
    }

    if (!idmodulo) {
      return NextResponse.json(
        { success: false, error: 'ID del módulo es requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Paso 1: Obtener el siguiente valor de orden para este módulo
    const { data: existingLecciones } = await supabase
      .from('leccion')
      .select('contenido:idleccion(orden)')
      .eq('idmodulo', idmodulo)
      .order('contenido(orden)', { ascending: false })
      .limit(1)

    let nextOrden = 0
    if (existingLecciones && existingLecciones.length > 0) {
      const firstLeccion = existingLecciones[0] as unknown as { contenido: { orden: number } | null }
      nextOrden = (firstLeccion.contenido?.orden || 0) + 1
    }

    // Paso 2: Crear entrada de contenido
    const { data: contenido, error: contenidoError } = await supabase
      .from('contenido')
      .insert({
        titulo,
        descripcion,
        tipo,
        video_url,
        orden: nextOrden,
      })
      .select()
      .single()

    if (contenidoError) throw contenidoError

    // Paso 3: Crear entrada de unión de lección
    const { data: leccion, error: leccionError } = await supabase
      .from('leccion')
      .insert({
        idleccion: contenido.idleccion,
        idmodulo,
      })
      .select()
      .single()

    if (leccionError) throw leccionError

    // Paso 4: Crear párrafos si se proporcionan fragmentos
    let parrafosCreated = 0
    if (chunks && chunks.length > 0) {
      const parrafosToCreate = chunks.map((chunk: { texto?: string; text?: string }) => ({
        idLeccion: contenido.idleccion,
        texto: chunk.texto || chunk.text || '',
      }))

      const { data: parrafos, error: parrafosError } = await supabase
        .from('parrafos')
        .insert(parrafosToCreate)
        .select()

      if (parrafosError) throw parrafosError
      parrafosCreated = parrafos.length
    }

    return NextResponse.json({
      success: true,
      data: {
        contenido,
        leccion,
        parrafosCreated,
      },
    })
  } catch (error) {
    console.error('Error creating contenido:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
