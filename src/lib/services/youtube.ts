// Servicio de extracción de transcripciones de YouTube
import { YoutubeTranscript } from 'youtube-transcript'
import type { YouTubeTranscript as YouTubeTranscriptType } from '@/types/database'

interface TranscriptSegment {
  text: string
  duration: number
  offset: number
}

export class YouTubeService {
  private static readonly YOUTUBE_URL_PATTERNS = [
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  /**
   * Valida si una cadena es una URL válida de YouTube
   */
  static isValidYouTubeUrl(url: string): boolean {
    return this.YOUTUBE_URL_PATTERNS.some(pattern => pattern.test(url))
  }

  /**
   * Extrae el ID del video de una URL de YouTube
   */
  static extractVideoId(url: string): string | null {
    const match = url.match(this.YOUTUBE_URL_PATTERNS[0])
    return match ? match[4] : null
  }

  /**
   * Obtiene la transcripción de un video de YouTube
   * Prioriza subtítulos en español, recurre a autogenerados o inglés
   */
  static async getTranscript(url: string): Promise<YouTubeTranscriptType> {
    if (!this.isValidYouTubeUrl(url)) {
      throw new Error('URL de YouTube inválida')
    }

    const videoId = this.extractVideoId(url)
    if (!videoId) {
      throw new Error('No se pudo extraer el ID del video')
    }

    try {
      // Intentar obtener transcripción con preferencia de español
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'es',
      })

      // Combinar todos los segmentos en texto completo
      const fullTranscript = transcriptData
        .map((segment: TranscriptSegment) => segment.text)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalizar espacios en blanco
        .trim()

      // Calcular duración total
      const duration = transcriptData.length > 0
        ? Math.max(...transcriptData.map((s: TranscriptSegment) => s.offset + s.duration))
        : 0

      return {
        url,
        transcript: fullTranscript,
        duration: Math.round(duration),
        language: 'es',
      }
    } catch (error) {
      // Intentar con autogenerados o cualquier idioma disponible
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)

        const fullTranscript = transcriptData
          .map((segment: TranscriptSegment) => segment.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        const duration = transcriptData.length > 0
          ? Math.max(...transcriptData.map((s: TranscriptSegment) => s.offset + s.duration))
          : 0

        return {
          url,
          transcript: fullTranscript,
          duration: Math.round(duration),
          language: 'auto',
        }
      } catch (fallbackError) {
        throw new Error(
          'No se encontraron subtítulos para este video. ' +
          'Asegúrate de que el video tenga subtítulos disponibles.'
        )
      }
    }
  }

  /**
   * Obtiene metadatos sobre un video de YouTube (la extracción del título requeriría API adicional)
   * Por ahora, devuelve información básica
   */
  static getVideoInfo(url: string) {
    const videoId = this.extractVideoId(url)
    return {
      videoId,
      url,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
    }
  }
}
