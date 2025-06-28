import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { checkSubscriptionLimits, createSubscriptionErrorResponse } from '@/lib/subscription-check';
import { SceneElements } from '@/services/scene-element-extractor';
import { enhancePromptWithMissingElements } from '@/services/scene-aware-prompts';
import { adaptPromptForArtStyle, validateStyleAdaptation } from '@/services/art-style-adapter';
import { validatePromptMatchesStory } from '@/services/prompt-validator';
import { ArtStyleId, getStyleParameters } from '@/services/art-styles-system';
import { StoryContinuityManager, detectStoryTheme, extractConsistentFeatures } from '@/services/story-continuity-system';
import { createAccurateStoryPrompt } from '@/services/story-image-sync-fix';
import { StoryUnderstandingSystem } from '@/services/story-understanding-system';
import { buildMultiCharacterScenePrompt, validateMultiCharacterPrompt } from '@/services/multi-character-scene-prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Request validation schema
const GenerateImagesV3Schema = z.object({
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
  artStyle: z.enum(['studio_ghibli', 'disney_pixar_3d', 'watercolor_illustration', 'chibi_kawaii', 'dreamworks_animation', 'classic_fairytale']).default('studio_ghibli'),
  testingMode: z.boolean().default(true),
  enhancedMode: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    console.log('\n\n🎨 =====================================================');
    console.log('🎨 GENERATE-IMAGES-V3 API ROUTE CALLED');
    console.log('🎨 Story-Aware Image Generation with Full Validation');
    console.log('🎨 =====================================================\n');
    
    // Check subscription limits
    const subscriptionCheck = await checkSubscriptionLimits();
    if (!subscriptionCheck.allowed) {
      return createSubscriptionErrorResponse(subscriptionCheck);
    }

    const body = await request.json();
    const validatedData = GenerateImagesV3Schema.parse(body);

    console.log('🎨 Starting Story-Aware Image Generation V3...');
    console.log('📊 Configuration:', {
      storyId: validatedData.storyId,
      testingMode: validatedData.testingMode,
      artStyle: validatedData.artStyle,
      totalPages: validatedData.pages.length,
      childName: validatedData.childName,
      childAge: validatedData.childAge,
      childPhotoUrl: validatedData.childPhotoUrl ? 'PROVIDED' : 'MISSING',
      childDescription: validatedData.childDescription || 'MISSING'
    });
    
    console.log('🚨 CRITICAL CHECK - Child Description:');
    console.log('   Raw description:', validatedData.childDescription);
    console.log('   Has photo URL:', !!validatedData.childPhotoUrl);
    console.log('   Pages received:', validatedData.pages.length);

    // Initialize character reference
    const characterDescription = validatedData.childDescription || 
      `${validatedData.childName}, a ${validatedData.childAge} year old child`;
    
    console.log('👤 CHARACTER SETUP:');
    console.log('   Final description:', characterDescription);
    
    const consistentFeatures = extractConsistentFeatures(characterDescription);
    console.log('   Extracted features:', consistentFeatures);
    
    const character = {
      name: validatedData.childName,
      age: validatedData.childAge,
      appearance: characterDescription,
      consistentFeatures: consistentFeatures
    };
    
    console.log('   Character object:', JSON.stringify(character, null, 2));

    // Initialize story understanding system
    console.log('\n🧠 INITIALIZING STORY UNDERSTANDING SYSTEM...');
    const storyUnderstanding = new StoryUnderstandingSystem();
    
    // Parse the full story to understand all characters and relationships
    storyUnderstanding.parseFullStory(validatedData.pages);
    
    // Initialize story continuity
    const storyTheme = detectStoryTheme('', validatedData.pages[0]?.text || '');
    const continuityManager = new StoryContinuityManager({
      storyId: validatedData.storyId,
      storyTheme: storyTheme,
      mainCharacter: {
        name: validatedData.childName,
        appearance: characterDescription,
        consistentFeatures: character.consistentFeatures,
        age: validatedData.childAge,
        personalityTraits: []
      },
      setting: {
        world: 'to be determined',
        timeOfDay: 'day',
        season: 'spring',
        locationDetails: [],
        atmosphere: 'warm and friendly'
      },
      visualStyle: {
        colorPalette: 'art style appropriate',
        lightingStyle: 'natural',
        moodTone: 'uplifting'
      },
      narrativeProgression: {
        currentPage: 1,
        totalPages: validatedData.pages.length,
        storyArc: []
      }
    });

    const generatedImages = [];
    let totalCost = 0;

    // Determine pages to generate
    const maxImages = validatedData.testingMode ? 2 : validatedData.pages.length;
    const pagesToGenerate = validatedData.pages.slice(0, maxImages);

    console.log(`📊 Generating ${pagesToGenerate.length}/${validatedData.pages.length} images`);

    // Generate images with scene awareness
    for (let i = 0; i < pagesToGenerate.length; i++) {
      const page = pagesToGenerate[i];
      
      try {
        console.log(`\n🎨 ==================== GENERATING IMAGE ${i + 1}/${pagesToGenerate.length} ====================`);
        console.log('📄 PAGE DATA:');
        console.log('   Page number:', page.pageNumber);
        console.log('   Story text:', page.text);
        console.log('   Original imagePrompt:', page.imagePrompt);
        
        // 1. Use Story Understanding System for scene comprehension
        console.log('\n🧠 UNDERSTANDING SCENE WITH STORY CONTEXT:');
        
        // Get all previous pages for context
        const previousPages = validatedData.pages.slice(0, i).map(p => ({ text: p.text }));
        const sceneContext = storyUnderstanding.understandPage(
          page.pageNumber,
          page.text,
          previousPages
        );
        
        // Build scene understanding for image generation
        const sceneComprehension = storyUnderstanding.buildSceneUnderstanding(
          page.pageNumber,
          page.text,
          page.imagePrompt
        );
        
        console.log('📍 Scene Understanding:');
        console.log('   Characters present:', sceneComprehension.requiredCharacters.map(c => c.name).join(', '));
        console.log('   Setting:', sceneComprehension.setting);
        console.log('   Positioning:', sceneComprehension.positioning);
        console.log('   Action:', sceneComprehension.action);
        console.log('   Mood:', sceneComprehension.mood);
        console.log('   Critical requirements:', sceneComprehension.criticalRequirements);
        
        // Convert to SceneElements format for compatibility
        const sceneElements: SceneElements = {
          setting: sceneComprehension.setting,
          specificLocation: sceneComprehension.setting,
          action: sceneComprehension.action,
          characters: sceneComprehension.requiredCharacters.map(c => c.name),
          mood: sceneComprehension.mood,
          keyObjects: sceneContext.interactions.map(i => i.action)
        };
        
        // 2. Build prompt based on scene complexity
        console.log('🔨 Building accurate story-synced prompt...');
        let finalPrompt: string;
        
        // Use multi-character prompt builder for scenes with multiple characters
        if (sceneComprehension.requiredCharacters.length > 1) {
          console.log('🎭 Using multi-character scene prompt builder...');
          finalPrompt = buildMultiCharacterScenePrompt({
            sceneContext: sceneContext,
            mainCharacter: character,
            storyId: validatedData.storyId,
            pageNumber: page.pageNumber,
            artStyle: validatedData.artStyle,
            storyText: page.text
          });
          
          // Validate all characters are included
          const charValidation = validateMultiCharacterPrompt(
            finalPrompt,
            sceneComprehension.requiredCharacters.map(c => c.name)
          );
          
          if (!charValidation.valid) {
            console.warn('⚠️ Missing characters in prompt:', charValidation.missingCharacters);
          }
        } else {
          // Use standard prompt builder for single character scenes
          finalPrompt = createAccurateStoryPrompt(
            page.text,
            character,
            sceneElements,
            validatedData.storyId,
            page.pageNumber
          );
        }
        
        // 3. Apply art style WITHOUT breaking story accuracy
        console.log('🎨 Applying art style:', validatedData.artStyle);
        const styledPrompt = adaptPromptForArtStyle(
          finalPrompt,
          validatedData.artStyle,
          sceneElements
        );
        
        // Make sure adaptation didn't break story elements
        const styleValidation = validateStyleAdaptation(finalPrompt, styledPrompt, sceneElements);
        if (styleValidation.valid) {
          finalPrompt = styledPrompt;
        } else {
          console.warn('⚠️ Style adaptation would break story, using original prompt');
        }
        
        // 4. Add extra character consistency for problematic styles
        if (validatedData.artStyle === 'chibi_kawaii' || validatedData.artStyle === 'disney_pixar_3d') {
          finalPrompt = `[CRITICAL: ${validatedData.childName} must look EXACTLY the same as in ALL other images] ` + finalPrompt;
        }
        
        // 5. Validate prompt before generation
        console.log('✅ Validating prompt matches story...');
        const validation = validatePromptMatchesStory(page.text, finalPrompt, sceneElements);
        console.log('📊 Validation Score:', validation.score);
        
        if (!validation.valid) {
          console.warn('⚠️ Prompt validation failed:', validation.errors);
          console.log('💡 Suggestions:', validation.suggestions);
          
          // Auto-fix critical issues
          if (validation.errors.length > 0) {
            finalPrompt = enhancePromptWithMissingElements(finalPrompt, validation.errors);
            console.log('🔧 Enhanced prompt with missing elements');
          }
        }
        
        // Log the actual prompt
        console.log('\n🎯 ========== DALL-E 3 API CALL ==========');
        console.log('📏 Prompt Length:', finalPrompt.length, 'characters');
        console.log('🎨 Art Style:', validatedData.artStyle);
        console.log('📄 Story Text:', page.text);
        console.log('\n🔍 FINAL DALL-E PROMPT:');
        console.log('----------------------------------------');
        console.log(finalPrompt);
        console.log('----------------------------------------\n');
        
        // 6. Generate image
        console.log('🚀 Calling OpenAI DALL-E 3 API...');
        const styleParams = getStyleParameters(validatedData.artStyle as ArtStyleId);
        
        const apiParams = {
          model: styleParams.model,
          prompt: finalPrompt,
          n: 1,
          size: styleParams.size as '1024x1024' | '1024x1792' | '1792x1024',
          quality: validatedData.testingMode ? 'standard' : 'hd' as 'standard' | 'hd',
          style: styleParams.style,
        };
        
        let imageResponse;
        try {
          imageResponse = await openai.images.generate(apiParams);
          console.log('✅ DALL-E Response received');
        } catch (dalleError) {
          console.error('❌ DALL-E API Error:', dalleError);
          const errorDetails = {
            message: dalleError instanceof Error ? dalleError.message : 'Unknown error',
            response: (dalleError as Record<string, unknown>)?.response?.data,
            status: (dalleError as Record<string, unknown>)?.response?.status,
          };
          console.error('Error details:', errorDetails);
          throw dalleError;
        }

        const imageUrl = imageResponse.data?.[0]?.url;
        if (!imageUrl) {
          console.error('❌ No image URL returned from DALL-E');
          throw new Error(`Failed to generate image for page ${page.pageNumber}`);
        }
        
        console.log('🖼️ Image URL generated successfully');

        // Calculate cost
        const imageCost = validatedData.testingMode ? 0.040 : 0.080;
        totalCost += imageCost;

        generatedImages.push({
          pageNumber: page.pageNumber,
          imageUrl,
          prompt: finalPrompt,
          sceneElements,
          validationScore: validation.score,
          revisedPrompt: imageResponse.data?.[0]?.revised_prompt,
          cost: imageCost,
          quality: validatedData.testingMode ? 'standard' : 'hd',
          generatedAt: new Date().toISOString(),
        });

        console.log(`✅ Image ${i + 1} generated successfully (Validation: ${validation.score}/100)`);
        
        // Update continuity manager
        continuityManager.updatePageContext(page.pageNumber, finalPrompt);

        // Delay between requests
        if (i < pagesToGenerate.length - 1) {
          const delay = validatedData.testingMode ? 1000 : 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        console.error(`❌ Failed to generate image for page ${page.pageNumber}:`, error);
        
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
          note: 'Image generation skipped in testing mode',
          cost: 0,
        });
      }
    }

    console.log('✅ Story-aware image generation complete');
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
        averageValidationScore: generatedImages
          .filter(img => img.validationScore)
          .reduce((sum, img) => sum + (img.validationScore || 0), 0) / 
          generatedImages.filter(img => img.validationScore).length || 0,
        totalCost,
        testingMode: validatedData.testingMode,
        artStyle: validatedData.artStyle,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Story-aware image generation failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Story-aware image generation failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for V3 capabilities
export async function GET() {
  return NextResponse.json({
    success: true,
    version: '3.0',
    features: [
      'Scene element extraction from story text',
      'Story-aware prompt generation',
      'Art style adaptation without losing story elements',
      'Pre-generation validation',
      'Automatic prompt enhancement for missing elements',
      'Character consistency across all styles',
      'Setting preservation (no more ocean→street mistakes)',
      'Validation scoring system'
    ],
    validationRules: [
      'Setting must match story text',
      'All mentioned characters must appear',
      'Actions must be represented',
      'Key objects must be included',
      'No contradictions allowed'
    ],
    supportedArtStyles: [
      'studio_ghibli',
      'disney_pixar_3d',
      'watercolor_illustration',
      'chibi_kawaii',
      'dreamworks_animation',
      'classic_fairytale'
    ]
  });
}