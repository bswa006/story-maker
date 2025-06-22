/**
 * Cost optimization settings for testing phase
 * Adjust these settings to control API costs during development
 */

export const COST_SETTINGS = {
  // 🔴 TESTING MODE: Set to false for production
  TESTING_MODE: true,
  
  // Maximum number of images to generate in testing mode
  MAX_TEST_IMAGES: 2,
  
  // Image generation settings
  IMAGE_GENERATION: {
    // DALL-E model: 'dall-e-3' or 'dall-e-2' (dall-e-2 is 75% cheaper)
    MODEL: 'dall-e-3',
    
    // Quality: 'standard' or 'hd' (standard is 50% cheaper)
    QUALITY: 'standard',
    
    // Style: 'natural' or 'vivid' 
    STYLE: 'natural',
    
    // Size: '1024x1024', '1024x1792', '1792x1024'
    SIZE: '1024x1024'
  },
  
  // GPT-4 Vision settings
  VISION_ANALYSIS: {
    // Skip child analysis after first image
    SKIP_AFTER_FIRST: true,
    
    // Model: 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'
    MODEL: 'gpt-4o-mini',
    
    // Max tokens for description
    MAX_TOKENS: 200
  }
};

/**
 * Cost estimates per storybook (10 pages)
 * 
 * Full Production (all features):
 * - 10 DALL-E 3 HD images: $0.80
 * - 1 GPT-4o-mini analysis: $0.001
 * Total: ~$0.801 per storybook
 * 
 * Current Testing Settings:
 * - 2 DALL-E 3 standard images: $0.08
 * - 1 GPT-4o-mini analysis: $0.001
 * Total: ~$0.081 per storybook (90% cost reduction)
 * 
 * Maximum savings (DALL-E 2):
 * - 2 DALL-E 2 images: $0.04
 * - 1 GPT-4o-mini analysis: $0.001
 * Total: ~$0.041 per storybook (95% cost reduction)
 */