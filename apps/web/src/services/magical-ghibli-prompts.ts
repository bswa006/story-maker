// Magical Studio Ghibli-inspired prompts that create awe and wonder

export const MAGICAL_ELEMENTS = {
  lighting: {
    golden_hour: 'bathed in warm golden hour light with volumetric god rays, dust motes dancing like tiny stars',
    ethereal_glow: 'surrounded by thousands of floating light particles, bioluminescent spirits glowing softly',
    moonlight: 'illuminated by ethereal moonlight with aurora-like ribbons in the sky, stars twinkling magically',
    forest_rays: 'dramatic shafts of sunlight piercing through ancient tree canopy, creating pools of golden light',
    underwater: 'filtered through crystal water with caustic patterns dancing on everything, bubbles catching rainbow light',
  },
  
  atmosphere: {
    mystical: 'air thick with magic - floating seeds, glowing spores, tiny spirits, butterflies leaving light trails',
    dreamy: 'soft watercolor edges blending reality with dream, distant elements fading into pastel mist',
    magical: 'visible magic everywhere - sparkles, floating crystals, energy wisps, petals suspended mid-air',
    serene: 'gentle wind making grass dance in waves, clouds drifting lazily, leaves spiraling gracefully',
    wonder: 'impossible beauty - floating rocks, upside-down waterfalls, trees growing into sky bridges',
  },
  
  nature_magic: {
    enchanted_forest: 'massive ancient trees with doors in trunks, glowing mushroom villages, tiny spirits peeking from leaves, roots forming natural staircases, moss that pulses with soft light',
    flower_meadow: 'infinite wildflower ocean with waves of color, butterflies creating living rainbows, flowers that sing in the wind, hidden fairy rings',
    sky_wonders: 'floating islands connected by rainbow bridges, cloud whales swimming by, castle ruins on distant peaks, birds leaving trails of stardust',
    water_magic: 'crystal streams with visible water spirits, koi fish made of starlight, lily pads large enough to sit on, underwater gardens visible through clear depths',
    wind_spirits: 'visible wind beings dancing through air, leaves and petals caught in magical spirals, dandelion seeds floating impossibly slowly, wind chimes singing without touch',
  },
  
  ghibli_signature: {
    totoro_forest: 'lush green forest with enormous ancient trees and hidden spirits',
    spirited_away: 'otherworldly beauty with traditional Japanese elements and magic',
    howls_castle: 'rolling hills with moving castles in the distance, flower fields',
    ponyo_ocean: 'vibrant underwater world with jellyfish and coral gardens',
    kiki_sky: 'coastal town view from above with red-tiled roofs and blue ocean',
  }
};

