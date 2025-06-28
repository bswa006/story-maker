// Scene-specific enhancements for each art style

import { ArtStyleId } from './art-styles-system';

type SceneEnhancer = (scene: string, animal?: string) => string;

export const STYLE_SCENE_ENHANCERS: Record<ArtStyleId, Record<string, SceneEnhancer>> = {
  studio_ghibli: {
    forest: (scene) => `${scene} in an ancient enchanted forest where every tree has a spirit, glowing moss covers everything, tiny kodama peek from behind leaves, shafts of golden light pierce the canopy creating magical pools of light`,
    sky: (scene) => `${scene} among floating islands connected by rainbow bridges, cloud castles drift by, wind spirits dance visibly, the sky painted in impossible colors`,
    water: (scene) => `${scene} by crystal clear water where koi fish swim through air and water alike, lily pads glow softly, water spirits create rippling mandalas`,
    meadow: (scene) => `${scene} in infinite wildflower fields that ripple like ocean waves, butterflies leave trails of light, flowers sing in the wind`
  },

  disney_pixar_3d: {
    forest: (scene) => `${scene} in a vibrant 3D forest with perfectly rendered leaves catching light, animated creatures with big expressive eyes, magical sparkles floating everywhere`,
    sky: (scene) => `${scene} high above fluffy volumetric clouds, lens flares from the sun, birds with rainbow trails, perfectly rendered atmospheric perspective`,
    water: (scene) => `${scene} near crystal clear water with realistic caustics, playful sea creatures, splashing water droplets frozen in time like diamonds`,
    meadow: (scene) => `${scene} in a colorful meadow with each blade of grass individually rendered, flowers that bounce and sway, perfect subsurface scattering on petals`
  },

  watercolor_illustration: {
    forest: (scene) => `${scene} in a soft watercolor forest where colors bleed beautifully, trees painted with loose brushstrokes, dappled light created with wet-on-wet technique`,
    sky: (scene) => `${scene} under a wash of sunset colors bleeding into each other, clouds painted with single brushstrokes, birds suggested with minimal marks`,
    water: (scene) => `${scene} beside a pond painted in transparent layers, reflections created with wet washes, ripples suggested with careful brushwork`,
    meadow: (scene) => `${scene} in a field of impressionistic flowers, colors mixing on the paper, negative space used beautifully, butterflies painted with single touches`
  },

  chibi_kawaii: {
    forest: (scene) => `${scene} in a super cute forest where every tree has a happy face, mushrooms with dots and hearts, sparkles and bubbles everywhere`,
    sky: (scene) => `${scene} in a pastel sky with smiling clouds, rainbow gradients, star-shaped sparkles, cute sun with rosy cheeks`,
    water: (scene) => `${scene} by sparkling water with heart-shaped ripples, fish with big eyes and blushing cheeks, lily pads with smiley faces`,
    meadow: (scene) => `${scene} in a field of flowers with kawaii faces, butterflies leaving heart trails, everything overwhelmingly adorable`
  },

  dreamworks_animation: {
    forest: (scene) => `${scene} in an epic mystical forest with towering trees, dramatic lighting cutting through fog, stylized foliage with painterly textures`,
    sky: (scene) => `${scene} soaring through dramatic cloudscapes, epic vistas below, atmospheric haze, cinematic camera angles`,
    water: (scene) => `${scene} by turbulent waters with realistic physics, spray and mist effects, dramatic rocks, moody lighting`,
    meadow: (scene) => `${scene} on windswept hills with grass moving in waves, dramatic sky, epic scale, cinematic composition`
  },

  classic_fairytale: {
    forest: (scene) => `${scene} in an enchanted forest from ancient tales, gnarled trees with faces, delicate pen work details, Art Nouveau inspired foliage`,
    sky: (scene) => `${scene} beneath a fairy tale sky with decorative clouds, stars arranged in patterns, moon with a gentle face, ornate border designs`,
    water: (scene) => `${scene} by a mirror-like pond from old stories, water lilies with gold edges, swan reflections, intricate ripple patterns`,
    meadow: (scene) => `${scene} in a meadow from vintage illustrations, flowers drawn with botanical accuracy, decorative grass patterns, illuminated manuscript style`
  }
};

