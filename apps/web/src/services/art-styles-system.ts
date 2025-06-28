// Comprehensive Art Styles System for Children's Storybook Generator

export type ArtStyleId = 
  | 'studio_ghibli' 
  | 'disney_pixar_3d' 
  | 'watercolor_illustration' 
  | 'chibi_kawaii' 
  | 'dreamworks_animation' 
  | 'classic_fairytale';

export interface ArtStyle {
  id: ArtStyleId;
  name: string;
  description: string;
  basePrompt: string;
  styleElements: {
    lighting: string;
    texture: string;
    color: string;
    atmosphere: string;
    character: string;
    background: string;
  };
  magicalElements: string[];
  technicalSpecs: string;
  negativePrompt: string;
  dalleStyle: 'vivid' | 'natural';
}

export const ART_STYLES: Record<ArtStyleId, ArtStyle> = {
  studio_ghibli: {
    id: 'studio_ghibli',
    name: 'Studio Ghibli',
    description: 'Hand-painted watercolor anime with magical realism',
    basePrompt: 'Studio Ghibli anime film still by Hayao Miyazaki, hand-painted watercolor',
    styleElements: {
      lighting: 'soft golden hour light with volumetric god rays, ethereal glow',
      texture: 'visible brushstrokes, watercolor paper texture, paint bleeding',
      color: 'muted earthy tones with magical glows, soft pastels',
      atmosphere: 'dreamlike, nostalgic, filled with wonder and magic',
      character: 'expressive eyes, flowing hair, gentle features',
      background: 'lush detailed nature, impossible architecture, floating elements'
    },
    magicalElements: [
      'kodama spirits',
      'floating particles of light',
      'wind spirits',
      'glowing mushrooms',
      'cherry blossoms falling upward',
      'tiny forest creatures'
    ],
    technicalSpecs: 'professional anime film quality, museum-worthy artwork',
    negativePrompt: 'NOT cartoon, NOT clipart, NOT simple, NOT CGI',
    dalleStyle: 'vivid'
  },

  disney_pixar_3d: {
    id: 'disney_pixar_3d',
    name: 'Disney/Pixar 3D',
    description: 'Vibrant 3D animation with expressive characters and rich environments',
    basePrompt: 'Disney Pixar 3D animation movie still, ultra high quality CGI render',
    styleElements: {
      lighting: 'cinematic lighting with rim lights, subsurface scattering, ambient occlusion',
      texture: 'high-poly 3D models, realistic fabric and hair simulation',
      color: 'vibrant saturated colors, complementary color schemes',
      atmosphere: 'joyful, energetic, emotionally engaging',
      character: 'exaggerated expressions, appealing design, perfect proportions',
      background: 'fully realized 3D environments, atmospheric depth'
    },
    magicalElements: [
      'sparkling magic dust',
      'glowing particle effects',
      'rainbow light trails',
      'floating bubbles',
      'twinkling stars',
      'magical sparkles'
    ],
    technicalSpecs: 'Renderman quality, ray-traced lighting, 8K resolution',
    negativePrompt: 'NOT 2D, NOT flat, NOT low quality',
    dalleStyle: 'vivid'
  },

  watercolor_illustration: {
    id: 'watercolor_illustration',
    name: 'Watercolor Illustration',
    description: 'Traditional children\'s book art with soft, dreamy watercolor techniques',
    basePrompt: 'Traditional watercolor children\'s book illustration, Beatrix Potter style',
    styleElements: {
      lighting: 'soft diffused natural light, gentle shadows',
      texture: 'visible watercolor paper grain, paint bleeds, wet-on-wet effects',
      color: 'soft pastels, transparent washes, delicate color mixing',
      atmosphere: 'gentle, dreamy, nostalgic, timeless',
      character: 'soft edges, loose brushwork, charming simplicity',
      background: 'layered washes, negative space, impressionistic details'
    },
    magicalElements: [
      'floating dandelion seeds',
      'butterfly trails',
      'morning dew sparkles',
      'soft light halos',
      'flower petals in breeze',
      'gentle mist'
    ],
    technicalSpecs: 'professional illustration quality, gallery-worthy artwork',
    negativePrompt: 'NOT digital, NOT harsh lines, NOT oversaturated',
    dalleStyle: 'natural'
  },

  chibi_kawaii: {
    id: 'chibi_kawaii',
    name: 'Chibi/Kawaii',
    description: 'Super cute style with big eyes and adorable proportions',
    basePrompt: 'Kawaii chibi art style, ultra cute children\'s illustration, big sparkly eyes',
    styleElements: {
      lighting: 'bright cheerful lighting, soft shadows, sparkle highlights',
      texture: 'smooth digital art, cel-shaded style',
      color: 'pastel rainbow palette, pink and mint accents',
      atmosphere: 'overwhelmingly cute, happy, playful',
      character: 'huge eyes, tiny body, blushing cheeks, simplified features',
      background: 'pattern-filled, decorative elements, hearts and stars'
    },
    magicalElements: [
      'heart bubbles',
      'star sparkles',
      'rainbow trails',
      'cute cloud friends',
      'flower crowns',
      'magical girl effects'
    ],
    technicalSpecs: 'professional kawaii art, perfect proportions',
    negativePrompt: 'NOT realistic, NOT scary, NOT detailed anatomy',
    dalleStyle: 'vivid'
  },

  dreamworks_animation: {
    id: 'dreamworks_animation',
    name: 'DreamWorks Animation',
    description: 'Stylized 3D with exaggerated features and dynamic cinematography',
    basePrompt: 'DreamWorks Animation style 3D movie still, How to Train Your Dragon quality',
    styleElements: {
      lighting: 'dramatic cinematic lighting, strong key light, atmospheric fog',
      texture: 'stylized 3D rendering, painterly textures',
      color: 'rich color grading, dramatic contrasts',
      atmosphere: 'epic, adventurous, emotionally powerful',
      character: 'expressive faces, dynamic poses, unique proportions',
      background: 'cinematic vistas, atmospheric perspective, epic scale'
    },
    magicalElements: [
      'dragon fire effects',
      'magical auroras',
      'glowing runes',
      'swirling energy',
      'epic light beams',
      'mystical fog'
    ],
    technicalSpecs: 'cinematic quality, motion picture standards',
    negativePrompt: 'NOT flat, NOT amateur, NOT low budget',
    dalleStyle: 'vivid'
  },

  classic_fairytale: {
    id: 'classic_fairytale',
    name: 'Classic Fairytale',
    description: 'Traditional storybook illustration with ornate details and vintage charm',
    basePrompt: 'Classic fairytale illustration, Arthur Rackham and Edmund Dulac style',
    styleElements: {
      lighting: 'warm golden light, dramatic chiaroscuro',
      texture: 'detailed line work, cross-hatching, aged paper feel',
      color: 'muted vintage palette, sepia undertones, jewel accents',
      atmosphere: 'magical, mysterious, timeless, enchanting',
      character: 'elegant proportions, detailed costumes, expressive linework',
      background: 'intricate details, Art Nouveau influences, decorative borders'
    },
    magicalElements: [
      'fairy dust trails',
      'enchanted roses',
      'mystical symbols',
      'golden threads of fate',
      'magical books',
      'crystal orbs'
    ],
    technicalSpecs: 'museum-quality illustration, fine art standards',
    negativePrompt: 'NOT modern, NOT minimalist, NOT cartoon',
    dalleStyle: 'natural'
  }
};

