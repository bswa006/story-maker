export interface StoryPage {
  id: string;
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  animal?: string;
  lesson?: string;
}

export interface Storybook {
  id: string;
  childName: string;
  childPhotoUrl?: string;
  childAge?: string;
  templateId: string;
  category: string;
  subscriptionTier: 'basic' | 'premium' | 'all';
  pages: StoryPage[];
  learningObjectives: string[];
  therapeuticValue?: string[];
  estimatedReadingTime: number;
  createdAt: Date;
  status: 'draft' | 'created' | 'generating' | 'completed' | 'error';
  downloadCount?: number;
  shareCount?: number;
}

export interface GenerateImageRequest {
  prompt: string;
  childPhotoUrl: string;
  style: 'ghibli';
}

export interface Animal {
  name: string;
  emoji: string;
  text: string;
  lesson: string;
  interactionPrompt: string;
}