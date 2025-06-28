// Ultra-high quality image generation prompts for 10/10 results

export const ULTRA_QUALITY_STYLES = {
  studio_ghibli: {
    base: `A beautiful illustration in the style of Studio Ghibli anime films, with the artistic quality of Hayao Miyazaki's work. The image should have a hand-painted watercolor appearance with soft, dreamy colors and ethereal lighting. Rich, detailed backgrounds with lush nature elements. Characters should have gentle, expressive features with large eyes in the distinctive Ghibli style. The overall atmosphere should be magical yet grounded, with warm, muted colors and masterful use of light and shadow. Professional anime movie quality artwork.`,
    
    technical: `TECHNICAL SPECIFICATIONS:
    - Ultra high resolution 4K quality artwork
    - Professional movie poster quality illustration
    - Perfect color harmony and atmospheric perspective
    - No CGI or digital look - must appear hand-painted
    - Smooth, professional finish without amateur elements
    - Gallery-worthy artistic quality`
  },
  
  pixar_disney: {
    base: `PIXAR/DISNEY 3D ANIMATION STYLE - EXACTLY like Encanto, Moana, or Turning Red:
    - Highly polished 3D rendered appearance
    - Vibrant, saturated colors with perfect lighting
    - Expressive character animation with appeal
    - Subsurface scattering on skin for realistic glow
    - Professional character design with clear silhouettes
    - Rich textures and materials (fabric, hair, skin)
    - Cinematic depth of field and composition
    - Warm, inviting atmosphere
    - Perfect technical execution`,
    
    technical: `RENDERING QUALITY:
    - Photorealistic 3D rendering quality
    - Ray-traced lighting and shadows
    - High-quality anti-aliasing
    - Professional color grading
    - Movie production quality`
  },
  
  watercolor_masterpiece: {
    base: `PROFESSIONAL WATERCOLOR ILLUSTRATION - Museum quality children's book art:
    - Traditional watercolor painting techniques
    - Visible paper texture and paint bleeds
    - Layered washes creating depth
    - Delicate color transitions and wet-on-wet effects
    - Professional artist's hand evident in brushwork
    - Sophisticated color mixing and harmony
    - Areas of detail contrasted with loose washes
    - Light, airy feeling with breathing room
    - Gallery exhibition quality`,
    
    technical: `ARTISTIC QUALITY:
    - Master watercolorist level execution
    - Perfect color theory application
    - Professional illustration standards
    - Print-ready resolution and clarity
    - Award-winning children's book quality`
  }
};

export function generateUltraPrompt(
  characterDescription: string,
  sceneDescription: string,
  styleChoice: keyof typeof ULTRA_QUALITY_STYLES,
  pageNumber: number,
  totalPages: number,
  previousImageReference?: string
): string {
  const style = ULTRA_QUALITY_STYLES[styleChoice];
  
  // More concise, DALL-E 3 friendly prompt structure
  return `${style.base}

Character: ${characterDescription}
${pageNumber > 1 ? 'IMPORTANT: This character must look exactly the same as in previous pages - same face, hair, and features.' : ''}

Scene: ${sceneDescription}

The character should be the main focus, clearly visible in the scene. Professional children's book illustration quality with beautiful composition and lighting. No text or words in the image.`;
}

export function enhanceChildDescription(basicDescription: string): string {
  // Keep it concise for DALL-E 3
  return basicDescription.trim();
}

// Specific prompts for common scenes to ensure quality
export const SCENE_QUALITY_ENHANCERS = {
  magical_forest: `
    - Ancient trees with twisted roots and glowing moss
    - Shafts of golden sunlight filtering through leaves
    - Floating particles of light and magic in the air
    - Rich undergrowth with fantastical plants and flowers
    - Depth created through layers of foliage
    - Mystical atmosphere without being scary`,
    
  cozy_bedroom: `
    - Warm, inviting space with soft lighting
    - Personal details that show character's interests
    - Textured fabrics and comfortable furnishings
    - Window showing time of day/weather outside
    - Lived-in feeling with authentic details
    - Safe, nurturing atmosphere`,
    
  adventure_landscape: `
    - Epic vista with multiple layers of depth
    - Dramatic but child-friendly environment
    - Clear path for the character's journey
    - Weather and lighting that enhance mood
    - Sense of wonder and possibility
    - Professional matte painting quality`,
    
  underwater_world: `
    - Crystal clear water with caustic light effects
    - Colorful coral and sea life
    - Bubbles and water movement
    - Dreamy, ethereal atmosphere
    - Rich blues and aqua tones
    - Magical underwater lighting`
};

// Function to analyze why current images are low quality
export function diagnoseImageQuality(currentPrompt: string): string[] {
  const issues = [];
  
  if (!currentPrompt.includes('Studio Ghibli') && !currentPrompt.includes('Pixar')) {
    issues.push('No specific high-quality style reference');
  }
  
  if (!currentPrompt.includes('4K') && !currentPrompt.includes('high resolution')) {
    issues.push('No quality specifications');
  }
  
  if (!currentPrompt.includes('masterpiece') && !currentPrompt.includes('professional')) {
    issues.push('No quality benchmarks set');
  }
  
  if (currentPrompt.length < 500) {
    issues.push('Prompt too short - needs more detail');
  }
  
  if (!currentPrompt.includes('must be identical') && !currentPrompt.includes('exact same')) {
    issues.push('Weak character consistency requirements');
  }
  
  return issues;
}