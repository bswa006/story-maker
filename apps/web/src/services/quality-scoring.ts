import OpenAI from 'openai';
import { CharacterReference } from './enhanced-image-generation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Quality score interface
export interface QualityScore {
  characterConsistency: number; // 0-10
  artQuality: number; // 0-10
  storyAlignment: number; // 0-10
  technicalExecution: number; // 0-10
  childAppropriate: number; // 0-10
  overall: number; // calculated average
  details: {
    strengths: string[];
    improvements: string[];
    specificIssues?: string[];
  };
  timestamp: Date;
}

// Batch scoring for efficiency
export interface BatchScoreRequest {
  storyId: string;
  images: Array<{
    pageNumber: number;
    imageUrl: string;
    sceneDescription: string;
  }>;
  characterReference: CharacterReference;
  artStyle: string;
}

// Quality scoring service
export class QualityScorer {
  // Score a single image
  async scoreImage(
    imageUrl: string,
    characterRef: CharacterReference,
    sceneDescription: string,
    pageNumber: number,
    totalPages: number
  ): Promise<QualityScore> {
    try {
      console.log(`🔍 Scoring image quality for page ${pageNumber}/${totalPages}...`);
      
      const scoringPrompt = `
You are an expert children's book illustrator and quality control specialist. Please evaluate this illustration based on the following criteria and provide scores from 0-10 for each category.

CHARACTER REFERENCE:
${this.formatCharacterReference(characterRef)}

SCENE DESCRIPTION:
${sceneDescription}

SCORING CRITERIA:
1. CHARACTER CONSISTENCY (0-10): How well does the character match the reference? Consider facial features, hair, skin tone, proportions.
2. ART QUALITY (0-10): Overall artistic quality, composition, color use, professional polish.
3. STORY ALIGNMENT (0-10): How well does the image convey the intended scene and narrative?
4. TECHNICAL EXECUTION (0-10): Image clarity, proper lighting, no artifacts, clean rendering.
5. CHILD APPROPRIATE (0-10): Age-appropriate content, engaging for children, positive themes.

Provide your response in this JSON format:
{
  "characterConsistency": 0-10,
  "artQuality": 0-10,
  "storyAlignment": 0-10,
  "technicalExecution": 0-10,
  "childAppropriate": 0-10,
  "strengths": ["list 3-5 specific strengths"],
  "improvements": ["list 2-3 specific areas for improvement"],
  "specificIssues": ["list any critical issues that need immediate attention"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at evaluating children&apos;s book illustrations. Provide objective, detailed assessments.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: scoringPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const scoreData = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      // Calculate overall score
      const overall = (
        scoreData.characterConsistency +
        scoreData.artQuality +
        scoreData.storyAlignment +
        scoreData.technicalExecution +
        scoreData.childAppropriate
      ) / 5;

      const qualityScore: QualityScore = {
        characterConsistency: scoreData.characterConsistency || 0,
        artQuality: scoreData.artQuality || 0,
        storyAlignment: scoreData.storyAlignment || 0,
        technicalExecution: scoreData.technicalExecution || 0,
        childAppropriate: scoreData.childAppropriate || 0,
        overall,
        details: {
          strengths: scoreData.strengths || [],
          improvements: scoreData.improvements || [],
          specificIssues: scoreData.specificIssues
        },
        timestamp: new Date()
      };

      console.log(`✅ Quality score: ${overall.toFixed(1)}/10`);
      return qualityScore;

    } catch (error) {
      console.error('❌ Failed to score image quality:', error);
      
      // Return neutral score on error
      return {
        characterConsistency: 5,
        artQuality: 5,
        storyAlignment: 5,
        technicalExecution: 5,
        childAppropriate: 5,
        overall: 5,
        details: {
          strengths: [],
          improvements: ['Unable to complete quality assessment'],
          specificIssues: ['Assessment failed']
        },
        timestamp: new Date()
      };
    }
  }
  
  // Batch score multiple images for efficiency
  async batchScoreImages(request: BatchScoreRequest): Promise<Map<number, QualityScore>> {
    const scores = new Map<number, QualityScore>();
    
    console.log(`📊 Batch scoring ${request.images.length} images...`);
    
    // Process in parallel with rate limiting
    const batchSize = 3; // Process 3 at a time to avoid rate limits
    
    for (let i = 0; i < request.images.length; i += batchSize) {
      const batch = request.images.slice(i, i + batchSize);
      
      const batchPromises = batch.map(image => 
        this.scoreImage(
          image.imageUrl,
          request.characterReference,
          image.sceneDescription,
          image.pageNumber,
          request.images.length
        ).then(score => ({ pageNumber: image.pageNumber, score }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        scores.set(result.pageNumber, result.score);
      });
      
      // Rate limiting delay
      if (i + batchSize < request.images.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('✅ Batch scoring complete');
    return scores;
  }
  
  // Compare consistency between images
  async compareConsistency(
    imageUrls: string[],
    characterRef: CharacterReference
  ): Promise<{
    overallConsistency: number;
    pairwiseScores: Array<{ pair: [number, number]; score: number }>;
    recommendations: string[];
  }> {
    console.log(`🔄 Comparing consistency across ${imageUrls.length} images...`);
    
    const comparisonPrompt = `
Compare these children's book illustrations for CHARACTER CONSISTENCY. The same character should appear identically in all images.

CHARACTER REFERENCE:
${this.formatCharacterReference(characterRef)}

Evaluate:
1. Are facial features identical across all images?
2. Is the hair color, style, and texture consistent?
3. Are body proportions maintained?
4. Is skin tone exactly the same?
5. Are any distinctive features preserved?

Provide a consistency score (0-10) and specific observations.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: comparisonPrompt
              },
              ...imageUrls.map(url => ({
                type: 'image_url' as const,
                image_url: {
                  url,
                  detail: 'low' as const // Use low detail for comparison
                }
              }))
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      // Parse response (would need more structured parsing in production)
      const analysis = response.choices[0]?.message?.content || '';
      
      // Extract consistency score (simplified - would use JSON response in production)
      const scoreMatch = analysis.match(/consistency score[:\s]+(\d+)/i);
      const overallConsistency = scoreMatch ? parseInt(scoreMatch[1]) : 5;
      
      return {
        overallConsistency,
        pairwiseScores: [], // Would calculate pairwise in production
        recommendations: [
          'Ensure hair color uses exact same hex values',
          'Maintain consistent eye shape across all illustrations',
          'Use character reference sheet for every image generation'
        ]
      };

    } catch (error) {
      console.error('❌ Failed to compare consistency:', error);
      
      return {
        overallConsistency: 5,
        pairwiseScores: [],
        recommendations: ['Unable to complete consistency analysis']
      };
    }
  }
  
  // Format character reference for prompts
  private formatCharacterReference(ref: CharacterReference): string {
    return `
Name: ${ref.name}, Age: ${ref.age}
Face: ${ref.face.shape} shape, ${ref.face.complexion} complexion
Eyes: ${ref.eyes.color}, ${ref.eyes.shape} shaped
Hair: ${ref.hair.color}, ${ref.hair.texture}, ${ref.hair.style}
Build: ${ref.build.height} height, ${ref.build.bodyType} build
Distinctive features: ${ref.face.distinctiveMarks?.join(', ') || 'None'}`;
  }
  
  // Generate quality report
  generateQualityReport(scores: Map<number, QualityScore>): {
    summary: {
      averageOverall: number;
      averageByCategory: Record<string, number>;
      lowestScoringPages: number[];
      highestScoringPages: number[];
    };
    recommendations: string[];
    criticalIssues: string[];
  } {
    const scoresArray = Array.from(scores.values());
    
    // Calculate averages
    const averages = {
      characterConsistency: 0,
      artQuality: 0,
      storyAlignment: 0,
      technicalExecution: 0,
      childAppropriate: 0,
      overall: 0
    };
    
    scoresArray.forEach(score => {
      averages.characterConsistency += score.characterConsistency;
      averages.artQuality += score.artQuality;
      averages.storyAlignment += score.storyAlignment;
      averages.technicalExecution += score.technicalExecution;
      averages.childAppropriate += score.childAppropriate;
      averages.overall += score.overall;
    });
    
    Object.keys(averages).forEach(key => {
      averages[key as keyof typeof averages] /= scoresArray.length;
    });
    
    // Find lowest and highest scoring pages
    const sortedPages = Array.from(scores.entries())
      .sort((a, b) => a[1].overall - b[1].overall);
    
    const lowestScoringPages = sortedPages.slice(0, 3).map(([page]) => page);
    const highestScoringPages = sortedPages.slice(-3).map(([page]) => page);
    
    // Collect all recommendations and issues
    const allRecommendations = new Set<string>();
    const allIssues = new Set<string>();
    
    scoresArray.forEach(score => {
      score.details.improvements.forEach(imp => allRecommendations.add(imp));
      score.details.specificIssues?.forEach(issue => allIssues.add(issue));
    });
    
    return {
      summary: {
        averageOverall: averages.overall,
        averageByCategory: averages,
        lowestScoringPages,
        highestScoringPages
      },
      recommendations: Array.from(allRecommendations),
      criticalIssues: Array.from(allIssues)
    };
  }
}

// Export singleton instance
export const qualityScorer = new QualityScorer();