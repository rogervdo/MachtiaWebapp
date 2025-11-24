// Rutas de API para operaciones de Párrafos
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST crear nuevos párrafos (por lote)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idLeccion, parrafos } = body

    if (!idLeccion || !parrafos || !Array.isArray(parrafos)) {
      return NextResponse.json(
        { success: false, error: 'idLeccion y parrafos (array) son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const parrafosToCreate = parrafos.map((p: { texto?: string; text?: string }) => ({
      idLeccion,
      texto: p.texto || p.text || '',
    }))

    const { data, error } = await supabase
      .from('parrafos')
      .insert(parrafosToCreate)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error creating parrafos:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

// DELETE eliminar párrafo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del parrafo es requerido' },
        { status: 400 }
      )
    }

    const parrafoId = parseInt(id)
    if (isNaN(parrafoId)) {
      return NextResponse.json(
        { success: false, error: 'ID de parrafo inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('parrafos')
      .delete()
      .eq('id', parrafoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting parrafo:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
