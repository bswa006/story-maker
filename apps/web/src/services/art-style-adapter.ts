// Art Style Adapter - Applies art styles without overriding story elements

import { ArtStyleId } from './art-styles-system';
import { SceneElements } from './scene-element-extractor';

// Style-specific adaptations that preserve story settings
export const STYLE_SETTING_ADAPTATIONS: Record<ArtStyleId, Record<string, string>> = {
  studio_ghibli: {
    underwater: 'underwater ocean scene in Studio Ghibli style like Ponyo, with magical sea creatures, flowing water animation, bioluminescent coral',
    ocean: 'vast ocean in Ghibli style with rolling waves like Ponyo, seabirds, distant islands',
    forest: 'enchanted Ghibli forest like Princess Mononoke with ancient trees, dappled sunlight, forest spirits',
    home: 'cozy home interior like My Neighbor Totoro, warm lighting, lived-in details',
    sky: 'expansive Ghibli sky like Castle in the Sky, dramatic clouds, sense of wonder',
    city: 'bustling town like Spirited Away, traditional architecture mixed with modern elements',
  },
  
  disney_pixar_3d: {
    underwater: 'vibrant underwater world like Finding Nemo, crystal clear water, colorful coral reef, schools of fish',
    ocean: 'Pixar ocean with stylized waves like Moana, sparkling water, volumetric lighting',
    forest: '3D animated forest like Brave, lush foliage, rays of light through trees',
    home: 'warm Pixar home interior like Toy Story, soft lighting, familiar objects',
    sky: 'Pixar sky with fluffy clouds like Up, bright blue atmosphere, lens flares',
    city: 'Pixar cityscape like Incredibles, clean lines, vibrant colors',
  },
  
  watercolor_illustration: {
    underwater: 'dreamy underwater scene painted in watercolor, soft blues and greens, fish suggested with loose brushstrokes',
    ocean: 'ocean painted with flowing watercolor washes, waves in wet-on-wet technique',
    forest: 'watercolor forest with bleeding greens, impressionistic trees, soft edges',
    home: 'cozy home in soft watercolor, warm earth tones, gentle washes',
    sky: 'watercolor sky with gradient washes, clouds painted wet-on-wet',
    city: 'watercolor cityscape with architectural sketching, soft color washes',
  },
  
  chibi_kawaii: {
    underwater: 'super cute underwater world, kawaii fish with big eyes, heart-shaped bubbles, pastel coral',
    ocean: 'adorable ocean scene, smiling waves, cute sea creatures, rainbow sparkles',
    forest: 'kawaii forest with happy trees, cute animals, flowers with faces',
    home: 'ultra-cute room with kawaii decorations, plushies, pastel colors',
    sky: 'cute sky with smiling clouds, rainbow gradients, star sparkles',
    city: 'kawaii town with cute buildings, happy faces on everything',
  },
  
  dreamworks_animation: {
    underwater: 'dramatic underwater scene like Shark Tale, dynamic lighting, epic scale',
    ocean: 'cinematic ocean like How to Train Your Dragon, dramatic waves, moody atmosphere',
    forest: 'epic forest like Shrek, atmospheric fog, dramatic lighting',
    home: 'stylized home interior like Megamind, bold designs, dynamic angles',
    sky: 'dramatic sky like Dragons, epic cloudscapes, rim lighting',
    city: 'stylized city like Megamind, bold architecture, dramatic perspective',
  },
  
  classic_fairytale: {
    underwater: 'fairytale underwater kingdom, ornate details, magical light filtering through water',
    ocean: 'storybook ocean with decorative wave patterns, ships with billowing sails',
    forest: 'enchanted fairytale forest, twisted trees, hidden pathways, golden light',
    home: 'storybook cottage with thatched roof, flower boxes, warm glow from windows',
    sky: 'fairytale sky with decorative clouds, stars, moon with a face',
    city: 'medieval town with cobblestones, timber houses, market square',
  },
};

// Adapt prompt for art style while preserving story accuracy
export function adaptPromptForArtStyle(
  basePrompt: string,
  artStyle: ArtStyleId,
  sceneElements: SceneElements
): string {
  let adaptedPrompt = basePrompt;
  
  // Get style-specific setting description
  const styleAdaptations = STYLE_SETTING_ADAPTATIONS[artStyle];
  
  if (styleAdaptations) {
    // Try specific location first, then general setting
    const settingKey = sceneElements.specificLocation || sceneElements.setting;
    const styleSpecificSetting = styleAdaptations[settingKey];
    
    if (styleSpecificSetting) {
      // Replace generic setting with style-specific version
      // But ensure we don't lose the core requirement
      adaptedPrompt = adaptedPrompt.replace(
        /SETTING: [^.]+\./,
        `SETTING: ${styleSpecificSetting}.`
      );
    }
  }
  
  // Add style-specific enhancements based on mood
  const moodEnhancements = getStyleMoodEnhancements(artStyle, sceneElements.mood);
  if (moodEnhancements) {
    adaptedPrompt += `\nSTYLE MOOD: ${moodEnhancements}`;
  }
  
  // Ensure critical elements aren't lost
  adaptedPrompt = preserveCriticalElements(adaptedPrompt, sceneElements);
  
  return adaptedPrompt;
}

