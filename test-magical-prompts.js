// Test script to verify magical Ghibli prompts

import { createMagicalGhibliPrompt, createEmotionalGhibliPrompt, MAGICAL_SCENE_PROMPTS } from './apps/web/src/services/magical-ghibli-prompts.js';

console.log('🎨 Testing Magical Ghibli Prompts\n');

// Test 1: Basic magical prompt
const basicPrompt = createMagicalGhibliPrompt(
  '6 year old girl with brown hair and green eyes',
  'standing in a forest clearing with butterflies',
  1
);
console.log('Basic Magical Prompt:');
console.log(basicPrompt);
console.log('\n---\n');

// Test 2: Emotional animal companion prompt
const emotionalPrompt = createEmotionalGhibliPrompt(
  'Emma',
  '6 year old with curly brown hair and hazel eyes',
  'butterfly',
  'transformation and growth',
  5
);
console.log('Emotional Animal Companion Prompt:');
console.log(emotionalPrompt);
console.log('\n---\n');

// Test 3: Predefined magical scenes
console.log('Predefined Magical Scenes:');
console.log('\nIntroduction Scene:');
console.log(MAGICAL_SCENE_PROMPTS.introduction);
console.log('\nButterfly Scene:');
console.log(MAGICAL_SCENE_PROMPTS.butterfly);
console.log('\nConclusion Scene:');
console.log(MAGICAL_SCENE_PROMPTS.conclusion);