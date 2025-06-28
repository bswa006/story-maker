export interface StoryTheme {
  id: string;
  name: string;
  icon: string;
  description: string;
  shortDescription: string;
  category: 'emotional' | 'stem' | 'diversity' | 'life-skills' | 'fantasy' | 'adventure';
  ageGroups: string[];
  defaultSettings: {
    tone: 'exciting' | 'calming' | 'educational' | 'inspiring' | 'funny';
    length: 'short' | 'medium' | 'long';
    complexity: 'simple' | 'moderate' | 'advanced';
  };
  customOptions: {
    settings?: string[];
    characters?: string[];
    learningGoals?: string[];
  };
  imageStyle: string;
  colorPalette: string[];
}

export const STORY_THEMES: StoryTheme[] = [
  {
    id: 'emotional-intelligence',
    name: 'Emotional Intelligence',
    icon: '🌈',
    description: 'Help your child understand and manage complex emotions through relatable scenarios and friendly characters.',
    shortDescription: 'Understanding feelings and emotions',
    category: 'emotional',
    ageGroups: ['3-5', '6-8', '9-12'],
    defaultSettings: {
      tone: 'calming',
      length: 'medium',
      complexity: 'simple'
    },
    customOptions: {
      settings: ['Home', 'School', 'Playground', 'Family gathering'],
      characters: ['Friends', 'Family members', 'Emotion characters', 'Wise mentor'],
      learningGoals: [
        'Understanding different emotions',
        'Managing anger and frustration',
        'Building empathy',
        'Expressing feelings healthily',
        'Conflict resolution'
      ]
    },
    imageStyle: 'Soft, warm illustrations with expressive characters showing various emotions',
    colorPalette: ['#FFE5CC', '#FFB3BA', '#BAE1FF', '#BAFFC9', '#FFFFBA']
  },
  {
    id: 'stem-adventures',
    name: 'STEM Adventures',
    icon: '🚀',
    description: 'Exciting journeys through science, technology, engineering, and math concepts made fun and accessible.',
    shortDescription: 'Science and discovery adventures',
    category: 'stem',
    ageGroups: ['5-7', '8-10', '11-13'],
    defaultSettings: {
      tone: 'exciting',
      length: 'long',
      complexity: 'moderate'
    },
    customOptions: {
      settings: ['Space station', 'Laboratory', 'Ocean depths', 'Prehistoric times', 'Future city'],
      characters: ['Scientists', 'Robots', 'Alien friends', 'Time travelers', 'Animal experts'],
      learningGoals: [
        'Scientific method basics',
        'Simple coding concepts',
        'Environmental science',
        'Space exploration',
        'Math problem-solving',
        'Engineering design'
      ]
    },
    imageStyle: 'Vibrant, detailed scientific illustrations with futuristic elements',
    colorPalette: ['#4ECDC4', '#556270', '#FF6B6B', '#C44D58', '#FFE66D']
  },
  {
    id: 'diversity-culture',
    name: 'Diversity & Culture',
    icon: '🌍',
    description: 'Celebrate different cultures, traditions, and ways of life around the world.',
    shortDescription: 'Cultural exploration and diversity',
    category: 'diversity',
    ageGroups: ['4-6', '7-9', '10-12'],
    defaultSettings: {
      tone: 'inspiring',
      length: 'medium',
      complexity: 'moderate'
    },
    customOptions: {
      settings: ['Different countries', 'Cultural festivals', 'International school', 'World market'],
      characters: ['Children from different cultures', 'Grandparents with stories', 'Cultural guides'],
      learningGoals: [
        'Appreciating differences',
        'Learning about traditions',
        'Understanding different families',
        'Global citizenship',
        'Language appreciation'
      ]
    },
    imageStyle: 'Rich, culturally authentic illustrations with traditional patterns and vibrant colors',
    colorPalette: ['#FF6F61', '#6B5B95', '#88B0D3', '#82B366', '#F7CAC9']
  },
  {
    id: 'life-skills',
    name: 'Life Skills & Values',
    icon: '⭐',
    description: 'Practical lessons about responsibility, problem-solving, and important life skills.',
    shortDescription: 'Building essential life skills',
    category: 'life-skills',
    ageGroups: ['4-6', '7-9', '10-12'],
    defaultSettings: {
      tone: 'educational',
      length: 'medium',
      complexity: 'simple'
    },
    customOptions: {
      settings: ['Home', 'School', 'Community', 'Store', 'Garden'],
      characters: ['Helpful neighbors', 'Wise grandparent', 'Teacher', 'Community helpers'],
      learningGoals: [
        'Money and saving basics',
        'Time management',
        'Healthy habits',
        'Problem-solving skills',
        'Responsibility and chores',
        'Safety awareness'
      ]
    },
    imageStyle: 'Clear, relatable illustrations showing everyday situations and practical activities',
    colorPalette: ['#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94', '#C7CEEA']
  },
  {
    id: 'fantasy-magic',
    name: 'Fantasy & Magic',
    icon: '✨',
    description: 'Magical adventures with dragons, fairies, and enchanted worlds full of wonder.',
    shortDescription: 'Magical and fantastical adventures',
    category: 'fantasy',
    ageGroups: ['5-7', '8-10', '11-13'],
    defaultSettings: {
      tone: 'exciting',
      length: 'long',
      complexity: 'moderate'
    },
    customOptions: {
      settings: ['Enchanted forest', 'Magic kingdom', 'Dragon mountain', 'Fairy realm', 'Wizard school'],
      characters: ['Dragons', 'Fairies', 'Wizards', 'Magical creatures', 'Brave knights'],
      learningGoals: [
        'Imagination and creativity',
        'Courage and bravery',
        'Good vs evil concepts',
        'Teamwork in quests',
        'Problem-solving through magic'
      ]
    },
    imageStyle: 'Whimsical, Studio Ghibli-inspired illustrations with magical elements and soft lighting',
    colorPalette: ['#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3']
  },
  {
    id: 'animal-nature',
    name: 'Animal & Nature Tales',
    icon: '🦁',
    description: 'Learn from wise animals and explore the wonders of the natural world.',
    shortDescription: 'Wildlife and nature adventures',
    category: 'adventure',
    ageGroups: ['3-5', '6-8', '9-11'],
    defaultSettings: {
      tone: 'inspiring',
      length: 'medium',
      complexity: 'simple'
    },
    customOptions: {
      settings: ['Safari', 'Ocean', 'Rainforest', 'Farm', 'Mountain'],
      characters: ['Wild animals', 'Pet friends', 'Nature spirits', 'Park ranger', 'Veterinarian'],
      learningGoals: [
        'Animal behavior and habitats',
        'Environmental conservation',
        'Respect for nature',
        'Animal care and empathy',
        'Ecosystem understanding'
      ]
    },
    imageStyle: 'Natural, detailed animal illustrations with lush environmental backgrounds',
    colorPalette: ['#8FBC8F', '#DEB887', '#87CEEB', '#F0E68C', '#FFB6C1']
  }
];

export const getThemeById = (id: string): StoryTheme | undefined => {
  return STORY_THEMES.find(theme => theme.id === id);
};

export const getThemesByCategory = (category: string): StoryTheme[] => {
  return STORY_THEMES.filter(theme => theme.category === category);
};

export const getThemesForAge = (age: number): StoryTheme[] => {
  return STORY_THEMES.filter(theme => 
    theme.ageGroups.some(group => {
      const [min, max] = group.split('-').map(Number);
      return age >= min && age <= max;
    })
  );
};