// Get mood-specific enhancements for each art style
function getStyleMoodEnhancements(artStyle: ArtStyleId, mood: string): string {
  const moodEnhancements: Record<ArtStyleId, Record<string, string>> = {
    studio_ghibli: {
      peaceful: 'serene Ghibli atmosphere with soft light and gentle movement',
      excited: 'dynamic Ghibli energy with swirling effects and vibrant colors',
      magical: 'enchanting Ghibli magic with spirits, glowing elements, impossible physics',
      adventurous: 'epic Ghibli adventure feel with vast landscapes and brave determination',
    },
    disney_pixar_3d: {
      peaceful: 'warm Pixar lighting with soft shadows and comfortable atmosphere',
      excited: 'energetic Pixar animation with dynamic poses and bright colors',
      magical: 'Pixar magic with particle effects, sparkles, and wonder',
      adventurous: 'Pixar adventure with heroic poses and epic framing',
    },
    watercolor_illustration: {
      peaceful: 'soft watercolor washes creating calm atmosphere',
      excited: 'energetic brushstrokes and vibrant color splashes',
      magical: 'dreamy watercolor effects with color bleeds suggesting magic',
      adventurous: 'bold watercolor strokes suggesting movement and energy',
    },
    chibi_kawaii: {
      peaceful: 'super relaxing kawaii scene with soft pastels and sleepy expressions',
      excited: 'hyper-cute excitement with sparkles, action lines, big smiles',
      magical: 'kawaii magic with rainbow effects, star sparkles, transformation',
      adventurous: 'cute adventure with determined expressions and dynamic poses',
    },
    dreamworks_animation: {
      peaceful: 'calm DreamWorks moment with soft lighting and quiet beauty',
      excited: 'high-energy DreamWorks action with dynamic camera angles',
      magical: 'epic DreamWorks magic with dramatic effects and scale',
      adventurous: 'cinematic adventure with heroic framing and epic scope',
    },
    classic_fairytale: {
      peaceful: 'tranquil fairytale moment with golden hour lighting',
      excited: 'lively fairytale scene with swirling movement and energy',
      magical: 'enchanted fairytale magic with glowing effects and wonder',
      adventurous: 'classic adventure with brave heroes and epic quests',
    },
  };
  
  return moodEnhancements[artStyle]?.[mood] || '';
}

// Ensure critical story elements aren't lost in style adaptation
function preserveCriticalElements(prompt: string, sceneElements: SceneElements): string {
  let preservedPrompt = prompt;
  
  // If underwater, ensure it stays underwater
  if (sceneElements.specificLocation === 'underwater') {
    if (!preservedPrompt.toLowerCase().includes('underwater')) {
      preservedPrompt += '\nCRITICAL: This scene MUST be completely underwater, not on land or at the surface.';
    }
  }
  
  // Ensure all characters are mentioned
  sceneElements.characters.forEach(character => {
    if (!preservedPrompt.toLowerCase().includes(character.toLowerCase())) {
      preservedPrompt += `\nMUST INCLUDE: ${character}`;
    }
  });
  
  // Ensure key objects aren't lost
  sceneElements.keyObjects.forEach(object => {
    if (!preservedPrompt.toLowerCase().includes(object.toLowerCase())) {
      preservedPrompt += `\nMUST SHOW: ${object}`;
    }
  });
  
  return preservedPrompt;
}

// Create style-appropriate descriptions that don't override story
export function createStyleAppropriateDescription(
  artStyle: ArtStyleId,
  element: string,
  context: 'character' | 'setting' | 'object'
): string {
  const styleDescriptions: Record<ArtStyleId, Record<string, Record<string, string>>> = {
    studio_ghibli: {
      character: {
        default: 'with Ghibli-style expressive eyes and flowing movement',
        child: 'child with large expressive Ghibli eyes, detailed hair animation',
      },
      setting: {
        default: 'painted in Ghibli watercolor style with rich details',
        water: 'water animated in Ghibli style with flowing, living quality',
      },
      object: {
        default: 'rendered with Ghibli attention to detail and craftsmanship',
      },
    },
    disney_pixar_3d: {
      character: {
        default: 'in Pixar 3D style with appealing proportions and expressions',
        child: '3D animated child with Pixar appeal, subsurface scattering on skin',
      },
      setting: {
        default: 'fully realized 3D environment with Pixar quality',
        water: 'crystal clear 3D water with realistic caustics and refraction',
      },
      object: {
        default: '3D modeled with Pixar-level detail and material quality',
      },
    },
    // ... other styles
  };
  
  const styleDesc = styleDescriptions[artStyle]?.[context]?.[element] || 
                   styleDescriptions[artStyle]?.[context]?.default || 
                   element;
  
  return styleDesc;
}

// Validate that style adaptation didn't break story requirements
export function validateStyleAdaptation(
  originalPrompt: string,
  adaptedPrompt: string,
  sceneElements: SceneElements
): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const adaptedLower = adaptedPrompt.toLowerCase();
  
  // Check that critical elements weren't removed
  if (sceneElements.specificLocation) {
    if (originalPrompt.includes(sceneElements.specificLocation) && 
        !adaptedLower.includes(sceneElements.specificLocation.toLowerCase())) {
      issues.push(`Lost location: ${sceneElements.specificLocation}`);
    }
  }
  
  // Check characters
  sceneElements.characters.forEach(char => {
    if (originalPrompt.includes(char) && !adaptedLower.includes(char.toLowerCase())) {
      issues.push(`Lost character: ${char}`);
    }
  });
  
  // Check objects
  sceneElements.keyObjects.forEach(obj => {
    if (originalPrompt.includes(obj) && !adaptedLower.includes(obj.toLowerCase())) {
      issues.push(`Lost object: ${obj}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}