export function createMagicalGhibliPrompt(
  childDescription: string,
  scene: string,
  pageNumber: number // Reserved for future use
): string {
  // Simplified child description for better DALL-E understanding
  const simpleChild = childDescription.split(',').slice(0, 3).join(',');
  
  // Choose magical elements based on scene content
  const sceneLower = scene.toLowerCase();
  let lighting = MAGICAL_ELEMENTS.lighting.golden_hour;
  let atmosphere = MAGICAL_ELEMENTS.atmosphere.wonder;
  let natureMagic = '';
  
  if (sceneLower.includes('forest') || sceneLower.includes('tree')) {
    lighting = MAGICAL_ELEMENTS.lighting.forest_rays;
    natureMagic = MAGICAL_ELEMENTS.nature_magic.enchanted_forest;
  } else if (sceneLower.includes('ocean') || sceneLower.includes('underwater')) {
    lighting = MAGICAL_ELEMENTS.lighting.underwater;
    natureMagic = MAGICAL_ELEMENTS.nature_magic.water_magic;
  } else if (sceneLower.includes('sky') || sceneLower.includes('fly')) {
    atmosphere = MAGICAL_ELEMENTS.atmosphere.dreamy;
    natureMagic = MAGICAL_ELEMENTS.nature_magic.sky_wonders;
  } else if (sceneLower.includes('night') || sceneLower.includes('moon')) {
    lighting = MAGICAL_ELEMENTS.lighting.moonlight;
    atmosphere = MAGICAL_ELEMENTS.atmosphere.mystical;
  }
  
  // Create the magical prompt - FORCE Studio Ghibli style
  const magicalCreatures = [
    'tiny kodama spirits hiding in trees',
    'dust bunnies (susuwatari) scurrying in corners',
    'forest spirits glowing softly',
    'magical butterflies leaving trails of light',
    'small totoro-like creatures peeking from bushes'
  ];
  
  const randomCreatures = magicalCreatures.sort(() => Math.random() - 0.5).slice(0, 2).join(', ');
  
  return `STUDIO GHIBLI ANIME FILM STILL by Hayao Miyazaki - ULTRA DETAILED MAGICAL SCENE. ${simpleChild} in an AWE-INSPIRING moment of pure magic. ${scene}. 

ENVIRONMENT: ${lighting}, ${atmosphere}. ${natureMagic}. Background has MULTIPLE LAYERS of detail - foreground elements, mid-ground action, distant magical vistas. ${randomCreatures}.

ARTISTIC STYLE: Authentic hand-painted watercolor anime EXACTLY like My Neighbor Totoro, Spirited Away, Princess Mononoke. Soft brushstrokes, color bleeding, paper texture visible. Muted earthy colors with magical glows. Professional anime film frame.

MAGICAL ELEMENTS: Wind visibly moving everything, floating particles everywhere, impossible physics, dreamlike proportions, nature alive and breathing. Every leaf, every cloud has personality.

EMOTIONAL IMPACT: Must inspire childlike wonder and take viewer's breath away. This is the most beautiful moment the child has ever experienced.`;
}

export function enhanceSceneWithMagic(basicScene: string): string {
  const magicalEnhancements = [
    'with butterflies dancing around in spirals',
    'as flower petals float gently through the air',
    'while magical sparkles drift like stardust',
    'with rainbow light refracting through dewdrops',
    'as gentle spirits peek from behind trees',
    'with clouds forming whimsical shapes above',
    'while fireflies create constellations in the air',
    'as the wind carries whispers of adventure',
  ];
  
  // Add 2-3 random magical elements
  const selectedEnhancements = magicalEnhancements
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .join(', ');
  
  return `${basicScene}, ${selectedEnhancements}`;
}

export function createEmotionalGhibliPrompt(
  childName: string,
  childAppearance: string,
  animalCompanion: string,
  lesson: string,
  pageNumber: number, // Reserved for future use
  originalScene?: string // Add original scene to preserve story context
): string {
  // Map animals to specific Ghibli-style magical ENHANCEMENTS (not replacements)
  const animalEnhancements: Record<string, string> = {
    bird: 'with clouds forming sky castles, rainbow bridges, wind spirits dancing',
    lion: 'golden savanna rippling like waves, dust devils dancing, spirits in clouds',
    turtle: 'cherry blossoms falling in slow motion, ripples turning gold, time visible as threads',
    monkey: 'ancient temples with bioluminescent vines, butterflies forming bridges',
    ant: 'dewdrops as crystal balls, glowing mushrooms, pollen like golden snow',
    butterfly: 'thousands creating living stained glass, flowers blooming in their path',
    dog: 'sunflower fields touching clouds, petals swirling, flowers following their movement',
    fish: 'coral castles glowing, schools painting murals, underwater auroras',
  };
  
  const enhancement = animalEnhancements[animalCompanion.toLowerCase()] || 
    'in a magical landscape filled with wonder';
  
  // If we have an original scene, preserve it and enhance it
  const baseScene = originalScene || `${childName} with ${animalCompanion}`;
  
  return `AUTHENTIC STUDIO GHIBLI ANIME by Hayao Miyazaki - ${baseScene}, ${enhancement}. ${childName} (${childAppearance}) shows pure joy and wonder. MUST look EXACTLY like scenes from My Neighbor Totoro, Spirited Away, or Princess Mononoke. Hand-painted watercolor anime with visible brush textures, ethereal lighting, floating particles of light. Rich detailed backgrounds with depth. The scene captures the lesson "${lesson}" through visual storytelling. Soft muted colors, dreamlike quality, breathtaking composition. Professional anime film quality.`;
}

