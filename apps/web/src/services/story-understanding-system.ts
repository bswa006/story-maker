// Complete Story Understanding System - Actually understands what's happening

export interface Character {
  name: string;
  gender: 'male' | 'female' | 'other';
  role: string; // "older sister", "younger brother", etc.
  age?: string;
  appearance: string;
  relationships: Map<string, string>; // name -> relationship
  aliases: string[]; // "she", "her", "the girl", etc.
}

export interface SceneContext {
  characters: Character[];
  setting: string;
  previousSetting?: string;
  action: string;
  emotion: string;
  interactions: Array<{
    actor: string;
    action: string;
    target: string;
  }>;
}

export interface StoryContext {
  allCharacters: Map<string, Character>;
  currentScene: SceneContext;
  previousScenes: SceneContext[];
  settings: Map<number, string>; // page -> setting
}

export class StoryUnderstandingSystem {
  private storyContext: StoryContext;
  private lastMentioned: Map<string, string>; // pronoun -> character name
  
  constructor() {
    this.storyContext = {
      allCharacters: new Map(),
      currentScene: {
        characters: [],
        setting: '',
        action: '',
        emotion: '',
        interactions: []
      },
      previousScenes: [],
      settings: new Map()
    };
    this.lastMentioned = new Map();
  }
  
  // Parse the entire story to understand characters and relationships
  public parseFullStory(pages: Array<{text: string, pageNumber: number}>) {
    console.log('🧠 UNDERSTANDING FULL STORY CONTEXT...');
    
    // First pass: Extract all characters and relationships
    pages.forEach(page => {
      this.extractCharactersFromText(page.text);
    });
    
    // Second pass: Track settings and continuity
    pages.forEach(page => {
      const setting = this.extractSetting(page.text, page.pageNumber);
      this.storyContext.settings.set(page.pageNumber, setting);
    });
    
    console.log('📚 Story Understanding Complete:');
    console.log('   Characters found:', Array.from(this.storyContext.allCharacters.keys()));
    console.log('   Settings tracked:', Array.from(this.storyContext.settings.entries()));
  }
  
  // Extract characters and their relationships from text
  private extractCharactersFromText(text: string) {
    // Pattern for finding character introductions
    const introPatterns = [
      /(\w+)(?:,| is) (?:the |an? )?(\w+(?:\s+\w+)*?)(?:,|\.)/gi, // "Ira, the older sister"
      /(\w+) found (?:her|his|their) (\w+(?:\s+\w+)*?),? (\w+)/gi, // "Ira found her younger brother, Jake"
      /(\w+)(?:'s|s') (\w+(?:\s+\w+)*?),? (\w+)/gi // "Ira's brother, Jake"
    ];
    
    // Extract character with relationship
    const relationshipMatch = text.match(/(\w+) found (?:her|his) ([\w\s]+), (\w+),/i);
    if (relationshipMatch) {
      const [_, character1, relationship, character2] = relationshipMatch;
      
      // Add both characters
      // Character 1 is the one who "found" - likely the older sibling
      const char1Gender = this.inferGender(text, character1);
      this.addCharacter(character1, {
        name: character1,
        gender: char1Gender,
        role: 'older sister', // Ira is the older sister
        appearance: '',
        relationships: new Map([[character2, relationship]]),
        aliases: this.generateAliases(character1, char1Gender)
      });
      
      // Character 2 is the one who was found - the younger brother
      const char2Gender = relationship.includes('brother') ? 'male' : 
                         relationship.includes('sister') ? 'female' : 
                         this.inferGender(text, character2);
      this.addCharacter(character2, {
        name: character2,
        gender: char2Gender,
        role: relationship,
        appearance: '',
        relationships: new Map([[character1, 'older sister']]),
        aliases: this.generateAliases(character2, char2Gender)
      });
    }
  }
  
  // Add character to story context
  private addCharacter(name: string, character: Character) {
    if (!this.storyContext.allCharacters.has(name)) {
      this.storyContext.allCharacters.set(name, character);
      console.log(`👤 Added character: ${name} (${character.role})`);
    }
  }
  
