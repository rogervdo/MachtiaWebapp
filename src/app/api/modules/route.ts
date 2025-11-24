// Rutas de API para operaciones CRUD de Módulos
import { createClient } from '@/lib/supabase/server';
import type { Modulo } from '@/types/database';
import { NextRequest, NextResponse } from 'next/server';

// GET obtener todos los módulos
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from('modulos').select('*').order('idmodulo', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// POST crear nuevo módulo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, descripcion } = body;

    if (!titulo) {
      return NextResponse.json({ success: false, error: 'Título es requerido' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('modulos')
      .insert({
        titulo,
        descripcion,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

