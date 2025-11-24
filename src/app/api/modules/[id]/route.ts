// Rutas de API para operaciones de Módulos individuales
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET obtener un módulo individual con sus lecciones
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idmodulo = parseInt(id);

    if (isNaN(idmodulo)) {
      return NextResponse.json({ success: false, error: 'ID de módulo inválido' }, { status: 400 });
    }

    const supabase = await createClient();

    // Obtener módulo
    const { data: modulo, error: moduloError } = await supabase
      .from('modulos')
      .select('*')
      .eq('idmodulo', idmodulo)
      .single();

    if (moduloError) throw moduloError;

    // Obtener lecciones con contenido
    const { data: lecciones, error: leccionesError } = await supabase
      .from('leccion')
      .select(
        `
        *,
        contenido:idleccion (*)
      `
      )
      .eq('idmodulo', idmodulo)
      .order('contenido(orden)', { ascending: true });

    if (leccionesError) throw leccionesError;

    return NextResponse.json({
      success: true,
      data: {
        modulo,
        lecciones,
      },
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// PUT actualizar módulo
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idmodulo = parseInt(id);

    if (isNaN(idmodulo)) {
      return NextResponse.json({ success: false, error: 'ID de módulo inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { titulo, descripcion } = body;

    if (!titulo) {
      return NextResponse.json({ success: false, error: 'Título es requerido' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('modulos')
      .update({
        titulo,
        descripcion,
      })
      .eq('idmodulo', idmodulo)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// DELETE eliminar módulo
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idmodulo = parseInt(id);

    if (isNaN(idmodulo)) {
      return NextResponse.json({ success: false, error: 'ID de módulo inválido' }, { status: 400 });
    }

    const supabase = await createClient();

    // Nota: Esto eliminará en cascada las lecciones relacionadas si la clave foránea está configurada con ON DELETE CASCADE
    const { error } = await supabase.from('modulos').delete().eq('idmodulo', idmodulo);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

