// DALL-E 3 optimized prompt generation

export function createDALLEPrompt(
  childName: string,
  appearance: string,
  scene: string,
  style: 'ghibli' | 'pixar' | 'watercolor' = 'ghibli'
): string {
  const styleMap = {
    ghibli: 'Studio Ghibli anime style illustration, soft watercolor aesthetic, Hayao Miyazaki inspired',
    pixar: 'Pixar 3D animation style, vibrant colors, Disney quality rendering',
    watercolor: 'Traditional watercolor painting, soft brushstrokes, children\'s book illustration'
  };
  
  // DALL-E 3 performs better with clear, structured prompts
  return `${styleMap[style]}. A child named ${childName} (${appearance}) in this scene: ${scene}. The child should be the main focus of the image. Professional children's book illustration quality. No text.`;
}

export function simplifyCharacterDescription(detailedDescription: string): string {
  // Extract key features for DALL-E 3
  // DALL-E 3 works better with concise descriptions
  const features = [];
  
  // Extract age
  const ageMatch = detailedDescription.match(/(\d+)[-\s]?year[-\s]?old/i);
  if (ageMatch) features.push(`${ageMatch[1]} years old`);
  
  // Extract hair
  const hairMatch = detailedDescription.match(/([\w\s]+)\shair/i);
  if (hairMatch) features.push(`${hairMatch[1]} hair`);
  
  // Extract key appearance words
  const appearanceWords = ['eyes', 'skin', 'wearing', 'dress', 'shirt', 'smile'];
  appearanceWords.forEach(word => {
    const regex = new RegExp(`(\\w+\\s)?${word}`, 'i');
    const match = detailedDescription.match(regex);
    if (match) features.push(match[0]);
  });
  
  return features.join(', ');
}

export function createScenePrompt(
  template: string,
  childName: string,
  pageNumber: number
): string {
  // Replace placeholders and simplify for DALL-E 3
  return template
    .replace(/\[child\]/gi, childName)
    .replace(/\[name\]/gi, childName)
    .replace(/\{childName\}/gi, childName)
    .trim();
}