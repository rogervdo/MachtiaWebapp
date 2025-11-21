// Smart text chunking service
// Ported from Swift MachtiaDesktop ChunkingService
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
    targetWords: 400, // Sweet spot: 300-500 words
    overlapSentences: 1, // 1 sentence overlap between chunks
  }

  /**
   * Chunks text into segments of 300-500 words with sentence boundary detection
   * and 1-sentence overlap between chunks
   */
  static chunkText(
    text: string,
    options: Partial<ChunkingOptions> = {}
  ): TextChunk[] {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }

    // Step 1: Normalize text (clean whitespace, preserve paragraphs)
    const normalizedText = this.normalizeText(text)

    // Step 2: Split into sentences
    const sentences = this.splitIntoSentences(normalizedText)

    // Step 3: Build chunks respecting sentence boundaries
    const chunks = this.buildChunks(sentences, opts)

    // Step 4: Add quality indicators
    return chunks.map((chunk, index) => ({
      ...chunk,
      position: index,
      quality: this.getChunkQuality(chunk.wordCount, opts),
    }))
  }

  /**
   * Normalizes text: cleans whitespace, preserves paragraphs
   */
  private static normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line breaks
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[ \t]+/g, ' ') // Normalize spaces/tabs
      .trim()
  }

  /**
   * Splits text into sentences (Spanish & English regex)
   * Handles common abbreviations to avoid false splits
   */
  private static splitIntoSentences(text: string): string[] {
    // Common abbreviations that shouldn't split sentences
    const protectedAbbreviations = [
      'Sr.', 'Sra.', 'Dr.', 'Dra.', 'Prof.', 'Profa.',
      'Mr.', 'Mrs.', 'Dr.', 'Prof.',
      'etc.', 'ej.', 'p.ej.', 'aprox.',
    ]

    let processedText = text

    // Temporarily replace abbreviations
    protectedAbbreviations.forEach((abbr, index) => {
      const placeholder = `__ABBR${index}__`
      processedText = processedText.replace(new RegExp(abbr.replace('.', '\\.'), 'g'), placeholder)
    })

    // Split on sentence boundaries: . ! ? followed by space and capital letter
    // or newline
    const sentenceRegex = /([.!?])\s+(?=[A-ZÁÉÍÓÚÑ])|([.!?])\n/g
    const segments = processedText.split(sentenceRegex).filter(Boolean)

    // Reconstruct sentences
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

    // Restore abbreviations
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
   * Builds chunks from sentences respecting word count targets and adding overlap
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

      // Check if adding this sentence would exceed max words
      if (
        currentWordCount + sentenceWordCount > options.maxWords &&
        currentChunk.length > 0
      ) {
        // Finalize current chunk
        const chunkText = currentChunk.join(' ')
        chunks.push({
          id: uuidv4(),
          text: chunkText,
          wordCount: currentWordCount,
          hasOverlap: previousOverlapSentences.length > 0,
        })

        // Save last N sentences for overlap with next chunk
        const overlapStart = Math.max(0, currentChunk.length - options.overlapSentences)
        previousOverlapSentences = currentChunk.slice(overlapStart)

        // Start new chunk with overlap
        currentChunk = [...previousOverlapSentences, sentence]
        currentWordCount = this.countWords(currentChunk.join(' '))
      } else {
        // Add sentence to current chunk
        currentChunk.push(sentence)
        currentWordCount += sentenceWordCount
      }
    }

    // Add final chunk
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
   * Counts words in a text string
   */
  static countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
  }

  /**
   * Determines chunk quality based on word count
   * - ideal: 300-500 words (green)
   * - short: <300 words (orange)
   * - long: >500 words (red)
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
   * Get statistics about chunks
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
