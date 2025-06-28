// Generic story-image synchronization fixes that work for ALL AI-generated stories

import { SceneElements } from './scene-element-extractor';
import { CharacterDescription } from './scene-aware-prompts';

// Core issue: Story text and images don't match
// Solution: Extract exact requirements from story text

export function buildAccurateImagePrompt(
  storyText: string,
  originalPrompt: string,
  character: CharacterDescription,
  sceneElements: SceneElements
): string {
  // Start with character consistency (MOST IMPORTANT)
  let accuratePrompt = `${character.name} (MUST appear EXACTLY as: ${character.appearance}) `;
  
  // Add the actual story action
  accuratePrompt += `is ${sceneElements.action} `;
  
  // Add location/setting
  if (sceneElements.specificLocation) {
    accuratePrompt += `${sceneElements.specificLocation} `;
  } else if (sceneElements.setting !== 'unknown') {
    accuratePrompt += `in/at ${sceneElements.setting} `;
  }
  
  // Add other characters mentioned
  const otherCharacters = sceneElements.characters.filter(c => 
    c.toLowerCase() !== character.name.toLowerCase()
  );
  if (otherCharacters.length > 0) {
    accuratePrompt += `with ${otherCharacters.join(' and ')} `;
  }
  
  // Add emotional context/mood
  accuratePrompt += `(mood: ${sceneElements.mood}). `;
  
  // Add key objects
  if (sceneElements.keyObjects.length > 0) {
    accuratePrompt += `Include: ${sceneElements.keyObjects.join(', ')}. `;
  }
  
  // Add the actual story context
  accuratePrompt += `\nSTORY CONTEXT: "${storyText}" `;
  
  // Ensure we capture the story's intent
  accuratePrompt += '\nCRITICAL: Show EXACTLY what the story describes, maintaining story accuracy. ';
  
  return accuratePrompt;
}

// Ensure character appears consistently
export function enforceCharacterConsistency(
  prompt: string,
  character: CharacterDescription,
  storyId: string
): string {
  // Prepend character ID for consistency
  let consistentPrompt = `[Character ${storyId}-${character.name}] `;
  
  // Add mandatory character description
  consistentPrompt += `${character.name} with THESE EXACT FEATURES: `;
  
  // List all consistent features
  if (character.consistentFeatures.length > 0) {
    consistentPrompt += character.consistentFeatures.join(', ') + '. ';
  } else {
    consistentPrompt += character.appearance + '. ';
  }
  
  // Add the scene
  consistentPrompt += prompt;
  
  // Final enforcement
  consistentPrompt += ` (IMPORTANT: Same ${character.name} as ALL other pages)`;
  
  return consistentPrompt;
}

// Fix emotional mismatches (story says panic, image shows calm)
export function alignEmotionalContext(
  prompt: string,
  storyText: string,
  detectedMood: string
): string {
  const storyLower = storyText.toLowerCase();
  let emotionalPrompt = prompt;
  
  // Detect emotional keywords in story
  const emotionMap = {
    panic: ['panicking', 'panic', 'frightened', 'scared', 'terrified'],
    sad: ['sad', 'crying', 'upset', 'unhappy', 'depressed'],
    angry: ['angry', 'mad', 'furious', 'frustrated'],
    happy: ['happy', 'joyful', 'excited', 'cheerful', 'delighted'],
    worried: ['worried', 'concerned', 'anxious', 'nervous'],
    calm: ['calm', 'peaceful', 'serene', 'relaxed']
  };
  
  // Find the actual emotion in the story
  let storyEmotion = detectedMood;
  for (const [emotion, keywords] of Object.entries(emotionMap)) {
    if (keywords.some(keyword => storyLower.includes(keyword))) {
      storyEmotion = emotion;
      break;
    }
  }
  
  // Remove contradicting emotions
  const oppositeEmotions = {
    panic: ['calm', 'peaceful', 'happy', 'relaxed'],
    happy: ['sad', 'angry', 'worried', 'panic'],
    calm: ['panic', 'angry', 'worried', 'anxious']
  };
  
  if (oppositeEmotions[storyEmotion]) {
    oppositeEmotions[storyEmotion].forEach(opposite => {
      emotionalPrompt = emotionalPrompt.replace(new RegExp(opposite, 'gi'), storyEmotion);
    });
  }
  
  // Ensure the emotion is clearly stated
  if (!emotionalPrompt.toLowerCase().includes(storyEmotion)) {
    emotionalPrompt += ` The overall mood/emotion is ${storyEmotion}. `;
  }
  
  return emotionalPrompt;
}

// Ensure setting matches story
export function alignSettingWithStory(
  prompt: string,
  storyText: string,
  extractedSetting: string
): string {
  let alignedPrompt = prompt;
  
  // Common setting mismatches to fix
  const settingCorrections = {
    // If story mentions destruction/danger, don't show cozy scenes
    'destroyed|destruction|danger': {
      remove: ['cozy', 'comfortable', 'peaceful home'],
      add: 'showing environmental concern'
    },
    // If story mentions meeting someone, ensure it's not a solo scene
    'met|greeted|encountered': {
      remove: ['alone', 'solitary'],
      add: 'meeting scene with multiple characters'
    },
    // If story mentions specific location, enforce it
    'underwater|ocean': {
      remove: ['land', 'ground', 'street', 'house'],
      add: 'underwater scene'
    },
    'forest|woods': {
      remove: ['indoor', 'house', 'city'],
      add: 'outdoor forest scene'
    }
  };
  
  // Apply corrections
  for (const [pattern, correction] of Object.entries(settingCorrections)) {
    if (new RegExp(pattern, 'i').test(storyText)) {
      // Remove contradicting elements
      correction.remove.forEach(term => {
        alignedPrompt = alignedPrompt.replace(new RegExp(term, 'gi'), '');
      });
      // Add correct elements
      if (!alignedPrompt.includes(correction.add)) {
        alignedPrompt += ` ${correction.add}. `;
      }
    }
  }
  
  return alignedPrompt;
}

// Master function to fix all issues
export function createAccurateStoryPrompt(
  storyText: string,
  character: CharacterDescription,
  sceneElements: SceneElements,
  storyId: string,
  pageNumber: number
): string {
  console.log(`\n🔧 FIXING PROMPT FOR PAGE ${pageNumber}`);
  console.log('📖 Story text:', storyText);
  console.log('👤 Character:', character.name);
  console.log('🎬 Scene elements:', sceneElements);
  
  // 1. Build accurate base prompt from story
  let finalPrompt = buildAccurateImagePrompt(
    storyText,
    '',
    character,
    sceneElements
  );
  
  // 2. Enforce character consistency
  finalPrompt = enforceCharacterConsistency(
    finalPrompt,
    character,
    storyId
  );
  
  // 3. Align emotional context
  finalPrompt = alignEmotionalContext(
    finalPrompt,
    storyText,
    sceneElements.mood
  );
  
  // 4. Align setting
  finalPrompt = alignSettingWithStory(
    finalPrompt,
    storyText,
    sceneElements.setting
  );
  
  console.log('✅ Fixed prompt:', finalPrompt);
  
  return finalPrompt;
}