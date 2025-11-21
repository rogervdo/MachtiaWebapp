// API Route: Test Gemini API and list available models
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY not configured',
        },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // List all available models
    const models = await genAI.listModels()

    // Filter to only models that support generateContent
    const contentGenerationModels = models.filter((model: any) =>
      model.supportedGenerationMethods?.includes('generateContent')
    )

    return NextResponse.json({
      success: true,
      models: contentGenerationModels.map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedGenerationMethods: model.supportedGenerationMethods,
      })),
      totalModels: models.length,
      contentGenerationModels: contentGenerationModels.length,
    })
  } catch (error) {
    console.error('Error listing Gemini models:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
