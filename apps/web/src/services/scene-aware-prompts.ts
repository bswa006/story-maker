// Scene-Aware Prompt Generation - Builds prompts that preserve story accuracy

import { SceneElements, sceneElementsToDescription } from './scene-element-extractor';
import { ArtStyleId } from './art-styles-system';

export interface CharacterDescription {
  name: string;
  age: string;
  appearance: string;
  consistentFeatures: string[];
}

export interface SceneAwarePromptOptions {
  page: {
    pageNumber: number;
    text: string;
    imagePrompt?: string;
  };
  sceneElements: SceneElements;
  character: CharacterDescription;
  artStyle: ArtStyleId;
  storyContext?: {
    totalPages: number;
    storyTheme: string;
    isFirstPage?: boolean;
    isLastPage?: boolean;
  };
}

// Build a prompt that prioritizes story accuracy
export function buildSceneAwarePrompt(options: SceneAwarePromptOptions): string {
  const { page, sceneElements, character, artStyle, storyContext } = options;
  
  let prompt = '';
  
  // 1. CRITICAL SCENE REQUIREMENTS (highest priority)
  prompt += '=== MANDATORY SCENE REQUIREMENTS (DO NOT CHANGE) ===\n\n';
  
  // Setting is absolute
  if (sceneElements.specificLocation) {
    prompt += `SETTING: This scene MUST take place ${sceneElements.specificLocation}. `;
    
    // Add setting-specific requirements
    if (sceneElements.specificLocation === 'underwater') {
      prompt += 'The ENTIRE scene is underwater with fish, coral, and ocean elements. ';
      prompt += 'Characters are swimming/floating underwater, NOT on land. ';
    } else if (sceneElements.specificLocation === 'ocean') {
      prompt += 'Show the ocean prominently with waves, water, and marine life. ';
    }
  } else {
    prompt += `SETTING: This scene MUST take place in/at ${sceneElements.setting}. `;
  }
  prompt += '\n\n';
  
  // 2. CHARACTER REQUIREMENTS
  prompt += '=== CHARACTER REQUIREMENTS ===\n';
  prompt += `MAIN CHARACTER: ${character.name} (age ${character.age}) MUST appear in this scene.\n`;
  prompt += `EXACT APPEARANCE: ${character.appearance}\n`;
  if (character.consistentFeatures.length > 0) {
    prompt += `UNCHANGEABLE FEATURES: ${character.consistentFeatures.join(', ')}\n`;
  }
  
  // Other characters
  if (sceneElements.characters.length > 1) {
    const otherCharacters = sceneElements.characters.filter(c => 
      c.toLowerCase() !== character.name.toLowerCase()
    );
    if (otherCharacters.length > 0) {
      prompt += `OTHER CHARACTERS: ${otherCharacters.join(', ')} must also appear\n`;
    }
  }
  prompt += '\n';
  
  // 3. ACTION AND ACTIVITY
  prompt += '=== ACTION REQUIREMENTS ===\n';
  prompt += `PRIMARY ACTION: ${sceneElements.action}\n`;
  prompt += `WHAT'S HAPPENING: ${page.text}\n`;
  prompt += '\n';
  
  // 4. MOOD AND ATMOSPHERE
  prompt += '=== ATMOSPHERE ===\n';
  prompt += `EMOTIONAL TONE: ${sceneElements.mood}\n`;
  if (sceneElements.timeOfDay) {
    prompt += `TIME OF DAY: ${sceneElements.timeOfDay}\n`;
  }
  if (sceneElements.weather) {
    prompt += `WEATHER: ${sceneElements.weather}\n`;
  }
  prompt += '\n';
  
  // 5. IMPORTANT OBJECTS
  if (sceneElements.keyObjects.length > 0) {
    prompt += '=== KEY OBJECTS TO INCLUDE ===\n';
    prompt += `OBJECTS: ${sceneElements.keyObjects.join(', ')}\n`;
    prompt += '\n';
  }
  
  // 6. STORY CONTEXT
  if (storyContext) {
    prompt += '=== STORY CONTEXT ===\n';
    if (storyContext.isFirstPage) {
      prompt += 'This is the OPENING scene - establish the character and setting clearly.\n';
    } else if (storyContext.isLastPage) {
      prompt += 'This is the FINAL scene - show resolution and happiness.\n';
    } else {
      prompt += `This is page ${page.pageNumber} of ${storyContext.totalPages} in the story.\n`;
    }
    prompt += '\n';
  }
  
  // 7. ART STYLE (applied without overriding above)
  prompt += '=== ART STYLE ===\n';
  prompt += `Render in ${artStyle.replace(/_/g, ' ')} style while maintaining ALL above requirements.\n`;
  prompt += 'The art style should enhance, not replace, the scene elements.\n';
  
  // 8. FINAL EMPHASIS
  prompt += '\n=== CRITICAL REMINDERS ===\n';
  prompt += '1. Setting/location is MANDATORY - do not change it\n';
  prompt += '2. Character appearance must be EXACTLY as described\n';
  prompt += '3. All mentioned characters MUST appear\n';
  prompt += '4. The action/activity described MUST be shown\n';
  
  return prompt;
}

