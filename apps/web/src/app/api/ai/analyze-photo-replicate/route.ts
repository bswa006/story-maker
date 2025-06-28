import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { z } from 'zod';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
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

    let response;
    
    try {
      console.log('🔍 Analyzing child photo with Replicate LLaVA...');
      
      // Using LLaVA model on Replicate (good for image analysis)
      const output = await replicate.run(
        "yorickvp/llava-13b:b5f6212d032508382d61ff00469ddda3e32fd8a0e75dc39d8a4191bb742157fb",
        {
          input: {
            image: validatedData.photoUrl,
            prompt: `Create a detailed character description for a children's storybook illustration based on this photo. The character will be named ${validatedData.childName}.

Please provide specific visual details that will ensure consistent character representation across multiple illustrations:

1. HAIR: Exact color, texture (curly/straight/wavy), length, and style
2. FACIAL FEATURES: Eye color and shape, eyebrow style, nose shape, face shape  
3. SKIN TONE: Specific description for consistent coloring
4. BUILD: Age-appropriate height and build
5. DISTINCTIVE FEATURES: Any unique characteristics that make them recognizable

Format your response as: "Character ${validatedData.childName} should consistently be depicted with..."

Focus on creating a character reference that an illustrator could use to maintain consistency across all story illustrations. Be specific and detailed about physical appearance.`,
            max_tokens: 500,
            temperature: 0.1
          }
        }
      );

      const analysis = Array.isArray(output) ? output.join('') : String(output || '');
      
      // Replicate pricing is usually around $0.0023 per request for LLaVA
      const estimatedCost = 0.0023;

      console.log('✅ Replicate LLaVA analysis complete');

      response = {
        success: true,
        description: analysis,
        metadata: {
          childName: validatedData.childName,
          model: 'llava-13b',
          estimatedCost,
          analyzedAt: new Date().toISOString(),
          provider: 'replicate',
        },
      };
    } catch (primaryError) {
      console.error('❌ Replicate photo analysis failed:', primaryError);

      // Try alternative Replicate model if LLaVA fails
      console.log('🔄 Trying alternative Replicate model...');
      
      const fallbackOutput = await replicate.run(
        "daanelson/minigpt-4:b96a2f33cc8e4b0aa23eacfce731b9c41a7d9466d9ed4e167375587b54db9423",
        {
          input: {
            image: validatedData.photoUrl,
            prompt: `Describe this child's appearance in detail for creating a consistent character in children's book illustrations. Focus on hair, facial features, skin tone, and distinctive characteristics. The character's name is ${validatedData.childName}.`,
            num_beams: 5,
            temperature: 0.1,
            max_length: 300
          }
        }
      );

      const fallbackAnalysis = Array.isArray(fallbackOutput) ? fallbackOutput.join('') : String(fallbackOutput || '');

      response = {
        success: true,
        description: `Character ${validatedData.childName} should consistently be depicted with: ${fallbackAnalysis}`,
        metadata: {
          childName: validatedData.childName,
          model: 'minigpt-4',
          estimatedCost: 0.0023,
          analyzedAt: new Date().toISOString(),
          provider: 'replicate-fallback',
        },
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ All photo analysis attempts failed:', error);

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
        models: [
          {
            name: 'llava-13b',
            provider: 'replicate',
            description: 'Primary vision model for detailed analysis'
          },
          {
            name: 'minigpt-4', 
            provider: 'replicate',
            description: 'Fallback vision model'
          }
        ],
        supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
        maxImageSize: '10MB',
        pricing: {
          perRequest: 0.0023, // ~$0.0023 per request
        },
        features: [
          'Open source vision models',
          'Less restrictive content policies',
          'Good image understanding',
          'Multiple model fallbacks',
        ],
      },
    });

  } catch (error) {
    console.error('❌ Failed to get Replicate config:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}