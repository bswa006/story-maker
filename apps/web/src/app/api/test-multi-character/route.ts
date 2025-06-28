import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StoryUnderstandingSystem } from '@/services/story-understanding-system';
import { buildMultiCharacterScenePrompt } from '@/services/multi-character-scene-prompts';
import { getStyleParameters } from '@/services/art-styles-system';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('\n\n🎭 =====================================================');
    console.log('🎭 MULTI-CHARACTER TEST ENDPOINT');
    console.log('🎭 Testing Ira/Jake scene generation');
    console.log('🎭 =====================================================\n');
    
    const testData = {
      storyId: 'test-ira-jake',
      childName: 'Ira',
      childAge: '7',
      childDescription: 'Ira, a 7 year old girl with long brown hair wearing a yellow dress and crown',
      pages: [
        {
          pageNumber: 1,
          text: "One sunny afternoon, Ira found her younger brother, Jake, crying in the corner of their playroom.",
          imagePrompt: "Ira discovering Jake crying in playroom corner"
        },
        {
          pageNumber: 2,
          text: "She bent down and asked Jake what was wrong, her face full of concern for her little brother.",
          imagePrompt: "Ira bending down to ask crying Jake what's wrong"
        }
      ],
      artStyle: 'disney_pixar_3d'
    };
    
    // Initialize story understanding
    console.log('🧠 INITIALIZING STORY UNDERSTANDING...');
    const storyUnderstanding = new StoryUnderstandingSystem();
    storyUnderstanding.parseFullStory(testData.pages);
    
    const results = [];
    
    // Process each page
    for (let i = 0; i < testData.pages.length; i++) {
      const page = testData.pages[i];
      console.log(`\n\n📖 PROCESSING PAGE ${page.pageNumber}`);
      console.log('Story text:', page.text);
      
      // Understand the scene
      const previousPages = testData.pages.slice(0, i).map(p => ({ text: p.text }));
      const sceneContext = storyUnderstanding.understandPage(
        page.pageNumber,
        page.text,
        previousPages
      );
      
      const sceneUnderstanding = storyUnderstanding.buildSceneUnderstanding(
        page.pageNumber,
        page.text,
        page.imagePrompt
      );
      
      console.log('\n📍 Scene Understanding:');
      console.log('Characters present:', sceneUnderstanding.requiredCharacters.map(c => `${c.name} (${c.role})`).join(', '));
      console.log('Setting:', sceneUnderstanding.setting);
      console.log('Action:', sceneUnderstanding.action);
      console.log('Positioning:', sceneUnderstanding.positioning);
      console.log('Critical requirements:', sceneUnderstanding.criticalRequirements);
      
      // Build multi-character prompt
      let prompt = '';
      if (sceneUnderstanding.requiredCharacters.length > 1) {
        console.log('\n🎭 Using multi-character prompt builder...');
        prompt = buildMultiCharacterScenePrompt({
          sceneContext: sceneContext,
          mainCharacter: {
            name: testData.childName,
            appearance: testData.childDescription
          },
          storyId: testData.storyId,
          pageNumber: page.pageNumber,
          artStyle: testData.artStyle,
          storyText: page.text
        });
      }
      
      console.log('\n📝 GENERATED PROMPT:');
      console.log('=====================================');
      console.log(prompt.substring(0, 500) + '...');
      console.log('=====================================');
      
      // Generate image
      try {
        console.log('\n🚀 Calling DALL-E 3...');
        const styleParams = getStyleParameters(testData.artStyle);
        
        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: styleParams.style,
        });
        
        const imageUrl = imageResponse.data?.[0]?.url;
        console.log('✅ Image generated successfully');
        
        results.push({
          pageNumber: page.pageNumber,
          success: true,
          imageUrl,
          prompt: prompt.substring(0, 300) + '...',
          characters: sceneUnderstanding.requiredCharacters.map(c => c.name),
          revisedPrompt: imageResponse.data?.[0]?.revised_prompt
        });
        
      } catch (error) {
        console.error('❌ Image generation failed:', error);
        results.push({
          pageNumber: page.pageNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          characters: sceneUnderstanding.requiredCharacters.map(c => c.name)
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      test: 'multi-character-scene',
      results,
      summary: {
        totalPages: results.length,
        successfulImages: results.filter(r => r.success).length,
        charactersDetected: {
          page1: results[0]?.characters || [],
          page2: results[1]?.characters || []
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Test endpoint failed:', error);
    return NextResponse.json(
      { error: 'Test failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if test is available
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/test-multi-character',
    purpose: 'Test multi-character scene generation',
    method: 'POST',
    testScenario: 'Ira and Jake sibling interaction'
  });
}