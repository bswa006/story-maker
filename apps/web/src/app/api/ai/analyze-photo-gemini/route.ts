import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Request validation schema
const AnalyzePhotoSchema = z.object({
  photoUrl: z.string().url(),
  childName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = AnalyzePhotoSchema.parse(body);

    console.log('🔍 Analyzing child photo with Gemini Pro Vision...');
    
    // Convert image URL to base64 for Gemini
    const imageResponse = await fetch(validatedData.photoUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Create a detailed character description for a children's storybook illustration based on this photo. The character will be named ${validatedData.childName}. 

Please provide specific visual details that will ensure consistent character representation across multiple illustrations:

1. HAIR: Exact color, texture (curly/straight/wavy), length, and style
2. FACIAL FEATURES: Eye color and shape, eyebrow style, nose shape, face shape
3. SKIN TONE: Specific description for consistent coloring
4. BUILD: Age-appropriate height and build
5. DISTINCTIVE FEATURES: Any unique characteristics

Format your response as: "Character ${validatedData.childName} should always be depicted with..."

Focus on creating a character reference that an illustrator could use to maintain consistency across all story illustrations.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const analysis = result.response.text() || '';
    
    // Estimate cost (Gemini Pro is much cheaper than GPT-4o Vision)
    const estimatedCost = 0.001; // Rough estimate

    console.log('✅ Gemini photo analysis complete');

    return NextResponse.json({
      success: true,
      description: analysis,
      metadata: {
        childName: validatedData.childName,
        model: 'gemini-1.5-pro',
        estimatedCost,
        analyzedAt: new Date().toISOString(),
        provider: 'google-gemini',
      },
    });

  } catch (error) {
    console.error('❌ Gemini photo analysis failed:', error);

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
        model: 'gemini-1.5-pro',
        provider: 'google-gemini',
        supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
        maxImageSize: '4MB',
        pricing: {
          perImage: 0.001, // Much cheaper than OpenAI
        },
        features: [
          'Character appearance analysis',
          'Detailed visual descriptions',
          'Consistent character references',
          'Less restrictive content policies',
        ],
      },
    });

  } catch (error) {
    console.error('❌ Failed to get Gemini config:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}