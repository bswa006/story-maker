import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { checkSubscriptionLimits, createSubscriptionErrorResponse } from '@/lib/subscription-check';
import { 
  characterCache, 
  CharacterReference
} from '@/services/enhanced-image-generation';
import { analyzePhotoWithVerification } from '@/services/enhanced-photo-analysis';
import { aiCache } from '@/services/ai-cache';
import { promptOptimizer } from '@/services/prompt-versioning';
import { qualityScorer } from '@/services/quality-scoring';
import { validatePromptLength } from '@/services/dalle-optimized-prompts';
import { createMagicalGhibliPrompt, createEmotionalGhibliPrompt, enhanceSceneWithMagic, MAGICAL_SCENE_PROMPTS } from '@/services/magical-ghibli-prompts';
import { ArtStyleId, createStyledPrompt, getStyleParameters } from '@/services/art-styles-system';
import { STYLE_SCENE_ENHANCERS, STYLE_ANIMAL_SCENES } from '@/services/art-style-scene-enhancers';
import { StoryContinuityManager, detectStoryTheme, extractConsistentFeatures } from '@/services/story-continuity-system';
import { generateContinuityEnhancedPrompt, createConsistentCharacterReference } from '@/services/continuity-enhanced-prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Request validation schema
const GenerateImagesV2Schema = z.object({
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
  promptVersion: z.string().default('v3_ultra_quality'),
  enhancedMode: z.boolean().default(true),
});

