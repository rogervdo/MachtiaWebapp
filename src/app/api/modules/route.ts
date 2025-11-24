// API Routes for Module CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Modulo } from '@/types/database'

// GET all modules
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('modulos')
      .select('*')
      .order('idmodulo', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST create new module
export async function POST(request: NextRequest) {
  try {
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
      .insert({
        titulo,
        descripcion,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