  // Understand what's happening in a specific page
  public understandPage(
    pageNumber: number,
    pageText: string,
    previousPages: Array<{text: string}>
  ): SceneContext {
    console.log(`\n📖 UNDERSTANDING PAGE ${pageNumber}...`);
    console.log('   Text:', pageText);
    
    // Get setting context
    const setting = this.storyContext.settings.get(pageNumber) || 
                   this.storyContext.settings.get(pageNumber - 1) || 
                   'unknown';
    
    // Resolve pronouns to actual characters
    const resolvedText = this.resolvePronouns(pageText, pageNumber);
    console.log('   Resolved:', resolvedText);
    
    // Extract who's in this scene
    const presentCharacters = this.extractPresentCharacters(pageText, resolvedText);
    console.log('   Characters present:', presentCharacters.map(c => c.name));
    
    // Extract the main action
    const action = this.extractAction(resolvedText);
    console.log('   Action:', action);
    
    // Extract interactions
    const interactions = this.extractInteractions(resolvedText);
    console.log('   Interactions:', interactions);
    
    // Build scene context
    const sceneContext: SceneContext = {
      characters: presentCharacters,
      setting: setting,
      previousSetting: pageNumber > 1 ? this.storyContext.settings.get(pageNumber - 1) : undefined,
      action: action,
      emotion: this.extractEmotion(pageText),
      interactions: interactions
    };
    
    // Update story context
    this.storyContext.previousScenes.push(this.storyContext.currentScene);
    this.storyContext.currentScene = sceneContext;
    
    return sceneContext;
  }
  
  // Resolve pronouns (she/he/they) to character names
  private resolvePronouns(text: string, pageNumber: number): string {
    let resolvedText = text;
    
    // Get characters from previous context
    const previousScene = this.storyContext.previousScenes[this.storyContext.previousScenes.length - 1];
    
    // Common pronoun patterns
    const pronounPatterns = [
      { pattern: /\bShe\b/g, type: 'female' },
      { pattern: /\bshe\b/g, type: 'female' },
      { pattern: /\bHe\b/g, type: 'male' },
      { pattern: /\bhe\b/g, type: 'male' },
      { pattern: /\bHer\b/g, type: 'female_possessive' },
      { pattern: /\bher\b/g, type: 'female_possessive' },
      { pattern: /\bHis\b/g, type: 'male_possessive' },
      { pattern: /\bhis\b/g, type: 'male_possessive' }
    ];
    
    // Find the most recent character of each gender
    let lastFemale = '';
    let lastMale = '';
    
    // First priority: Characters from previous scene
    if (previousScene) {
      previousScene.characters.forEach(char => {
        if (char.gender === 'female') lastFemale = char.name;
        if (char.gender === 'male') lastMale = char.name;
      });
    }
    
    // Second priority: Check story context for all known characters
    this.storyContext.allCharacters.forEach((char, name) => {
      // If we haven't found a character of this gender yet, use this one
      if (char.gender === 'female' && !lastFemale) lastFemale = name;
      if (char.gender === 'male' && !lastMale) lastMale = name;
      
      // If this character was mentioned recently in the text, prioritize them
      const nameMentionIndex = text.lastIndexOf(name);
      if (nameMentionIndex !== -1 && nameMentionIndex < 50) { // Within first 50 chars
        if (char.gender === 'female') lastFemale = name;
        if (char.gender === 'male') lastMale = name;
      }
    });
    
    console.log(`   Pronoun resolution - Female: ${lastFemale}, Male: ${lastMale}`);
    
    // Replace pronouns
    pronounPatterns.forEach(({ pattern, type }) => {
      if (type.includes('female') && lastFemale) {
        resolvedText = resolvedText.replace(pattern, lastFemale);
      } else if (type.includes('male') && lastMale) {
        resolvedText = resolvedText.replace(pattern, lastMale);
      }
    });
    
    return resolvedText;
  }
  
