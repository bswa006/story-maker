// Scene Element Extraction System - Extracts key visual elements from story text

export interface SceneElements {
  setting: string;           // WHERE: ocean, forest, home, school, etc.
  specificLocation?: string; // More specific: underwater, deep ocean, coral reef
  action: string;           // WHAT: swimming, talking, exploring, playing
  characters: string[];     // WHO: Emma, Turtle named Tito, friendly fish
  mood: string;            // FEEL: excited, peaceful, adventurous, curious
  keyObjects: string[];    // ITEMS: crown, toothbrush, treasure chest
  timeOfDay?: string;      // WHEN: morning, sunset, night
  weather?: string;        // CONDITIONS: sunny, stormy, foggy
}

// Common setting patterns
const SETTING_PATTERNS = {
  water: /\b(ocean|sea|underwater|lake|river|pond|beach|waves|depths|aquatic|marine)\b/i,
  forest: /\b(forest|woods|trees|jungle|grove|woodland)\b/i,
  home: /\b(home|house|room|bedroom|kitchen|living room|yard|garden)\b/i,
  sky: /\b(sky|clouds|flying|air|heaven|atmosphere)\b/i,
  mountain: /\b(mountain|hill|peak|cliff|valley)\b/i,
  city: /\b(city|town|street|building|neighborhood|urban)\b/i,
  school: /\b(school|classroom|playground|library)\b/i,
  fantasy: /\b(castle|kingdom|magical|enchanted|fairyland)\b/i,
};

// Action verb patterns
const ACTION_PATTERNS = {
  movement: /\b(swim|swam|swimming|dive|dove|diving|fly|flew|flying|run|ran|running|walk|walked|walking|jump|jumped|jumping|climb|climbed|climbing)\b/i,
  interaction: /\b(meet|met|meeting|talk|talked|talking|play|played|playing|help|helped|helping|share|shared|sharing|teach|taught|teaching)\b/i,
  discovery: /\b(find|found|finding|discover|discovered|discovering|explore|explored|exploring|search|searched|searching|learn|learned|learning)\b/i,
  emotion: /\b(smile|smiled|smiling|laugh|laughed|laughing|cry|cried|crying|hug|hugged|hugging)\b/i,
};

// Mood/emotion patterns
const MOOD_PATTERNS = {
  positive: /\b(happy|excited|joyful|cheerful|peaceful|calm|content|proud|brave|confident)\b/i,
  adventurous: /\b(adventure|adventurous|curious|explore|discover|journey|quest)\b/i,
  magical: /\b(magical|wonder|amazing|enchanted|mystical|fantastic|extraordinary)\b/i,
  cozy: /\b(cozy|warm|comfortable|safe|gentle|quiet|serene)\b/i,
};

