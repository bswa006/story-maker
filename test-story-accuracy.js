#!/usr/bin/env node

// Test script to verify story-image accuracy

const testStories = [
  {
    name: "Parrot Deforestation Test",
    pages: [
      {
        pageNumber: 1,
        text: "In her yellow dress and crown, Ira stood at the edge of the rainforest, her toothbrush in hand, ready for an adventure.",
        imagePrompt: "Ira in yellow dress with crown at rainforest edge holding toothbrush"
      },
      {
        pageNumber: 2,
        text: "She met a colorful parrot named Polly who was panicking because her home was being destroyed by deforestation.",
        imagePrompt: "Ira meeting panicked parrot Polly with deforestation visible"
      }
    ],
    childDescription: "Ira, a 6 year old girl with brown hair, wearing a yellow dress and crown",
    expectedResults: {
      page1: {
        mustInclude: ["Ira", "yellow dress", "crown", "toothbrush", "rainforest"],
        mustNotInclude: ["indoor", "house"]
      },
      page2: {
        mustInclude: ["Ira", "parrot", "Polly", "deforestation", "panic"],
        mustNotInclude: ["cozy", "calm", "happy", "indoor"]
      }
    }
  },
  {
    name: "Underwater Adventure Test",
    pages: [
      {
        pageNumber: 1,
        text: "Emma dove into the crystal clear ocean to explore the underwater world.",
        imagePrompt: "Emma diving underwater in ocean"
      },
      {
        pageNumber: 2,
        text: "She swam alongside a friendly sea turtle named Tito through the coral reef.",
        imagePrompt: "Emma swimming with sea turtle Tito in coral reef"
      }
    ],
    childDescription: "Emma, a 7 year old girl with blonde pigtails, wearing a blue swimsuit",
    expectedResults: {
      page1: {
        mustInclude: ["Emma", "underwater", "ocean", "diving"],
        mustNotInclude: ["land", "street", "house"]
      },
      page2: {
        mustInclude: ["Emma", "turtle", "Tito", "coral", "underwater"],
        mustNotInclude: ["ground", "walking", "standing"]
      }
    }
  }
];

async function testStoryAccuracy() {
  console.log("🧪 Testing Story-Image Accuracy System...\n");
  
  for (const test of testStories) {
    console.log(`\n📚 Testing: ${test.name}`);
    console.log(`Character: ${test.childDescription}`);
    
    try {
      const response = await fetch("http://localhost:3002/api/ai/generate-images-v3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId: `test-${Date.now()}`,
          childName: test.childDescription.split(',')[0], // Extract name
          childAge: test.childDescription.match(/(\d+)\s*year/)?.[1] || "6",
          childDescription: test.childDescription,
          pages: test.pages,
          artStyle: "disney_pixar_3d", // Test with problematic style
          testingMode: true
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error(`❌ API Error:`, result.error);
        continue;
      }

      console.log("\n📊 Results:");
      console.log(`Success rate: ${result.metadata.successfulImages}/${result.metadata.totalImages}`);
      console.log(`Validation score: ${result.metadata.averageValidationScore?.toFixed(1) || 'N/A'}/100`);
      
      // Check each page
      result.images.forEach((img, index) => {
        if (img.imageUrl && img.sceneElements) {
          console.log(`\nPage ${img.pageNumber}:`);
          const expected = test.expectedResults[`page${img.pageNumber}`];
          
          // Check must include elements
          console.log("  Must Include:");
          expected.mustInclude.forEach(element => {
            const found = JSON.stringify(img.sceneElements).toLowerCase().includes(element.toLowerCase()) ||
                         img.prompt?.toLowerCase().includes(element.toLowerCase());
            console.log(`    ${element}: ${found ? '✅' : '❌'}`);
          });
          
          // Check must not include elements
          console.log("  Must NOT Include:");
          expected.mustNotInclude.forEach(element => {
            const found = img.prompt?.toLowerCase().includes(element.toLowerCase());
            console.log(`    ${element}: ${found ? '❌ FOUND (BAD)' : '✅ NOT FOUND (GOOD)'}`);
          });
          
          // Log the actual prompt used
          console.log("\n  Generated Prompt Preview:");
          console.log(`    "${img.prompt?.substring(0, 200)}..."`);
        }
      });
      
      // Check character consistency
      if (result.images.length > 1) {
        console.log("\n🔍 Character Consistency Check:");
        const firstPrompt = result.images[0]?.prompt || "";
        const secondPrompt = result.images[1]?.prompt || "";
        
        // Both should mention the same character name
        const charName = test.childDescription.split(',')[0];
        const bothHaveCharName = firstPrompt.includes(charName) && secondPrompt.includes(charName);
        console.log(`  Same character name in both: ${bothHaveCharName ? '✅' : '❌'}`);
        
        // Both should have character description
        const bothHaveDescription = firstPrompt.includes("year old") && secondPrompt.includes("year old");
        console.log(`  Character description in both: ${bothHaveDescription ? '✅' : '❌'}`);
      }
      
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
  }
  
  console.log("\n✅ Testing complete!");
  console.log("\n💡 Key things to verify manually:");
  console.log("1. Same child appears in all images (not different children)");
  console.log("2. Story events match images (e.g., deforestation visible, not cozy scene)");
  console.log("3. Emotions match (panic shown as panic, not calm)");
  console.log("4. Settings are correct (underwater is underwater, not on land)");
}

// Run the tests
testStoryAccuracy().catch(console.error);