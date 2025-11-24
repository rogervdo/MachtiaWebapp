// Database Types - Matching actual Supabase schema

// ============================================================================
// PUBLIC SCHEMA TABLES
// ============================================================================

export interface Usuario {
  id: string; // uuid (links to auth.users)
  nombre: string;
  apellidos: string;
  email: string; // unique
  fecha_nac: Date;
  rol: number;
  idgerente?: number;
  imagendir: string; // default 'default.jpg'
}

export interface IdRol {
  id: number;
  descripcion: string;
  tiporol: string;
}

export interface Accesibilidad {
  idUsuario: string; // uuid
  size?: number;
  voice?: boolean;
  color1?: boolean;
}

export interface Modulo {
  idmodulo: number;
  titulo: string;
  descripcion?: string;
}

export interface Contenido {
  idleccion: number; // PK
  titulo: string;
  descripcion?: string;
  tipo: 'lesson' | 'video' | 'document' | 'quiz';
  video_url?: string;
  orden: number; // default 0
  created_at?: Date;
  id: number; // GENERATED ALWAYS AS IDENTITY
}

export interface Leccion {
  id: number; // PK, GENERATED ALWAYS AS IDENTITY
  idleccion: number; // FK to contenido
  idmodulo?: number; // FK to modulos
}

export interface Parrafo {
  id: number; // bigint, GENERATED ALWAYS AS IDENTITY
  idLeccion: number; // FK to contenido
  texto?: string;
}

export interface Pregunta {
  idpregunta: number;
  idleccion?: number; // FK to contenido
  pregunta: string;
  tipopregunta?: string;
  respuesta1?: string;
  respuesta2?: string;
  respuesta3?: string;
  respuesta4?: string;
}

export interface LeccionUsuario {
  idusuario: string; // uuid
  idleccion: number;
  completado?: boolean; // default false
  fechacompletado?: Date;
}

export interface ProgresoUsuario {
  iduser: string; // uuid
  idmodulo: number;
  progreso?: string;
}

export interface Imagen {
  idimagen: number;
  idmodulo?: number;
  directorio?: string;
}

// ============================================================================
// APPLICATION-SPECIFIC TYPES
// ============================================================================

export interface TextChunk {
  id: string;
  text: string;
  wordCount: number;
  position: number;
  hasOverlap: boolean;
  quality: 'ideal' | 'short' | 'long';
}

export interface YouTubeTranscript {
  url: string;
  title?: string;
  duration?: number;
  transcript: string;
  language: string;
}

export interface ProcessedContent {
  originalText: string;
  cleanedText?: string;
  chunks: TextChunk[];
  metadata: {
    totalWords: number;
    totalChunks: number;
    processingTime?: number;
    [key: string]: any;
  };
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateLessonForm {
  title: string;
  description?: string;
  sourceType: 'youtube' | 'text';
  sourceContent: string; // URL or text content
  useTextCleaning: boolean;
  targetModule?: number;
}

export interface SaveLessonRequest {
  moduloId?: number; // If null, create new module
  moduloTitulo: string;
  moduloDescripcion?: string;
  contenidoTitulo: string;
  contenidoDescripcion?: string;
  contenidoTipo: 'lesson' | 'video' | 'document' | 'quiz';
  videoUrl?: string;
  chunks: Array<{ texto: string; position: number }>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface YouTubeExtractResponse {
  transcript: string;
  metadata: {
    title?: string;
    duration?: number;
    language: string;
  };
}

export interface ChunkingResponse {
  chunks: TextChunk[];
  metadata: {
    totalWords: number;
    totalChunks: number;
    averageWordsPerChunk: number;
  };
}

export interface SaveLessonResponse {
  moduloId: number;
  contenidoId: number;
  leccionId: number;
  parrafosCreated: number;
}

// ============================================================================
// EXTENDED TYPES FOR UI
// ============================================================================

export interface ModuloWithLecciones extends Modulo {
  lecciones?: LeccionWithContenido[];
}

export interface LeccionWithContenido extends Leccion {
  contenido?: Contenido;
}

export interface ContenidoWithDetails extends Contenido {
  parrafos?: Parrafo[];
  preguntas?: Pregunta[];
  totalWords?: number;
}

export interface CreateContenidoRequest {
  idmodulo: number;
  titulo: string;
  descripcion?: string;
  tipo: 'lesson' | 'video' | 'document' | 'quiz';
  video_url?: string;
  chunks?: Array<{ texto: string; position?: number }>;
}

export interface UpdateContenidoRequest {
  titulo?: string;
  descripcion?: string;
  tipo?: 'lesson' | 'video' | 'document' | 'quiz';
  video_url?: string;
  orden?: number;
}

export interface UpdateModuloRequest {
  titulo?: string;
  descripcion?: string;
}
