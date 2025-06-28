// DALL-E 3 Optimized Prompts - Direct and Forceful for Better Results

export function createDALLEOptimizedPrompt(
  basePrompt: string,
  style: 'studio_ghibli' | 'pixar_disney' | 'watercolor_masterpiece'
): string {
  // DALL-E 3 responds better to direct, specific instructions at the beginning
  
  const stylePresets = {
    studio_ghibli: `Studio Ghibli movie screenshot, Hayao Miyazaki art style, hand-painted watercolor, soft pastel colors, dreamy atmosphere like Spirited Away or My Neighbor Totoro`,
    pixar_disney: `Pixar 3D animation movie still, Disney quality, vibrant colors, professional CGI rendering like Encanto or Moana`,
    watercolor_masterpiece: `Traditional watercolor painting, children's book illustration, Quentin Blake style, soft brushstrokes, museum quality artwork`
  };
  
  const qualityBoost = `masterpiece, best quality, ultra detailed, professional artwork, award winning illustration`;
  
  // DALL-E 3 specific format that works better
  return `${stylePresets[style]}, ${qualityBoost}. ${basePrompt}. Children's book illustration, no text or words anywhere in the image.`;
}

export function simplifyCharacterDescription(complexDescription: string): string {
  // DALL-E 3 works better with simpler, more direct character descriptions
  // Extract key features only
  
  // This would parse the complex description and return something like:
  // "young girl with brown hair in pigtails, brown eyes, yellow dress"
  // instead of ultra-detailed descriptions that DALL-E might ignore
  
  // For now, return a simplified version
  const lines = complexDescription.split(',').slice(0, 5).join(',');
  return lines;
}

export function createDirectDALLEPrompt(
  childName: string,
  childDescription: string,
  sceneDescription: string,
  pageNumber: number,
  style: 'studio_ghibli' | 'pixar_disney' | 'watercolor_masterpiece'
): string {
  // DALL-E 3 format that actually works
  const simplifiedChild = simplifyCharacterDescription(childDescription);
  
  const styleMap = {
    studio_ghibli: 'Studio Ghibli anime style by Hayao Miyazaki',
    pixar_disney: 'Pixar 3D animation style',
    watercolor_masterpiece: 'Watercolor children\'s book illustration'
  };
  
  // Direct, clear, and simple - what DALL-E 3 actually responds to
  return `${styleMap[style]}, masterpiece quality. A ${simplifiedChild}. ${sceneDescription}. Beautiful children's book illustration with rich details and professional quality. No text.`;
}

// Test if prompts are too long (DALL-E has limits)
export function validatePromptLength(prompt: string): {
  valid: boolean;
  length: number;
  recommended: string;
} {
  const MAX_LENGTH = 4000; // DALL-E 3 has a 4000 character limit
  
  if (prompt.length <= MAX_LENGTH) {
    return { valid: true, length: prompt.length, recommended: prompt };
  }
  
  // Truncate and keep the most important parts
  const truncated = prompt.substring(0, MAX_LENGTH - 50) + '... Professional quality illustration.';
  return { 
    valid: false, 
    length: prompt.length, 
    recommended: truncated 
  };
}