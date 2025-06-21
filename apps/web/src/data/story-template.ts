import { Animal } from '@/types/storybook';

export const STORY_ANIMALS: Animal[] = [
  {
    name: 'bird',
    emoji: '🕊️',
    text: 'I would flap my wings and fly up high,\nAnd learn to see the world from the sky.',
    lesson: 'Perspective / Imagination',
    interactionPrompt: 'A child flying alongside a beautiful white dove through fluffy clouds in a bright blue sky, both with their arms/wings spread wide, feeling free and joyful'
  },
  {
    name: 'lion',
    emoji: '🦁',
    text: 'I would roar with pride and walk so tall,\nAnd learn to be brave, even if I\'m small.',
    lesson: 'Courage',
    interactionPrompt: 'A child walking confidently next to a majestic but gentle lion through a golden savanna, the lion teaching the child to stand tall and proud'
  },
  {
    name: 'turtle',
    emoji: '🐢',
    text: 'I would take my time and not rush past,\nAnd learn that slow can still be fast!',
    lesson: 'Patience',
    interactionPrompt: 'A child sitting peacefully beside a wise old turtle near a tranquil pond, both enjoying the calm moment and watching lily pads float by'
  },
  {
    name: 'monkey',
    emoji: '🐒',
    text: 'I would swing from trees and giggle all day,\nAnd learn that laughter is the best way to play!',
    lesson: 'Joy / Fun',
    interactionPrompt: 'A child playing and laughing with a playful monkey in a lush jungle, both swinging from vines and having the time of their lives'
  },
  {
    name: 'ant',
    emoji: '🐜',
    text: 'I would carry big things with all my might,\nAnd learn that teamwork makes things right.',
    lesson: 'Teamwork / Strength',
    interactionPrompt: 'A child helping a group of ants carry a large leaf together, all working as a team with the child shrunk down to ant size in imagination'
  },
  {
    name: 'butterfly',
    emoji: '🦋',
    text: 'I would change my colours and float around,\nAnd learn that growing up is safe and sound.',
    lesson: 'Change / Self-Discovery',
    interactionPrompt: 'A child watching in wonder as a butterfly emerges from its chrysalis, surrounded by a magical garden full of colorful flowers'
  },
  {
    name: 'dog',
    emoji: '🐶',
    text: 'I would wag my tail and stay by your side,\nAnd learn that love is nothing to hide.',
    lesson: 'Loyalty / Love',
    interactionPrompt: 'A child hugging a friendly golden retriever in a sunny meadow, both showing pure love and affection for each other'
  },
  {
    name: 'fish',
    emoji: '🐠',
    text: 'I would swim through water deep and blue,\nAnd learn that exploring is fun to do!',
    lesson: 'Curiosity',
    interactionPrompt: 'A child swimming underwater with colorful tropical fish in a crystal-clear ocean, discovering a magical underwater world together'
  }
];

export const INTRO_PAGE = {
  text: 'Hello, my name is {{childName}}.\nToday, I\'m going to imagine being all kinds of animals!\nWhat would I learn if I were them?',
  imagePrompt: 'A curious child standing in a magical forest clearing, surrounded by gentle glowing lights and various friendly animals peeking from behind trees, Studio Ghibli style'
};

export const OUTRO_PAGE = {
  text: 'Now I\'m just me, and that\'s the best!\nBut I\'ve learned from animals — I\'ve passed the test!\nBeing kind, brave, and smart too,\nThere\'s so much to learn — from the wild to you!',
  imagePrompt: 'A happy child surrounded by all the animal friends from the story in a beautiful sunset scene, all together in harmony, Studio Ghibli style'
};