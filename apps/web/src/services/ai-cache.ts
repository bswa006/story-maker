import crypto from 'crypto';

// Cache configuration
const CACHE_CONFIG = {
  CHARACTER_ANALYSIS: {
    prefix: 'char_analysis',
    ttl: 60 * 60 * 24 * 30, // 30 days
  },
  IMAGE_PROMPT: {
    prefix: 'img_prompt',
    ttl: 60 * 60 * 24 * 7, // 7 days
  },
  STORY_CONTENT: {
    prefix: 'story_content',
    ttl: 60 * 60 * 24 * 14, // 14 days
  },
  TEMPLATE_SUGGESTION: {
    prefix: 'template_suggest',
    ttl: 60 * 60 * 24 * 3, // 3 days
  }
};

// We'll use in-memory cache for now
// In production, you would install and use @upstash/redis
const redis = null;

// In-memory cache fallback for development
class InMemoryCache {
  private cache: Map<string, { value: unknown; expires: number }> = new Map();
  
  async get(key: string): Promise<unknown> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  async set(key: string, value: unknown, ttl: number): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }
  
  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
  
  async flushPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Use Redis if available, otherwise fall back to in-memory cache
const cacheClient = redis || new InMemoryCache();

// AI Cache Service
export class AICache {
  // Generate cache key from inputs
  private generateKey(prefix: string, inputs: Record<string, any>): string {
    const sortedInputs = Object.keys(inputs)
      .sort()
      .reduce((acc, key) => {
        acc[key] = inputs[key];
        return acc;
      }, {} as Record<string, any>);
    
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(sortedInputs))
      .digest('hex')
      .substring(0, 16);
    
