import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // Test with a very specific Studio Ghibli prompt
    const testPrompt = `
CREATE A MASTERPIECE ILLUSTRATION - This must be indistinguishable from an actual Studio Ghibli film by Hayao Miyazaki.

AUTHENTIC STUDIO GHIBLI STYLE - EXACTLY like Spirited Away, My Neighbor Totoro, and Ponyo:
- Hand-painted watercolor aesthetic with visible brush strokes
- Soft, dreamy atmosphere with ethereal lighting
- Rich, lush backgrounds with intricate environmental details
- Warm, muted color palette with subtle gradients
- Characters with large, expressive eyes and gentle features
- Organic, flowing movement in hair and clothing
- Masterful use of light and shadow creating depth
- Whimsical yet grounded in emotional reality
- Nature elements rendered with love and detail
- Cinematic composition with thoughtful framing

CHARACTER: A 6-year-old girl with long brown hair in pigtails, wearing a yellow dress, large expressive eyes, fair skin, gentle smile.

SCENE: The girl is sitting on a wooden swing hanging from a large, ancient tree in a magical forest. Sunlight filters through the leaves creating dappled shadows. Butterflies float around her. The background shows layers of trees fading into a misty distance.

TECHNICAL SPECIFICATIONS:
- Ultra high resolution 4K quality artwork
- Professional movie poster quality illustration
- Perfect color harmony and atmospheric perspective
- No CGI or digital look - must appear hand-painted
- Smooth, professional finish without amateur elements
- Gallery-worthy artistic quality

This illustration should win children's book illustration awards and be suitable for publication by major publishers.

ABSOLUTELY NO text, words, or letters in the image.`;

    console.log('Testing with prompt length:', testPrompt.length);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: testPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural',
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    return NextResponse.json({
      success: true,
      imageUrl,
      promptLength: testPrompt.length,
      revisedPrompt,
      originalPromptPreview: testPrompt.substring(0, 500) + '...',
    });

  } catch (error) {
    console.error('Test image generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate test image' },
      { status: 500 }
    );
  }
}