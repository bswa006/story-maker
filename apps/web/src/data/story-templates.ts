/**
 * Comprehensive story template system for multi-sector personalized children's content
 * Based on market research for high-demand educational niches
 */

export interface StoryTemplate {
  id: string;
  title: string;
  description: string;
  category: StoryCategory;
  ageGroups: AgeGroup[];
  educationalFocus: EducationalFocus[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pages: number;
  estimatedReadingTime: number; // minutes
  subscriptionTier: 'basic' | 'premium' | 'all';
  themes: StoryTheme[];
  learningObjectives: string[];
  parentGuide?: string;
  therapeuticValue?: TherapeuticValue[];
  culturalAdaptations?: string[];
  preview: {
    coverText: string;
    samplePage: string;
  };
}

export type StoryCategory = 
  | 'classic_adventures'
  | 'emotional_intelligence' 
  | 'stem_education'
  | 'life_skills'
  | 'diversity_inclusion'
  | 'therapeutic'
  | 'special_occasions'
  | 'family_values'
  | 'environmental'
  | 'cultural_heritage';

export type AgeGroup = '3-5' | '6-8' | '9-12' | '13+';

export type EducationalFocus = 
  | 'sel' // Social-Emotional Learning
  | 'stem'
  | 'literacy'
  | 'numeracy'
  | 'social_skills'
  | 'creativity'
  | 'critical_thinking'
  | 'cultural_awareness'
  | 'environmental_awareness'
  | 'life_skills';

export type StoryTheme = 
  | 'courage' | 'friendship' | 'kindness' | 'perseverance' | 'honesty'
  | 'responsibility' | 'empathy' | 'diversity' | 'family' | 'growth_mindset'
  | 'problem_solving' | 'teamwork' | 'self_confidence' | 'emotional_regulation'
  | 'communication' | 'leadership' | 'creativity' | 'curiosity';

export type TherapeuticValue = 
  | 'anxiety_reduction' | 'emotional_regulation' | 'social_skills'
  | 'self_esteem' | 'trauma_processing' | 'behavioral_modification'
  | 'communication_skills' | 'coping_strategies';

// Story Templates Database
export const STORY_TEMPLATES: StoryTemplate[] = [
  // Classic Adventures (Original)
  {
    id: 'if_i_were_an_animal',
    title: 'If I Were an Animal',
    description: 'A magical journey where your child meets 8 different animals and learns valuable life lessons from each one.',
    category: 'classic_adventures',
    ageGroups: ['3-5', '6-8'],
    educationalFocus: ['sel', 'social_skills'],
    difficulty: 'beginner',
    pages: 10,
    estimatedReadingTime: 8,
    subscriptionTier: 'basic',
    themes: ['courage', 'perseverance', 'teamwork', 'curiosity', 'growth_mindset'],
    learningObjectives: [
      'Understand different animal characteristics',
      'Learn patience and perseverance',
      'Develop empathy and kindness',
      'Build courage and confidence'
    ],
    parentGuide: 'This story helps children explore different personality traits through animal metaphors. Great for bedtime reading and discussing emotions.',
    preview: {
      coverText: 'Join {childName} on a magical adventure meeting wise animals who teach important life lessons!',
      samplePage: 'If I were a wise owl like Oliver, I would help my friends see things from different perspectives...'
    }
  },

  // Social-Emotional Learning Stories
  {
    id: 'when_i_feel_big_emotions',
    title: 'When I Feel Big Emotions',
    description: 'Help your child understand and manage complex emotions through relatable scenarios and coping strategies.',
    category: 'emotional_intelligence',
    ageGroups: ['3-5', '6-8'],
    educationalFocus: ['sel', 'social_skills'],
    difficulty: 'beginner',
    pages: 8,
    estimatedReadingTime: 6,
    subscriptionTier: 'premium',
    themes: ['emotional_regulation', 'empathy', 'self_confidence'],
    learningObjectives: [
      'Identify different emotions',
      'Learn healthy coping strategies',
      'Understand that all feelings are valid',
      'Develop emotional vocabulary'
    ],
    parentGuide: 'Perfect for children who struggle with emotional regulation. Includes discussion prompts and coping strategy cards.',
    therapeuticValue: ['anxiety_reduction', 'emotional_regulation', 'coping_strategies'],
    preview: {
      coverText: 'Sometimes {childName} feels angry, sad, or worried. Let\'s learn how to handle big emotions together!',
      samplePage: 'When I feel angry like a volcano about to erupt, I take three deep breaths and count to ten...'
    }
  },

  {
    id: 'my_worry_monster',
    title: 'My Worry Monster and Me',
    description: 'A therapeutic story that helps children understand anxiety and learn practical tools to manage worries.',
    category: 'therapeutic',
    ageGroups: ['6-8', '9-12'],
    educationalFocus: ['sel', 'social_skills'],
    difficulty: 'intermediate',
    pages: 12,
    estimatedReadingTime: 10,
    subscriptionTier: 'premium',
    themes: ['emotional_regulation', 'courage', 'problem_solving'],
    learningObjectives: [
      'Externalize anxiety as a manageable character',
      'Learn worry-reduction techniques',
      'Build resilience and coping skills',
      'Understand that worries are normal'
    ],
    parentGuide: 'Developed with child psychologists. Includes parent resources for supporting anxious children.',
    therapeuticValue: ['anxiety_reduction', 'coping_strategies', 'emotional_regulation'],
    preview: {
      coverText: '{childName} meets their worry monster and learns it\'s not as scary as it seems!',
      samplePage: 'My worry monster whispers "what if" stories, but I\'ve learned to tell it better stories instead...'
    }
  },

  // STEM Education Stories
  {
    id: 'space_explorer_adventure',
    title: 'If I Were a Space Explorer',
    description: 'Join your child on an educational journey through space, learning about planets, stars, and the scientific method.',
    category: 'stem_education',
    ageGroups: ['6-8', '9-12'],
    educationalFocus: ['stem', 'critical_thinking'],
    difficulty: 'intermediate',
    pages: 14,
    estimatedReadingTime: 12,
    subscriptionTier: 'premium',
    themes: ['curiosity', 'problem_solving', 'perseverance', 'creativity'],
    learningObjectives: [
      'Learn basic astronomy concepts',
      'Understand the scientific method',
      'Develop problem-solving skills',
      'Foster curiosity about STEM careers'
    ],
    parentGuide: 'Includes real space facts and hands-on activities. Great for budding scientists and engineers.',
    preview: {
      coverText: 'Astronaut {childName} blasts off on a mission to explore the solar system and make amazing discoveries!',
      samplePage: 'As I float past Mars, I use my tools to collect rock samples and test my hypothesis about life on other planets...'
    }
  },

  {
    id: 'inventor_workshop',
    title: 'My Amazing Invention Workshop',
    description: 'Your child becomes an inventor, creating solutions to everyday problems while learning engineering principles.',
    category: 'stem_education',
    ageGroups: ['6-8', '9-12'],
    educationalFocus: ['stem', 'creativity'],
    difficulty: 'intermediate',
    pages: 10,
    estimatedReadingTime: 8,
    subscriptionTier: 'premium',
    themes: ['creativity', 'problem_solving', 'perseverance', 'growth_mindset'],
    learningObjectives: [
      'Understand the design thinking process',
      'Learn basic engineering concepts',
      'Develop creative problem-solving skills',
      'Build confidence in STEM abilities'
    ],
    parentGuide: 'Encourages hands-on experimentation. Includes simple DIY projects to try at home.',
    preview: {
      coverText: 'Inventor {childName} opens their workshop and creates amazing gadgets to help friends and family!',
      samplePage: 'When my little brother has trouble reaching the light switch, I design a special step stool that folds flat...'
    }
  },

  // Diversity and Inclusion
  {
    id: 'our_beautiful_differences',
    title: 'Our Beautiful Differences',
    description: 'Celebrate diversity and learn about different cultures, abilities, and family structures in an inclusive adventure.',
    category: 'diversity_inclusion',
    ageGroups: ['3-5', '6-8'],
    educationalFocus: ['cultural_awareness', 'social_skills'],
    difficulty: 'beginner',
    pages: 10,
    estimatedReadingTime: 8,
    subscriptionTier: 'premium',
    themes: ['diversity', 'empathy', 'friendship', 'kindness'],
    learningObjectives: [
      'Celebrate different cultures and traditions',
      'Understand different family structures',
      'Develop empathy for people with disabilities',
      'Learn that differences make us stronger'
    ],
    parentGuide: 'Promotes inclusive thinking and cultural awareness. Includes discussion questions about diversity.',
    culturalAdaptations: ['Indian festivals', 'Global traditions', 'Different languages', 'Various religions'],
    preview: {
      coverText: '{childName} meets friends from around the world and learns that our differences make us special!',
      samplePage: 'My friend Arjun teaches me about Diwali, while I share my family\'s traditions with him...'
    }
  },

  // Life Skills
  {
    id: 'responsibility_hero',
    title: 'The Responsibility Hero',
    description: 'Your child learns about responsibility through age-appropriate tasks and sees how helping others feels amazing.',
    category: 'life_skills',
    ageGroups: ['6-8', '9-12'],
    educationalFocus: ['life_skills', 'social_skills'],
    difficulty: 'intermediate',
    pages: 10,
    estimatedReadingTime: 8,
    subscriptionTier: 'basic',
    themes: ['responsibility', 'kindness', 'growth_mindset', 'family'],
    learningObjectives: [
      'Understand age-appropriate responsibilities',
      'Learn the connection between effort and results',
      'Develop pride in contributing to family/community',
      'Build time management skills'
    ],
    parentGuide: 'Perfect for teaching chores and responsibilities. Includes a responsibility chart template.',
    preview: {
      coverText: 'Super-helper {childName} discovers that being responsible gives them amazing powers!',
      samplePage: 'When I remember to feed my pet fish without being reminded, I feel like I have a responsibility superpower...'
    }
  },

  // Special Occasions
  {
    id: 'first_day_adventure',
    title: 'My First Day Adventure',
    description: 'Ease first-day jitters with a story about starting school, making friends, and discovering new things.',
    category: 'special_occasions',
    ageGroups: ['3-5', '6-8'],
    educationalFocus: ['sel', 'social_skills'],
    difficulty: 'beginner',
    pages: 8,
    estimatedReadingTime: 6,
    subscriptionTier: 'basic',
    themes: ['courage', 'friendship', 'curiosity', 'growth_mindset'],
    learningObjectives: [
      'Reduce anxiety about new experiences',
      'Learn strategies for making friends',
      'Build confidence in new situations',
      'Understand that nervousness is normal'
    ],
    parentGuide: 'Perfect for school transitions. Includes tips for parents to support children during new beginnings.',
    therapeuticValue: ['anxiety_reduction', 'social_skills', 'self_esteem'],
    preview: {
      coverText: '{childName} is nervous about their first day, but discovers it\'s the beginning of an amazing adventure!',
      samplePage: 'My tummy feels fluttery like butterflies, but I remember that feeling excited and nervous can happen together...'
    }
  },

  // Environmental Awareness
  {
    id: 'earth_helper',
    title: 'If I Were an Earth Helper',
    description: 'Learn about environmental protection through fun activities and discover how children can make a difference.',
    category: 'environmental',
    ageGroups: ['6-8', '9-12'],
    educationalFocus: ['environmental_awareness', 'social_skills'],
    difficulty: 'intermediate',
    pages: 10,
    estimatedReadingTime: 8,
    subscriptionTier: 'premium',
    themes: ['responsibility', 'problem_solving', 'teamwork'],
    learningObjectives: [
      'Understand environmental challenges',
      'Learn practical conservation actions',
      'Develop sense of environmental responsibility',
      'Connect individual actions to global impact'
    ],
    parentGuide: 'Includes family activities for environmental conservation and sustainable living tips.',
    preview: {
      coverText: 'Eco-warrior {childName} learns how small actions can make a big difference for our planet!',
      samplePage: 'When I turn off lights and use both sides of paper, I\'m being a superhero for the Earth...'
    }
  }
];

// Story categories for navigation
export const STORY_CATEGORIES = {
  classic_adventures: {
    name: 'Classic Adventures',
    description: 'Timeless stories with universal themes',
    icon: '🌟',
    color: 'bg-amber-100 text-amber-800'
  },
  emotional_intelligence: {
    name: 'Emotional Intelligence',
    description: 'Stories that help children understand and manage emotions',
    icon: '💝',
    color: 'bg-pink-100 text-pink-800'
  },
  stem_education: {
    name: 'STEM Adventures',
    description: 'Science, technology, engineering, and math exploration',
    icon: '🚀',
    color: 'bg-blue-100 text-blue-800'
  },
  life_skills: {
    name: 'Life Skills',
    description: 'Practical skills for growing up',
    icon: '🌱',
    color: 'bg-green-100 text-green-800'
  },
  diversity_inclusion: {
    name: 'Our World',
    description: 'Celebrating diversity and inclusion',
    icon: '🌍',
    color: 'bg-purple-100 text-purple-800'
  },
  therapeutic: {
    name: 'Gentle Support',
    description: 'Stories for emotional healing and growth',
    icon: '🤗',
    color: 'bg-teal-100 text-teal-800'
  },
  special_occasions: {
    name: 'Special Moments',
    description: 'Stories for life\'s important milestones',
    icon: '🎉',
    color: 'bg-yellow-100 text-yellow-800'
  },
  environmental: {
    name: 'Earth Friends',
    description: 'Environmental awareness and sustainability',
    icon: '🌿',
    color: 'bg-emerald-100 text-emerald-800'
  },
  family_values: {
    name: 'Family Values',
    description: 'Stories about family bonds and relationships',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-rose-100 text-rose-800'
  },
  cultural_heritage: {
    name: 'Cultural Heritage',
    description: 'Stories celebrating different cultures and traditions',
    icon: '🏛️',
    color: 'bg-indigo-100 text-indigo-800'
  }
};

// Helper functions
export function getTemplatesByCategory(category: StoryCategory): StoryTemplate[] {
  return STORY_TEMPLATES.filter(template => template.category === category);
}

export function getTemplatesByAge(ageGroup: AgeGroup): StoryTemplate[] {
  return STORY_TEMPLATES.filter(template => template.ageGroups.includes(ageGroup));
}

export function getTemplatesBySubscriptionTier(tier: 'basic' | 'premium' | 'all'): StoryTemplate[] {
  if (tier === 'all') return STORY_TEMPLATES;
  return STORY_TEMPLATES.filter(template => 
    template.subscriptionTier === tier || template.subscriptionTier === 'basic'
  );
}

export function getTherapeuticTemplates(): StoryTemplate[] {
  return STORY_TEMPLATES.filter(template => template.therapeuticValue && template.therapeuticValue.length > 0);
}

export default STORY_TEMPLATES;