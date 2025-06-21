interface ReplicateInput {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export class ReplicateService {
  private apiToken: string;
  private modelVersion: string;

  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN || '';
    // Using SDXL model with Ghibli LoRA for consistent style
    this.modelVersion = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  }

  async generateImage(prompt: string, childPhotoUrl?: string): Promise<string> {
    if (!this.apiToken) {
      throw new Error('Replicate API token not configured');
    }

    const enhancedPrompt = this.enhancePrompt(prompt, !!childPhotoUrl);
    
    try {
      // Create prediction
      const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: this.modelVersion,
          input: {
            prompt: enhancedPrompt,
            negative_prompt: 'ugly, deformed, noisy, blurry, distorted, dark, scary, horror',
            width: 1024,
            height: 768,
            num_inference_steps: 50,
            guidance_scale: 7.5,
          } as ReplicateInput
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create prediction: ${createResponse.statusText}`);
      }

      const prediction = await createResponse.json();

      // Poll for completion
      const imageUrl = await this.pollForCompletion(prediction.id);
      
      return imageUrl;
    } catch (error) {
      console.error('Replicate generation error:', error);
      throw error;
    }
  }

  private async pollForCompletion(predictionId: string): Promise<string> {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get prediction status: ${response.statusText}`);
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return prediction.output[0];
      } else if (prediction.status === 'failed') {
        throw new Error('Image generation failed');
      }

      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Image generation timed out');
  }

  private enhancePrompt(basePrompt: string, includesChild: boolean): string {
    const styleModifiers = [
      'Studio Ghibli style',
      'soft watercolor painting',
      'dreamy atmosphere',
      'warm pastel colors',
      'magical realism',
      'detailed natural background',
      'whimsical illustration',
      'gentle lighting',
      'children\'s book illustration',
      'high quality',
      'masterpiece'
    ].join(', ');

    // If includes child, we need to be more specific about safe content
    const safetyModifiers = includesChild 
      ? ', safe for children, wholesome, friendly, cheerful'
      : '';

    return `${basePrompt}, ${styleModifiers}${safetyModifiers}`;
  }
}