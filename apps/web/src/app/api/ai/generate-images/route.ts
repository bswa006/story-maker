import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { checkSubscriptionLimits, createSubscriptionErrorResponse } from '@/lib/subscription-check';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Request validation schema
const GenerateImagesSchema = z.object({
  storyId: z.string(),
  childName: z.string(),
  childAge: z.string(),
  childPhotoUrl: z.string().optional(),
  childDescription: z.string().optional(),
  pages: z.array(z.object({
    pageNumber: z.number(),
    text: z.string(),
    imagePrompt: z.string(),
  })),
  artStyle: z.enum(['cartoon', 'watercolor', 'digital_art', 'illustration']).default('illustration'),
  testingMode: z.boolean().default(true),
});

// type GenerateImagesRequest = z.infer<typeof GenerateImagesSchema>; // Reserved for future use

// AI art style prompts for consistency
const ART_STYLES = {
  cartoon: "cute cartoon style, vibrant colors, child-friendly, Disney-Pixar inspired",
  watercolor: "soft watercolor painting style, gentle brushstrokes, pastel colors",
  digital_art: "digital illustration, clean lines, bright colors, modern children's book style",
  illustration: "children's book illustration style, warm colors, friendly and inviting",
};

// Generate character description from photo using GPT-4 Vision
async function analyzeChildPhoto(photoUrl: string, childName: string): Promise<string> {
  try {
    console.log('🔍 Analyzing child photo with GPT-4 Vision...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this photo of ${childName} and provide a detailed but child-appropriate description of their appearance for creating consistent character illustrations in a children's storybook. Focus on:
              
              1. Hair color and style
              2. Eye color and facial features
              3. Skin tone
              4. Any distinctive features (glasses, freckles, etc.)
              5. General build/height for age
              
              Format as a natural description that can be used in AI art prompts. Keep it positive and inclusive.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: photoUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const analysis = response.choices[0]?.message?.content || '';
    console.log('✅ Photo analysis complete');
    return analysis;

  } catch (error) {
    console.error('❌ Photo analysis failed:', error);
    return `a cheerful child named ${childName}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n\n⚠️ =====================================================');
    console.log('⚠️ OLD GENERATE-IMAGES API ROUTE CALLED');
    console.log('⚠️ This route does NOT support Studio Ghibli magic!');
    console.log('⚠️ Should be using /api/ai/generate-images-v2 instead');
    console.log('⚠️ =====================================================\n');
    
    // Check subscription limits (images are part of story generation)
    const subscriptionCheck = await checkSubscriptionLimits();
    if (!subscriptionCheck.allowed) {
      return createSubscriptionErrorResponse(subscriptionCheck);
    }

    const body = await request.json();
    const validatedData = GenerateImagesSchema.parse(body);

    console.log('🎨 Starting AI image generation (OLD ROUTE)...');
    console.log('Story ID:', validatedData.storyId);
    console.log('Art Style:', validatedData.artStyle);
    console.log('Testing mode:', validatedData.testingMode);
    console.log('Total pages:', validatedData.pages.length);
    console.log('Pages data:', JSON.stringify(validatedData.pages, null, 2));

    // Analyze child photo if provided
    let childDescription = validatedData.childDescription;
    if (validatedData.childPhotoUrl && !childDescription) {
      childDescription = await analyzeChildPhoto(validatedData.childPhotoUrl, validatedData.childName);
    }

    // Fallback description if no photo
    if (!childDescription) {
      childDescription = `a bright and curious child named ${validatedData.childName}`;
    }

    const artStylePrompt = ART_STYLES[validatedData.artStyle];
    const generatedImages = [];
    let totalCost = 0;

    // Determine how many images to generate (testing mode limits)
    const maxImages = validatedData.testingMode ? 2 : validatedData.pages.length;
    const pagesToGenerate = validatedData.pages.slice(0, maxImages);

    console.log(`📊 Generating ${pagesToGenerate.length}/${validatedData.pages.length} images (${validatedData.testingMode ? 'testing mode' : 'full mode'})`);

    // Generate images for each page
    for (let i = 0; i < pagesToGenerate.length; i++) {
      const page = pagesToGenerate[i];
      
      try {
        console.log(`🎨 Generating image ${i + 1}/${pagesToGenerate.length} for page ${page.pageNumber}...`);

        // Create enhanced prompt with consistent character description
        const enhancedPrompt = `High-quality children's book illustration: ${page.imagePrompt}

        CHARACTER CONSISTENCY (CRITICAL):
        Main character: ${childDescription}
        - EXACTLY the same facial features, skin tone, hair style in every image
        - Consistent character design throughout all illustrations
        - Same proportions and build
        
        ART STYLE REQUIREMENTS:
        - Professional children's book illustration quality
        - ${artStylePrompt}
        - Clean, polished artwork suitable for publication
        - Bright, engaging colors with good contrast
        - Simple, clear composition focused on the main scene
        - NO text, words, letters, or speech bubbles in the image
        - NO multiple versions of the same character in one image
        - Single clear scene showing one moment in the story
        
        TECHNICAL REQUIREMENTS:
        - High resolution, publication-quality artwork
        - Professional illustration standards
        - Age-appropriate for ${validatedData.childAge} year old children
        - Educational and inspiring content
        - Clean background without clutter
        
        STRICTLY AVOID:
        - Any text, words, or writing in the image
        - Multiple character copies or versions
        - Confusing or cluttered compositions
        - Dark, scary, or inappropriate themes
        - Poor quality or amateur-looking artwork
        - Speech bubbles, thought bubbles, or text overlays`;

        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard', // Use standard for cost optimization
          style: 'natural',
        });

        const imageUrl = imageResponse.data?.[0]?.url;
        if (!imageUrl) {
          throw new Error(`Failed to generate image for page ${page.pageNumber}`);
        }

        // DALL-E 3 pricing: $0.040 per image (standard quality)
        const imageCost = 0.040;
        totalCost += imageCost;

        generatedImages.push({
          pageNumber: page.pageNumber,
          imageUrl,
          prompt: enhancedPrompt,
          revisedPrompt: imageResponse.data?.[0]?.revised_prompt,
          cost: imageCost,
          generatedAt: new Date().toISOString(),
        });

        console.log(`✅ Image ${i + 1} generated successfully`);

        // Add delay between requests to avoid rate limits
        if (i < pagesToGenerate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Failed to generate image for page ${page.pageNumber}:`, error);
        
        // Create placeholder for failed image
        generatedImages.push({
          pageNumber: page.pageNumber,
          imageUrl: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          cost: 0,
        });
      }
    }

    // Add placeholders for remaining pages in testing mode
    if (validatedData.testingMode && validatedData.pages.length > maxImages) {
      for (let i = maxImages; i < validatedData.pages.length; i++) {
        const page = validatedData.pages[i];
        generatedImages.push({
          pageNumber: page.pageNumber,
          imageUrl: null,
          placeholder: true,
          note: 'Image generation skipped in testing mode to save costs',
          cost: 0,
        });
      }
    }

    console.log('✅ Image generation complete');
    console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);

    return NextResponse.json({
      success: true,
      storyId: validatedData.storyId,
      images: generatedImages,
      metadata: {
        totalImages: generatedImages.length,
        successfulImages: generatedImages.filter(img => img.imageUrl).length,
        failedImages: generatedImages.filter(img => img.error).length,
        placeholderImages: generatedImages.filter(img => img.placeholder).length,
        totalCost,
        testingMode: validatedData.testingMode,
        artStyle: validatedData.artStyle,
        childDescription,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Image generation failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Image generation failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for image generation status and pricing
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: {
        model: 'dall-e-3',
        supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
        supportedQualities: ['standard', 'hd'],
        supportedStyles: ['natural', 'vivid'],
        pricing: {
          standard: 0.040, // $0.040 per image
          hd: 0.080, // $0.080 per image
        },
        artStyles: Object.keys(ART_STYLES),
        testingMode: {
          enabled: true,
          maxImages: 2,
          description: 'Testing mode limits image generation to reduce costs during development',
        },
        features: [
          'GPT-4 Vision photo analysis',
          'Consistent character generation',
          'Multiple art styles',
          'Child-safe content filtering',
          'Cost optimization modes',
        ],
      },
    });

  } catch (error) {
    console.error('❌ Failed to get image generation config:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}