// Build a more natural flowing prompt while maintaining requirements
export function buildNaturalScenePrompt(options: SceneAwarePromptOptions): string {
  const { page, sceneElements, character, artStyle } = options;
  
  let prompt = '';
  
  // Start with the scene
  if (sceneElements.specificLocation === 'underwater') {
    prompt += `An underwater ocean scene showing `;
  } else if (sceneElements.specificLocation) {
    prompt += `A scene ${sceneElements.specificLocation} showing `;
  } else {
    prompt += `A scene in ${sceneElements.setting} showing `;
  }
  
  // Add the main character
  prompt += `${character.name}, a ${character.age} year old child with ${character.appearance}, `;
  
  // Add the action
  prompt += `who is ${sceneElements.action} `;
  
  // Add other characters
  const otherCharacters = sceneElements.characters.filter(c => 
    c.toLowerCase() !== character.name.toLowerCase()
  );
  if (otherCharacters.length > 0) {
    prompt += `with ${otherCharacters.join(' and ')} `;
  }
  
  // Add mood
  prompt += `in a ${sceneElements.mood} moment. `;
  
  // Add critical requirements
  prompt += `CRITICAL: `;
  if (sceneElements.specificLocation === 'underwater') {
    prompt += `The ENTIRE scene must be underwater with visible water, fish, and ocean elements. `;
  }
  prompt += `${character.name} must have EXACTLY: ${character.consistentFeatures.join(', ')}. `;
  
  // Add objects
  if (sceneElements.keyObjects.length > 0) {
    prompt += `Include these objects: ${sceneElements.keyObjects.join(', ')}. `;
  }
  
  // Add style
  prompt += `Illustrated in ${artStyle.replace(/_/g, ' ')} style. `;
  
  // Final emphasis on story accuracy
  prompt += `This scene depicts: "${page.text}"`;
  
  return prompt;
}

// Validate that a prompt contains all necessary elements
export function validateScenePrompt(
  prompt: string,
  sceneElements: SceneElements,
  character: CharacterDescription
): {
  valid: boolean;
  missing: string[];
  suggestions: string[];
} {
  const promptLower = prompt.toLowerCase();
  const missing: string[] = [];
  const suggestions: string[] = [];
  
  // Check setting
  if (sceneElements.specificLocation && !promptLower.includes(sceneElements.specificLocation.toLowerCase())) {
    missing.push(`Setting: ${sceneElements.specificLocation}`);
    suggestions.push(`Add "${sceneElements.specificLocation}" to the prompt`);
  }
  
  // Check character
  if (!promptLower.includes(character.name.toLowerCase())) {
    missing.push(`Main character: ${character.name}`);
    suggestions.push(`Include "${character.name}" in the prompt`);
  }
  
  // Check other characters
  sceneElements.characters.forEach(char => {
    if (!promptLower.includes(char.toLowerCase())) {
      missing.push(`Character: ${char}`);
      suggestions.push(`Add "${char}" to the scene`);
    }
  });
  
  // Check action
  if (!promptLower.includes(sceneElements.action.toLowerCase())) {
    missing.push(`Action: ${sceneElements.action}`);
    suggestions.push(`Describe the action "${sceneElements.action}"`);
  }
  
  // Check key objects
  sceneElements.keyObjects.forEach(obj => {
    if (!promptLower.includes(obj.toLowerCase())) {
      missing.push(`Object: ${obj}`);
      suggestions.push(`Include "${obj}" in the scene`);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
    suggestions
  };
}

// Fix a prompt by adding missing elements
export function enhancePromptWithMissingElements(
  originalPrompt: string,
  missingElements: string[]
): string {
  let enhancedPrompt = originalPrompt;
  
  // Add a section for missing elements
  if (missingElements.length > 0) {
    enhancedPrompt += '\n\nADDITIONAL REQUIREMENTS (MUST INCLUDE):\n';
    missingElements.forEach(element => {
      enhancedPrompt += `- ${element}\n`;
    });
  }
  
  return enhancedPrompt;
}

// Generate a prompt that works across all art styles
export function buildUniversalScenePrompt(
  sceneElements: SceneElements,
  character: CharacterDescription,
  storyText: string
): string {
  // This prompt structure works for any art style
  let prompt = `Scene from a children's story: `;
  
  // Location first (most important)
  if (sceneElements.specificLocation === 'underwater') {
    prompt += `UNDERWATER in the ocean (entire scene submerged, with fish and coral visible). `;
  } else if (sceneElements.specificLocation) {
    prompt += `Location: ${sceneElements.specificLocation}. `;
  } else {
    prompt += `Setting: ${sceneElements.setting}. `;
  }
  
  // Character consistency
  prompt += `Main character: ${character.name} (MUST appear EXACTLY as: ${character.appearance}). `;
  
  // Story accuracy
  prompt += `Scene depicts: "${storyText}". `;
  
  // Other essential elements
  if (sceneElements.characters.length > 1) {
    prompt += `Also includes: ${sceneElements.characters.filter(c => c !== character.name).join(', ')}. `;
  }
  
  prompt += `Mood: ${sceneElements.mood}. `;
  
  return prompt;
}