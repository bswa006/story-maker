// Debug script to test scene extraction and prompt generation
import { extractSceneElements } from './apps/web/src/services/scene-element-extractor.js';
import { buildSceneAwarePrompt } from './apps/web/src/services/scene-aware-prompts.js';

// Test story pages
const testPages = [
  {
    pageNumber: 1,
    text: "Emma plunged into the crystal-clear ocean, her eyes widening as she discovered a magical underwater world filled with colorful coral and playful fish.",
    imagePrompt: "underwater scene with child swimming"
  },
  {
    pageNumber: 2,
    text: "In the depths of the ocean, Emma met a wise old turtle named Tito who wore a tiny crown made of seashells.",
    imagePrompt: "child meeting turtle underwater"
  },
  {
    pageNumber: 3,
    text: "Emma and Tito swam through a forest of kelp, where schools of rainbow fish danced around them in the sunlight filtering through the water.",
    imagePrompt: "underwater kelp forest scene"
  }
];

const character = {
  name: "Emma",
  age: "6",
  appearance: "young girl with brown pigtails, wearing a blue swimsuit",
  consistentFeatures: ["brown pigtails", "blue swimsuit", "bright smile"]
};

console.log("=== SCENE EXTRACTION AND PROMPT GENERATION DEBUG ===\n");

testPages.forEach((page) => {
  console.log(`\n======== PAGE ${page.pageNumber} ========`);
  console.log(`Story Text: "${page.text}"`);
  console.log(`Original Prompt: "${page.imagePrompt}"`);
  
  // Extract scene elements
  const sceneElements = extractSceneElements(page.text);
  console.log("\nExtracted Scene Elements:");
  console.log(JSON.stringify(sceneElements, null, 2));
  
  // Build scene-aware prompt
  const scenePrompt = buildSceneAwarePrompt({
    page,
    sceneElements,
    character,
    artStyle: 'studio_ghibli',
    storyContext: {
      totalPages: 10,
      storyTheme: 'underwater adventure',
      isFirstPage: page.pageNumber === 1,
      isLastPage: false
    }
  });
  
  console.log("\nGenerated Scene-Aware Prompt:");
  console.log("----------------------------------------");
  console.log(scenePrompt);
  console.log("----------------------------------------");
});