// Specific prompts for maximum magical impact
export const MAGICAL_SCENE_PROMPTS = {
  introduction: `STUDIO GHIBLI ANIME MASTERPIECE by Hayao Miyazaki (NOT cartoon style!): A child standing at their bedroom window at dawn, golden light streaming in creating god rays, as magical forest spirits peek through the glass. The room filled with floating particles of light that dance in the air. Outside, a fantastical world with ancient trees, floating islands, and aurora-like sky. Hand-painted watercolor anime style EXACTLY like My Neighbor Totoro opening. Soft brushstrokes, muted colors, dreamlike atmosphere. Professional anime film quality.`,
  
  conclusion: `STUDIO GHIBLI ANIME FINALE in the style of Hayao Miyazaki (MUST NOT be cartoon!): A child surrounded by all their magical animal friends in a circular meadow at golden hour. Each animal has an ethereal glow. The sky painted in breathtaking gradients - lavender, gold, rose. Thousands of flower petals and dandelion seeds swirl in a gentle magical vortex. The child's expression shows transcendent joy. Epic composition like Princess Mononoke's ending. Hand-painted textures, visible brushwork, professional anime quality.`,
  
  // Animal-specific magical scenes
  bird: `BREATHTAKING AERIAL SCENE: Child riding on the back of a giant phoenix-like bird through a sea of clouds that form impossible sky kingdoms. The setting sun turns everything to liquid gold. Below, floating islands connected by waterfalls that flow upward. Wind spirits with translucent wings escort them. The bird's feathers trail stardust. Cherry blossom petals swirl in impossible spirals. Ancient sky dragons sleep on distant cloud mountains. The child's hair streams with ribbons of light.`,
  
  lion: `MAJESTIC SAVANNA MAGIC: Child and noble lion stand atop Pride Rock as the entire savanna comes alive - grass waves form golden ocean, every acacia tree has a spirit guardian, dust devils dance like ballet. The lion's mane flows with cosmic energy. Ancient African spirits materialize in the clouds forming a crown of ancestors. Zebras and gazelles move in mystical patterns below. The setting sun is three times larger than normal, painting the world in impossible colors.`,
  
  turtle: `TIMELESS POND OF WISDOM: Child and ancient turtle sit by an enchanted pond where time flows differently - cherry blossoms fall upward, water flows in spirals, ripples form mandala patterns. The turtle's shell contains a miniature galaxy. Koi fish made of pure starlight swim through air and water alike. Lotus flowers open to reveal tiny fairy kingdoms. The moon's reflection shows other worlds. Fireflies write messages in ancient scripts.`,
  
  butterfly: `TRANSFORMATION CATHEDRAL: Child witnesses butterfly friend's metamorphosis in a glass cathedral made of flower petals. Thousands of butterflies create living stained glass murals that tell stories. Each wing beat releases musical notes visible as golden ribbons. Flowers bloom in time-lapse wherever they land. The chrysalis cracks open releasing aurora lights. Butterfly spirits of all who came before dance in celebration. The air itself shimmers with transformation magic.`,
};

// Function to select best prompt approach based on requirements
export function selectOptimalPromptStrategy(
  requiresMagic: boolean = true,
  requiresConsistency: boolean = true,
  artStyle: string = 'studio_ghibli'
): 'magical_ghibli' | 'technical_consistent' | 'balanced' {
  if (requiresMagic && artStyle === 'studio_ghibli') {
    return 'magical_ghibli';
  } else if (requiresConsistency && !requiresMagic) {
    return 'technical_consistent';
  }
  return 'balanced';
}