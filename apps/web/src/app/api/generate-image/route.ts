import { NextRequest, NextResponse } from 'next/server';

// Helper function to analyze child photo and get detailed description
async function analyzeChildPhoto(photoUrl: string, apiKey: string): Promise<string> {
  try {
    console.log('🔍 Analyzing child photo for detailed description...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this child\'s photo and provide a detailed but respectful description for AI art generation. Include: hair color and style, eye color, skin tone, approximate age, facial features, and any distinctive characteristics. Focus on features that will help create consistent character art. Keep it appropriate and positive for children\'s book illustration. Format as a concise descriptive phrase.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: photoUrl
                }
              }
            ]
          }
        ],
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API error:', response.status, errorText);
      throw new Error(`Vision API error: ${response.status}`);
    }

    const result = await response.json();
    const description = result.choices[0].message.content;
    console.log('✅ Child description generated:', description);
    return description;
  } catch (error) {
    console.error('❌ Failed to analyze child photo:', error);
    return 'a happy, cheerful child with bright eyes and a warm smile'; // Fallback description
  }
}

// Helper function to generate personalized story image with child description
async function generatePersonalizedImage(prompt: string, childDescription: string, apiKey: string): Promise<string> {
  try {
    const personalizedPrompt = `${prompt}. The main character should be ${childDescription}. Studio Ghibli style children's book illustration, soft watercolor painting, dreamy atmosphere, warm pastel colors, magical realism, detailed natural background, whimsical illustration, gentle lighting, high quality, masterpiece, safe for children, wholesome, friendly, cheerful scene, consistent character design`;

    console.log('🎨 DALL-E prompt:', personalizedPrompt.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: personalizedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd', // Use HD quality for better details
        style: 'vivid'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DALL-E API error:', response.status, errorText);
      throw new Error(`DALL-E API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data[0].url;
  } catch (error) {
    console.error('Failed to generate personalized image:', error);
    throw error;
  }
}

// Helper function to swap face using Replicate InstantID (currently unused but kept for future implementation)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function swapFaceWithReplicate(baseImageUrl: string, faceImageUrl: string, prompt: string): Promise<string> {
  try {
    console.log('Starting Replicate InstantID face swap...');
    
    // Using correct Replicate InstantID model
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "c98b2e7a196828d00955767813b81fc05c5c9b294c670c6d147d545fed4ceecf", // Correct InstantID version
        input: {
          image: faceImageUrl, // The face image to use for identity
          prompt: `${prompt}. A child in a beautiful storybook illustration, Studio Ghibli style, soft watercolor painting, dreamy atmosphere, warm pastel colors, magical realism, children's book art`,
          negative_prompt: "distorted face, blurry, low quality, scary, inappropriate, adult, realistic photo, photorealistic",
          width: 1024,
          height: 1024,
          guidance_scale: 5,
          ip_adapter_scale: 0.8, // Higher for better face similarity
          controlnet_conditioning_scale: 0.8, // Face preservation strength
          num_inference_steps: 30,
          disable_safety_checker: false
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error response:', errorText);
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('Replicate prediction started:', prediction.id);
    
    // Poll for completion (reduced timeout for better UX)
    let result = prediction;
    let pollCount = 0;
    const maxPolls = 15; // Max 30 seconds polling (15 * 2s)
    
    while ((result.status === 'starting' || result.status === 'processing') && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
      pollCount++;
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      if (!pollResponse.ok) {
        throw new Error(`Polling error: ${pollResponse.status}`);
      }
      
      result = await pollResponse.json();
      console.log(`Poll ${pollCount}: Status = ${result.status}`);
    }

    if (result.status === 'succeeded') {
      console.log('Face swap completed successfully');
      return result.output; // InstantID returns a single image URL
    } else {
      console.error('Replicate prediction failed:', result);
      throw new Error(`Replicate prediction failed: ${result.error || result.status}`);
    }
  } catch (error) {
    console.error('Face swap failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, childPhotoUrl } = body;

    if (!prompt || !childPhotoUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    let imageUrl: string;

    if (openaiApiKey) {
      try {
        console.log('=== Starting hybrid image generation process ===');
        console.log('OpenAI API Key available:', !!openaiApiKey);
        console.log('Replicate Token available:', !!replicateToken);
        console.log('Child Photo URL:', childPhotoUrl?.substring(0, 50) + '...');
        console.log('Prompt:', prompt);
        
        // Step 1: Analyze the child's photo to get detailed description
        console.log('=== Step 1: Analyzing child photo ===');
        const childDescription = await analyzeChildPhoto(childPhotoUrl, openaiApiKey);
        
        // Step 2: Generate personalized image with child description
        console.log('=== Step 2: Generating personalized DALL-E image ===');
        imageUrl = await generatePersonalizedImage(prompt, childDescription, openaiApiKey);
        console.log('✅ Personalized DALL-E image generated:', imageUrl?.substring(0, 50) + '...');
        
      } catch (error) {
        console.error('❌ Complete image generation failed, using SVG fallback:', error);
        imageUrl = `data:image/svg+xml;base64,${Buffer.from(`
          <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#87CEEB"/>
                <stop offset="100%" style="stop-color:#FAE8FF"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="28" fill="#333333" text-anchor="middle" dy=".3em">✨ Magical Illustration ✨</text>
            <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="18" fill="#555555" text-anchor="middle" dy=".3em">Generated for StoryTime</text>
          </svg>
        `).toString('base64')}`;
      }
    } else {
      console.log('No OpenAI API key found, using placeholder');
      await new Promise(resolve => setTimeout(resolve, 1000));
      imageUrl = `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#87CEEB"/>
              <stop offset="100%" style="stop-color:#FAE8FF"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)"/>
          <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="28" fill="#333333" text-anchor="middle" dy=".3em">✨ Magical Illustration ✨</text>
          <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="18" fill="#555555" text-anchor="middle" dy=".3em">Demo Mode - Add API Keys</text>
        </svg>
      `).toString('base64')}`;
    }

    return NextResponse.json({
      imageUrl: imageUrl,
      prompt: prompt,
      status: 'completed'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}