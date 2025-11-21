// Gemini API text cleaning service
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', // Basic stable model
      generationConfig: {
        temperature: 0.3, // Low temperature for consistent output
      },
    });
  }

  /**
   * Cleans text by adding punctuation, capitalization, and formatting
   * WITHOUT summarizing or changing word count significantly
   *
   * Based on Swift TextCleaningService logic
   */
  async cleanText(text: string): Promise<{
    cleanedText: string;
    originalWordCount: number;
    cleanedWordCount: number;
    processingTime: number;
  }> {
    const startTime = Date.now();
    const originalWordCount = this.countWords(text);

    const prompt = `Eres un asistente que mejora la calidad de transcripciones de YouTube en español.

Tu tarea es mejorar el texto agregando:
- Puntuación correcta (puntos, comas, signos de interrogación, etc.)
- Capitalización apropiada
- Saltos de párrafo donde sea necesario
- Corrección de errores ortográficos obvios

REGLAS IMPORTANTES:
1. NO resumas ni acortes el texto
2. NO agregues información nueva
3. NO cambies el significado original
4. Mantén aproximadamente el mismo número de palabras (±10%)
5. Solo mejora el formato y la legibilidad

Texto a mejorar:
${text}`;

    try {
      const result = await this.model.generateContent(prompt);
      const cleanedText = result.response.text();
      const cleanedWordCount = this.countWords(cleanedText);
      const processingTime = Date.now() - startTime;

      // Verify word count hasn't changed dramatically (within 15% tolerance)
      const wordCountRatio = cleanedWordCount / originalWordCount;
      if (wordCountRatio < 0.85 || wordCountRatio > 1.15) {
        console.warn(
          `Word count changed significantly: ${originalWordCount} → ${cleanedWordCount} ` +
            `(${Math.round((wordCountRatio - 1) * 100)}%)`
        );
      }

      return {
        cleanedText,
        originalWordCount,
        cleanedWordCount,
        processingTime,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al limpiar texto con Gemini: ${error.message}`);
      }
      throw new Error('Error desconocido al procesar el texto');
    }
  }

  /**
   * Counts words in a text string
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Test Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Responde solo con "OK"');
      const response = result.response.text();
      return response.toLowerCase().includes('ok');
    } catch {
      return false;
    }
  }
}

// Factory function to create service instance
export function createGeminiService() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
  }
  return new GeminiService(apiKey);
}

