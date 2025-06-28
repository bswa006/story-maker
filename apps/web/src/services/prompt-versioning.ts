import { z } from 'zod';

// Prompt template schema
export const PromptTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  category: z.enum(['character', 'scene', 'style', 'technical']),
  template: z.string(),
  variables: z.array(z.string()),
  testResults: z.object({
    totalUses: z.number().default(0),
    successRate: z.number().default(0),
    avgQualityScore: z.number().default(0),
    avgConsistencyScore: z.number().default(0),
    lastUpdated: z.date().optional(),
  }),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

// A/B test configuration
export interface ABTestConfig {
  id: string;
  name: string;
  templateA: string;
  templateB: string;
  startDate: Date;
  endDate?: Date;
  results: {
    templateA: TestResults;
    templateB: TestResults;
  };
  winner?: string;
}

export interface TestResults {
  uses: number;
  successRate: number;
  avgQualityScore: number;
  avgConsistencyScore: number;
  userFeedback: number;
}

// Prompt optimization engine
export class PromptOptimizer {
  private templates: Map<string, PromptTemplate> = new Map();
  private abTests: Map<string, ABTestConfig> = new Map();
  
  // Character consistency prompts with versions
  private characterPrompts = {
    v1_basic: {
      id: 'char_basic_v1',
      name: 'Basic Character Description',
      version: '1.0',
      category: 'character' as const,
      template: `Character: {name}, {age} years old, with {hairColor} hair and {eyeColor} eyes`,
      variables: ['name', 'age', 'hairColor', 'eyeColor'],
      testResults: {
        totalUses: 0,
        successRate: 0.7,
        avgQualityScore: 6,
        avgConsistencyScore: 5,
      },
      active: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    
    v2_detailed: {
      id: 'char_detailed_v2',
      name: 'Detailed Character Sheet',
      version: '2.0',
      category: 'character' as const,
      template: `
CHARACTER REFERENCE SHEET:
Name: {name}
Age: {age}
Physical Appearance:
- Face: {faceShape} shaped face with {complexion} complexion
- Eyes: {eyeColor} colored, {eyeShape} shaped eyes with {eyeExpression}
- Hair: {hairTexture} {hairColor} hair, {hairLength} length in {hairStyle} style
- Build: {height} height, {bodyType} build
- Distinctive features: {distinctiveFeatures}

CRITICAL: Maintain these EXACT features in every illustration`,
      variables: ['name', 'age', 'faceShape', 'complexion', 'eyeColor', 'eyeShape', 'eyeExpression', 
                 'hairTexture', 'hairColor', 'hairLength', 'hairStyle', 'height', 'bodyType', 'distinctiveFeatures'],
      testResults: {
        totalUses: 150,
        successRate: 0.85,
        avgQualityScore: 8,
        avgConsistencyScore: 7.5,
      },
      active: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-06-01'),
    },
    
    v3_ultra: {
      id: 'char_ultra_v3',
      name: 'Ultra-Detailed Character DNA',
      version: '3.0',
      category: 'character' as const,
      template: `
[CHARACTER DNA - ABSOLUTE CONSISTENCY REQUIRED]

IDENTITY: {name}, {age} years old

FACIAL ARCHITECTURE:
• Face Shape: {faceShape} with {faceWidth} width and {faceLengthRatio} length ratio
• Forehead: {foreheadHeight} height, {foreheadWidth} width
• Cheekbones: {cheekboneProminence} prominence at {cheekbonePosition} position
• Jawline: {jawlineShape} shaped with {chinShape} chin
• Facial Symmetry: {symmetryNotes}

EYE SPECIFICATIONS:
• Color: {eyeColorDetailed} (iris pattern: {irisPattern})
• Shape: {eyeShape} with {eyeTilt} degree tilt
• Size: {eyeSize} ({eyeWidthMm}mm width)
• Spacing: {eyeSpacing} apart
• Eyelids: {eyelidType} with {eyelidCrease}
• Eyebrows: {eyebrowShape} shape, {eyebrowThickness} thick, {eyebrowColor} color
• Lashes: {lashLength} length, {lashDensity} density

NOSE PROFILE:
• Bridge: {noseBridge} with {noseBridgeWidth}mm width
• Tip: {noseTipShape} shaped, {noseTipAngle} degree angle
• Nostrils: {nostrilShape} shaped, {nostrilSize} size
• Profile: {noseProfile} from side view

MOUTH ARCHITECTURE:
• Lip Shape: Upper - {upperLipShape}, Lower - {lowerLipShape}
• Lip Fullness: {lipFullness} with {lipRatio} ratio
• Mouth Width: {mouthWidth} relative to nose
• Natural Expression: {naturalMouthExpression}

HAIR BLUEPRINT:
• Color Formula: {hairColorFormula} with {hairHighlights} highlights
• Texture Pattern: {hairTexturePattern} with {hairCurlPattern} curl pattern
• Density: {hairDensity} per sq cm
• Growth Pattern: {hairGrowthPattern} with {hairPartLocation} part
• Length Specifics: {hairLengthExact} from crown
• Styling DNA: {hairStylingDetails}

SKIN CANVAS:
• Base Tone: {skinToneBase} with {skinUndertone} undertone
• Texture: {skinTexture} with {poreVisibility} pore visibility
• Unique Marks: {skinMarks}
• Lighting Response: {skinLightingResponse}

PROPORTIONAL MATHEMATICS:
• Head to Body Ratio: 1:{headBodyRatio}
• Shoulder Width: {shoulderWidth} head widths
• Arm Length: {armLength} relative to height
• Leg Proportion: {legProportion} of total height

MOVEMENT SIGNATURE:
• Posture: {postureDescription}
• Energy Level: {energyLevel}
• Characteristic Gestures: {characteristicGestures}

RENDERING INSTRUCTIONS:
✓ Lock these features across ALL illustrations
✓ Reference this DNA for every single image
✓ NO variations allowed in core features
✓ Clothing and expressions can change, physical features CANNOT`,
      variables: [
        'name', 'age', 'faceShape', 'faceWidth', 'faceLengthRatio', 'foreheadHeight', 'foreheadWidth',
        'cheekboneProminence', 'cheekbonePosition', 'jawlineShape', 'chinShape', 'symmetryNotes',
        'eyeColorDetailed', 'irisPattern', 'eyeShape', 'eyeTilt', 'eyeSize', 'eyeWidthMm', 'eyeSpacing',
        'eyelidType', 'eyelidCrease', 'eyebrowShape', 'eyebrowThickness', 'eyebrowColor',
        'lashLength', 'lashDensity', 'noseBridge', 'noseBridgeWidth', 'noseTipShape', 'noseTipAngle',
        'nostrilShape', 'nostrilSize', 'noseProfile', 'upperLipShape', 'lowerLipShape', 'lipFullness',
        'lipRatio', 'mouthWidth', 'naturalMouthExpression', 'hairColorFormula', 'hairHighlights',
        'hairTexturePattern', 'hairCurlPattern', 'hairDensity', 'hairGrowthPattern', 'hairPartLocation',
        'hairLengthExact', 'hairStylingDetails', 'skinToneBase', 'skinUndertone', 'skinTexture',
        'poreVisibility', 'skinMarks', 'skinLightingResponse', 'headBodyRatio', 'shoulderWidth',
        'armLength', 'legProportion', 'postureDescription', 'energyLevel', 'characteristicGestures'
      ],
      testResults: {
        totalUses: 50,
        successRate: 0.95,
        avgQualityScore: 9.5,
        avgConsistencyScore: 9.2,
      },
      active: true,
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-06-26'),
    },
    
    v3_ultra_quality: {
      id: 'ultra_quality_v3',
      name: 'Ultra Quality Master Prompts',
      version: '3.0',
      category: 'character' as const,
      template: `Uses generateUltraPrompt for maximum quality`,
      variables: ['all'],
      testResults: {
        totalUses: 10,
        successRate: 0.98,
        avgQualityScore: 9.8,
        avgConsistencyScore: 9.7,
      },
      active: true,
      createdAt: new Date('2024-06-26'),
      updatedAt: new Date('2024-06-26'),
    }
  };
  
  // Scene composition prompts
  private scenePrompts = {
    v1_standard: {
      id: 'scene_standard_v1',
      name: 'Standard Scene Description',
      version: '1.0',
      category: 'scene' as const,
      template: `Scene: {sceneDescription} featuring {characterName}`,
      variables: ['sceneDescription', 'characterName'],
      testResults: {
        totalUses: 200,
        successRate: 0.75,
        avgQualityScore: 7,
        avgConsistencyScore: 6,
      },
      active: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    
    v2_cinematic: {
      id: 'scene_cinematic_v2',
      name: 'Cinematic Scene Composition',
      version: '2.0',
      category: 'scene' as const,
      template: `
CINEMATIC SCENE COMPOSITION:

ACTION: {mainAction}
SETTING: {detailedSetting}
TIME: {timeOfDay} with {lightingCondition}
MOOD: {emotionalTone}

CAMERA ANGLE: {cameraAngle}
FOCAL POINT: {focalPoint}
DEPTH: {foreground} / {midground} / {background}

CHARACTER PLACEMENT: {characterName} is {characterPosition} while {characterAction}
CHARACTER EXPRESSION: {characterExpression} conveying {emotionalState}

ENVIRONMENTAL DETAILS:
- Weather: {weather}
- Atmosphere: {atmosphere}
- Key Props: {props}

ARTISTIC NOTES:
- Color Palette: {colorPalette}
- Visual Style: {visualStyle}
- Special Effects: {specialEffects}`,
      variables: [
        'mainAction', 'detailedSetting', 'timeOfDay', 'lightingCondition', 'emotionalTone',
        'cameraAngle', 'focalPoint', 'foreground', 'midground', 'background',
        'characterName', 'characterPosition', 'characterAction', 'characterExpression', 'emotionalState',
        'weather', 'atmosphere', 'props', 'colorPalette', 'visualStyle', 'specialEffects'
      ],
      testResults: {
        totalUses: 120,
        successRate: 0.88,
        avgQualityScore: 8.5,
        avgConsistencyScore: 8,
      },
      active: true,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-06-15'),
    }
  };
  
  constructor() {
    // Initialize with default templates
    Object.values(this.characterPrompts).forEach(prompt => {
      this.templates.set(prompt.id, prompt);
    });
    Object.values(this.scenePrompts).forEach(prompt => {
      this.templates.set(prompt.id, prompt);
    });
  }
  
  // Get best performing template for a category
  getBestTemplate(category: 'character' | 'scene' | 'style' | 'technical'): PromptTemplate | null {
    let bestTemplate: PromptTemplate | null = null;
    let bestScore = 0;
    
    this.templates.forEach(template => {
      if (template.category === category && template.active) {
        const score = this.calculateTemplateScore(template);
        if (score > bestScore) {
          bestScore = score;
          bestTemplate = template;
        }
      }
    });
    
    return bestTemplate;
  }
  
  // Calculate template performance score
  private calculateTemplateScore(template: PromptTemplate): number {
    const { successRate, avgQualityScore, avgConsistencyScore, totalUses } = template.testResults;
    
    // Weight factors
    const successWeight = 0.3;
    const qualityWeight = 0.4;
    const consistencyWeight = 0.3;
    
    // Normalize scores to 0-1 range
    const normalizedQuality = avgQualityScore / 10;
    const normalizedConsistency = avgConsistencyScore / 10;
    
    // Calculate weighted score
    let score = (successRate * successWeight) + 
                (normalizedQuality * qualityWeight) + 
                (normalizedConsistency * consistencyWeight);
    
    // Apply confidence factor based on usage
    const confidenceFactor = Math.min(1, totalUses / 100);
    score *= confidenceFactor;
    
    return score;
  }
  
  // Start A/B test
  startABTest(config: Omit<ABTestConfig, 'results'>): string {
    const testId = `test_${Date.now()}`;
    const test: ABTestConfig = {
      ...config,
      id: testId,
      startDate: new Date(),
      results: {
        templateA: { uses: 0, successRate: 0, avgQualityScore: 0, avgConsistencyScore: 0, userFeedback: 0 },
        templateB: { uses: 0, successRate: 0, avgQualityScore: 0, avgConsistencyScore: 0, userFeedback: 0 }
      }
    };
    
    this.abTests.set(testId, test);
    return testId;
  }
  
  // Get template for A/B test
  getABTestTemplate(testId: string): string | null {
    const test = this.abTests.get(testId);
    if (!test || (test.endDate && test.endDate < new Date())) {
      return null;
    }
    
    // Simple random selection (could be more sophisticated)
    return Math.random() < 0.5 ? test.templateA : test.templateB;
  }
  
  // Record test result
  recordTestResult(
    templateId: string, 
    success: boolean, 
    qualityScore: number, 
    consistencyScore: number
  ): void {
    const template = this.templates.get(templateId);
    if (!template) return;
    
    const results = template.testResults;
    const totalUses = results.totalUses + 1;
    
    // Update running averages
    results.successRate = ((results.successRate * results.totalUses) + (success ? 1 : 0)) / totalUses;
    results.avgQualityScore = ((results.avgQualityScore * results.totalUses) + qualityScore) / totalUses;
    results.avgConsistencyScore = ((results.avgConsistencyScore * results.totalUses) + consistencyScore) / totalUses;
    results.totalUses = totalUses;
    results.lastUpdated = new Date();
    
    template.updatedAt = new Date();
  }
  
  // Export templates for persistence
  exportTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
  
  // Import templates from storage
  importTemplates(templates: PromptTemplate[]): void {
    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

// Singleton instance
export const promptOptimizer = new PromptOptimizer();