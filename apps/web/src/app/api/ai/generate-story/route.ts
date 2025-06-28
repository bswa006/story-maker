import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { checkSubscriptionLimits, incrementUsage, createSubscriptionErrorResponse } from '@/lib/subscription-check';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Request validation schema
const GenerateStorySchema = z.object({
  templateId: z.string().optional(), // Keep for backward compatibility
  theme: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    imageStyle: z.string(),
  }).optional(),
  customization: z.object({
    setting: z.string().optional(),
    characters: z.array(z.string()).optional(),
    learningGoals: z.array(z.string()).optional(),
    tone: z.string().optional(),
    additionalInstructions: z.string().optional(),
  }).optional(),
  childName: z.string().min(1),
  childAge: z.string(),
  childInterests: z.array(z.string()).optional(),
  childPhotoAnalysis: z.object({
    appearance: z.string(),
    characteristics: z.string(),
  }).optional(),
  learningObjectives: z.array(z.string()).optional(),
  culturalBackground: z.string().optional(),
  specialConsiderations: z.array(z.string()).optional(),
});

// type GenerateStoryRequest = z.infer<typeof GenerateStorySchema>; // Reserved for future use

// Dynamic story generation system prompt
const DYNAMIC_STORY_SYSTEM_PROMPT = `You are an expert children's story writer who creates personalized, educational stories based on specific themes and customization parameters. You adapt your writing style and content to match the requested theme while incorporating all provided customization details.

Core Guidelines:
- Create age-appropriate, engaging stories that teach valuable lessons
- Incorporate ALL provided customization settings into the story
- Make the child the hero of their own adventure
- Each page should have a clear narrative purpose
- Include vivid, specific descriptions for AI illustration generation
- Maintain the requested tone throughout the story
- Ensure cultural sensitivity and inclusivity`;