// Helper function to get art style by ID
export function getArtStyle(styleId: ArtStyleId): ArtStyle {
  return ART_STYLES[styleId];
}

// Function to create style-specific prompts
export function createStyledPrompt(
  styleId: ArtStyleId,
  childDescription: string,
  sceneDescription: string,
  includesMagic: boolean = true
): string {
  const style = getArtStyle(styleId);
  
  // Select random magical elements
  const magicalElements = includesMagic 
    ? style.magicalElements
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .join(', ')
    : '';
  
  const prompt = `${style.basePrompt}. ${childDescription} in ${sceneDescription}. 
    
VISUAL STYLE: ${style.styleElements.atmosphere}. ${style.styleElements.lighting}. 
${style.styleElements.texture}. ${style.styleElements.color}.

CHARACTER: ${style.styleElements.character}. 
BACKGROUND: ${style.styleElements.background}.
${includesMagic ? `MAGICAL ELEMENTS: ${magicalElements}.` : ''}

${style.technicalSpecs}. Children's storybook illustration. ${style.negativePrompt}.`;

  return prompt.trim();
}

// Function to get optimal DALL-E parameters for each style
export function getStyleParameters(styleId: ArtStyleId): {
  model: string;
  size: string;
  quality: string;
  style: 'vivid' | 'natural';
} {
  const artStyle = getArtStyle(styleId);
  
  return {
    model: 'dall-e-3',
    size: '1024x1024',
    quality: 'standard', // Change to 'hd' for production
    style: artStyle.dalleStyle
  };
}

// Export all available art style options for UI
export const ART_STYLE_OPTIONS = Object.values(ART_STYLES).map(style => ({
  value: style.id,
  label: style.name,
  description: style.description
}));