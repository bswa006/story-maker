// Enhanced prompt generation with story continuity

import { ArtStyleId } from './art-styles-system';
import { StoryVisualContext } from './story-continuity-system';

export interface ContinuityEnhancedPromptOptions {
  storyContext: StoryVisualContext;
  artStyle: ArtStyleId;
  pageNumber: number;
  totalPages: number;
  basePrompt: string;
  characterDescription: string;
  previousPagePrompt?: string;
  isFirstPage?: boolean;
  isLastPage?: boolean;
}

// Story templates for different themes
const STORY_WORLD_TEMPLATES = {
  fantasy: {
    worldDescription: 'a magical kingdom with castles, enchanted forests, and mystical creatures',
    atmosphereWords: ['magical', 'enchanted', 'mystical', 'ethereal', 'wondrous'],
    avoidWords: ['modern', 'technology', 'cars', 'phones', 'computers'],
    colorPalettes: {
      studio_ghibli: 'soft pastels with magical glows, deep forest greens, sky blues',
      disney_pixar_3d: 'vibrant jewel tones, golden accents, rich purples and blues',
      classic_fairytale: 'muted vintage colors with gold leaf accents'
    }
  },
  realistic: {
    worldDescription: 'a modern suburban neighborhood with cozy homes and friendly community',
    atmosphereWords: ['warm', 'familiar', 'comfortable', 'everyday', 'relatable'],
    avoidWords: ['magical', 'fantasy', 'dragons', 'castles', 'impossible'],
    colorPalettes: {
      watercolor_illustration: 'soft natural tones, gentle pastels',
      disney_pixar_3d: 'bright, cheerful colors with natural lighting',
      chibi_kawaii: 'pastel rainbow with pink and mint accents'
    }
  },
  adventure: {
    worldDescription: 'diverse landscapes from mountains to oceans, full of discovery',
    atmosphereWords: ['exciting', 'dynamic', 'vast', 'unexplored', 'thrilling'],
    avoidWords: ['boring', 'static', 'confined', 'ordinary'],
    colorPalettes: {
      dreamworks_animation: 'dramatic contrasts, sunset oranges, ocean blues',
      studio_ghibli: 'natural earth tones with dramatic sky colors',
      disney_pixar_3d: 'vibrant nature colors, bright and saturated'
    }
  }
};

export function generateContinuityEnhancedPrompt(options: ContinuityEnhancedPromptOptions): string {
  const {
    storyContext,
    artStyle,
    pageNumber,
    totalPages,
    basePrompt,
    characterDescription,
    previousPagePrompt,
    isFirstPage,
    isLastPage
  } = options;
  
  // Get world template
  const worldTemplate = STORY_WORLD_TEMPLATES[storyContext.storyTheme] || STORY_WORLD_TEMPLATES.realistic;
  const colorPalette = worldTemplate.colorPalettes[artStyle] || worldTemplate.colorPalettes.disney_pixar_3d;
  
  let enhancedPrompt = '';
  
  // 1. Story continuity context (natural language)
  enhancedPrompt += `Page ${pageNumber} of ${totalPages} in a ${storyContext.storyTheme} children's story. `;
  enhancedPrompt += `The entire story takes place in ${worldTemplate.worldDescription}. `;
  
  // 2. Character consistency (natural description)
  enhancedPrompt += `The main character ${storyContext.mainCharacter.name} appears in this scene. `;
  enhancedPrompt += `${storyContext.mainCharacter.name} is ${characterDescription}. `;
  
  // Build consistent features into natural description
  if (storyContext.mainCharacter.consistentFeatures.length > 0) {
    enhancedPrompt += `CRITICAL CHARACTER CONSISTENCY: This is ${storyContext.mainCharacter.name}, the SAME child from all previous pages. They MUST have EXACTLY these unchangeable features: `;
    enhancedPrompt += storyContext.mainCharacter.consistentFeatures.join(', ') + '. ';
    enhancedPrompt += `Even in ${artStyle.replace(/_/g, ' ')} style, these features must remain identical. `;
  }
  
  // 3. Setting and atmosphere (flowing description)
  enhancedPrompt += `The scene is set in ${storyContext.setting.world} during ${storyContext.setting.timeOfDay} in ${storyContext.setting.season}. `;
  enhancedPrompt += `The atmosphere is ${storyContext.setting.atmosphere}. `;
  enhancedPrompt += `Use a ${colorPalette} color scheme. `;
  
  // 4. Page-specific context
  if (isFirstPage) {
    enhancedPrompt += `This is the opening scene of the story, showing ${storyContext.mainCharacter.name} clearly to establish their appearance. `;
  } else if (isLastPage) {
    enhancedPrompt += `This is the final scene of the story. The character and setting remain exactly as established. `;
  } else {
    if (previousPagePrompt) {
      enhancedPrompt += `This scene continues from the previous page where ${previousPagePrompt.substring(0, 80)}. `;
    }
  }
  
  // 5. The actual scene (most important part)
  // Make sure the base prompt doesn't have problematic formatting
  const cleanedBasePrompt = basePrompt
    .replace(/SCENE:\s*/gi, '') // Remove SCENE: prefix if present
    .replace(/\[.*?\]/g, '') // Remove any bracketed content
    .trim();
  enhancedPrompt += `\n\n${cleanedBasePrompt}\n\n`;
  
  // 6. Style requirements (natural language)
  enhancedPrompt += `Illustrated in ${artStyle.replace(/_/g, ' ')} style with ${storyContext.visualStyle.lightingStyle} lighting and a ${storyContext.visualStyle.moodTone} mood. `;
  
  // Special handling for styles that tend to override character features
  if (artStyle === 'chibi_kawaii' || artStyle === 'disney_pixar_3d') {
    enhancedPrompt += `IMPORTANT: While using ${artStyle.replace(/_/g, ' ')} style, maintain the exact individual identity of ${storyContext.mainCharacter.name}. `;
    enhancedPrompt += `This is NOT a generic ${artStyle.replace(/_/g, ' ')} character, but specifically ${storyContext.mainCharacter.name} rendered in this style. `;
  }
  
  // 7. Important notes (natural language)
  if (worldTemplate.avoidWords.length > 0) {
    enhancedPrompt += `This ${storyContext.storyTheme} story should not include any ${worldTemplate.avoidWords.join(', ')}. `;
  }
  enhancedPrompt += `Maintain perfect consistency with the character's established appearance throughout.`;
  
  // Clean up any remaining structured formatting
  enhancedPrompt = enhancedPrompt
    .replace(/\[.*?\]/g, '') // Remove any bracketed content
    .replace(/\n{3,}/g, '\n\n') // Limit multiple newlines
    .trim();
  
  return enhancedPrompt;
}

