import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Request validation schema
const AnalyzePhotoSchema = z.object({
  photoUrl: z.string().url(),
  childName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = AnalyzePhotoSchema.parse(body);

    console.log('🔍 Analyzing child photo with Claude 3.5 Sonnet...');
    
    // Fetch and convert image to base64
    const imageResponse = await fetch(validatedData.photoUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `I need to create a detailed character reference for a children's storybook character named ${validatedData.childName}. Please analyze this photo and provide specific visual details that will ensure the same character appears consistently across multiple illustrations.

Please describe:
1. Hair color, texture, length, and style
2. Facial features (eyes, eyebrows, nose, face shape)
3. Skin tone
4. Build and proportions for their age
5. Any distinctive features

Format as: "Character ${validatedData.childName} should consistently have..."

This will be used as a character sheet for illustrators to maintain visual consistency.`,
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    // Claude pricing: $3 per million input tokens, $15 per million output tokens
    const inputTokens = response.usage.input_tokens || 0;
    const outputTokens = response.usage.output_tokens || 0;
    const cost = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);

    console.log('✅ Claude photo analysis complete');

    return NextResponse.json({
      success: true,
      description: analysis,
      metadata: {
        childName: validatedData.childName,
        model: 'claude-3-5-sonnet-20241022',
        tokensUsed: inputTokens + outputTokens,
        estimatedCost: cost,
        analyzedAt: new Date().toISOString(),
        provider: 'anthropic',
      },
    });

  } catch (error) {
    console.error('❌ Claude photo analysis failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Photo analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: {
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
        maxImageSize: '5MB',
        pricing: {
          input: 3, // $3 per 1M tokens
          output: 15, // $15 per 1M tokens
        },
        features: [
          'Advanced visual analysis',
          'Detailed character descriptions',
          'High-quality reasoning',
          'Flexible content policies',
        ],
      },
    });

  } catch (error) {
    console.error('❌ Failed to get Claude config:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}