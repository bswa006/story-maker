#!/usr/bin/env node

// Test script for story-image synchronization

const testCases = [
  {
    name: "Underwater Adventure",
    story: {
      storyId: "test-underwater-123",
      childName: "Emma",
      childAge: "6",
      childDescription: "6 year old girl with brown hair in pigtails, green eyes, wearing a blue dress",
      artStyle: "disney_pixar_3d",
      testingMode: true,
      pages: [
        {
          pageNumber: 1,
          text: "One sunny day, Emma, with her crown and toothbrush, decided to explore the ocean depths.",
          imagePrompt: "Emma diving into the ocean with her crown and toothbrush"
        },
        {
          pageNumber: 2,
          text: "As she plunged into the waters, she was greeted by a friendly sea turtle named Tito.",
          imagePrompt: "Emma underwater meeting a sea turtle named Tito"
        }
      ]
    },
    expectedValidation: {
      page1: {
        setting: "ocean",
        characters: ["Emma"],
        keyObjects: ["crown", "toothbrush"],
        action: "explore"
      },
      page2: {
        setting: "underwater",
        characters: ["Emma", "turtle", "Tito"],
        action: "plunged"
      }
    }
  },
  {
    name: "Forest Adventure",
    story: {
      storyId: "test-forest-456",
      childName: "Alex",
      childAge: "7",
      childDescription: "7 year old boy with short black hair, brown eyes, wearing a red t-shirt",
      artStyle: "studio_ghibli",
      testingMode: true,
      pages: [
        {
          pageNumber: 1,
          text: "Alex ventured into the magical forest where glowing mushrooms lit the path.",
          imagePrompt: "Alex in a magical forest with glowing mushrooms"
        },
        {
          pageNumber: 2,
          text: "He discovered a wise old owl perched on an ancient tree, ready to share forest secrets.",
          imagePrompt: "Alex meeting a wise owl on an ancient tree in the forest"
        }
      ]
    }
  },
  {
    name: "Kawaii Style Test",
    story: {
      storyId: "test-kawaii-789",
      childName: "Mia",
      childAge: "5",
      childDescription: "5 year old girl with long blonde hair, blue eyes, wearing a pink dress with hearts",
      artStyle: "chibi_kawaii",
      testingMode: true,
      pages: [
        {
          pageNumber: 1,
          text: "Mia found a magical rainbow butterfly in her garden that sparkled with every color.",
          imagePrompt: "Mia with a magical rainbow butterfly in a garden"
        },
        {
          pageNumber: 2,
          text: "Together they flew through cotton candy clouds to a land made of sweets and smiles.",
          imagePrompt: "Mia and butterfly flying through cotton candy clouds to candy land"
        }
      ]
    }
  }
];

async function testStorySync() {
  console.log("🧪 Testing Story-Image Synchronization System V3...\n");
  
  for (const testCase of testCases) {
    console.log(`\n📚 Testing: ${testCase.name}`);
    console.log(`Art Style: ${testCase.story.artStyle}`);
    console.log(`Character: ${testCase.story.childName}, ${testCase.story.childDescription}`);
    
    try {
      const response = await fetch("http://localhost:3002/api/ai/generate-images-v3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase.story)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error(`❌ API Error (${response.status}):`, result.error);
        console.error("Details:", JSON.stringify(result, null, 2));
        continue;
      }

      console.log("✅ API Response received");
      console.log(`\n📊 Results for ${testCase.name}:`);
      console.log(`Total images: ${result.metadata.totalImages}`);
      console.log(`Successful: ${result.metadata.successfulImages}`);
      console.log(`Failed: ${result.metadata.failedImages}`);
      console.log(`Average validation score: ${result.metadata.averageValidationScore?.toFixed(1) || 'N/A'}/100`);
      console.log(`Cost: $${result.metadata.totalCost.toFixed(4)}`);
      
      console.log("\n🖼️ Generated Images:");
      result.images.forEach((img, index) => {
        console.log(`\nPage ${img.pageNumber}:`);
        if (img.imageUrl) {
          console.log(`✅ Success`);
          console.log(`   Validation Score: ${img.validationScore || 'N/A'}/100`);
          console.log(`   Scene Elements:`, img.sceneElements ? {
            setting: img.sceneElements.setting,
            characters: img.sceneElements.characters,
            action: img.sceneElements.action
          } : 'N/A');
          console.log(`   Cost: $${img.cost}`);
          console.log(`   URL: ${img.imageUrl.substring(0, 50)}...`);
        } else if (img.error) {
          console.log(`❌ Error: ${img.error}`);
        } else if (img.placeholder) {
          console.log(`⏭️ Skipped: ${img.note}`);
        }
      });
      
      // Validate scene elements match expectations
      if (testCase.expectedValidation) {
        console.log("\n🔍 Validation Check:");
        result.images.forEach((img, index) => {
          if (img.sceneElements) {
            const expected = testCase.expectedValidation[`page${index + 1}`];
            if (expected) {
              console.log(`Page ${index + 1}:`);
              console.log(`  Setting: ${img.sceneElements.setting} (expected: ${expected.setting}) ${img.sceneElements.setting === expected.setting ? '✅' : '❌'}`);
              console.log(`  Characters: ${img.sceneElements.characters.join(', ')} (expected: ${expected.characters.join(', ')})`);
            }
          }
        });
      }
      
    } catch (error) {
      console.error(`❌ Request failed for ${testCase.name}:`, error.message);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("\n✅ All tests completed!");
}

// Run the tests
testStorySync().catch(console.error);