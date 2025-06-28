import { z } from 'zod';

// Enhanced character description schema for maximum consistency
export const CharacterReferenceSchema = z.object({
  // Core Identity
  name: z.string(),
  age: z.number(),
  
  // Facial Features - Ultra Detailed
  face: z.object({
    shape: z.enum(['oval', 'round', 'square', 'heart', 'oblong']),
    complexion: z.string(), // e.g., "warm beige with rosy undertones"
    distinctiveMarks: z.array(z.string()).optional(), // freckles, moles, etc.
  }),
  
  eyes: z.object({
    color: z.string(), // e.g., "deep brown with amber flecks"
    shape: z.enum(['almond', 'round', 'hooded', 'monolid', 'upturned', 'downturned']),
    size: z.enum(['small', 'medium', 'large']),
    eyebrows: z.object({
      thickness: z.enum(['thin', 'medium', 'thick']),
      shape: z.enum(['straight', 'arched', 'rounded']),
      color: z.string(),
    }),
    lashes: z.enum(['short', 'medium', 'long']),
    expression: z.string(), // e.g., "bright and curious"
  }),
  
  nose: z.object({
    shape: z.enum(['button', 'straight', 'roman', 'snub', 'aquiline']),
    size: z.enum(['small', 'medium', 'large']),
    nostrils: z.enum(['narrow', 'medium', 'wide']),
  }),
  
  mouth: z.object({
    lipShape: z.enum(['thin', 'medium', 'full']),
    lipColor: z.string(), // e.g., "natural pink"
    smile: z.string(), // e.g., "wide and cheerful showing slight gap between front teeth"
  }),
  
  hair: z.object({
    color: z.string(), // e.g., "rich chocolate brown with subtle golden highlights"
    texture: z.enum(['straight', 'wavy', 'curly', 'coily', 'kinky']),
    length: z.enum(['very short', 'short', 'medium', 'long', 'very long']),
    style: z.string(), // e.g., "shoulder-length with side part and gentle waves"
    volume: z.enum(['thin', 'medium', 'thick']),
  }),
  
  // Body Characteristics
  build: z.object({
    height: z.enum(['very short', 'short', 'average', 'tall', 'very tall']),
    bodyType: z.enum(['slim', 'average', 'athletic', 'sturdy', 'round']),
    posture: z.string(), // e.g., "slightly slouched with energetic movements"
  }),
  
  // Style Consistency
  styleGuide: z.object({
    colorPalette: z.array(z.string()), // preferred colors for the character
    lightingNotes: z.string(), // e.g., "soft, warm lighting with gentle shadows"
    perspectiveNotes: z.string(), // e.g., "usually shown at child's eye level"
  }),
});

export type CharacterReference = z.infer<typeof CharacterReferenceSchema>;

