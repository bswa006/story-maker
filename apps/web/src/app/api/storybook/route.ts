import { NextRequest, NextResponse } from 'next/server';
import { STORY_ANIMALS, INTRO_PAGE, OUTRO_PAGE } from '@/data/story-template';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childName, childPhotoUrl, selectedAnimals } = body;

    if (!childName || !childPhotoUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Filter animals based on selection
    const animalsToInclude = selectedAnimals && selectedAnimals.length > 0 
      ? STORY_ANIMALS.filter(animal => selectedAnimals.includes(animal.name))
      : STORY_ANIMALS;

    // Generate all pages
    const pages = [];
    
    // Intro page
    pages.push({
      id: 'intro',
      pageNumber: 1,
      text: INTRO_PAGE.text,
      imagePrompt: INTRO_PAGE.imagePrompt,
      status: 'pending'
    });

    // Animal pages (only selected animals)
    animalsToInclude.forEach((animal, index) => {
      pages.push({
        id: `animal-${animal.name}`,
        pageNumber: index + 2,
        text: `If I were a ${animal.name}...\n${animal.text}`,
        imagePrompt: animal.interactionPrompt,
        animal: animal.emoji,
        lesson: animal.lesson,
        status: 'pending'
      });
    });

    // Outro page
    pages.push({
      id: 'outro',
      pageNumber: pages.length + 1,
      text: OUTRO_PAGE.text,
      imagePrompt: OUTRO_PAGE.imagePrompt,
      status: 'pending'
    });

    // Create storybook
    const storybook = {
      id: Date.now().toString(),
      childName,
      childPhotoUrl,
      pages,
      createdAt: new Date().toISOString(),
      status: 'created'
    };

    return NextResponse.json(storybook);

  } catch (error) {
    console.error('Storybook creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create storybook' },
      { status: 500 }
    );
  }
}