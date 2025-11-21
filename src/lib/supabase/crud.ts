// CRUD operations for actual database schema
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
// USER OPERATIONS
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
// MODULE OPERATIONS
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

// ============================================================================
// CONTENIDO OPERATIONS
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

// ============================================================================
// LECCION OPERATIONS (Junction table)
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
// PARRAFO OPERATIONS (Text Chunks)
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

// ============================================================================
// PREGUNTA OPERATIONS
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
// COMPLETE LESSON CREATION WORKFLOW
// ============================================================================

/**
 * Creates a complete lesson structure:
 * 1. Create or use existing module
 * 2. Create contenido entry
 * 3. Create leccion junction entry
 * 4. Create parrafos (text chunks) in batch
 */
export async function saveCompleteLesson(
  request: SaveLessonRequest
): Promise<SaveLessonResponse> {
  const supabase = await createClient()

  try {
    // Step 1: Create or use existing module
    let moduloId = request.moduloId
    if (!moduloId) {
      const newModulo = await createModulo({
        titulo: request.moduloTitulo,
        descripcion: request.moduloDescripcion,
      })
      moduloId = newModulo.idmodulo
    }

    // Step 2: Get next orden value for this module
    const { data: existingLecciones } = await supabase
      .from('leccion')
      .select('contenido:idleccion(orden)')
      .eq('idmodulo', moduloId)
      .order('contenido(orden)', { ascending: false })
      .limit(1)

    const nextOrden = existingLecciones && existingLecciones.length > 0
      ? ((existingLecciones[0] as any).contenido?.orden || 0) + 1
      : 0

    // Step 3: Create contenido entry (idleccion will be auto-generated)
    const contenido = await createContenido({
      titulo: request.contenidoTitulo,
      descripcion: request.contenidoDescripcion,
      tipo: request.contenidoTipo,
      video_url: request.videoUrl,
      orden: nextOrden,
    })

    // Step 4: Create leccion junction entry
    const leccion = await createLeccion({
      idleccion: contenido.idleccion,
      idmodulo: moduloId,
    })

    // Step 5: Create parrafos (text chunks) in batch
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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets complete lesson data with all related tables
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
 * Gets all lessons for a module with their content
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
