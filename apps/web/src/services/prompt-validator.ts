// Prompt Validation System - Ensures prompts match story content

import { SceneElements, extractSceneElements } from './scene-element-extractor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
}

export interface ValidationRule {
  name: string;
  check: (storyText: string, prompt: string, sceneElements: SceneElements) => boolean;
  errorMessage: string;
  suggestion: string;
  severity: 'error' | 'warning';
}

// Core validation rules
const VALIDATION_RULES: ValidationRule[] = [
  {
    name: 'setting_match',
    check: (_, prompt, elements) => {
      const promptLower = prompt.toLowerCase();
      if (elements.specificLocation) {
        return promptLower.includes(elements.specificLocation.toLowerCase());
      }
      return promptLower.includes(elements.setting.toLowerCase());
    },
    errorMessage: 'Prompt missing required setting/location',
    suggestion: 'Add the specific location mentioned in the story',
    severity: 'error'
  },
  
  {
    name: 'main_character_present',
    check: (_, prompt, elements) => {
      if (elements.characters.length === 0) return true; // No characters to check
      const promptLower = prompt.toLowerCase();
      return elements.characters.some(char => promptLower.includes(char.toLowerCase()));
    },
    errorMessage: 'Main character not mentioned in prompt',
    suggestion: 'Include the character name explicitly',
    severity: 'error'
  },
  
  {
    name: 'action_represented',
    check: (_, prompt, elements) => {
      const promptLower = prompt.toLowerCase();
      const actionWords = elements.action.split(/\s+/);
      return actionWords.some(word => promptLower.includes(word.toLowerCase()));
    },
    errorMessage: 'Action from story not represented in prompt',
    suggestion: 'Describe what the character is doing',
    severity: 'warning'
  },
  
  {
    name: 'underwater_specificity',
    check: (story, prompt, elements) => {
      if (!story.toLowerCase().includes('underwater') && 
          !story.toLowerCase().includes('ocean depths') &&
          !story.toLowerCase().includes('beneath')) {
        return true; // Not an underwater scene
      }
      const promptLower = prompt.toLowerCase();
      return promptLower.includes('underwater') || 
             promptLower.includes('submerged') ||
             promptLower.includes('beneath the water');
    },
    errorMessage: 'Underwater scene not clearly specified',
    suggestion: 'Explicitly state "underwater" or "submerged" for ocean depth scenes',
    severity: 'error'
  },
  
  {
    name: 'character_with_animal',
    check: (story, prompt, elements) => {
      // Check if story mentions character meeting/with an animal
      const hasAnimalInteraction = story.match(/\b(met|meet|meets|with|saw|found)\s+(?:a|an|the)?\s*(turtle|fish|bird|lion|dog|cat|monkey|butterfly)\b/i);
      if (!hasAnimalInteraction) return true;
      
      const animal = hasAnimalInteraction[2];
      const promptLower = prompt.toLowerCase();
      return promptLower.includes(animal.toLowerCase());
    },
    errorMessage: 'Animal character mentioned in story missing from prompt',
    suggestion: 'Include all characters mentioned in the story text',
    severity: 'error'
  },
  
  {
    name: 'key_objects_included',
    check: (_, prompt, elements) => {
      if (elements.keyObjects.length === 0) return true;
      const promptLower = prompt.toLowerCase();
      // At least half of key objects should be mentioned
      const mentionedObjects = elements.keyObjects.filter(obj => 
        promptLower.includes(obj.toLowerCase())
      );
      return mentionedObjects.length >= Math.ceil(elements.keyObjects.length / 2);
    },
    errorMessage: 'Important objects from story not included',
    suggestion: 'Include key objects mentioned in the story',
    severity: 'warning'
  },
  
  {
    name: 'no_contradictions',
    check: (story, prompt, elements) => {
      const promptLower = prompt.toLowerCase();
      
      // Check for setting contradictions
      if (elements.specificLocation === 'underwater' && 
          (promptLower.includes('standing') || 
           promptLower.includes('walking') ||
           promptLower.includes('on the ground'))) {
        return false;
      }
      
      // Check for time contradictions
      if (story.includes('night') && promptLower.includes('sunny')) {
        return false;
      }
      
      return true;
    },
    errorMessage: 'Prompt contains contradictions with story',
    suggestion: 'Ensure prompt elements match story context',
    severity: 'error'
  }
];

// Main validation function
export function validatePromptMatchesStory(
  storyText: string,
  imagePrompt: string,
  providedElements?: SceneElements
): ValidationResult {
  const sceneElements = providedElements || extractSceneElements(storyText);
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  let passedRules = 0;
  let totalWeight = 0;
  
  // Run all validation rules
  VALIDATION_RULES.forEach(rule => {
    const passed = rule.check(storyText, imagePrompt, sceneElements);
    const weight = rule.severity === 'error' ? 2 : 1;
    totalWeight += weight;
    
    if (passed) {
      passedRules += weight;
    } else {
      if (rule.severity === 'error') {
        errors.push(rule.errorMessage);
      } else {
        warnings.push(rule.errorMessage);
      }
      suggestions.push(rule.suggestion);
    }
  });
  
  // Calculate score
  const score = Math.round((passedRules / totalWeight) * 100);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions: [...new Set(suggestions)], // Remove duplicates
    score
  };
}