// Animal-specific prompts for each art style
export const STYLE_ANIMAL_SCENES: Record<ArtStyleId, Record<string, string>> = {
  studio_ghibli: {
    bird: 'Child riding a majestic bird through cloud kingdoms as cherry blossoms spiral impossibly, wind spirits escort them',
    lion: 'Child and noble lion on a hill as the savanna breathes with life, ancestor spirits form crowns in clouds',
    turtle: 'Child with ancient turtle by a pond where time flows differently, ripples form mandalas',
    butterfly: 'Child witnesses butterfly metamorphosis in a cathedral of petals, transformation magic visible',
    monkey: 'Child swings with monkey through temples overgrown with glowing vines, stone faces smile',
    ant: 'Child in macro world where dewdrops are crystal balls, mushrooms glow like street lamps',
    dog: 'Child runs with dog through sunflower fields touching clouds, flowers turn to watch them pass',
    fish: 'Child swims with fish in underwater kingdom where coral castles glow, sea spirits dance'
  },

  disney_pixar_3d: {
    bird: 'Child soars with colorful bird above perfectly rendered clouds, feathers shimmer with iridescence',
    lion: 'Child stands with majestic CGI lion, mane flowing realistically, sunset creates rim lighting',
    turtle: 'Child sits with wise turtle, shell reflects environment perfectly, water has realistic caustics',
    butterfly: 'Child surrounded by hundreds of butterflies, wings catch light beautifully, particle effects',
    monkey: 'Child plays with animated monkey, fur simulation, dynamic poses, jungle fully realized in 3D',
    ant: 'Child shrunk to ant size in detailed grass forest, subsurface scattering on leaves',
    dog: 'Child plays fetch with energetic dog, fur dynamics, grass individually modeled',
    fish: 'Child in underwater adventure, volumetric lighting through water, coral reef fully detailed'
  },

  watercolor_illustration: {
    bird: 'Child and bird painted in flowing watercolor washes, sky bleeds into landscape',
    lion: 'Child with lion in savanna painted with warm earth tones, loose brushwork suggests movement',
    turtle: 'Child by pond with turtle, water created with wet-on-wet technique, soft reflections',
    butterfly: 'Child watching butterflies painted as colorful dots and streaks, flowers in loose washes',
    monkey: 'Child in jungle canopy painted with layers of green washes, leaves suggested not detailed',
    ant: 'Child observing ants, painted at tiny scale with delicate brushwork',
    dog: 'Child running with dog through meadow, movement captured in flowing brushstrokes',
    fish: 'Child underwater painted in blue-green washes, fish as quick brushstrokes of color'
  },

  chibi_kawaii: {
    bird: 'Super cute child with kawaii bird, both with huge sparkly eyes, hearts everywhere',
    lion: 'Adorable child with chibi lion, oversized mane, paw prints are heart-shaped',
    turtle: 'Tiny child on smiling turtle, shell has cute patterns, bubbles and sparkles',
    butterfly: 'Kawaii child with butterfly leaving rainbow heart trail, flowers have happy faces',
    monkey: 'Chibi child and monkey with matching bows, swinging past smiling trees',
    ant: 'Mini child with cute ant wearing a bow, carrying heart-shaped leaves',
    dog: 'Child and fluffy dog with huge eyes, playing with star-shaped toys',
    fish: 'Child in bubbly underwater scene, fish have rosy cheeks and long eyelashes'
  },

  dreamworks_animation: {
    bird: 'Child on dragon-like bird soaring through epic cloudscapes, cinematic angles',
    lion: 'Child with powerful lion on dramatic cliff, wind blowing mane dynamically',
    turtle: 'Child on ancient turtle crossing mystical waters, fog and atmosphere',
    butterfly: 'Child in butterfly grove with thousands of wings creating living patterns',
    monkey: 'Child swinging with monkey through action-packed jungle chase scene',
    ant: 'Child in epic ant battle, dramatic scale differences, intense lighting',
    dog: 'Child and dog in dynamic running scene, motion blur, cinematic framing',
    fish: 'Child in underwater action sequence, dramatic lighting through water'
  },

  classic_fairytale: {
    bird: 'Child with noble phoenix in detailed pen-and-ink style, ornate feathers',
    lion: 'Child meets lion from heraldic traditions, decorative mane patterns',
    turtle: 'Child by wise turtle with shell containing intricate symbolic patterns',
    butterfly: 'Child watching butterfly emerge, botanical illustration accuracy',
    monkey: 'Child in jungle scene with monkey, Victorian adventure book style',
    ant: 'Child observing ant kingdom, cross-section illustration style',
    dog: 'Child with faithful hound, classic British illustration tradition',
    fish: 'Child meets magical fish, scales detailed like medieval illumination'
  }
};