    return `${prefix}:${hash}`;
  }
  
  // Cache character analysis results
  async cacheCharacterAnalysis(
    photoUrl: string,
    childName: string,
    analysis: any
  ): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.CHARACTER_ANALYSIS.prefix, {
      photoUrl,
      childName
    });
    
    await cacheClient.set(
      key,
      JSON.stringify({
        analysis,
        cachedAt: new Date().toISOString(),
        version: '2.0'
      }),
      CACHE_CONFIG.CHARACTER_ANALYSIS.ttl
    );
    
    console.log(`💾 Cached character analysis: ${key}`);
  }
  
  // Get cached character analysis
  async getCachedCharacterAnalysis(
    photoUrl: string,
    childName: string
  ): Promise<any | null> {
    const key = this.generateKey(CACHE_CONFIG.CHARACTER_ANALYSIS.prefix, {
      photoUrl,
      childName
    });
    
    const cached = await cacheClient.get(key);
    if (!cached) return null;
    
    try {
      const data = JSON.parse(cached as string);
      console.log(`✅ Cache hit for character analysis: ${key}`);
      return data.analysis;
    } catch (error) {
      console.error('Failed to parse cached data:', error);
      return null;
    }
  }
  
  // Cache image generation prompts and results
  async cacheImageGeneration(
    characterRef: any,
    sceneDescription: string,
    artStyle: string,
    promptVersion: string,
    result: {
      prompt: string;
      imageUrl?: string;
      metadata: any;
    }
  ): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.IMAGE_PROMPT.prefix, {
      characterRef: JSON.stringify(characterRef),
      sceneDescription,
      artStyle,
      promptVersion
    });
    
    await cacheClient.set(
      key,
      JSON.stringify({
        ...result,
        cachedAt: new Date().toISOString()
      }),
      CACHE_CONFIG.IMAGE_PROMPT.ttl
    );
    
    console.log(`💾 Cached image generation: ${key}`);
  }
  
  // Get cached image generation
  async getCachedImageGeneration(
    characterRef: any,
    sceneDescription: string,
    artStyle: string,
    promptVersion: string
  ): Promise<any | null> {
    const key = this.generateKey(CACHE_CONFIG.IMAGE_PROMPT.prefix, {
      characterRef: JSON.stringify(characterRef),
      sceneDescription,
      artStyle,
      promptVersion
    });
    
    const cached = await cacheClient.get(key);
    if (!cached) return null;
    
    try {
      const data = JSON.parse(cached as string);
      console.log(`✅ Cache hit for image generation: ${key}`);
      return data;
    } catch (error) {
      console.error('Failed to parse cached data:', error);
      return null;
    }
  }
  
  // Cache story content
  async cacheStoryContent(
    theme: string,
    customization: any,
    childDetails: any,
    content: any
  ): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.STORY_CONTENT.prefix, {
      theme,
      customization: JSON.stringify(customization),
      childDetails: JSON.stringify(childDetails)
    });
    
    await cacheClient.set(
      key,
      JSON.stringify({
        content,
        cachedAt: new Date().toISOString()
      }),
      CACHE_CONFIG.STORY_CONTENT.ttl
    );
    
    console.log(`💾 Cached story content: ${key}`);
  }
  
  // Get cached story content
  async getCachedStoryContent(
    theme: string,
    customization: any,
    childDetails: any
  ): Promise<any | null> {
    const key = this.generateKey(CACHE_CONFIG.STORY_CONTENT.prefix, {
      theme,
      customization: JSON.stringify(customization),
      childDetails: JSON.stringify(childDetails)
    });
    
    const cached = await cacheClient.get(key);
    if (!cached) return null;
    
    try {
      const data = JSON.parse(cached as string);
      console.log(`✅ Cache hit for story content: ${key}`);
      return data.content;
    } catch (error) {
      console.error('Failed to parse cached data:', error);
      return null;
    }
  }
  
  // Cache template suggestions
  async cacheTemplateSuggestions(
    childProfile: any,
    preferences: any,
    suggestions: any[]
  ): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.TEMPLATE_SUGGESTION.prefix, {
      childProfile: JSON.stringify(childProfile),
      preferences: JSON.stringify(preferences)
    });
    
    await cacheClient.set(
      key,
      JSON.stringify({
        suggestions,
        cachedAt: new Date().toISOString()
      }),
      CACHE_CONFIG.TEMPLATE_SUGGESTION.ttl
    );
    
    console.log(`💾 Cached template suggestions: ${key}`);
  }
  
  // Get cached template suggestions
  async getCachedTemplateSuggestions(
    childProfile: any,
    preferences: any
  ): Promise<any[] | null> {
    const key = this.generateKey(CACHE_CONFIG.TEMPLATE_SUGGESTION.prefix, {
      childProfile: JSON.stringify(childProfile),
      preferences: JSON.stringify(preferences)
    });
    
    const cached = await cacheClient.get(key);
    if (!cached) return null;
    
    try {
      const data = JSON.parse(cached as string);
      console.log(`✅ Cache hit for template suggestions: ${key}`);
      return data.suggestions;
    } catch (error) {
      console.error('Failed to parse cached data:', error);
      return null;
    }
  }
  
  // Clear cache by pattern
  async clearCache(pattern: 'character' | 'image' | 'story' | 'template' | 'all'): Promise<void> {
    const patterns: Record<string, string> = {
      character: `${CACHE_CONFIG.CHARACTER_ANALYSIS.prefix}:*`,
      image: `${CACHE_CONFIG.IMAGE_PROMPT.prefix}:*`,
      story: `${CACHE_CONFIG.STORY_CONTENT.prefix}:*`,
      template: `${CACHE_CONFIG.TEMPLATE_SUGGESTION.prefix}:*`,
      all: '*'
    };
    
    const cachePattern = patterns[pattern] || patterns.all;
    
    // For in-memory cache
    await (cacheClient as InMemoryCache).flushPattern(cachePattern);
    
    console.log(`✅ Cache cleared for pattern: ${pattern}`);
  }
  
  // Get cache statistics
  async getCacheStats(): Promise<{
    provider: string;
    patterns: Record<string, { prefix: string; ttl: number }>;
  }> {
    return {
      provider: 'In-Memory',
      patterns: CACHE_CONFIG
    };
  }
}

// Export singleton instance
export const aiCache = new AICache();