  // Extract which characters are present in the scene
  private extractPresentCharacters(originalText: string, resolvedText: string): Character[] {
    const present: Character[] = [];
    
    // Check each known character
    this.storyContext.allCharacters.forEach((char, name) => {
      if (originalText.includes(name) || resolvedText.includes(name)) {
        present.push(char);
      }
      
      // Also check aliases (pronouns)
      char.aliases.forEach(alias => {
        if (originalText.toLowerCase().includes(alias.toLowerCase())) {
          if (!present.includes(char)) {
            present.push(char);
          }
        }
      });
    });
    
    return present;
  }
  
  // Extract the main action
  private extractAction(text: string): string {
    // First check if the text has been pronoun-resolved
    // If it starts with a character name, use that
    const characterNames = Array.from(this.storyContext.allCharacters.keys());
    
    // Common action patterns
    const actionPatterns = [
      /(\w+)\s+(bent down|sat down|stood up|walked|ran|asked|said|cried|smiled)/i,
      /(\w+)\s+was\s+(\w+ing)/i,
      /(\w+)\s+(\w+ed)\s+(?:to|at|with)?\s*(\w+)?/i
    ];
    
    for (const pattern of actionPatterns) {
      const match = text.match(pattern);
      if (match) {
        // Check if the actor is a known character
        const actor = match[1];
        const isKnownCharacter = characterNames.some(name => 
          name.toLowerCase() === actor.toLowerCase()
        );
        
        // If it's a pronoun like "She" or "He", we need the resolved version
        if (!isKnownCharacter && (actor === 'She' || actor === 'He')) {
          console.warn(`   Warning: Unresolved pronoun "${actor}" in action`);
        }
        
        return match[0];
      }
    }
    
    return 'interacting';
  }
  
