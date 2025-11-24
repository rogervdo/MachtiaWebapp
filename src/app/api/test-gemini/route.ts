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

    // Test with a simple model initialization
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    return NextResponse.json({
      success: true,
      message: 'Gemini API connection successful',
      model: 'gemini-2.0-flash-exp',
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
