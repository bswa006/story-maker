import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    console.log('🔍 Analyzing child photo with GPT-4 Vision...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `I need to create a CONSISTENT fictional character description for children's storybook illustrations. Please describe the visual appearance in this photo with SPECIFIC details that will ensure the same character appears in every illustration. Focus on:

              1. HAIR: Exact color, texture (curly/straight/wavy), length, and style
              2. FACIAL FEATURES: Eye color, eye shape, eyebrow style, nose shape, face shape
              3. SKIN TONE: Specific description for consistent coloring
              4. BUILD: Height/build appropriate for age, any distinctive proportions
              5. DISTINCTIVE FEATURES: Any unique characteristics that make this character recognizable

              IMPORTANT: Provide a detailed character sheet description that an illustrator could use to draw the EXACT SAME character in multiple scenes. The character will be named ${validatedData.childName}. Be specific enough that the character would be immediately recognizable across different illustrations and clothing changes.

              Format as a character reference that emphasizes consistency: "Character ${validatedData.childName} should always have..."`,
            },
            {
              type: 'image_url',
              image_url: {
                url: validatedData.photoUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const analysis = response.choices[0]?.message?.content || '';
    
    // Calculate costs
    const promptTokens = response.usage?.prompt_tokens || 0;
    const completionTokens = response.usage?.completion_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;
    
    // GPT-4o pricing: $0.005 per 1K prompt tokens, $0.015 per 1K completion tokens
    const cost = (promptTokens * 0.005 / 1000) + (completionTokens * 0.015 / 1000);

    console.log('✅ Photo analysis complete');
    console.log('📊 Usage:', { promptTokens, completionTokens, totalTokens, cost: `$${cost.toFixed(4)}` });

    return NextResponse.json({
      success: true,
      description: analysis,
      metadata: {
        childName: validatedData.childName,
        tokensUsed: totalTokens,
        estimatedCost: cost,
        model: 'gpt-4o',
        analyzedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Photo analysis failed:', error);

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

// GET endpoint for photo analysis capabilities
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: {
        model: 'gpt-4o',
        maxTokens: 300,
        supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
        maxImageSize: '20MB',
        pricing: {
          prompt: 0.005, // $0.005 per 1K tokens
          completion: 0.015, // $0.015 per 1K tokens
        },
        features: [
          'Child appearance analysis',
          'Character consistency descriptions',
          'Age-appropriate language',
          'Positive and inclusive descriptions',
        ],
      },
    });

  } catch (error) {
    console.error('❌ Failed to get photo analysis config:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}