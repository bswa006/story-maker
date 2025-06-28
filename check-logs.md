# How to Check Image Generation Logs

## Steps to Debug Image Generation:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the terminal where the server is running** - This will show all the console logs

3. **Generate a story with images** at http://localhost:3002/demo

4. **Look for these log patterns in the terminal**:

   ### If using the CORRECT route (generate-images-v2):
   ```
   🎨 =====================================================
   🎨 GENERATE-IMAGES-V2 API ROUTE CALLED
   🎨 =====================================================
   
   🎨 Art Style: studio_ghibli
   🌟 Using MAGICAL GHIBLI PROMPTS
   ```

   ### If using the WRONG route (old generate-images):
   ```
   ⚠️ =====================================================
   ⚠️ OLD GENERATE-IMAGES API ROUTE CALLED
   ⚠️ This route does NOT support Studio Ghibli magic!
   ⚠️ =====================================================
   ```

5. **Check the full DALL-E prompt** - Look for:
   ```
   🔍 FULL DALL-E PROMPT:
   ----------------------------------------
   [The actual prompt sent to DALL-E]
   ----------------------------------------
   ```

## What to Look For:

### ✅ GOOD Signs (Magical Prompts):
- "Studio Ghibli masterpiece"
- "breathtaking", "magical", "wonder"
- "golden hour light", "ethereal glow"
- "floating particles", "dreamlike quality"
- "Museum-quality children's book illustration"

### ❌ BAD Signs (Generic Prompts):
- "cute cartoon style"
- "Disney-Pixar inspired"
- "child-friendly"
- Technical specifications without magic
- Short, generic descriptions

## Quick Fix if Wrong Route is Called:

The frontend should now be using the correct route, but if you still see the OLD route being called:

1. Clear browser cache
2. Restart the dev server
3. Make sure you're using the `/demo` page or the AI Generator option