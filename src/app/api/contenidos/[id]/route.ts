// API Routes for individual Contenido operations
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET single contenido with parrafos and preguntas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idleccion = parseInt(id)

    if (isNaN(idleccion)) {
      return NextResponse.json(
        { success: false, error: 'ID de contenido inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get contenido
    const { data: contenido, error: contenidoError } = await supabase
      .from('contenido')
      .select('*')
      .eq('idleccion', idleccion)
      .single()

    if (contenidoError) throw contenidoError

    // Get parrafos
    const { data: parrafos, error: parrafosError } = await supabase
      .from('parrafos')
      .select('*')
      .eq('idLeccion', idleccion)
      .order('id', { ascending: true })

    if (parrafosError) throw parrafosError

    // Get preguntas
    const { data: preguntas, error: preguntasError } = await supabase
      .from('pregunta')
      .select('*')
      .eq('idleccion', idleccion)

    if (preguntasError) throw preguntasError

    return NextResponse.json({
      success: true,
      data: {
        contenido,
        parrafos,
        preguntas,
      },
    })
  } catch (error: any) {
    console.error('Error fetching contenido:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT update contenido
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idleccion = parseInt(id)

    if (isNaN(idleccion)) {
      return NextResponse.json(
        { success: false, error: 'ID de contenido inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { titulo, descripcion, tipo, video_url, orden } = body

    if (!titulo || !tipo) {
      return NextResponse.json(
        { success: false, error: 'Título y tipo son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData: any = {
      titulo,
      descripcion,
      tipo,
      video_url,
    }

    if (orden !== undefined) {
      updateData.orden = orden
    }

    const { data, error } = await supabase
      .from('contenido')
      .update(updateData)
      .eq('idleccion', idleccion)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating contenido:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE contenido
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idleccion = parseInt(id)

    if (isNaN(idleccion)) {
      return NextResponse.json(
        { success: false, error: 'ID de contenido inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Delete contenido (cascades to parrafos, preguntas, and leccion junction)
    const { error } = await supabase
      .from('contenido')
      .delete()
      .eq('idleccion', idleccion)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting contenido:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
