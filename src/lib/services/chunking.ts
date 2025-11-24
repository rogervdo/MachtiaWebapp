// Servicio inteligente de división de texto
// Portado desde ChunkingService de MachtiaDesktop en Swift
import type { TextChunk } from '@/types/database'
import { v4 as uuidv4 } from 'uuid'

export interface ChunkingOptions {
  minWords: number
  maxWords: number
  targetWords: number
  overlapSentences: number
}

export class ChunkingService {
  private static readonly DEFAULT_OPTIONS: ChunkingOptions = {
    minWords: 200,
    maxWords: 600,
    targetWords: 400, // Punto ideal: 300-500 palabras
    overlapSentences: 1, // Superposición de 1 oración entre fragmentos
  }

  /**
   * Divide el texto en segmentos de 300-500 palabras con detección de límites de oraciones
   * y superposición de 1 oración entre fragmentos
   */
  static chunkText(
    text: string,
    options: Partial<ChunkingOptions> = {}
  ): TextChunk[] {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }

    // Paso 1: Normalizar texto (limpiar espacios en blanco, preservar párrafos)
    const normalizedText = this.normalizeText(text)

    // Paso 2: Dividir en oraciones
    const sentences = this.splitIntoSentences(normalizedText)

    // Paso 3: Construir fragmentos respetando límites de oraciones
    const chunks = this.buildChunks(sentences, opts)

    // Paso 4: Agregar indicadores de calidad
    return chunks.map((chunk, index) => ({
      ...chunk,
      position: index,
      quality: this.getChunkQuality(chunk.wordCount, opts),
    }))
  }

  /**
   * Normaliza el texto: limpia espacios en blanco, preserva párrafos
   */
  private static normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalizar saltos de línea
      .replace(/\n{3,}/g, '\n\n') // Máximo 2 saltos de línea consecutivos
      .replace(/[ \t]+/g, ' ') // Normalizar espacios/tabulaciones
      .trim()
  }

  /**
   * Divide el texto en oraciones (regex para español e inglés)
   * Maneja abreviaturas comunes para evitar divisiones falsas
   */
  private static splitIntoSentences(text: string): string[] {
    // Abreviaturas comunes que no deberían dividir oraciones
    const protectedAbbreviations = [
      'Sr.', 'Sra.', 'Dr.', 'Dra.', 'Prof.', 'Profa.',
      'Mr.', 'Mrs.', 'Dr.', 'Prof.',
      'etc.', 'ej.', 'p.ej.', 'aprox.',
    ]

    let processedText = text

    // Reemplazar temporalmente las abreviaturas
    protectedAbbreviations.forEach((abbr, index) => {
      const placeholder = `__ABBR${index}__`
      processedText = processedText.replace(new RegExp(abbr.replace('.', '\\.'), 'g'), placeholder)
    })

    // Dividir en límites de oración: . ! ? seguido de espacio y letra mayúscula
    // o salto de línea
    const sentenceRegex = /([.!?])\s+(?=[A-ZÁÉÍÓÚÑ])|([.!?])\n/g
    const segments = processedText.split(sentenceRegex).filter(Boolean)

    // Reconstruir oraciones
    const sentences: string[] = []
    let currentSentence = ''

    for (const segment of segments) {
      if (segment.match(/^[.!?]$/)) {
        currentSentence += segment
      } else {
        if (currentSentence) {
          sentences.push(currentSentence.trim())
          currentSentence = ''
        }
        currentSentence += segment
      }
    }

    if (currentSentence) {
      sentences.push(currentSentence.trim())
    }

    // Restaurar abreviaturas
    return sentences.map(sentence => {
      let restored = sentence
      protectedAbbreviations.forEach((abbr, index) => {
        const placeholder = `__ABBR${index}__`
        restored = restored.replace(new RegExp(placeholder, 'g'), abbr)
      })
      return restored
    })
  }

  /**
   * Construye fragmentos a partir de oraciones respetando objetivos de conteo de palabras y agregando superposición
   */
  private static buildChunks(
    sentences: string[],
    options: ChunkingOptions
  ): Omit<TextChunk, 'position' | 'quality'>[] {
    const chunks: Omit<TextChunk, 'position' | 'quality'>[] = []
    let currentChunk: string[] = []
    let currentWordCount = 0
    let previousOverlapSentences: string[] = []

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const sentenceWordCount = this.countWords(sentence)

      // Verificar si agregar esta oración excedería el máximo de palabras
      if (
        currentWordCount + sentenceWordCount > options.maxWords &&
        currentChunk.length > 0
      ) {
        // Finalizar fragmento actual
        const chunkText = currentChunk.join(' ')
        chunks.push({
          id: uuidv4(),
          text: chunkText,
          wordCount: currentWordCount,
          hasOverlap: previousOverlapSentences.length > 0,
        })

        // Guardar las últimas N oraciones para superposición con el siguiente fragmento
        const overlapStart = Math.max(0, currentChunk.length - options.overlapSentences)
        previousOverlapSentences = currentChunk.slice(overlapStart)

        // Iniciar nuevo fragmento con superposición
        currentChunk = [...previousOverlapSentences, sentence]
        currentWordCount = this.countWords(currentChunk.join(' '))
      } else {
        // Agregar oración al fragmento actual
        currentChunk.push(sentence)
        currentWordCount += sentenceWordCount
      }
    }

    // Agregar fragmento final
    if (currentChunk.length > 0) {
      chunks.push({
        id: uuidv4(),
        text: currentChunk.join(' '),
        wordCount: currentWordCount,
        hasOverlap: previousOverlapSentences.length > 0,
      })
    }

    return chunks
  }

  /**
   * Cuenta las palabras en una cadena de texto
   */
  static countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
  }

  /**
   * Determina la calidad del fragmento basándose en el conteo de palabras
   * - ideal: 300-500 palabras (verde)
   * - corto: <300 palabras (naranja)
   * - largo: >500 palabras (rojo)
   */
  private static getChunkQuality(
    wordCount: number,
    options: ChunkingOptions
  ): 'ideal' | 'short' | 'long' {
    if (wordCount >= 300 && wordCount <= 500) {
      return 'ideal'
    } else if (wordCount < 300) {
      return 'short'
    } else {
      return 'long'
    }
  }

  /**
   * Obtiene estadísticas sobre los fragmentos
   */
  static getChunkStatistics(chunks: TextChunk[]) {
    const totalWords = chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0)
    const averageWords = chunks.length > 0 ? totalWords / chunks.length : 0

    const qualityCounts = {
      ideal: chunks.filter(c => c.quality === 'ideal').length,
      short: chunks.filter(c => c.quality === 'short').length,
      long: chunks.filter(c => c.quality === 'long').length,
    }

    return {
      totalChunks: chunks.length,
      totalWords,
      averageWords: Math.round(averageWords),
      qualityCounts,
      qualityPercentage: {
        ideal: chunks.length > 0 ? (qualityCounts.ideal / chunks.length) * 100 : 0,
        short: chunks.length > 0 ? (qualityCounts.short / chunks.length) * 100 : 0,
        long: chunks.length > 0 ? (qualityCounts.long / chunks.length) * 100 : 0,
      },
    }
  }
}
