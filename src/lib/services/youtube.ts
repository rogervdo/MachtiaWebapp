// YouTube transcript extraction service
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
   * Validates if a string is a valid YouTube URL
   */
  static isValidYouTubeUrl(url: string): boolean {
    return this.YOUTUBE_URL_PATTERNS.some(pattern => pattern.test(url))
  }

  /**
   * Extracts video ID from YouTube URL
   */
  static extractVideoId(url: string): string | null {
    const match = url.match(this.YOUTUBE_URL_PATTERNS[0])
    return match ? match[4] : null
  }

  /**
   * Fetches transcript from YouTube video
   * Prioritizes Spanish subtitles, falls back to auto-generated or English
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
      // Try to fetch transcript with Spanish preference
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'es',
      })

      // Combine all segments into full text
      const fullTranscript = transcriptData
        .map((segment: TranscriptSegment) => segment.text)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      // Calculate total duration
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
      // Try fallback to auto-generated or any available language
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
   * Gets metadata about a YouTube video (title extraction would require additional API)
   * For now, returns basic info
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
