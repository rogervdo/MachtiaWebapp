// API Routes for individual Module operations
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET single module with its lessons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idmodulo = parseInt(id)

    if (isNaN(idmodulo)) {
      return NextResponse.json(
        { success: false, error: 'ID de módulo inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get module
    const { data: modulo, error: moduloError } = await supabase
      .from('modulos')
      .select('*')
      .eq('idmodulo', idmodulo)
      .single()

    if (moduloError) throw moduloError

    // Get lessons with contenido
    const { data: lecciones, error: leccionesError } = await supabase
      .from('leccion')
      .select(`
        *,
        contenido:idleccion (*)
      `)
      .eq('idmodulo', idmodulo)
      .order('contenido(orden)', { ascending: true })

    if (leccionesError) throw leccionesError

    return NextResponse.json({
      success: true,
      data: {
        modulo,
        lecciones,
      },
    })
  } catch (error: any) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT update module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idmodulo = parseInt(id)

    if (isNaN(idmodulo)) {
      return NextResponse.json(
        { success: false, error: 'ID de módulo inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { titulo, descripcion } = body

    if (!titulo) {
      return NextResponse.json(
        { success: false, error: 'Título es requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('modulos')
      .update({
        titulo,
        descripcion,
      })
      .eq('idmodulo', idmodulo)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idmodulo = parseInt(id)

    if (isNaN(idmodulo)) {
      return NextResponse.json(
        { success: false, error: 'ID de módulo inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Note: This will cascade delete related lessons if foreign key is set up with ON DELETE CASCADE
    const { error } = await supabase
      .from('modulos')
      .delete()
      .eq('idmodulo', idmodulo)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
