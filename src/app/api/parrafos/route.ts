// API Routes for Parrafo operations
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST create new parrafos (batch)
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

    const parrafosToCreate = parrafos.map((p: any) => ({
      idLeccion,
      texto: p.texto || p.text,
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
  } catch (error: any) {
    console.error('Error creating parrafos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE parrafo
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
  } catch (error: any) {
    console.error('Error deleting parrafo:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