// Enhanced art style configurations
const ENHANCED_ART_STYLES = {
  cartoon: {
    base: "Pixar/Disney 3D animation style, ultra-high quality rendering",
    lighting: "bright, colorful with soft shadows",
    details: "smooth surfaces, appealing character design, expressive features"
  },
  watercolor: {
    base: "traditional watercolor masterpiece, gallery-quality artwork",
    lighting: "soft, diffused natural light",
    details: "visible brush strokes, color bleeds, paper texture, artistic imperfections"
  },
  digital_art: {
    base: "premium digital illustration, ArtStation trending quality",
    lighting: "dynamic lighting with rim lights and ambient occlusion",
    details: "crisp lines, gradient shading, perfect color theory"
  },
  illustration: {
    base: "award-winning children&apos;s book illustration, Caldecott Medal quality",
    lighting: "warm, inviting with soft highlights",
    details: "hand-crafted feel, rich textures, timeless appeal"
  },
  studio_ghibli: {
    base: "authentic Studio Ghibli style by Hayao Miyazaki",
    lighting: "magical hour lighting with ethereal glow",
    details: "hand-painted backgrounds, flowing hair animation, dreamy atmosphere"
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('\n\n🎨 =====================================================');
    console.log('🎨 GENERATE-IMAGES-V2 API ROUTE CALLED');
    console.log('🎨 =====================================================\n');
    
    // Check subscription limits
    const subscriptionCheck = await checkSubscriptionLimits();
    if (!subscriptionCheck.allowed) {
      return createSubscriptionErrorResponse(subscriptionCheck);
    }

    const body = await request.json();
    const validatedData = GenerateImagesV2Schema.parse(body);

    console.log('🎨 Starting Enhanced AI Image Generation V2...');
    console.log('📊 Configuration:', {
      storyId: validatedData.storyId,
      testingMode: validatedData.testingMode,
      enhancedMode: validatedData.enhancedMode,
      promptVersion: validatedData.promptVersion,
      artStyle: validatedData.artStyle,
      totalPages: validatedData.pages.length
    });
    
    console.log('📄 First page prompt preview:', validatedData.pages[0]?.imagePrompt);

    // Get or create character reference with caching
    let characterRef: CharacterReference | undefined = characterCache.get(validatedData.storyId);
    
    if (!characterRef && validatedData.childPhotoUrl) {
      // Check cache first
      const cachedAnalysis = await aiCache.getCachedCharacterAnalysis(
        validatedData.childPhotoUrl,
        validatedData.childName
      );
      
      if (cachedAnalysis) {
        console.log('✅ Using cached character analysis');
        characterRef = cachedAnalysis;
      } else {
        console.log('🔬 Creating new ultra-detailed character reference...');
        
        const analysis = await analyzePhotoWithVerification(
          validatedData.childPhotoUrl,
          validatedData.childName
        );
        
        characterRef = analysis.characterReference;
        
        // Cache the analysis
        await aiCache.cacheCharacterAnalysis(
          validatedData.childPhotoUrl,
          validatedData.childName,
          characterRef
        );
        
        console.log('✅ Character reference created with confidence:', analysis.confidence);
        console.log('📝 Verification notes:', analysis.verificationNotes);
      }
      
      characterCache.set(validatedData.storyId, characterRef);
    }
    
    // Fallback if no photo provided
    if (!characterRef) {
      console.warn('⚠️ No character reference available, using description fallback');
      // This would ideally parse the description into a CharacterReference
      // For now, we'll use the enhanced prompt system with the description
    }

    const generatedImages = [];
    let totalCost = 0;

    // Initialize story continuity manager
    const storyTheme = detectStoryTheme('', validatedData.pages[0]?.text || '');
    const characterDescription = validatedData.childDescription || 
      (characterRef ? `${characterRef.age} year old with ${characterRef.hair.color} hair and ${characterRef.eyes.color} eyes` : 
       `${validatedData.childName}, a ${validatedData.childAge} year old child`);
    
    const consistentFeatures = extractConsistentFeatures(characterDescription);
    
    const continuityManager = new StoryContinuityManager({
      storyId: validatedData.storyId,
      storyTheme: storyTheme,
      mainCharacter: {
        name: validatedData.childName,
        appearance: characterDescription,
        consistentFeatures: consistentFeatures,
        age: validatedData.childAge,
        personalityTraits: []
      },
      setting: {
        world: storyTheme === 'fantasy' ? 'magical kingdom' : 'modern neighborhood',
        timeOfDay: 'day',
        season: 'spring',
        locationDetails: [],
        atmosphere: storyTheme === 'fantasy' ? 'magical and wondrous' : 'warm and friendly'
      },
      visualStyle: {
        colorPalette: 'consistent throughout story',
        lightingStyle: 'natural and warm',
        moodTone: 'uplifting'
      },
      narrativeProgression: {
        currentPage: 1,
        totalPages: validatedData.pages.length,
        storyArc: []
      }
    });
    
    console.log('🎭 Story Continuity Initialized:', {
      theme: storyTheme,
      character: validatedData.childName,
      features: consistentFeatures,
      totalPages: validatedData.pages.length
    });

    // Determine pages to generate
    const maxImages = validatedData.testingMode ? 2 : validatedData.pages.length;
    const pagesToGenerate = validatedData.pages.slice(0, maxImages);

    console.log(`📊 Generating ${pagesToGenerate.length}/${validatedData.pages.length} images`);

    // Generate images with enhanced prompts
    for (let i = 0; i < pagesToGenerate.length; i++) {
      const page = pagesToGenerate[i];
      
      try {
        console.log(`\n🎨 ==================== GENERATING IMAGE ${i + 1}/${pagesToGenerate.length} ====================`);
        console.log('📝 Page details:', {
          pageNumber: page.pageNumber,
          imagePrompt: page.imagePrompt,
          pageText: page.text,
          artStyle: validatedData.artStyle,
          enhancedMode: validatedData.enhancedMode,
          hasCharacterRef: !!characterRef,
          testingMode: validatedData.testingMode
        });
        
        // Log the ORIGINAL scene to ensure we're not losing it
        console.log('🎬 ORIGINAL SCENE from story:', page.imagePrompt);
        console.log('📝 ORIGINAL TEXT from story:', page.text);

        let enhancedPrompt: string = '';
        let promptMetadata: Record<string, unknown> = {};

        if (validatedData.enhancedMode && characterRef) {
          console.log(`🔧 Using enhanced mode with character reference for page ${page.pageNumber}`);
          
          // Check cache first
          const cachedImage = await aiCache.getCachedImageGeneration(
            characterRef,
            page.imagePrompt,
            validatedData.artStyle,
            validatedData.promptVersion
          );
          
          if (cachedImage && cachedImage.imageUrl) {
            console.log('✅ Using cached image generation');
            generatedImages.push({
              pageNumber: page.pageNumber,
              imageUrl: cachedImage.imageUrl,
              prompt: cachedImage.prompt,
              promptMetadata: cachedImage.metadata,
              cached: true,
              cost: 0,
              quality: 'cached',
              enhancedMode: true,
              generatedAt: cachedImage.cachedAt,
            });
            continue;
          }
          
          // Use the new art styles system
          const artStyleId = validatedData.artStyle as ArtStyleId;
          const simpleAppearance = `${characterRef.age} year old ${characterRef.name} with ${characterRef.hair.color} hair and ${characterRef.eyes.color} eyes`;
          
          console.log('🎨 Using Art Style:', artStyleId);
          
          // Extract animal from scene if present
          const animalMatch = page.imagePrompt.toLowerCase().match(/(bird|lion|turtle|monkey|ant|butterfly|dog|fish)/);
          const animal = animalMatch ? animalMatch[1] : '';
          console.log('🦁 Animal detected:', animal || 'none');
          
          // Check if we should use special Studio Ghibli magical prompts
          if (artStyleId === 'studio_ghibli') {
            console.log('🌟 Using MAGICAL GHIBLI PROMPTS with character reference');
            // Keep the existing magical Ghibli logic for maximum quality
            if (animal) {
              console.log('✨ Creating EMOTIONAL GHIBLI prompt with animal companion');
              enhancedPrompt = createEmotionalGhibliPrompt(
                characterRef.name,
                simpleAppearance,
                animal,
                page.text || '',
                page.pageNumber,
                page.imagePrompt // Pass original scene to preserve story context
              );
            } else {
              console.log('🎭 Creating MAGICAL SCENE prompt');
              const magicalScene = enhanceSceneWithMagic(page.imagePrompt);
              enhancedPrompt = createMagicalGhibliPrompt(
                simpleAppearance,
                magicalScene,
                page.pageNumber
              );
            }
          } else {
            console.log('🎯 Using ART STYLES SYSTEM for:', artStyleId);
            // Use the new art styles system for other styles
            let enhancedScene = page.imagePrompt;
            
            // Apply style-specific scene enhancements while PRESERVING original content
            const sceneEnhancers = STYLE_SCENE_ENHANCERS[artStyleId];
            if (sceneEnhancers) {
              const sceneLower = page.imagePrompt.toLowerCase();
              // Use the enhancers which already preserve the original scene
              if (sceneLower.includes('forest') || sceneLower.includes('tree')) {
                enhancedScene = sceneEnhancers.forest(page.imagePrompt);
              } else if (sceneLower.includes('sky') || sceneLower.includes('fly')) {
                enhancedScene = sceneEnhancers.sky(page.imagePrompt);
              } else if (sceneLower.includes('water') || sceneLower.includes('ocean')) {
                enhancedScene = sceneEnhancers.water(page.imagePrompt);
              } else {
                enhancedScene = sceneEnhancers.meadow(page.imagePrompt);
              }
              console.log('🌈 Enhanced scene (preserving original):', enhancedScene.substring(0, 100) + '...');
            }
            
            // Check for animal-specific scenes but PRESERVE original context
            if (animal && STYLE_ANIMAL_SCENES[artStyleId]?.[animal]) {
              // Instead of replacing, merge the style elements with original scene
              const styleElements = STYLE_ANIMAL_SCENES[artStyleId][animal];
              // Extract style-specific enhancements without losing original content
              enhancedScene = `${page.imagePrompt}. Style: ${styleElements.replace('Child', simpleAppearance)}`;
              console.log('🐾 Merging animal-specific style with original scene');
            }
            
            // Create the styled prompt
            enhancedPrompt = createStyledPrompt(
              artStyleId,
              simpleAppearance,
              enhancedScene,
              true // Include magical elements
            );
          }
          
          promptMetadata = {
            method: artStyleId === 'studio_ghibli' ? 'magical_ghibli' : 'art_styles_system',
            style: artStyleId,
            characterRef: true,
            hasAnimal: !!animal
          };
          
          console.log('🎨 PROMPT CREATED:', {
            style: artStyleId,
            length: enhancedPrompt.length,
            preview: enhancedPrompt.substring(0, 200) + '...'
          });
        } else {
          // Fallback when no character reference is available
          const artStyleId = validatedData.artStyle as ArtStyleId;
          const childDesc = validatedData.childDescription || `${validatedData.childName}, a ${validatedData.childAge} year old child`;
          
          console.log('🎨 Using Art Style (no character ref):', artStyleId);
          console.log('👤 Child description:', childDesc);
          
          // Extract animal from scene if present
          const animalMatch = page.imagePrompt.toLowerCase().match(/(bird|lion|turtle|monkey|ant|butterfly|dog|fish)/);
          const animal = animalMatch ? animalMatch[1] : '';
          console.log('🦁 Animal detected:', animal || 'none');
          
          // Special handling for Studio Ghibli style
          if (artStyleId === 'studio_ghibli') {
            console.log('🌟 Using MAGICAL GHIBLI PROMPTS without character reference');
            
            // Check for special scenes (intro/conclusion)
            if (page.pageNumber === 1 && page.imagePrompt.toLowerCase().includes('hello')) {
              console.log('🎬 Using INTRODUCTION magical scene');
              enhancedPrompt = MAGICAL_SCENE_PROMPTS.introduction.replace('A child', `${childDesc}`);
            } else if (page.pageNumber === validatedData.pages.length && page.imagePrompt.toLowerCase().includes('learned')) {
              console.log('🎭 Using CONCLUSION magical scene');
              enhancedPrompt = MAGICAL_SCENE_PROMPTS.conclusion.replace('A child', `${childDesc}`);
            } else if (animal && MAGICAL_SCENE_PROMPTS[animal]) {
              console.log(`🐾 Enhancing original scene with magical elements for ${animal}`);
              // Don't replace the original scene, enhance it
              enhancedPrompt = createMagicalGhibliPrompt(
                childDesc,
                page.imagePrompt, // Use the original scene
                page.pageNumber
              );
            } else {
              console.log('✨ Creating custom magical scene');
              const magicalScene = enhanceSceneWithMagic(page.imagePrompt);
              enhancedPrompt = createMagicalGhibliPrompt(
                childDesc,
                magicalScene,
                page.pageNumber
              );
            }
          } else {
            console.log('🎯 Using ART STYLES SYSTEM for:', artStyleId);
            // Use the new art styles system for all other styles
            let enhancedScene = page.imagePrompt;
            
            // Apply style-specific scene enhancements while PRESERVING original content
            const sceneEnhancers = STYLE_SCENE_ENHANCERS[artStyleId];
            if (sceneEnhancers) {
              const sceneLower = page.imagePrompt.toLowerCase();
              // Use the enhancers which already preserve the original scene
              if (sceneLower.includes('forest') || sceneLower.includes('tree')) {
                enhancedScene = sceneEnhancers.forest(page.imagePrompt);
              } else if (sceneLower.includes('sky') || sceneLower.includes('fly')) {
                enhancedScene = sceneEnhancers.sky(page.imagePrompt);
              } else if (sceneLower.includes('water') || sceneLower.includes('ocean')) {
                enhancedScene = sceneEnhancers.water(page.imagePrompt);
              } else {
                enhancedScene = sceneEnhancers.meadow(page.imagePrompt);
              }
              console.log('🌈 Enhanced scene (preserving original):', enhancedScene.substring(0, 100) + '...');
            }
            
            // Check for animal-specific scenes but PRESERVE original context
            if (animal && STYLE_ANIMAL_SCENES[artStyleId]?.[animal]) {
              // Instead of replacing, merge the style elements with original scene
              const styleElements = STYLE_ANIMAL_SCENES[artStyleId][animal];
              // Extract style-specific enhancements without losing original content
              enhancedScene = `${page.imagePrompt}. Style: ${styleElements.replace('Child', childDesc)}`;
              console.log('🐾 Merging animal-specific style with original scene');
            }
            
            // Create the styled prompt
            enhancedPrompt = createStyledPrompt(
              artStyleId,
              childDesc,
              enhancedScene,
              true // Include magical elements
            );
          }
          
          promptMetadata = {
            method: artStyleId === 'studio_ghibli' ? 'magical_ghibli' : 'art_styles_system',
            style: artStyleId,
            hasAnimal: !!animal,
            characterRef: false
          };
          
          console.log('🎨 PROMPT CREATED:', {
            style: artStyleId,
            length: enhancedPrompt.length,
            preview: enhancedPrompt.substring(0, 200) + '...'
          });
        }
        
        // Apply story continuity enhancement
        console.log('🔗 Applying story continuity...');
        const pageRequirements = continuityManager.generatePageRequirements(page.pageNumber, page.text);
        
        // Create continuity-enhanced prompt
        const continuityEnhancedPrompt = generateContinuityEnhancedPrompt({
          storyContext: continuityManager.getContext(),
          artStyle: validatedData.artStyle as ArtStyleId,
          pageNumber: page.pageNumber,
          totalPages: validatedData.pages.length,
          basePrompt: enhancedPrompt,
          characterDescription: createConsistentCharacterReference(
            validatedData.childName,
            characterDescription,
            validatedData.childAge
          ),
          previousPagePrompt: i > 0 ? pagesToGenerate[i - 1].imagePrompt : undefined,
          isFirstPage: page.pageNumber === 1,
          isLastPage: page.pageNumber === validatedData.pages.length
        });
        
        // Add character consistency seed for kawaii and other stylized art
        if (validatedData.artStyle === 'chibi_kawaii' || validatedData.artStyle === 'disney_pixar_3d') {
          const characterSeed = `Character Reference ${validatedData.storyId}-${validatedData.childName}: `;
          enhancedPrompt = characterSeed + continuityEnhancedPrompt;
        } else {
          enhancedPrompt = continuityEnhancedPrompt;
        }
        
        promptMetadata.continuityEnhanced = true;
        promptMetadata.storyTheme = storyTheme;
        
        console.log('✅ Continuity enhancement applied');
        console.log('📊 Continuity features:', {
          theme: storyTheme,
          consistentFeatures: consistentFeatures.length,
          pageContext: pageRequirements.mustMaintain.length
        });
        
        // Validate prompt length
        const validation = validatePromptLength(enhancedPrompt);
        if (!validation.valid) {
          console.warn(`⚠️ Prompt too long (${validation.length} chars), using truncated version`);
          enhancedPrompt = validation.recommended;
        }

        // Log the actual prompt being used
        console.log('\n🎯 ========== DALL-E 3 API CALL ==========');
        console.log('📊 Prompt Metadata:', promptMetadata);
        console.log('🎨 Art Style:', validatedData.artStyle);
        console.log('📏 Prompt Length:', enhancedPrompt.length, 'characters');
        console.log('🔧 Quality Mode:', validatedData.testingMode ? 'standard' : 'hd');
        console.log('📄 ORIGINAL Story Prompt:', page.imagePrompt);
        console.log('📝 ORIGINAL Story Text:', page.text?.substring(0, 100) + '...');
        console.log('\n🔍 FINAL DALL-E PROMPT (should preserve original context):');
        console.log('----------------------------------------');
        console.log(enhancedPrompt);
        console.log('----------------------------------------');
        
        // Check if original context is preserved
        const originalWords = page.imagePrompt.toLowerCase().split(' ');
        const importantWords = originalWords.filter(word => 
          word.length > 4 && !['with', 'their', 'would', 'could', 'should'].includes(word)
        );
        const preservedWords = importantWords.filter(word => 
          enhancedPrompt.toLowerCase().includes(word)
        );
        console.log(`✅ Context preservation: ${preservedWords.length}/${importantWords.length} key words preserved`);
        console.log('Key words:', importantWords.join(', '));
        console.log('Preserved:', preservedWords.join(', '));
        console.log('----------------------------------------\n');

        // finalPrompt is already set as enhancedPrompt above
        const finalPrompt = enhancedPrompt;
        
        // Validate prompt exists
        if (!finalPrompt || finalPrompt.trim().length === 0) {
          console.error('❌ ERROR: Empty or undefined prompt!');
          console.error('enhancedPrompt:', enhancedPrompt);
          console.error('promptMetadata:', promptMetadata);
          throw new Error('Generated prompt is empty or undefined');
        }
        
        // Log the prompts in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🎨 DALL-E Prompt for page', page.pageNumber);
          console.log('Original length:', enhancedPrompt.length, 'characters');
          console.log('Optimized length:', finalPrompt.length, 'characters');
          console.log('Using:', finalPrompt.substring(0, 200) + '...');
          console.log('---');
        }

        // Get style-specific parameters
        const styleParams = getStyleParameters(validatedData.artStyle as ArtStyleId);
        
        // Add multi-stage generation for better consistency
        console.log('🚀 Calling OpenAI DALL-E 3 API...');
        const apiParams = {
          model: styleParams.model,
          prompt: finalPrompt, // Use the optimized prompt
          n: 1,
          size: styleParams.size,
          quality: validatedData.testingMode ? 'standard' : 'hd', // HD for production
          style: styleParams.style, // Use style-specific setting (vivid or natural)
        };
        console.log('🔧 API Parameters:', apiParams);
        
        let imageResponse;
        try {
          imageResponse = await openai.images.generate(apiParams);
          console.log('✅ DALL-E Response received');
          console.log('🔄 Revised prompt from DALL-E:', imageResponse.data?.[0]?.revised_prompt?.substring(0, 200) + '...');
        } catch (dalleError) {
          console.error('❌ DALL-E API Error:', dalleError);
          const errorDetails = {
            message: dalleError instanceof Error ? dalleError.message : 'Unknown error',
            response: (dalleError as Record<string, unknown>)?.response?.data,
            status: (dalleError as Record<string, unknown>)?.response?.status,
            promptLength: finalPrompt.length,
            promptPreview: finalPrompt.substring(0, 500) + '...'
          };
          console.error('Error details:', errorDetails);
          
          // Check for specific error types
          if (errorDetails.status === 400 && errorDetails.response?.code === 'image_generation_user_error') {
            console.error('🚨 Prompt formatting error detected. Checking for problematic content...');
            const problematicPatterns = [
              { pattern: /\[.*?\]/g, name: 'Bracketed content' },
              { pattern: /\{.*?\}/g, name: 'Curly brace content' },
              { pattern: /[^\x00-\x7F]/g, name: 'Non-ASCII characters' },
              { pattern: /\n{3,}/g, name: 'Multiple newlines' }
            ];
            
            problematicPatterns.forEach(({ pattern, name }) => {
              const matches = finalPrompt.match(pattern);
              if (matches && matches.length > 0) {
                console.error(`🔍 Found ${name}: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
              }
            });
          }
          
          throw dalleError;
        }

        const imageUrl = imageResponse.data?.[0]?.url;
        if (!imageUrl) {
          console.error('❌ No image URL returned from DALL-E');
          throw new Error(`Failed to generate image for page ${page.pageNumber}`);
        }
        
        console.log('🖼️ Image URL generated successfully');

        // Calculate cost (HD: $0.080, Standard: $0.040)
        const imageCost = validatedData.testingMode ? 0.040 : 0.080;
        totalCost += imageCost;
        
        // Cache the successful generation
        if (validatedData.enhancedMode && characterRef) {
          await aiCache.cacheImageGeneration(
            characterRef,
            page.imagePrompt,
            validatedData.artStyle,
            promptMetadata.templateId || validatedData.promptVersion,
            {
              prompt: enhancedPrompt,
              imageUrl,
              metadata: promptMetadata
            }
          );
        }
        
        // Score the image quality (optional, can be async)
        let qualityScore = null;
        if (characterRef && !validatedData.testingMode) {
          qualityScore = await qualityScorer.scoreImage(
            imageUrl,
            characterRef,
            page.imagePrompt,
            page.pageNumber,
            validatedData.pages.length
          );
          
          // Record results for prompt optimization
          if (promptMetadata.templateId) {
            promptOptimizer.recordTestResult(
              promptMetadata.templateId,
              qualityScore.overall >= 7,
              qualityScore.overall,
              qualityScore.characterConsistency
            );
          }
        }

        generatedImages.push({
          pageNumber: page.pageNumber,
          imageUrl,
          prompt: enhancedPrompt,
          promptMetadata,
          revisedPrompt: imageResponse.data?.[0]?.revised_prompt,
          cost: imageCost,
          quality: validatedData.testingMode ? 'standard' : 'hd',
          enhancedMode: validatedData.enhancedMode,
          qualityScore: qualityScore?.overall,
          generatedAt: new Date().toISOString(),
        });

        console.log(`✅ Enhanced image ${i + 1} generated successfully${qualityScore ? ` (Quality: ${qualityScore.overall.toFixed(1)}/10)` : ''}`);
        
        // Update continuity manager with generated page
        continuityManager.updatePageContext(page.pageNumber, enhancedPrompt);

        // Longer delay for HD images
        if (i < pagesToGenerate.length - 1) {
          const delay = validatedData.testingMode ? 1000 : 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        console.error(`❌ Failed to generate enhanced image for page ${page.pageNumber}:`, error);
        
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

    console.log('✅ Enhanced image generation complete');
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
        enhancedMode: validatedData.enhancedMode,
        artStyle: validatedData.artStyle,
        promptVersion: validatedData.promptVersion,
        characterReferenceUsed: !!characterRef,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Enhanced image generation failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Enhanced image generation failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for V2 capabilities
export async function GET() {
  return NextResponse.json({
    success: true,
    version: '2.0',
    features: [
      'Ultra-detailed character references',
      'Enhanced prompt engineering with versioning',
      'Multi-stage photo analysis with verification',
      'Character reference caching',
      'Studio Ghibli authentic style',
      'HD quality option for production',
      'Improved consistency algorithms',
      'Gallery-quality output standards'
    ],
    config: {
      model: 'dall-e-3',
      qualityOptions: {
        standard: { price: 0.040, resolution: '1024x1024' },
        hd: { price: 0.080, resolution: '1024x1024', details: 'Higher quality, more details' }
      },
      artStyles: Object.keys(ENHANCED_ART_STYLES),
      promptVersions: ['v1_ultraConsistent', 'v2_studioGhibli'],
      maxImagesPerStory: {
        testing: 2,
        production: 10
      }
    }
  });
}