import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createMagicalGhibliPrompt, MAGICAL_SCENE_PROMPTS } from '@/services/magical-ghibli-prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    // Test the magical Ghibli prompt
    const testPrompt = createMagicalGhibliPrompt(
      '6 year old girl with black hair and brown eyes',
      'sitting on a swing under a giant cherry blossom tree with pink petals falling',
      1
    );
    
    console.log('\n🎨 ===== TESTING MAGICAL GHIBLI PROMPT =====');
    console.log('📝 Generated Prompt:');
    console.log(testPrompt);
    console.log('\n🖼️ Generating test image...');
    
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: testPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    });
    
    const imageUrl = imageResponse.data?.[0]?.url;
    const revisedPrompt = imageResponse.data?.[0]?.revised_prompt;
    
    console.log('✅ Image generated successfully!');
    console.log('🔄 DALL-E Revised Prompt:', revisedPrompt);
    
    return NextResponse.json({
      success: true,
      originalPrompt: testPrompt,
      revisedPrompt,
      imageUrl,
      testScenes: {
        introduction: MAGICAL_SCENE_PROMPTS.introduction,
        conclusion: MAGICAL_SCENE_PROMPTS.conclusion,
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      { error: 'Test failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}