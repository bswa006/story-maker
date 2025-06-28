// Story-specific prompt generation to ensure accuracy

import { SceneElements } from './scene-element-extractor';
import { CharacterDescription } from './scene-aware-prompts';

export interface StoryContext {
  mainCharacter: CharacterDescription;
  currentPage: {
    text: string;
    imagePrompt: string;
  };
  sceneElements: SceneElements;
  artStyle: string;
}

// Fix common story-image mismatches
export function fixCommonMismatches(
  storyText: string,
  basePrompt: string,
  character: CharacterDescription
): string {
  let fixedPrompt = basePrompt;
  
  // Deforestation scene fix
  if (storyText.toLowerCase().includes('deforestation') || 
      storyText.toLowerCase().includes('home was being destroyed')) {
    console.log('🚨 DEFORESTATION SCENE DETECTED - Applying specific fix');
    
    // Remove any indoor/cozy references
    fixedPrompt = fixedPrompt.replace(/cozy|indoor|cottage|home interior/gi, '');
    
    // Add deforestation elements
    fixedPrompt = `URGENT ENVIRONMENTAL SCENE: ${character.name} witnessing active deforestation. `;
    fixedPrompt += 'Show cut down trees, stumps, destruction of forest habitat. ';
    fixedPrompt += 'Parrot looks distressed/panicked about losing home. ';
    fixedPrompt += 'Atmosphere is concerning, not cozy. ';
    fixedPrompt += 'This is an environmental awareness scene about habitat destruction. ';
    fixedPrompt += basePrompt;
  }
  
  // Panic/distress fix
  if ((storyText.toLowerCase().includes('panicking') || 
       storyText.toLowerCase().includes('distressed')) &&
      !fixedPrompt.toLowerCase().includes('panic')) {
    console.log('🚨 PANIC/DISTRESS DETECTED - Adding emotional context');
    fixedPrompt = fixedPrompt.replace(/happy|calm|peaceful/gi, 'worried');
    fixedPrompt += ' The animal character shows visible distress/panic. ';
  }
  
  // Character meeting fix
  if (storyText.toLowerCase().includes('met') || 
      storyText.toLowerCase().includes('greeted by')) {
    console.log('🚨 CHARACTER MEETING DETECTED - Ensuring both characters present');
    // Extract who they're meeting
    const meetingMatch = storyText.match(/met\s+(?:a\s+)?(\w+\s+\w+)/i);
    if (meetingMatch && !fixedPrompt.includes(meetingMatch[1])) {
      fixedPrompt += ` Include ${meetingMatch[1]} in the scene. `;
    }
  }
  
  return fixedPrompt;
}

// Ensure character consistency in every prompt
export function enforceCharacterConsistency(
  prompt: string,
  character: CharacterDescription,
  pageNumber: number
): string {
  let consistentPrompt = '';
  
  // Start with character reference
  consistentPrompt += `PAGE ${pageNumber} - CHARACTER CONSISTENCY CRITICAL: `;
  consistentPrompt += `${character.name} appears EXACTLY as: ${character.appearance}. `;
  
  if (character.consistentFeatures.length > 0) {
    consistentPrompt += `MANDATORY FEATURES: ${character.consistentFeatures.join(', ')}. `;
    consistentPrompt += 'These features MUST be identical to previous pages. ';
  }
  
  // Add the scene
  consistentPrompt += '\n\nSCENE: ' + prompt;
  
  // Final reminder
  consistentPrompt += `\n\nREMINDER: This is the SAME ${character.name} from all previous pages, not a different child. `;
  
  return consistentPrompt;
}

// Validate prompt has all required elements
export function validatePromptCompleteness(
  prompt: string,
  requiredElements: {
    character: CharacterDescription;
    setting: string;
    action: string;
    otherCharacters: string[];
    mood: string;
  }
): {
  valid: boolean;
  missing: string[];
  enhancedPrompt: string;
} {
  const promptLower = prompt.toLowerCase();
  const missing: string[] = [];
  let enhancedPrompt = prompt;
  
  // Check character
  if (!promptLower.includes(requiredElements.character.name.toLowerCase())) {
    missing.push(`Main character: ${requiredElements.character.name}`);
    enhancedPrompt = `${requiredElements.character.name} (${requiredElements.character.appearance}) ` + enhancedPrompt;
  }
  
  // Check setting
  if (!promptLower.includes(requiredElements.setting.toLowerCase())) {
    missing.push(`Setting: ${requiredElements.setting}`);
    enhancedPrompt += ` Setting: ${requiredElements.setting}. `;
  }
  
  // Check other characters
  requiredElements.otherCharacters.forEach(char => {
    if (!promptLower.includes(char.toLowerCase())) {
      missing.push(`Character: ${char}`);
      enhancedPrompt += ` Include ${char}. `;
    }
  });
  
  // Check mood
  if (requiredElements.mood && !promptLower.includes(requiredElements.mood)) {
    enhancedPrompt += ` Mood: ${requiredElements.mood}. `;
  }
  
  return {
    valid: missing.length === 0,
    missing,
    enhancedPrompt
  };
}

// Generate a failsafe prompt when all else fails
export function generateFailsafePrompt(
  storyText: string,
  character: CharacterDescription,
  sceneElements: SceneElements
): string {
  let prompt = `EXACT SCENE FROM STORY: "${storyText}"\n\n`;
  
  prompt += `MANDATORY ELEMENTS:\n`;
  prompt += `1. CHARACTER: ${character.name} - ${character.appearance}\n`;
  prompt += `2. SETTING: ${sceneElements.setting || 'as described in story'}\n`;
  prompt += `3. ACTION: ${sceneElements.action || 'as described in story'}\n`;
  prompt += `4. OTHER CHARACTERS: ${sceneElements.characters.join(', ') || 'as mentioned in story'}\n`;
  prompt += `5. MOOD: ${sceneElements.mood || 'as implied by story'}\n`;
  
  if (sceneElements.keyObjects.length > 0) {
    prompt += `6. OBJECTS: ${sceneElements.keyObjects.join(', ')}\n`;
  }
  
  prompt += `\nCRITICAL: Generate EXACTLY what the story text describes, nothing else.`;
  
  return prompt;
}