import { withErrorHandler, ValidationError, ExternalServiceError } from '@/lib/error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Check subscription limits
  const subscriptionCheck = await checkSubscriptionLimits();
  console.log('Subscription check result:', subscriptionCheck);
  if (!subscriptionCheck.allowed) {
    return createSubscriptionErrorResponse(subscriptionCheck);
  }

    const body = await request.json();
    const validatedData = GenerateStorySchema.parse(body);

    // Build dynamic story prompt based on theme and customization
    const theme = validatedData.theme;
    const customization = validatedData.customization || {};
    
    let storyPrompt = `Create a personalized story for ${validatedData.childName}, age ${validatedData.childAge}.\n\n`;
    
    // Add theme information
    if (theme) {
      storyPrompt += `THEME REQUIREMENTS:\n`;
      storyPrompt += `- Theme: ${theme.name} (${theme.category})\n`;
      storyPrompt += `- Art Style Vision: ${theme.imageStyle}\n\n`;
    }
    
    // Add customization details
    if (customization.setting || customization.characters || customization.learningGoals) {
      storyPrompt += `STORY CUSTOMIZATION:\n`;
      if (customization.setting) {
        storyPrompt += `- Setting: ${customization.setting}\n`;
      }
      if (customization.characters && customization.characters.length > 0) {
        storyPrompt += `- Characters to include: ${customization.characters.join(', ')}\n`;
      }
      if (customization.learningGoals && customization.learningGoals.length > 0) {
        storyPrompt += `- Learning goals to incorporate: ${customization.learningGoals.join(', ')}\n`;
      }
      if (customization.tone) {
        storyPrompt += `- Story tone: ${customization.tone}\n`;
      }
      if (customization.additionalInstructions) {
        storyPrompt += `- Additional instructions: ${customization.additionalInstructions}\n`;
      }
      storyPrompt += `\n`;
    }
    
    // Add child details
    storyPrompt += `CHILD DETAILS:\n`;
    storyPrompt += `- Name: ${validatedData.childName}\n`;
    storyPrompt += `- Age: ${validatedData.childAge}\n`;
    if (validatedData.childInterests && validatedData.childInterests.length > 0) {
      storyPrompt += `- Interests: ${validatedData.childInterests.join(', ')}\n`;
    }
    if (validatedData.childPhotoAnalysis?.appearance) {
      storyPrompt += `- Appearance for illustrations: ${validatedData.childPhotoAnalysis.appearance}\n`;
    }
    if (validatedData.learningObjectives && validatedData.learningObjectives.length > 0) {
      storyPrompt += `- Learning objectives: ${validatedData.learningObjectives.join(', ')}\n`;
    }
    if (validatedData.culturalBackground) {
      storyPrompt += `- Cultural background: ${validatedData.culturalBackground}\n`;
    }
    if (validatedData.specialConsiderations && validatedData.specialConsiderations.length > 0) {
      storyPrompt += `- Special considerations: ${validatedData.specialConsiderations.join(', ')}\n`;
    }
    
    // Add story structure requirements
    storyPrompt += `\nSTORY REQUIREMENTS:\n`;
    storyPrompt += `- Create a ${8}-${10} page story\n`;
    storyPrompt += `- Each page should have 2-3 sentences\n`;
    storyPrompt += `- Make ${validatedData.childName} the main character\n`;
    storyPrompt += `- Incorporate the theme, setting, characters, and learning goals naturally\n`;
    storyPrompt += `- End with a positive message that reinforces the learning objectives\n\n`;
    
    // Add format requirements
    storyPrompt += `CRITICAL: You MUST respond with EXACTLY this JSON structure:\n\n`;
    storyPrompt += `{\n`;
    storyPrompt += `  "title": "[Create an engaging title that reflects the theme and child's name]",\n`;
    storyPrompt += `  "pages": [\n`;
    storyPrompt += `    {\n`;
    storyPrompt += `      "pageNumber": 1,\n`;
    storyPrompt += `      "text": "Story text for this page...",\n`;
    storyPrompt += `      "imagePrompt": "DETAILED scene that EXACTLY matches the story text - include WHERE (setting), WHO (characters), WHAT (action), and any objects mentioned",\n`;
    storyPrompt += `      "learningFocus": "What this page teaches or its purpose in the story"\n`;
    storyPrompt += `    }\n`;
    storyPrompt += `  ]\n`;
    storyPrompt += `}\n\n`;
    storyPrompt += `CRITICAL IMAGE PROMPT RULES:\n`;
    storyPrompt += `- If text mentions "ocean" or "underwater", imagePrompt MUST include "underwater in the ocean"\n`;
    storyPrompt += `- If text mentions meeting a character (like "turtle named Tito"), that character MUST be in imagePrompt\n`;
    storyPrompt += `- Include EXACT setting from text (ocean/forest/home/etc), not generic locations\n`;
    storyPrompt += `- ${validatedData.childName} must appear in EVERY imagePrompt with this EXACT description: "${validatedData.childPhotoAnalysis?.appearance || 'child with specific appearance'}"\n`;
    storyPrompt += `- NEVER change the child's appearance between pages\n`;
    storyPrompt += `- Be specific: "underwater with sea turtle" not just "adventure scene"\n`;
    storyPrompt += `- For each imagePrompt, start with: "${validatedData.childName} (EXACT SAME child from all pages) ..."\n\n`;
    storyPrompt += `IMPORTANT:\n`;
    storyPrompt += `- Use ONLY "pageNumber", "text", "imagePrompt", "learningFocus" as field names\n`;
    storyPrompt += `- imagePrompt must describe EXACTLY what happens in the text\n`;
    storyPrompt += `- Never use generic descriptions like "child on adventure"\n`;
    storyPrompt += `- Focus on the specific customization settings provided`;

    console.log('🤖 Generating AI story with GPT-4...');
    console.log('Theme:', theme?.name || 'Custom');
    console.log('Child:', validatedData.childName, 'Age:', validatedData.childAge);
    if (customization.setting) console.log('Setting:', customization.setting);
    if (customization.learningGoals) console.log('Learning Goals:', customization.learningGoals);

    // Generate story content with GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: DYNAMIC_STORY_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: storyPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const storyResponse = completion.choices[0]?.message?.content;
    if (!storyResponse) {
      throw new Error('Failed to generate story content');
    }

    // Parse the JSON response
    let storyData;
    try {
      // Try to extract JSON from response (in case GPT-4 adds extra text)
      const jsonMatch = storyResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : storyResponse;
      storyData = JSON.parse(jsonString);
      
      // Validate that the structure is correct
      if (!storyData.pages || !Array.isArray(storyData.pages)) {
        throw new Error('Invalid structure: missing pages array');
      }
      
      // Validate each page has the required fields
      for (const page of storyData.pages) {
        if (!page.pageNumber || !page.text || !page.imagePrompt) {
          throw new Error('Invalid page structure: missing required fields');
        }
      }
      
      console.log('✅ Story structure validation passed');
      
      // Log the generated story for debugging
      console.log('\n📖 GENERATED STORY ANALYSIS:');
      console.log('Title:', storyData.title);
      console.log('Total pages:', storyData.pages.length);
      
      storyData.pages.forEach((page, index) => {
        console.log(`\nPage ${index + 1}:`);
        console.log('  Text:', page.text?.substring(0, 100) + '...');
        console.log('  ImagePrompt:', page.imagePrompt);
        console.log('  Has child name in prompt:', page.imagePrompt?.includes(validatedData.childName));
      });
      
    } catch (parseError) {
      console.error('Failed to parse GPT-4 response as JSON:', parseError);
      console.error('Raw response:', storyResponse);
      
      // Fallback: Create a simple story structure with consistent format
      storyData = {
        title: `${validatedData.childName}'s Adventure`,
        pages: [
          {
            pageNumber: 1,
            text: `Once upon a time, there was a wonderful child named ${validatedData.childName}. Today was going to be a very special day filled with amazing discoveries!`,
            imagePrompt: `A cheerful child named ${validatedData.childName} starting an adventure, children's book illustration style`,
            learningFocus: "Beginning an adventure"
          },
          {
            pageNumber: 2,
            text: `${validatedData.childName} learned that being brave doesn't mean not being scared - it means doing the right thing even when you feel afraid.`,
            imagePrompt: `${validatedData.childName} showing courage in a challenging situation, warm and encouraging children's book style`,
            learningFocus: "Courage and bravery"
          },
          {
            pageNumber: 3,
            text: `Through kindness and perseverance, ${validatedData.childName} discovered that even small actions can make a big difference in the world.`,
            imagePrompt: `${validatedData.childName} helping others and making a positive impact, heartwarming children's book illustration`,
            learningFocus: "Kindness and impact"
          },
          {
            pageNumber: 4,
            text: `And so ${validatedData.childName} returned home, wiser and happier, knowing that tomorrow would bring new adventures and opportunities to grow.`,
            imagePrompt: `${validatedData.childName} at home reflecting on their adventure, peaceful and content children's book illustration`,
            learningFocus: "Growth and reflection"
          }
        ]
      };
      console.log('✅ Using fallback story structure with consistent format');
    }

    // Calculate costs
    const promptTokens = completion.usage?.prompt_tokens || 0;
    const completionTokens = completion.usage?.completion_tokens || 0;
    const totalTokens = completion.usage?.total_tokens || 0;
    
    // GPT-4 pricing: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
    const cost = (promptTokens * 0.03 / 1000) + (completionTokens * 0.06 / 1000);

    console.log('✅ Story generated successfully');
    console.log('📊 Usage:', { promptTokens, completionTokens, totalTokens, cost: `$${cost.toFixed(4)}` });

    // Increment user's story usage
    if (subscriptionCheck.user) {
      await incrementUsage(subscriptionCheck.user.id);
    }

    return NextResponse.json({
      success: true,
      story: storyData,
      metadata: {
        theme: theme,
        customization: customization,
        childName: validatedData.childName,
        generatedAt: new Date().toISOString(),
        tokensUsed: totalTokens,
        estimatedCost: cost,
        model: 'gpt-4',
      },
    });
});

// GET endpoint to retrieve AI capabilities
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      capabilities: {
        dynamicStoryGeneration: true,
        themeBased: true,
        customizationSupported: true,
        supportedThemeCategories: [
          'emotional',
          'stem', 
          'diversity',
          'life-skills',
          'fantasy',
          'adventure'
        ],
        customizationOptions: [
          'setting',
          'characters',
          'learningGoals',
          'tone',
          'additionalInstructions'
        ],
        aiModels: {
          story: 'gpt-4',
          images: 'dall-e-3',
          analysis: 'gpt-4-vision',
        },
      },
    });

  } catch (error) {
    console.error('❌ Failed to get capabilities:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve capabilities' },
      { status: 500 }
    );
  }
}