// Enhanced validation for specific story types
export function validateSpecificStoryType(
  storyText: string,
  imagePrompt: string,
  storyType: 'underwater' | 'forest' | 'home' | 'sky' | 'general'
): ValidationResult {
  const baseValidation = validatePromptMatchesStory(storyText, imagePrompt);
  
  // Add story-type specific validations
  switch (storyType) {
    case 'underwater':
      return validateUnderwaterScene(storyText, imagePrompt, baseValidation);
    case 'forest':
      return validateForestScene(storyText, imagePrompt, baseValidation);
    // Add more as needed
    default:
      return baseValidation;
  }
}

function validateUnderwaterScene(
  storyText: string,
  imagePrompt: string,
  baseValidation: ValidationResult
): ValidationResult {
  const promptLower = imagePrompt.toLowerCase();
  
  // Underwater-specific checks
  const underwaterElements = ['water', 'ocean', 'sea', 'underwater', 'fish', 'coral', 'swimming'];
  const hasUnderwaterElements = underwaterElements.some(element => promptLower.includes(element));
  
  if (!hasUnderwaterElements) {
    baseValidation.errors.push('Underwater scene lacks water-related elements');
    baseValidation.suggestions.push('Add underwater elements: water, fish, coral, etc.');
    baseValidation.valid = false;
    baseValidation.score = Math.max(0, baseValidation.score - 20);
  }
  
  // Check for contradictory elements
  const landElements = ['standing on ground', 'walking', 'grass', 'trees', 'street'];
  const hasLandElements = landElements.some(element => promptLower.includes(element));
  
  if (hasLandElements) {
    baseValidation.errors.push('Underwater scene contains land elements');
    baseValidation.suggestions.push('Remove land-based elements from underwater scene');
    baseValidation.valid = false;
    baseValidation.score = Math.max(0, baseValidation.score - 30);
  }
  
  return baseValidation;
}

function validateForestScene(
  storyText: string,
  imagePrompt: string,
  baseValidation: ValidationResult
): ValidationResult {
  const promptLower = imagePrompt.toLowerCase();
  
  // Forest-specific checks
  const forestElements = ['trees', 'forest', 'woods', 'leaves', 'nature'];
  const hasForestElements = forestElements.some(element => promptLower.includes(element));
  
  if (!hasForestElements) {
    baseValidation.warnings.push('Forest scene could be more specific');
    baseValidation.suggestions.push('Add forest elements: trees, leaves, woodland creatures');
    baseValidation.score = Math.max(0, baseValidation.score - 10);
  }
  
  return baseValidation;
}

// Quick validation for real-time feedback
export function quickValidatePrompt(
  prompt: string,
  requiredElements: {
    setting?: string;
    characters?: string[];
    action?: string;
    objects?: string[];
  }
): {
  valid: boolean;
  missing: string[];
} {
  const promptLower = prompt.toLowerCase();
  const missing: string[] = [];
  
  if (requiredElements.setting && !promptLower.includes(requiredElements.setting.toLowerCase())) {
    missing.push(`Setting: ${requiredElements.setting}`);
  }
  
  requiredElements.characters?.forEach(char => {
    if (!promptLower.includes(char.toLowerCase())) {
      missing.push(`Character: ${char}`);
    }
  });
  
  if (requiredElements.action && !promptLower.includes(requiredElements.action.toLowerCase())) {
    missing.push(`Action: ${requiredElements.action}`);
  }
  
  requiredElements.objects?.forEach(obj => {
    if (!promptLower.includes(obj.toLowerCase())) {
      missing.push(`Object: ${obj}`);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// Generate fix suggestions for validation errors
export function generateFixSuggestions(
  errors: string[],
  sceneElements: SceneElements
): string[] {
  const suggestions: string[] = [];
  
  errors.forEach(error => {
    if (error.includes('setting')) {
      suggestions.push(`Add to prompt: "The scene takes place ${sceneElements.specificLocation || sceneElements.setting}"`);
    }
    
    if (error.includes('character')) {
      suggestions.push(`Add to prompt: "${sceneElements.characters.join(' and ')} appear in this scene"`);
    }
    
    if (error.includes('underwater')) {
      suggestions.push('Specify: "completely underwater scene with visible water, fish, and ocean elements"');
    }
    
    if (error.includes('action')) {
      suggestions.push(`Describe the action: "${sceneElements.action}"`);
    }
  });
  
  return suggestions;
}