export function extractSceneElements(text: string): SceneElements {
  const elements: SceneElements = {
    setting: 'unknown',
    action: 'exploring',
    characters: [],
    mood: 'peaceful',
    keyObjects: [],
  };

  // Extract setting
  for (const [settingType, pattern] of Object.entries(SETTING_PATTERNS)) {
    if (pattern.test(text)) {
      elements.setting = settingType;
      const match = text.match(pattern);
      if (match) {
        elements.specificLocation = match[0].toLowerCase();
      }
      break;
    }
  }

  // Extract specific water settings
  if (elements.setting === 'water') {
    if (/\b(underwater|beneath|depths|deep|submerged)\b/i.test(text)) {
      elements.specificLocation = 'underwater';
    } else if (/\b(beach|shore|sand|coast)\b/i.test(text)) {
      elements.specificLocation = 'beach';
    } else if (/\b(ocean)\b/i.test(text)) {
      elements.specificLocation = 'ocean';
    }
  }

  // Extract action
  for (const [actionType, pattern] of Object.entries(ACTION_PATTERNS)) {
    const match = text.match(pattern);
    if (match) {
      elements.action = match[0].toLowerCase();
      break;
    }
  }

  // Extract characters (proper nouns and named entities)
  // Look for character patterns
  const characterPatterns = [
    /\b([A-Z][a-z]+)(?:\s+(?:the|a|an)\s+)?(?:and|met|saw|found|with)\b/g,  // "Emma met"
    /\b(?:named|called)\s+([A-Z][a-z]+)\b/g,  // "named Tito"
    /\b([A-Z][a-z]+)(?:'s|,)\b/g,  // "Emma's" or "Emma,"
    /\b(turtle|fish|bird|lion|monkey|ant|butterfly|dog|cat|rabbit|bear|elephant|dragon)\b/gi,  // Animals
  ];

  const foundCharacters = new Set<string>();
  
  // Extract main character (usually first capitalized name)
  const mainCharMatch = text.match(/\b[A-Z][a-z]+\b/);
  if (mainCharMatch) {
    foundCharacters.add(mainCharMatch[0]);
  }

  // Extract other characters
  characterPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1] !== 'The' && match[1] !== 'A' && match[1] !== 'An') {
        foundCharacters.add(match[1]);
      }
    }
  });

  // Special handling for "named X" pattern
  const namedMatch = text.match(/\b(?:named|called)\s+([A-Z][a-z]+)\b/);
  if (namedMatch) {
    foundCharacters.add(namedMatch[1]);
  }

  elements.characters = Array.from(foundCharacters);

  // Extract mood
  for (const [moodType, pattern] of Object.entries(MOOD_PATTERNS)) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        elements.mood = match[0].toLowerCase();
      }
      break;
    }
  }

  // Extract key objects
  const objectPatterns = [
    /\b(crown|toothbrush|brush|book|toy|ball|flower|treasure|chest|key|door|window|boat|ship)\b/gi,
    /\b(magical|glowing|sparkling|shiny|golden|silver)\s+(\w+)\b/gi,
  ];

  const foundObjects = new Set<string>();
  objectPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      foundObjects.add(match[0].toLowerCase());
    }
  });

  elements.keyObjects = Array.from(foundObjects);

  // Extract time of day
  const timeMatch = text.match(/\b(morning|afternoon|evening|night|sunset|sunrise|dawn|dusk|noon|midnight)\b/i);
  if (timeMatch) {
    elements.timeOfDay = timeMatch[0].toLowerCase();
  }

  // Extract weather
  const weatherMatch = text.match(/\b(sunny|rainy|stormy|cloudy|foggy|misty|clear|windy|snowy)\b/i);
  if (weatherMatch) {
    elements.weather = weatherMatch[0].toLowerCase();
  }

  return elements;
}

// Enhanced extraction for specific story patterns
export function extractEnhancedSceneElements(
  text: string,
  previousElements?: SceneElements
): SceneElements {
  const basicElements = extractSceneElements(text);
  
  // Enhance with context from previous scenes
  if (previousElements) {
    // Maintain character continuity
    const previousCharacters = previousElements.characters;
    previousCharacters.forEach(char => {
      if (text.toLowerCase().includes(char.toLowerCase()) && !basicElements.characters.includes(char)) {
        basicElements.characters.push(char);
      }
    });
    
    // Maintain setting if not explicitly changed
    if (basicElements.setting === 'unknown' && previousElements.setting) {
      basicElements.setting = previousElements.setting;
      basicElements.specificLocation = previousElements.specificLocation;
    }
  }
  
  // Special handling for underwater scenes
  if (text.toLowerCase().includes('plunged into') || text.toLowerCase().includes('dove into')) {
    if (basicElements.setting === 'water') {
      basicElements.specificLocation = 'underwater';
      basicElements.action = 'diving';
    }
  }
  
  return basicElements;
}

// Validate extracted elements make sense
export function validateSceneElements(elements: SceneElements): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for required elements
  if (elements.setting === 'unknown') {
    issues.push('Could not determine setting/location');
  }
  
  if (elements.characters.length === 0) {
    issues.push('No characters identified');
  }
  
  if (elements.action === 'exploring' && elements.setting !== 'unknown') {
    // This is okay, generic action for specific setting
  }
  
  // Check for logical consistency
  if (elements.setting === 'water' && elements.specificLocation === 'underwater') {
    // Underwater specific checks
    if (elements.action === 'flying') {
      issues.push('Action "flying" inconsistent with underwater setting');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Convert scene elements to natural language description
export function sceneElementsToDescription(elements: SceneElements): string {
  let description = '';
  
  // Setting
  if (elements.specificLocation) {
    description += `The scene takes place ${elements.specificLocation}. `;
  } else {
    description += `The scene takes place in a ${elements.setting}. `;
  }
  
  // Characters
  if (elements.characters.length > 0) {
    description += `Characters present: ${elements.characters.join(', ')}. `;
  }
  
  // Action
  description += `The main action is ${elements.action}. `;
  
  // Mood
  description += `The mood is ${elements.mood}. `;
  
  // Objects
  if (elements.keyObjects.length > 0) {
    description += `Important objects: ${elements.keyObjects.join(', ')}. `;
  }
  
  // Time and weather
  if (elements.timeOfDay) {
    description += `Time: ${elements.timeOfDay}. `;
  }
  if (elements.weather) {
    description += `Weather: ${elements.weather}. `;
  }
  
  return description.trim();
}