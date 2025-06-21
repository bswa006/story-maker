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
  pages: StoryPage[];
  createdAt: Date;
  status: 'draft' | 'generating' | 'completed' | 'error';
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