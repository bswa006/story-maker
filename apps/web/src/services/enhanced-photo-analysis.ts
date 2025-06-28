import OpenAI from 'openai';
import { CharacterReference, CharacterReferenceSchema } from './enhanced-image-generation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced photo analysis prompt for DALL-E 3 compatibility
const ULTRA_DETAILED_ANALYSIS_PROMPT = `
You are an expert at describing characters for AI image generation. Analyze this photo and create a clear, concise character description that will work well with DALL-E 3.

Focus on the most distinctive visual features that make this child recognizable. Be specific but concise.

Provide the analysis in the following JSON format:

{
  "name": "{childName}",
  "age": {estimatedAge},
  "face": {
    "shape": "oval|round|square|heart|oblong",
    "complexion": "detailed skin tone description with undertones",
    "distinctiveMarks": ["list any freckles, moles, dimples, etc."]
  },
  "eyes": {
    "color": "specific color with any variations/flecks",
    "shape": "almond|round|hooded|monolid|upturned|downturned",
    "size": "small|medium|large",
    "eyebrows": {
      "thickness": "thin|medium|thick",
      "shape": "straight|arched|rounded",
      "color": "specific color"
    },
    "lashes": "short|medium|long",
    "expression": "describe the natural expression"
  },
  "nose": {
    "shape": "button|straight|roman|snub|aquiline",
    "size": "small|medium|large",
    "nostrils": "narrow|medium|wide"
  },
  "mouth": {
    "lipShape": "thin|medium|full",
    "lipColor": "natural color description",
    "smile": "describe smile characteristics"
  },
  "hair": {
    "color": "precise color with highlights/lowlights if any",
    "texture": "straight|wavy|curly|coily|kinky",
    "length": "very short|short|medium|long|very long",
    "style": "detailed style description",
    "volume": "thin|medium|thick"
  },
  "build": {
    "height": "very short|short|average|tall|very tall",
    "bodyType": "slim|average|athletic|sturdy|round",
    "posture": "description of typical posture"
  },
  "styleGuide": {
    "colorPalette": ["colors that complement the character"],
    "lightingNotes": "best lighting approach for this character",
    "perspectiveNotes": "ideal viewing angles"
  }
}

Remember:
- Be EXTREMELY specific about facial features
- Note ANY unique characteristics that make this child recognizable
- Describe colors with precision (not just "brown" but "warm chestnut brown with golden undertones")
- Include subtle details that ensure consistency
- Keep descriptions positive and child-appropriate
`;

export async function analyzePhotoWithUltraDetail(
  photoUrl: string,
  childName: string
): Promise<CharacterReference> {
  try {
    console.log('🔬 Starting ultra-detailed photo analysis...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert character designer who creates detailed character reference sheets for children&apos;s book illustrations. You must respond with valid JSON only.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: ULTRA_DETAILED_ANALYSIS_PROMPT.replace('{childName}', childName)
            },
            {
              type: 'image_url',
              image_url: {
                url: photoUrl,
                detail: 'high' // Use high detail for better analysis
              }
            }
          ]
        }
      ],
      max_tokens: 1000, // Increased for detailed description
      temperature: 0.3, // Lower temperature for consistency
      response_format: { type: 'json_object' }
    });

    const analysisText = response.choices[0]?.message?.content || '{}';
    console.log('📊 Raw analysis:', analysisText);
    
    // Parse and validate the response
    const analysisData = JSON.parse(analysisText);
    
    // Add the child's actual name
    analysisData.name = childName;
    
    // Validate against schema
    const validatedReference = CharacterReferenceSchema.parse(analysisData);
    
    console.log('✅ Ultra-detailed analysis complete');
    return validatedReference;
    
  } catch (error) {
    console.error('❌ Ultra-detailed photo analysis failed:', error);
    
    // Return a default reference as fallback
    return createDefaultCharacterReference(childName);
  }
}

// Fallback function for when photo analysis fails
function createDefaultCharacterReference(childName: string): CharacterReference {
  return {
    name: childName,
    age: 6,
    face: {
      shape: 'round',
      complexion: 'warm beige with rosy cheeks',
      distinctiveMarks: []
    },
    eyes: {
      color: 'warm brown',
      shape: 'round',
      size: 'medium',
      eyebrows: {
        thickness: 'medium',
        shape: 'arched',
        color: 'dark brown'
      },
      lashes: 'medium',
      expression: 'bright and curious'
    },
    nose: {
      shape: 'button',
      size: 'small',
      nostrils: 'medium'
    },
    mouth: {
      lipShape: 'medium',
      lipColor: 'natural pink',
      smile: 'cheerful with slight dimples'
    },
    hair: {
      color: 'dark brown',
      texture: 'straight',
      length: 'medium',
      style: 'neat with a side part',
      volume: 'medium'
    },
    build: {
      height: 'average',
      bodyType: 'average',
      posture: 'energetic and upright'
    },
    styleGuide: {
      colorPalette: ['warm earth tones', 'soft pastels', 'vibrant primaries'],
      lightingNotes: 'soft, warm lighting with gentle shadows',
      perspectiveNotes: 'child&apos;s eye level, slightly looking up'
    }
  };
}

// Multi-stage analysis for even better results
export async function analyzePhotoWithVerification(
  photoUrl: string,
  childName: string
): Promise<{
  characterReference: CharacterReference;
  verificationNotes: string[];
  confidence: number;
}> {
  // First analysis
  const initialAnalysis = await analyzePhotoWithUltraDetail(photoUrl, childName);
  
  // Verification pass - ask AI to double-check critical features
  try {
    const verificationResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please verify these character details against the photo and note any corrections needed:
              
              Face shape: ${initialAnalysis.face.shape}
              Eye color: ${initialAnalysis.eyes.color}
              Hair: ${initialAnalysis.hair.color}, ${initialAnalysis.hair.texture}, ${initialAnalysis.hair.style}
              Skin tone: ${initialAnalysis.face.complexion}
              
              List any inaccuracies or additional important details for character consistency.`
            },
            {
              type: 'image_url',
              image_url: {
                url: photoUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });
    
    const verificationNotes = verificationResponse.choices[0]?.message?.content || '';
    
    return {
      characterReference: initialAnalysis,
      verificationNotes: verificationNotes.split('\n').filter(note => note.trim()),
      confidence: 0.95 // High confidence with verification
    };
    
  } catch (error) {
    console.error('❌ Verification pass failed:', error);
    return {
      characterReference: initialAnalysis,
      verificationNotes: [],
      confidence: 0.8 // Lower confidence without verification
    };
  }
}

// CharacterReference is already exported from enhanced-image-generation