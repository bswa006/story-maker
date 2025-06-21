export class ApiService {
  static async uploadPhoto(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    return response.json();
  }

  static async createStorybook(childName: string, childPhotoUrl: string) {
    const response = await fetch('/api/storybook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ childName, childPhotoUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to create storybook');
    }

    return response.json();
  }

  static async generateImage(
    prompt: string,
    childPhotoUrl: string,
    style: 'ghibli' = 'ghibli'
  ): Promise<{ imageUrl: string }> {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, childPhotoUrl, style }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    return response.json();
  }

  static async generateAllImages(
    pages: Array<{ id: string; imagePrompt: string }>,
    childPhotoUrl: string
  ): Promise<Array<{ pageId: string; imageUrl?: string; error?: string }>> {
    const imagePromises = pages.map(page =>
      this.generateImage(page.imagePrompt, childPhotoUrl)
        .then(result => ({ pageId: page.id, imageUrl: result.imageUrl }))
        .catch(error => ({ pageId: page.id, error: error.message }))
    );

    return Promise.all(imagePromises);
  }
}