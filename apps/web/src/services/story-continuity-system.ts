// Story Continuity System - Ensures visual coherence across all pages

export interface StoryVisualContext {
  // Core story identity
  storyId: string;
  storyTheme: 'fantasy' | 'realistic' | 'adventure' | 'educational' | 'magical';
  
  // Character consistency
  mainCharacter: {
    name: string;
    appearance: string;
    consistentFeatures: string[]; // e.g., "brown pigtails", "blue dress", "round glasses"
    age: string;
    personalityTraits: string[];
  };
  
  // Setting consistency
  setting: {
    world: string; // e.g., "modern suburban home", "magical kingdom", "enchanted forest"
    timeOfDay: string; // e.g., "afternoon", "sunset", "night"
    season: string; // e.g., "spring", "autumn"
    locationDetails: string[]; // e.g., ["cozy bedroom", "backyard garden", "local park"]
    atmosphere: string; // e.g., "warm and cozy", "mystical and dreamy", "bright and cheerful"
  };
  
  // Visual style consistency
  visualStyle: {
    colorPalette: string; // e.g., "warm earth tones", "pastel rainbow", "rich jewel tones"
    lightingStyle: string; // e.g., "soft natural light", "dramatic sunset", "magical glow"
    moodTone: string; // e.g., "whimsical", "serene", "adventurous"
  };
  
  // Story progression tracking
  narrativeProgression: {
    currentPage: number;
    totalPages: number;
    storyArc: string[]; // e.g., ["introduction", "problem", "journey", "climax", "resolution"]
    previousPageSummary?: string;
    upcomingPageHint?: string;
  };
}

export interface PageContinuityRequirements {
  pageNumber: number;
  mustInclude: string[]; // Elements that MUST appear
  mustMaintain: string[]; // Consistency requirements
  cannotInclude: string[]; // Elements to avoid
  transitionFrom?: string; // How this connects to previous page
  transitionTo?: string; // How this sets up next page
}

export class StoryContinuityManager {
  private context: StoryVisualContext;
  private pageHistory: Map<number, PageContinuityRequirements>;
  
  constructor(initialContext: Partial<StoryVisualContext>) {
    this.context = this.initializeContext(initialContext);
    this.pageHistory = new Map();
  }
  
  // Getter to access context
  getContext(): StoryVisualContext {
    return this.context;
  }
  
  private initializeContext(partial: Partial<StoryVisualContext>): StoryVisualContext {
    return {
      storyId: partial.storyId || '',
      storyTheme: partial.storyTheme || 'realistic',
      mainCharacter: {
        name: partial.mainCharacter?.name || '',
        appearance: partial.mainCharacter?.appearance || '',
        consistentFeatures: partial.mainCharacter?.consistentFeatures || [],
        age: partial.mainCharacter?.age || '',
        personalityTraits: partial.mainCharacter?.personalityTraits || []
      },
      setting: {
        world: partial.setting?.world || '',
        timeOfDay: partial.setting?.timeOfDay || 'day',
        season: partial.setting?.season || 'spring',
        locationDetails: partial.setting?.locationDetails || [],
        atmosphere: partial.setting?.atmosphere || ''
      },
      visualStyle: {
        colorPalette: partial.visualStyle?.colorPalette || '',
        lightingStyle: partial.visualStyle?.lightingStyle || '',
        moodTone: partial.visualStyle?.moodTone || ''
      },
      narrativeProgression: {
        currentPage: 1,
        totalPages: partial.narrativeProgression?.totalPages || 10,
        storyArc: partial.narrativeProgression?.storyArc || []
      }
    };
  }
  
  // Generate continuity requirements for a specific page
  generatePageRequirements(pageNumber: number, pageContent: string): PageContinuityRequirements {
    const requirements: PageContinuityRequirements = {
      pageNumber,
      mustInclude: [],
      mustMaintain: [],
      cannotInclude: [],
      transitionFrom: undefined,
      transitionTo: undefined
    };
    
    // Always maintain character appearance
    requirements.mustMaintain.push(
      `${this.context.mainCharacter.name} with EXACTLY: ${this.context.mainCharacter.consistentFeatures.join(', ')}`
    );
    
    // Maintain setting consistency
    requirements.mustMaintain.push(
      `Setting: ${this.context.setting.world}`,
      `Atmosphere: ${this.context.setting.atmosphere}`,
      `Color palette: ${this.context.visualStyle.colorPalette}`
    );
    
    // Page-specific requirements based on story progression
    if (pageNumber === 1) {
      requirements.mustInclude.push(
        `Establishing shot of ${this.context.setting.world}`,
        `Clear view of ${this.context.mainCharacter.name}'s full appearance`
      );
    } else {
      const previousPage = this.pageHistory.get(pageNumber - 1);
      if (previousPage) {
        requirements.transitionFrom = `Continue from: ${previousPage.transitionTo || 'previous scene'}`;
      }
    }
    
    // Avoid contradictions
    if (this.context.storyTheme === 'realistic') {
      requirements.cannotInclude.push('magical elements', 'fantasy creatures', 'impossible physics');
    } else if (this.context.storyTheme === 'fantasy') {
      requirements.cannotInclude.push('modern technology', 'contemporary settings');
    }
    
    this.pageHistory.set(pageNumber, requirements);
    return requirements;
  }
  
