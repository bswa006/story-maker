// Multi-character scene prompt builder - ensures ALL characters are visible

import { SceneContext } from './story-understanding-system';

export interface MultiCharacterPromptOptions {
  sceneContext: SceneContext;
  mainCharacter: {
    name: string;
    appearance: string;
  };
  storyId: string;
  pageNumber: number;
  artStyle: string;
  storyText: string;
}

export function buildMultiCharacterScenePrompt(options: MultiCharacterPromptOptions): string {
  const { sceneContext, mainCharacter, storyId, pageNumber, artStyle, storyText } = options;
  
  console.log('🎭 Building multi-character scene prompt...');
  console.log('   Total characters in scene:', sceneContext.characters.length);
  console.log('   Characters:', sceneContext.characters.map(c => c.name).join(', '));
  
  // Start with character consistency reference
  let prompt = `[SCENE ID: ${storyId}-page${pageNumber}]\n\n`;
  
  // CRITICAL: List ALL characters that must appear
  prompt += '=== MANDATORY: ALL CHARACTERS MUST BE VISIBLE ===\n';
  prompt += `This scene REQUIRES ${sceneContext.characters.length} characters:\n\n`;
  
  // Detail each character
  sceneContext.characters.forEach((char, index) => {
    prompt += `CHARACTER ${index + 1}: ${char.name}\n`;
    if (char.name === mainCharacter.name) {
      prompt += `- Appearance: ${mainCharacter.appearance}\n`;
      prompt += `- This is the MAIN character who appears in ALL images\n`;
    } else {
      prompt += `- Role: ${char.role}\n`;
      prompt += `- Gender: ${char.gender}\n`;
      if (char.appearance) {
        prompt += `- Appearance: ${char.appearance}\n`;
      }
    }
    
    // Add relationships
    if (char.relationships.size > 0) {
      const relationships = Array.from(char.relationships.entries());
      prompt += `- Relationships: `;
      if (char.name === mainCharacter.name) {
        // For main character, phrase it as "has a younger brother Jake"
        prompt += relationships.map(([name, rel]) => `has ${rel} named ${name}`).join(', ');
      } else {
        // For other characters, phrase it as "is the younger brother of Ira"
        prompt += relationships.map(([name, rel]) => `is the ${char.role} of ${name}`).join(', ');
      }
      prompt += '\n';
    }
    prompt += '\n';
  });
  
  // Describe the scene setting
  prompt += '=== SCENE SETTING ===\n';
  prompt += `Location: ${sceneContext.setting}\n`;
  if (sceneContext.previousSetting && sceneContext.previousSetting !== sceneContext.setting) {
    prompt += `(Scene has moved from ${sceneContext.previousSetting} to ${sceneContext.setting})\n`;
  }
  prompt += '\n';
  
  // Describe the action and positioning
  prompt += '=== ACTION & POSITIONING ===\n';
  prompt += `Main action: ${sceneContext.action}\n`;
  
  // Handle specific interactions
  if (sceneContext.interactions.length > 0) {
    prompt += '\nCharacter interactions:\n';
    sceneContext.interactions.forEach(interaction => {
      prompt += `- ${interaction.actor} ${interaction.action} ${interaction.target}\n`;
      
      // Add specific positioning requirements
      if (interaction.action.includes('bent down')) {
        prompt += `  → ${interaction.actor} must be shown bending or kneeling to ${interaction.target}'s eye level\n`;
      }
      if (interaction.action.includes('asked') || interaction.action.includes('told')) {
        prompt += `  → ${interaction.actor} and ${interaction.target} must be facing each other in conversation\n`;
      }
      if (interaction.action.includes('found')) {
        prompt += `  → Show the moment of discovery: ${interaction.actor} finding ${interaction.target}\n`;
      }
    });
  }
  prompt += '\n';
  
  // Emotion and mood
  prompt += '=== EMOTIONAL CONTEXT ===\n';
  prompt += `Mood: ${sceneContext.emotion}\n`;
  if (sceneContext.emotion === 'crying' || sceneContext.emotion === 'sad') {
    prompt += 'Show visible tears or signs of distress\n';
  }
  if (sceneContext.emotion === 'panicking') {
    prompt += 'Show panic through body language, wide eyes, frantic movement\n';
  }
  prompt += '\n';
  
  // Critical requirements summary
  prompt += '=== CRITICAL REQUIREMENTS (DO NOT MISS) ===\n';
  prompt += `1. ALL ${sceneContext.characters.length} characters must be clearly visible\n`;
  prompt += `2. Show ${sceneContext.characters.map(c => c.name).join(' AND ')} in the same frame\n`;
  prompt += `3. Setting must be: ${sceneContext.setting}\n`;
  prompt += `4. Action must show: ${sceneContext.action}\n`;
  
  if (sceneContext.interactions.length > 0) {
    prompt += `5. Character positioning: ${getPositioningDescription(sceneContext)}\n`;
  }
  
  // Add the original story text for context
  prompt += '\n=== STORY CONTEXT ===\n';
  prompt += `"${storyText}"\n\n`;
  
  // Art style (but don't let it override requirements)
  prompt += `Style: ${artStyle} illustration\n`;
  prompt += 'IMPORTANT: Style must not change the mandatory requirements above\n';
  
  return prompt;
}

function getPositioningDescription(sceneContext: SceneContext): string {
  if (sceneContext.interactions.length === 0) {
    return 'natural positioning';
  }
  
  const interaction = sceneContext.interactions[0];
  
  if (interaction.action.includes('bent down')) {
    return `${interaction.actor} at ${interaction.target}'s level (bending/kneeling)`;
  }
  
  if (interaction.action.includes('asked') || interaction.action.includes('told')) {
    return `${interaction.actor} and ${interaction.target} facing each other`;
  }
  
  if (interaction.action.includes('found')) {
    return `${interaction.actor} discovering ${interaction.target}`;
  }
  
  return 'characters interacting as described';
}

// Validate that a prompt includes all required characters
export function validateMultiCharacterPrompt(
  prompt: string, 
  requiredCharacters: string[]
): {
  valid: boolean;
  missingCharacters: string[];
  presentCharacters: string[];
} {
  const promptLower = prompt.toLowerCase();
  const missingCharacters: string[] = [];
  const presentCharacters: string[] = [];
  
  requiredCharacters.forEach(charName => {
    if (promptLower.includes(charName.toLowerCase())) {
      presentCharacters.push(charName);
    } else {
      missingCharacters.push(charName);
    }
  });
  
  return {
    valid: missingCharacters.length === 0,
    missingCharacters,
    presentCharacters
  };
}