// Helper to build progressive story context
export function buildProgressiveContext(
  pages: Array<{ pageNumber: number; text: string; imagePrompt: string }>,
  currentPageIndex: number
): string {
  let context = '';
  
  // Include context from previous pages
  if (currentPageIndex > 0) {
    const previousPage = pages[currentPageIndex - 1];
    context += `Previous scene (Page ${previousPage.pageNumber}): ${previousPage.imagePrompt}\n`;
  }
  
  // Include hint about next page
  if (currentPageIndex < pages.length - 1) {
    const nextPage = pages[currentPageIndex + 1];
    context += `Upcoming scene hint: This should naturally lead to ${nextPage.imagePrompt.substring(0, 50)}...\n`;
  }
  
  return context;
}

// Create a consistent character reference that persists across all pages
export function createConsistentCharacterReference(
  childName: string,
  childDescription: string,
  age: string
): string {
  // Parse and standardize the description
  const features = [];
  
  // Extract and standardize hair
  const hairMatch = childDescription.match(/(\w+)\s+hair/i);
  if (hairMatch) {
    features.push(`${hairMatch[1].toLowerCase()} hair styled the same way throughout`);
  }
  
  // Extract and standardize eyes
  const eyeMatch = childDescription.match(/(\w+)\s+eyes/i);
  if (eyeMatch) {
    features.push(`${eyeMatch[1].toLowerCase()} eyes`);
  }
  
  // Extract clothing
  const clothingMatch = childDescription.match(/(wearing\s+)?([\w\s]+\s+)(dress|shirt|outfit|clothes)/i);
  if (clothingMatch) {
    features.push(`always wearing the same ${clothingMatch[2]}${clothingMatch[3]}`);
  }
  
  // Extract skin tone if mentioned
  const skinMatch = childDescription.match(/(fair|dark|brown|tan|olive)\s+skin/i);
  if (skinMatch) {
    features.push(`${skinMatch[1].toLowerCase()} skin tone`);
  }
  
  // Extract distinctive features
  const glassesMatch = childDescription.match(/glasses/i);
  if (glassesMatch) {
    features.push('glasses');
  }
  
  // Build consistent reference with stronger emphasis
  return `${childName}, a ${age} year old child with ${features.join(', ')}. CRITICAL: This EXACT child with these EXACT features must appear in EVERY image. Not a similar child, but the SAME individual child named ${childName}.`;
}