  // Build a continuity-aware prompt
  buildContinuityPrompt(
    basePrompt: string,
    pageNumber: number,
    requirements: PageContinuityRequirements
  ): string {
    let continuityPrompt = '';
    
    // Add story context
    continuityPrompt += `STORY CONTEXT: This is page ${pageNumber} of ${this.context.narrativeProgression.totalPages} in a ${this.context.storyTheme} story. `;
    
    // Add character consistency
    continuityPrompt += `\n\nCHARACTER CONSISTENCY: ${this.context.mainCharacter.name} MUST appear EXACTLY as: ${this.context.mainCharacter.appearance}. `;
    continuityPrompt += `Key features that MUST be identical: ${this.context.mainCharacter.consistentFeatures.join(', ')}. `;
    
    // Add setting consistency
    continuityPrompt += `\n\nSETTING CONSISTENCY: The story takes place in ${this.context.setting.world}. `;
    continuityPrompt += `Maintain the ${this.context.setting.atmosphere} atmosphere throughout. `;
    continuityPrompt += `Time of day: ${this.context.setting.timeOfDay}. Season: ${this.context.setting.season}. `;
    
    // Add visual style consistency
    continuityPrompt += `\n\nVISUAL STYLE: Use ${this.context.visualStyle.colorPalette} color palette. `;
    continuityPrompt += `Lighting should be ${this.context.visualStyle.lightingStyle}. `;
    continuityPrompt += `Overall mood: ${this.context.visualStyle.moodTone}. `;
    
    // Add page-specific requirements
    if (requirements.mustInclude.length > 0) {
      continuityPrompt += `\n\nMUST INCLUDE: ${requirements.mustInclude.join('; ')}. `;
    }
    
    if (requirements.transitionFrom) {
      continuityPrompt += `\n\nSCENE TRANSITION: ${requirements.transitionFrom}. `;
    }
    
    // Add the base scene description
    continuityPrompt += `\n\nSCENE DESCRIPTION: ${basePrompt}`;
    
    // Add warnings about what to avoid
    if (requirements.cannotInclude.length > 0) {
      continuityPrompt += `\n\nIMPORTANT - DO NOT INCLUDE: ${requirements.cannotInclude.join(', ')}.`;
    }
    
    return continuityPrompt;
  }
  
  // Update context after page generation
  updatePageContext(pageNumber: number, generatedDescription: string) {
    this.context.narrativeProgression.currentPage = pageNumber;
    this.context.narrativeProgression.previousPageSummary = generatedDescription;
  }
}

// Helper function to detect story theme from template
export function detectStoryTheme(
  templateCategory: string,
  templateDescription: string
): StoryVisualContext['storyTheme'] {
  const lowerDesc = templateDescription.toLowerCase();
  
  if (lowerDesc.includes('magical') || lowerDesc.includes('fantasy') || lowerDesc.includes('dragon')) {
    return 'fantasy';
  } else if (lowerDesc.includes('adventure') || lowerDesc.includes('journey') || lowerDesc.includes('quest')) {
    return 'adventure';
  } else if (lowerDesc.includes('learn') || lowerDesc.includes('science') || lowerDesc.includes('discover')) {
    return 'educational';
  } else if (lowerDesc.includes('magic') || lowerDesc.includes('wish') || lowerDesc.includes('dream')) {
    return 'magical';
  }
  return 'realistic';
}

// Helper to extract consistent character features from description
export function extractConsistentFeatures(characterDescription: string): string[] {
  const features: string[] = [];
  
  // Extract hair details
  const hairMatch = characterDescription.match(/([\w\s]+)\s+hair/i);
  if (hairMatch) features.push(hairMatch[0]);
  
  // Extract eye color
  const eyeMatch = characterDescription.match(/([\w\s]+)\s+eyes/i);
  if (eyeMatch) features.push(eyeMatch[0]);
  
  // Extract clothing if mentioned
  const clothingMatch = characterDescription.match(/([\w\s]+)\s+(dress|shirt|outfit|clothes)/i);
  if (clothingMatch) features.push(clothingMatch[0]);
  
  // Extract distinctive accessories
  const accessoryMatch = characterDescription.match(/(glasses|hat|bow|ribbon|necklace|bracelet)/i);
  if (accessoryMatch) features.push(accessoryMatch[0]);
  
  return features;
}