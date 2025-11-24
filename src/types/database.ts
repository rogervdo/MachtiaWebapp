// Tipos de Base de Datos - Corresponden al esquema real de Supabase

// ============================================================================
// TABLAS DEL ESQUEMA PÚBLICO
// ============================================================================

export interface Usuario {
  id: string; // uuid (enlaza con auth.users)
  nombre: string;
  apellidos: string;
  email: string; // único
  fecha_nac: Date;
  rol: number;
  idgerente?: number;
  imagendir: string; // por defecto 'default.jpg'
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
  orden: number; // por defecto 0
  created_at?: Date;
  id: number; // GENERADO SIEMPRE COMO IDENTIDAD
}

export interface Leccion {
  id: number; // PK, GENERADO SIEMPRE COMO IDENTIDAD
  idleccion: number; // FK a contenido
  idmodulo?: number; // FK a modulos
}

export interface Parrafo {
  id: number; // bigint, GENERADO SIEMPRE COMO IDENTIDAD
  idLeccion: number; // FK a contenido
  texto?: string;
}

export interface Pregunta {
  idpregunta: number;
  idleccion?: number; // FK a contenido
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
  completado?: boolean; // por defecto false
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
// TIPOS ESPECÍFICOS DE LA APLICACIÓN
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
    duration?: number;
    language?: string;
    title?: string;
    averageWordsPerChunk?: number;
  };
}

// ============================================================================
// TIPOS DE FORMULARIOS
// ============================================================================

export interface CreateLessonForm {
  title: string;
  description?: string;
  sourceType: 'youtube' | 'text';
  sourceContent: string; // URL o contenido de texto
  useTextCleaning: boolean;
  targetModule?: number;
}

export interface SaveLessonRequest {
  moduloId?: number; // Si es null, crear nuevo módulo
  moduloTitulo: string;
  moduloDescripcion?: string;
  contenidoTitulo: string;
  contenidoDescripcion?: string;
  contenidoTipo: 'lesson' | 'video' | 'document' | 'quiz';
  videoUrl?: string;
  chunks: Array<{ texto: string; position: number }>;
}

// ============================================================================
// TIPOS DE RESPUESTA DE LA API
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
// TIPOS EXTENDIDOS PARA LA INTERFAZ DE USUARIO
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