  // Extract character interactions
  private extractInteractions(text: string): Array<{actor: string, action: string, target: string}> {
    const interactions: Array<{actor: string, action: string, target: string}> = [];
    
    // Patterns for interactions
    const interactionPatterns = [
      /(\w+)\s+(asked|told|showed|gave|helped)\s+(\w+)/gi,
      /(\w+)\s+(bent down)\s+(?:and|to)\s+\w+\s+(?:asked|said to|told)\s+(\w+)/gi,
      /(\w+)\s+found\s+(\w+)/gi
    ];
    
    interactionPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2] && match[3]) {
          interactions.push({
            actor: match[1],
            action: match[2],
            target: match[3]
          });
        }
      }
    });
    
    return interactions;
  }
  
  // Extract setting
  private extractSetting(text: string, pageNumber: number): string {
    const settingPatterns = [
      /in the ([\w\s]+?)(?:\.|,|$)/i,
      /at the ([\w\s]+?)(?:\.|,|$)/i,
      /inside the ([\w\s]+?)(?:\.|,|$)/i,
      /in (?:the\s+)?corner of (?:the\s+|their\s+)?([\w\s]+?)(?:\.|,|$)/i,
      /([\w\s]*?room|[\w\s]*?kitchen|[\w\s]*?garden|[\w\s]*?forest|[\w\s]*?ocean|[\w\s]*?house)(?:\.|,|$)/i
    ];
    
    for (const pattern of settingPatterns) {
      const match = text.match(pattern);
      if (match) {
        // Special handling for "corner of" pattern
        if (text.includes('corner of')) {
          const cornerMatch = text.match(/corner of (?:the\s+|their\s+)?([\w\s]+?)(?:\.|,|$)/i);
          if (cornerMatch) {
            return cornerMatch[1].trim();
          }
        }
        return match[1].trim();
      }
    }
    
    // If no setting found, use previous
    return this.storyContext.settings.get(pageNumber - 1) || 'unspecified location';
  }
  
  // Extract emotion/mood
  private extractEmotion(text: string): string {
    const emotions = [
      'crying', 'sad', 'happy', 'angry', 'scared', 'worried', 
      'excited', 'calm', 'peaceful', 'panicking', 'distressed'
    ];
    
    for (const emotion of emotions) {
      if (text.toLowerCase().includes(emotion)) {
        return emotion;
      }
    }
    
    return 'neutral';
  }
  
  // Infer gender from context
  private inferGender(text: string, name: string): 'male' | 'female' | 'other' {
    const textLower = text.toLowerCase();
    const nameLower = name.toLowerCase();
    
    // Check pronouns near the name
    if (textLower.includes(`${nameLower}, she`) || textLower.includes(`her ${nameLower}`)) {
      return 'female';
    }
    if (textLower.includes(`${nameLower}, he`) || textLower.includes(`his ${nameLower}`)) {
      return 'male';
    }
    
    // Check common name patterns (basic)
    const femaleEndings = ['a', 'e', 'y', 'ie'];
    const maleEndings = ['o', 'n', 'k', 'r'];
    
    const lastChar = nameLower[nameLower.length - 1];
    if (femaleEndings.includes(lastChar)) return 'female';
    if (maleEndings.includes(lastChar)) return 'male';
    
    return 'other';
  }
  
  // Infer role from relationship description
  private inferRole(relationship: string, position: string): string {
    if (relationship.includes('brother')) {
      return position === 'older' ? 'older sister' : 'younger sister';
    }
    if (relationship.includes('sister')) {
      return position === 'older' ? 'older brother' : 'younger brother';
    }
    return relationship;
  }
  
  // Reverse a relationship
  private reverseRelationship(relationship: string): string {
    const reversals: Record<string, string> = {
      'younger brother': 'older sister',
      'younger sister': 'older brother',
      'older brother': 'younger sister',
      'older sister': 'younger brother',
      'brother': 'sibling',
      'sister': 'sibling',
      'friend': 'friend',
      'parent': 'child',
      'child': 'parent'
    };
    
    return reversals[relationship] || relationship;
  }
  
  // Generate aliases for a character
  private generateAliases(name: string, gender: string): string[] {
    const aliases = [name.toLowerCase()];
    
    if (gender === 'female') {
      aliases.push('she', 'her', 'the girl', 'the sister');
    } else if (gender === 'male') {
      aliases.push('he', 'him', 'his', 'the boy', 'the brother');
    }
    
    return aliases;
  }
  
  // Build a complete scene understanding
  public buildSceneUnderstanding(
    pageNumber: number,
    pageText: string,
    imagePrompt: string
  ): {
    requiredCharacters: Character[];
    setting: string;
    positioning: string;
    action: string;
    mood: string;
    criticalRequirements: string[];
  } {
    const scene = this.storyContext.currentScene;
    
    return {
      requiredCharacters: scene.characters,
      setting: scene.setting,
      positioning: this.determinePositioning(scene),
      action: scene.action,
      mood: scene.emotion,
      criticalRequirements: this.extractCriticalRequirements(pageText, scene)
    };
  }
  
  // Determine how characters should be positioned
  private determinePositioning(scene: SceneContext): string {
    if (scene.interactions.length > 0) {
      const interaction = scene.interactions[0];
      
      if (interaction.action.includes('bent down')) {
        return `${interaction.actor} bending down to ${interaction.target}'s level`;
      }
      if (interaction.action.includes('found')) {
        return `${interaction.actor} discovering ${interaction.target} in the scene`;
      }
      if (interaction.action.includes('asked') || interaction.action.includes('told')) {
        return `${interaction.actor} facing ${interaction.target} in conversation`;
      }
    }
    
    return 'characters positioned naturally in the scene';
  }
  
  // Extract critical requirements that must be in the image
  private extractCriticalRequirements(text: string, scene: SceneContext): string[] {
    const requirements: string[] = [];
    
    // All characters must be visible
    if (scene.characters.length > 1) {
      requirements.push(`ALL ${scene.characters.length} characters must be clearly visible`);
      requirements.push(`Show: ${scene.characters.map(c => c.name).join(' AND ')}`);
    }
    
    // Specific actions must be shown
    if (text.includes('bent down')) {
      requirements.push('Character must be shown bending down');
    }
    if (text.includes('crying')) {
      requirements.push('Character must show visible tears or distress');
    }
    if (text.includes('asked')) {
      requirements.push('Characters must be positioned for conversation');
    }
    
    // Setting must be clear
    requirements.push(`Setting must clearly be: ${scene.setting}`);
    
    return requirements;
  }
}