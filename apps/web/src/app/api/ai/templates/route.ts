import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { STORY_TEMPLATES } from '@/data/story-templates';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI-enhanced template data with dynamic content generation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const ageGroup = searchParams.get('ageGroup');
    const subscriptionTier = searchParams.get('subscriptionTier');
    const generateDynamic = searchParams.get('generateDynamic') === 'true';

    let templates = [...STORY_TEMPLATES];

    // Apply filters
    if (category && category !== 'all') {
      templates = templates.filter(template => template.category === category);
    }

    if (ageGroup && ageGroup !== 'all') {
      templates = templates.filter(template => 
        template.ageGroups.includes(ageGroup as '3-5' | '6-8' | '9-12' | '13+')
      );
    }

    if (subscriptionTier && subscriptionTier !== 'all') {
      templates = templates.filter(template => {
        if (subscriptionTier === 'basic') {
          return template.subscriptionTier === 'basic';
        } else if (subscriptionTier === 'premium') {
          return template.subscriptionTier === 'premium' || template.subscriptionTier === 'basic';
        }
        return true;
      });
    }

    // Generate dynamic content if requested
    if (generateDynamic && templates.length > 0) {
      console.log('🤖 Generating dynamic template content with AI...');
      
      for (let i = 0; i < Math.min(templates.length, 3); i++) { // Limit to 3 for cost control
        const template = templates[i];
        
        try {
          // Generate fresh sample content and learning objectives
          const dynamicContent = await generateDynamicTemplateContent(template as unknown as Record<string, unknown>);
          templates[i] = { ...template, ...dynamicContent };
        } catch (error) {
          console.error(`Failed to generate dynamic content for ${template.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      templates,
      totalCount: templates.length,
      filters: {
        category,
        ageGroup,
        subscriptionTier,
        generateDynamic,
      },
      aiEnhanced: generateDynamic,
    });

  } catch (error) {
    console.error('❌ Failed to get templates:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve templates' },
      { status: 500 }
    );
  }
}

// POST endpoint to create custom templates with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      childName, 
      childAge, 
      interests, 
      learningGoals, 
      parentConcerns,
      culturalBackground 
    } = body;

    console.log('🎯 Generating custom AI template...');
    console.log('Child:', childName, 'Age:', childAge);
    console.log('Interests:', interests);
    console.log('Learning goals:', learningGoals);

    const customTemplate = await generateCustomTemplate({
      childName,
      childAge,
      interests: interests || [],
      learningGoals: learningGoals || [],
      parentConcerns: parentConcerns || [],
      culturalBackground: culturalBackground || 'diverse',
    });

    return NextResponse.json({
      success: true,
      customTemplate,
      message: 'Custom template generated successfully',
      aiGenerated: true,
      createdAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Failed to create custom template:', error);
    return NextResponse.json(
      { error: 'Failed to create custom template' },
      { status: 500 }
    );
  }
}

// Generate dynamic content for existing templates
async function generateDynamicTemplateContent(template: Record<string, unknown>) {
  const prompt = `Enhance this children's story template with fresh, engaging content:

Template: ${template.title}
Category: ${template.category}
Age Groups: ${(template.ageGroups as string[])?.join(', ') || 'All ages'}
Description: ${template.description}

Generate:
1. A new sample page excerpt (2-3 sentences) that showcases the story's tone and style
2. 3-4 specific learning objectives that align with the template's educational focus
3. A brief parent guide tip (1-2 sentences) for extending the learning at home

Keep the content:
- Age-appropriate and engaging
- Educationally valuable
- Culturally inclusive
- Inspiring and positive

Format as JSON:
{
  "preview": {
    "samplePage": "New sample page text...",
    "coverText": "Engaging cover description..."
  },
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "parentGuide": "Tip for parents to extend learning..."
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in children\'s educational content and early childhood development. Create engaging, age-appropriate, and pedagogically sound story content.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate dynamic content');
  }

  return JSON.parse(content);
}

// Generate completely custom template based on child's profile
async function generateCustomTemplate(childProfile: Record<string, unknown>) {
  const prompt = `Create a personalized story template for this child:

Child Profile:
- Name: ${childProfile.childName}
- Age: ${childProfile.childAge}
- Interests: ${(childProfile.interests as string[])?.join(', ') || 'None specified'}
- Learning Goals: ${(childProfile.learningGoals as string[])?.join(', ') || 'None specified'}
- Parent Concerns: ${(childProfile.parentConcerns as string[])?.join(', ') || 'None specified'}
- Cultural Background: ${childProfile.culturalBackground}

Create a unique story template that:
1. Incorporates the child's specific interests
2. Addresses the learning goals
3. Is culturally appropriate and inclusive
4. Provides educational value while being entertaining
5. Is age-appropriate for ${childProfile.childAge} year old

Generate a complete template with:
- Engaging title featuring the child
- Compelling description
- 8-12 page story outline
- Specific learning objectives
- Sample page content
- Image description prompts
- Parent engagement suggestions

Format as JSON:
{
  "id": "custom_[timestamp]",
  "title": "Story title featuring ${childProfile.childName}",
  "description": "Engaging description...",
  "category": "custom",
  "ageGroups": ["appropriate age group"],
  "educationalFocus": ["relevant focus areas"],
  "difficulty": "beginner/intermediate/advanced",
  "pages": 10,
  "estimatedReadingTime": 8,
  "subscriptionTier": "premium",
  "themes": ["relevant themes"],
  "learningObjectives": ["specific objectives"],
  "preview": {
    "coverText": "Cover description...",
    "samplePage": "Sample page content..."
  },
  "storyOutline": [
    {
      "pageNumber": 1,
      "summary": "What happens on this page",
      "learningFocus": "What this page teaches"
    }
  ],
  "parentGuide": "How parents can extend the learning...",
  "culturalElements": ["relevant cultural considerations"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert children\'s content creator specializing in personalized, educational storytelling. Create templates that are pedagogically sound, culturally sensitive, and deeply engaging for the specific child.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate custom template');
  }

  const customTemplate = JSON.parse(content);
  
  // Add timestamp to ID
  customTemplate.id = `custom_${Date.now()}`;
  customTemplate.aiGenerated = true;
  customTemplate.personalizedFor = childProfile.childName;
  
  return customTemplate;
}

// GET endpoint for AI template suggestions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { childProfiles, recentStories, learningProgress }: Record<string, unknown> = body;

    console.log('🎯 Generating AI template recommendations...');

    const suggestions = await generateTemplateRecommendations({
      childProfiles: childProfiles || [],
      recentStories: recentStories || [],
      learningProgress: learningProgress || {},
    });

    return NextResponse.json({
      success: true,
      recommendations: suggestions,
      aiGenerated: true,
      basedOn: {
        childProfiles: Array.isArray(childProfiles) ? childProfiles.length : 0,
        recentStories: Array.isArray(recentStories) ? recentStories.length : 0,
        hasProgressData: Object.keys(learningProgress || {}).length > 0,
      },
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Failed to generate recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

async function generateTemplateRecommendations(data: Record<string, unknown>) {
  const prompt = `Based on this child data, recommend the best story templates and explain why:

Child Profiles: ${JSON.stringify(data.childProfiles, null, 2)}
Recent Stories: ${JSON.stringify(data.recentStories, null, 2)}
Learning Progress: ${JSON.stringify(data.learningProgress, null, 2)}

Available templates: ${STORY_TEMPLATES.map(t => `${t.id}: ${t.title} (${t.category})`).join(', ')}

Provide recommendations that:
1. Match each child's interests and learning needs
2. Avoid repetition of recent story themes
3. Progress appropriately based on learning development
4. Include variety across different educational categories
5. Consider age appropriateness

Format as JSON:
{
  "recommendations": [
    {
      "templateId": "template_id",
      "childName": "child name",
      "reason": "Why this template is recommended",
      "learningBenefits": ["benefit 1", "benefit 2"],
      "priority": "high/medium/low"
    }
  ],
  "insights": {
    "learningPatterns": "Observed learning patterns...",
    "suggestedFocus": "Areas to focus on next...",
    "parentTips": "Tips for parents..."
  }
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an AI educational specialist who analyzes children\'s learning patterns and recommends personalized content. Provide thoughtful, data-driven recommendations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.6,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate recommendations');
  }

  return JSON.parse(content);
}