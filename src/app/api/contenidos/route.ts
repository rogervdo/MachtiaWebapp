// API Routes for Contenido CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST create new contenido with parrafos
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

    // Step 1: Get next orden value for this module
    const { data: existingLecciones } = await supabase
      .from('leccion')
      .select('contenido:idleccion(orden)')
      .eq('idmodulo', idmodulo)
      .order('contenido(orden)', { ascending: false })
      .limit(1)

    const nextOrden = existingLecciones && existingLecciones.length > 0
      ? ((existingLecciones[0] as any).contenido?.orden || 0) + 1
      : 0

    // Step 2: Create contenido entry
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

    // Step 3: Create leccion junction entry
    const { data: leccion, error: leccionError } = await supabase
      .from('leccion')
      .insert({
        idleccion: contenido.idleccion,
        idmodulo,
      })
      .select()
      .single()

    if (leccionError) throw leccionError

    // Step 4: Create parrafos if chunks provided
    let parrafosCreated = 0
    if (chunks && chunks.length > 0) {
      const parrafosToCreate = chunks.map((chunk: any) => ({
        idLeccion: contenido.idleccion,
        texto: chunk.texto || chunk.text,
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
  } catch (error: any) {
    console.error('Error creating contenido:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