// Prompt versioning system
export interface PromptVersion {
  id: string;
  version: string;
  template: string;
  successRate: number;
  avgQualityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Quality scoring criteria
export interface QualityScore {
  characterConsistency: number; // 0-10
  artQuality: number; // 0-10
  storyAlignment: number; // 0-10
  technicalExecution: number; // 0-10
  childAppropriate: number; // 0-10
  overall: number; // calculated average
}

// Import ultra prompts
import { generateUltraPrompt, enhanceChildDescription } from './ultra-image-prompts';

// Enhanced prompt templates with versioning
export const PROMPT_TEMPLATES = {
  v3_ultra_quality: {
    id: 'ultra_quality_v3',
    version: '3.0',
    template: `PLACEHOLDER - Use generateUltraPrompt instead`,
    useUltraGenerator: true
  },
  
  v1_ultraConsistent: {
    id: 'ultra_consistent_v1',
    version: '1.0',
    template: `
ULTRA-HIGH QUALITY CHILDREN'S BOOK ILLUSTRATION

[CRITICAL CHARACTER REFERENCE - MUST MATCH EXACTLY]:
{characterDescription}

[SCENE DESCRIPTION]:
{sceneDescription}

[TECHNICAL REQUIREMENTS]:
1. ILLUSTRATION QUALITY:
   - Professional children's book standard (think Pixar/DreamWorks quality)
   - Rich, vibrant colors with perfect color theory application
   - Exceptional detail and polish in every element
   - Studio-quality lighting with {lightingStyle}
   - Perfect composition following rule of thirds
   - Clear focal point with the child as the hero

2. CHARACTER CONSISTENCY (ABSOLUTE PRIORITY):
   - Face MUST be IDENTICAL to reference: {faceDetails}
   - Hair MUST match EXACTLY: {hairDetails}
   - Skin tone MUST be PRECISELY: {skinTone}
   - Body proportions MUST remain: {bodyDetails}
   - Expression should be {expressionGuide} while maintaining facial structure
   - Character should be wearing {outfit} (can vary by scene but style consistent)
   - CRITICAL: This is image {pageNumber} of {totalPages} - maintain EXACT appearance from previous pages

3. ART STYLE SPECIFICATIONS:
   - {artStyleDetails}
   - Consistent with high-end children's book illustrations
   - Smooth, polished rendering without rough edges
   - Professional color grading and atmosphere
   - Depth and dimension through expert use of perspective

4. SCENE REQUIREMENTS:
   - Clear storytelling that shows {storyMoment}
   - Age-appropriate for {ageRange} year old audience
   - Educational value through {learningElement}
   - Engaging composition that draws the eye
   - Background that enhances but doesn't distract

5. CONSISTENCY MARKERS:
   - Lighting angle: {lightingAngle} (same across all pages)
   - Color temperature: {colorTemp} (consistent mood)
   - Detail level: {detailLevel} (uniform quality)
   - Perspective: {perspectiveType} (maintain viewpoint)

[ABSOLUTE RESTRICTIONS]:
- NO text, letters, words, or symbols anywhere
- NO multiple versions of the same character
- NO inconsistencies with previous pages
- NO amateur or sketch-like elements
- NO inappropriate content or themes
- NO cluttered or confusing compositions

[QUALITY BENCHMARK]:
This illustration should be indistinguishable from a professionally published children's book by a major publisher. Think "Where the Wild Things Are" meets modern Pixar quality.
    `,
    useUltraGenerator: false
  },
  
  v2_studioGhibli: {
    id: 'studio_ghibli_v2',
    version: '2.0',
    template: `
STUDIO GHIBLI-INSPIRED MASTERPIECE ILLUSTRATION

[CHARACTER SHEET - EXACT MATCH REQUIRED]:
{characterDescription}

[GHIBLI SCENE MAGIC]:
{sceneDescription}

[ARTISTIC EXCELLENCE REQUIREMENTS]:

1. STUDIO GHIBLI AESTHETIC:
   - Hayao Miyazaki's distinctive art style
   - Soft, dreamlike quality with watercolor influences
   - Masterful use of light and shadow
   - Rich, natural backgrounds with incredible detail
   - Warm, inviting color palette with subtle gradients
   - Hand-painted texture and organic feel

2. CHARACTER RENDERING (MUST BE IDENTICAL ACROSS ALL PAGES):
   - Facial structure: {detailedFaceStructure}
   - Eye details: Large, expressive eyes with {eyeSpecifics}
   - Hair rendering: {hairRenderingDetails} with Ghibli-style flow
   - Skin: {skinRenderingNotes} with soft, natural shading
   - Proportions: Slightly stylized but maintaining {characterProportions}
   - This is page {pageNumber}/{totalPages} - reference previous pages for EXACT match

3. ENVIRONMENT & ATMOSPHERE:
   - Lush, detailed backgrounds with depth
   - Natural elements rendered with love and care
   - Atmospheric perspective and color shifts
   - Magical realism elements where appropriate
   - Weather and lighting that enhance mood: {moodLighting}

4. TECHNICAL MASTERY:
   - Resolution suitable for 4K printing
   - Perfect balance of detail and readability
   - Clear visual hierarchy
   - Smooth gradients and transitions
   - No digital artifacts or harsh edges

[STORY MOMENT CAPTURE]:
- Central action: {storyAction}
- Emotional tone: {emotionalContext}
- Learning moment: {educationalAspect}
- Character expression: {expressionDetails}

[CONTINUITY CHECKLIST]:
✓ Same exact facial features as page 1
✓ Identical hair color and style
✓ Consistent skin tone and shading style
✓ Same character proportions
✓ Matching art style and quality
✓ Unified color palette and lighting

[NEVER INCLUDE]:
- Text or writing of any kind
- Multiple character copies
- Style inconsistencies
- Digital/CGI look (maintain hand-painted feel)
- Dark or scary elements
    `
  }
};

// Enhanced image generation function
export async function generateEnhancedImage(
  characterRef: CharacterReference,
  sceneDescription: string,
  pageNumber: number,
  totalPages: number,
  artStyle: string,
  promptVersion: string = 'v3_ultra_quality'
): Promise<{prompt: string, metadata: Record<string, unknown>}> {
  
  const template = PROMPT_TEMPLATES[promptVersion as keyof typeof PROMPT_TEMPLATES];
  if (!template) {
    throw new Error(`Invalid prompt version: ${promptVersion}`);
  }
  
  // Check if we should use the ultra generator
  if (template.useUltraGenerator || promptVersion === 'v3_ultra_quality') {
    // Build enhanced character description
    const characterDescription = buildDetailedCharacterDescription(characterRef);
    const enhancedDescription = enhanceChildDescription(characterDescription);
    
    // Map art styles
    const styleMap: Record<string, 'studio_ghibli' | 'pixar_disney' | 'watercolor_masterpiece'> = {
      'studio_ghibli': 'studio_ghibli',
      'cartoon': 'pixar_disney',
      'digital_art': 'pixar_disney',
      'watercolor': 'watercolor_masterpiece',
      'illustration': 'pixar_disney'
    };
    
    const ultraStyle = styleMap[artStyle] || 'pixar_disney';
    
    // Generate ultra quality prompt
    const prompt = generateUltraPrompt(
      enhancedDescription,
      sceneDescription,
      ultraStyle,
      pageNumber,
      totalPages,
      pageNumber > 1 ? 'Character established in previous pages' : undefined
    );
    
    return {
      prompt,
      metadata: {
        promptVersion: '3.0',
        templateId: 'ultra_quality_v3',
        characterRefId: `${characterRef.name}_${characterRef.age}`,
        pageNumber,
        totalPages,
        ultraQuality: true,
        artStyle: ultraStyle,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Original template-based generation (fallback)
  const characterDescription = buildDetailedCharacterDescription(characterRef);
  const faceDetails = buildFaceDetails(characterRef);
  const hairDetails = buildHairDetails(characterRef);
  const skinTone = characterRef.face.complexion;
  const bodyDetails = buildBodyDetails(characterRef);
  
  // Fill in the template
  const prompt = template.template
    .replace('{characterDescription}', characterDescription)
    .replace('{sceneDescription}', sceneDescription)
    .replace('{faceDetails}', faceDetails)
    .replace('{hairDetails}', hairDetails)
    .replace('{skinTone}', skinTone)
    .replace('{bodyDetails}', bodyDetails)
    .replace('{pageNumber}', pageNumber.toString())
    .replace('{totalPages}', totalPages.toString())
    .replace('{artStyleDetails}', getArtStyleDetails(artStyle))
    .replace('{lightingStyle}', characterRef.styleGuide.lightingNotes)
    .replace('{ageRange}', characterRef.age.toString())
    .replace('{lightingAngle}', 'consistent 45-degree soft key light from top-left')
    .replace('{colorTemp}', 'warm 5500K')
    .replace('{detailLevel}', 'high - every element carefully rendered')
    .replace('{perspectiveType}', characterRef.styleGuide.perspectiveNotes);
  
  return {
    prompt,
    metadata: {
      promptVersion: template.version,
      templateId: template.id,
      characterRefId: `${characterRef.name}_${characterRef.age}`,
      pageNumber,
      totalPages,
      timestamp: new Date().toISOString()
    }
  };
}

// Helper functions for building detailed descriptions
export function buildDetailedCharacterDescription(ref: CharacterReference): string {
  return `${ref.name}, a ${ref.age}-year-old child with ${ref.face.shape} face, ${ref.face.complexion} skin tone, ${ref.eyes.color} ${ref.eyes.shape} eyes that are ${ref.eyes.size} with ${ref.eyes.expression} expression, ${ref.eyes.eyebrows.thickness} ${ref.eyes.eyebrows.shape} ${ref.eyes.eyebrows.color} eyebrows, ${ref.nose.shape} ${ref.nose.size} nose, ${ref.mouth.lipShape} lips in ${ref.mouth.lipColor} showing ${ref.mouth.smile}, ${ref.hair.texture} ${ref.hair.color} hair that is ${ref.hair.length} styled in ${ref.hair.style}, ${ref.build.height} height with ${ref.build.bodyType} build`;
}

function buildFaceDetails(ref: CharacterReference): string {
  return `${ref.face.shape} face shape, ${ref.eyes.shape} eyes spaced normally, ${ref.nose.shape} nose, ${ref.mouth.lipShape} lips, ${ref.face.distinctiveMarks?.join(', ') || 'no distinctive marks'}`;
}

function buildHairDetails(ref: CharacterReference): string {
  return `${ref.hair.texture} texture, ${ref.hair.color} color, ${ref.hair.length} length, ${ref.hair.style} style, ${ref.hair.volume} volume`;
}

function buildBodyDetails(ref: CharacterReference): string {
  return `${ref.build.height} for age, ${ref.build.bodyType} build, ${ref.build.posture}`;
}

function getArtStyleDetails(style: string): string {
  const styles: Record<string, string> = {
    cartoon: 'Modern animation style like Pixar/Disney with vibrant colors, smooth shading, and appealing character design',
    watercolor: 'Traditional watercolor painting with soft edges, color bleeds, visible brush strokes, and dreamy atmosphere',
    digital_art: 'Polished digital illustration with clean lines, gradient shading, modern color palette, professional finish',
    illustration: 'Classic children&apos;s book illustration style with warm colors, friendly appearance, hand-drawn quality',
    studio_ghibli: 'Hayao Miyazaki inspired art with soft colors, detailed backgrounds, ethereal quality, hand-painted aesthetic'
  };
  
  return styles[style] || styles.illustration;
}

// Cache for character references to ensure consistency
export class CharacterReferenceCache {
  private cache: Map<string, CharacterReference> = new Map();
  
  set(storyId: string, reference: CharacterReference): void {
    this.cache.set(storyId, reference);
  }
  
  get(storyId: string): CharacterReference | undefined {
    return this.cache.get(storyId);
  }
  
  has(storyId: string): boolean {
    return this.cache.has(storyId);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Quality scoring function
export function scoreImageQuality(
  imageUrl: string,
  expectedCharacterRef: CharacterReference,
  sceneDescription: string
): QualityScore {
  // In a real implementation, this would use computer vision APIs
  // For now, returning a placeholder
  return {
    characterConsistency: 0,
    artQuality: 0,
    storyAlignment: 0,
    technicalExecution: 0,
    childAppropriate: 0,
    overall: 0
  };
}

// Export singleton cache instance
export const characterCache = new CharacterReferenceCache();