#!/usr/bin/env node

// Test script specifically for multi-character scenes like Ira/Jake

const testMultiCharacterStory = {
  name: "Ira and Jake Multi-Character Test",
  childDescription: "Ira, a 7 year old girl with long brown hair wearing a yellow dress and crown",
  pages: [
    {
      pageNumber: 1,
      text: "One sunny afternoon, Ira found her younger brother, Jake, crying in the corner of their playroom.",
      imagePrompt: "Ira discovering Jake crying in playroom corner"
    },
    {
      pageNumber: 2,
      text: "She bent down and asked Jake what was wrong, her face full of concern for her little brother.",
      imagePrompt: "Ira bending down to ask crying Jake what's wrong"
    },
    {
      pageNumber: 3,
      text: "Jake wiped his tears and pointed to his broken toy robot, looking up at his sister for help.",
      imagePrompt: "Jake pointing to broken toy robot while looking at Ira"
    }
  ],
  expectedCharacters: {
    Ira: {
      name: "Ira",
      role: "older sister",
      gender: "female",
      appearance: "7 year old girl with long brown hair wearing a yellow dress and crown"
    },
    Jake: {
      name: "Jake",
      role: "younger brother", 
      gender: "male",
      appearance: "younger boy (implied from text)"
    }
  }
};

async function testMultiCharacterGeneration() {
  console.log("🎭 Testing Multi-Character Scene Generation...\n");
  console.log("Story: Ira and Jake sibling interaction");
  console.log("Key challenge: Both characters must appear in each scene\n");
  
  try {
    const response = await fetch("http://localhost:3001/api/ai/generate-images-v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storyId: `test-multi-${Date.now()}`,
        childName: "Ira",
        childAge: "7",
        childDescription: testMultiCharacterStory.childDescription,
        pages: testMultiCharacterStory.pages,
        artStyle: "disney_pixar_3d",
        testingMode: true,
        enhancedMode: true
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("❌ API Error:", result.error);
      return;
    }

    console.log("📊 Generation Results:");
    console.log(`Success rate: ${result.metadata.successfulImages}/${result.metadata.totalImages}`);
    console.log(`Validation score: ${result.metadata.averageValidationScore?.toFixed(1) || 'N/A'}/100`);
    
    // Analyze each generated image
    result.images.forEach((img, index) => {
      if (img.imageUrl) {
        console.log(`\n📸 Image ${img.pageNumber}:`);
        console.log(`Story: "${testMultiCharacterStory.pages[index]?.text}"`);
        
        // Check if prompt mentions both characters
        const promptLower = img.prompt?.toLowerCase() || "";
        const hasIra = promptLower.includes("ira");
        const hasJake = promptLower.includes("jake");
        
        console.log("\nCharacter Presence in Prompt:");
        console.log(`  Ira mentioned: ${hasIra ? '✅' : '❌'}`);
        console.log(`  Jake mentioned: ${hasJake ? '✅' : '❌'}`);
        
        // Check for multi-character requirements
        const hasMultiCharReq = promptLower.includes("2 characters") || 
                               promptLower.includes("both") || 
                               promptLower.includes("all characters");
        console.log(`  Multi-character requirement: ${hasMultiCharReq ? '✅' : '❌'}`);
        
        // Check for specific interactions
        if (img.pageNumber === 2) {
          const hasBending = promptLower.includes("bend") || promptLower.includes("kneel");
          console.log(`  Bending/kneeling action: ${hasBending ? '✅' : '❌'}`);
        }
        
        // Extract critical requirements from prompt
        const criticalMatch = img.prompt?.match(/CRITICAL REQUIREMENTS[\s\S]*?(?=\n\n|$)/);
        if (criticalMatch) {
          console.log("\nCritical Requirements Found:");
          console.log(criticalMatch[0].split('\n').slice(1).join('\n  '));
        }
        
        console.log("\nGenerated Image URL:", img.imageUrl);
      }
    });
    
    console.log("\n\n🔍 MANUAL VERIFICATION CHECKLIST:");
    console.log("1. [ ] Both Ira AND Jake appear in EVERY image");
    console.log("2. [ ] Ira consistently has yellow dress and crown");
    console.log("3. [ ] Jake is consistently the same boy (not different boys)");
    console.log("4. [ ] Page 2 shows Ira bending down to Jake's level");
    console.log("5. [ ] Characters are positioned correctly for their interaction");
    console.log("6. [ ] Settings match story (playroom, not outdoors)");
    console.log("7. [ ] Emotions match (Jake crying/sad, Ira concerned)");
    
    console.log("\n💡 KEY SUCCESS CRITERIA:");
    console.log("- If both characters appear = Major improvement");
    console.log("- If characters are consistent = Success");
    console.log("- If interactions are correct = Excellent");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testMultiCharacterGeneration().catch(console.error);