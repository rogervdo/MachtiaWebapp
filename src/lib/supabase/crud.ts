// Operaciones CRUD para el esquema real de la base de datos
import { createClient } from './server'
import type {
  Usuario,
  Modulo,
  Contenido,
  Leccion,
  Parrafo,
  Pregunta,
  SaveLessonRequest,
  SaveLessonResponse,
} from '@/types/database'

// ============================================================================
// OPERACIONES DE USUARIO
// ============================================================================

export async function getUser(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as Usuario
}

// ============================================================================
// OPERACIONES DE MÓDULO
// ============================================================================

export async function getModulos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modulos')
    .select('*')
    .order('idmodulo', { ascending: true })

  if (error) throw error
  return data as Modulo[]
}

export async function getModulo(idmodulo: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modulos')
    .select('*')
    .eq('idmodulo', idmodulo)
    .single()

  if (error) throw error
  return data as Modulo
}

export async function createModulo(modulo: Omit<Modulo, 'idmodulo'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modulos')
    .insert(modulo)
    .select()
    .single()

  if (error) throw error
  return data as Modulo
}

export async function updateModulo(idmodulo: number, updates: Partial<Omit<Modulo, 'idmodulo'>>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modulos')
    .update(updates)
    .eq('idmodulo', idmodulo)
    .select()
    .single()

  if (error) throw error
  return data as Modulo
}

export async function deleteModulo(idmodulo: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('modulos')
    .delete()
    .eq('idmodulo', idmodulo)

  if (error) throw error
}

// ============================================================================
// OPERACIONES DE CONTENIDO
// ============================================================================

export async function getContenido(idleccion: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .eq('idleccion', idleccion)
    .single()

  if (error) throw error
  return data as Contenido
}

export async function createContenido(contenido: Omit<Contenido, 'id' | 'idleccion' | 'created_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contenido')
    .insert(contenido)
    .select()
    .single()

  if (error) throw error
  return data as Contenido
}

export async function updateContenido(idleccion: number, updates: Partial<Omit<Contenido, 'id' | 'idleccion' | 'created_at'>>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contenido')
    .update(updates)
    .eq('idleccion', idleccion)
    .select()
    .single()

  if (error) throw error
  return data as Contenido
}

export async function deleteContenido(idleccion: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contenido')
    .delete()
    .eq('idleccion', idleccion)

  if (error) throw error
}

// ============================================================================
// OPERACIONES DE LECCIÓN (Tabla de unión)
// ============================================================================

export async function getLeccionesByModulo(idmodulo: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leccion')
    .select(`
      *,
      contenido:idleccion (*)
    `)
    .eq('idmodulo', idmodulo)

  if (error) throw error
  return data
}

export async function createLeccion(leccion: Omit<Leccion, 'id'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leccion')
    .insert(leccion)
    .select()
    .single()

  if (error) throw error
  return data as Leccion
}

// ============================================================================
// OPERACIONES DE PÁRRAFO (Fragmentos de Texto)
// ============================================================================

export async function getParrafosByLeccion(idLeccion: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parrafos')
    .select('*')
    .eq('idLeccion', idLeccion)
    .order('id', { ascending: true })

  if (error) throw error
  return data as Parrafo[]
}

export async function createParrafo(parrafo: Omit<Parrafo, 'id'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parrafos')
    .insert(parrafo)
    .select()
    .single()

  if (error) throw error
  return data as Parrafo
}

export async function createParrafosBatch(parrafos: Omit<Parrafo, 'id'>[]) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parrafos')
    .insert(parrafos)
    .select()

  if (error) throw error
  return data as Parrafo[]
}

export async function updateParrafo(id: number, texto: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parrafos')
    .update({ texto })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Parrafo
}

export async function deleteParrafo(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('parrafos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// OPERACIONES DE PREGUNTA
// ============================================================================

export async function getPreguntasByLeccion(idleccion: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pregunta')
    .select('*')
    .eq('idleccion', idleccion)

  if (error) throw error
  return data as Pregunta[]
}

export async function createPregunta(pregunta: Omit<Pregunta, 'idpregunta'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pregunta')
    .insert(pregunta)
    .select()
    .single()

  if (error) throw error
  return data as Pregunta
}

// ============================================================================
// FLUJO COMPLETO DE CREACIÓN DE LECCIÓN
// ============================================================================

/**
 * Crea una estructura completa de lección:
 * 1. Crear o usar módulo existente
 * 2. Crear entrada de contenido
 * 3. Crear entrada de unión de lección
 * 4. Crear párrafos (fragmentos de texto) por lote
 */
export async function saveCompleteLesson(
  request: SaveLessonRequest
): Promise<SaveLessonResponse> {
  const supabase = await createClient()

  try {
    // Paso 1: Crear o usar módulo existente
    let moduloId = request.moduloId
    if (!moduloId) {
      const newModulo = await createModulo({
        titulo: request.moduloTitulo,
        descripcion: request.moduloDescripcion,
      })
      moduloId = newModulo.idmodulo
    }

    // Paso 2: Obtener el siguiente valor de orden para este módulo
    const { data: existingLecciones } = await supabase
      .from('leccion')
      .select('contenido:idleccion(orden)')
      .eq('idmodulo', moduloId)
      .order('contenido(orden)', { ascending: false })
      .limit(1)

    let nextOrden = 0
    if (existingLecciones && existingLecciones.length > 0) {
      const firstLeccion = existingLecciones[0] as unknown as { contenido: { orden: number } | null }
      nextOrden = (firstLeccion.contenido?.orden || 0) + 1
    }

    // Paso 3: Crear entrada de contenido (idleccion se generará automáticamente)
    const contenido = await createContenido({
      titulo: request.contenidoTitulo,
      descripcion: request.contenidoDescripcion,
      tipo: request.contenidoTipo,
      video_url: request.videoUrl,
      orden: nextOrden,
    })

    // Paso 4: Crear entrada de unión de lección
    const leccion = await createLeccion({
      idleccion: contenido.idleccion,
      idmodulo: moduloId,
    })

    // Paso 5: Crear párrafos (fragmentos de texto) por lote
    const parrafosToCreate = request.chunks.map((chunk) => ({
      idLeccion: contenido.idleccion,
      texto: chunk.texto,
    }))

    const parrafos = await createParrafosBatch(parrafosToCreate)

    return {
      moduloId,
      contenidoId: contenido.idleccion,
      leccionId: leccion.id,
      parrafosCreated: parrafos.length,
    }
  } catch (error) {
    console.error('Error saving complete lesson:', error)
    throw error
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene datos completos de lección con todas las tablas relacionadas
 */
export async function getCompleteLessonData(idleccion: number) {
  const supabase = await createClient()

  const [contenido, parrafos, preguntas] = await Promise.all([
    getContenido(idleccion),
    getParrafosByLeccion(idleccion),
    getPreguntasByLeccion(idleccion),
  ])

  return {
    contenido,
    parrafos,
    preguntas,
  }
}

/**
 * Obtiene todas las lecciones de un módulo con su contenido
 */
export async function getModuleWithLessons(idmodulo: number) {
  const [modulo, lecciones] = await Promise.all([
    getModulo(idmodulo),
    getLeccionesByModulo(idmodulo),
  ])

  return {
    modulo,
    lecciones,
  }
}
