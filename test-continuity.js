#!/usr/bin/env node

// Test script for story continuity system

const testData = {
  storyId: "test-continuity-123",
  childName: "Emma",
  childAge: "6",
  childDescription: "6 year old girl with brown pigtails and bright green eyes, wearing a blue dress with white polka dots",
  artStyle: "studio_ghibli",
  testingMode: true,
  enhancedMode: true,
  pages: [
    {
      pageNumber: 1,
      text: "Hello, my name is Emma. Today, I'm going to imagine being all kinds of animals! What would I learn if I were them?",
      imagePrompt: "Child standing in a sunny meadow, excited and ready for adventure"
    },
    {
      pageNumber: 2,
      text: "If I were a bird, I would soar through clouds up high, And see the world below me as I fly. I'd learn that perspective changes everything we see.",
      imagePrompt: "Child flying alongside a majestic bird through fluffy clouds"
    }
  ]
};

async function testContinuity() {
  console.log("🧪 Testing Story Continuity System...\n");
  
  try {
    const response = await fetch("http://localhost:3002/api/ai/generate-images-v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("❌ API Error:", response.status);
      console.error("Error details:", JSON.stringify(result, null, 2));
      return;
    }

    console.log("✅ API Response received");
    console.log("\n📊 Results:");
    console.log(`Total images: ${result.metadata.totalImages}`);
    console.log(`Successful: ${result.metadata.successfulImages}`);
    console.log(`Failed: ${result.metadata.failedImages}`);
    console.log(`Cost: $${result.metadata.totalCost.toFixed(4)}`);
    
    console.log("\n🖼️ Generated Images:");
    result.images.forEach((img, index) => {
      console.log(`\nPage ${img.pageNumber}:`);
      if (img.imageUrl) {
        console.log(`✅ Success - ${img.imageUrl.substring(0, 50)}...`);
        console.log(`   Style: ${result.metadata.artStyle}`);
        console.log(`   Quality: ${img.quality}`);
        console.log(`   Cost: $${img.cost}`);
      } else if (img.error) {
        console.log(`❌ Error: ${img.error}`);
      } else if (img.placeholder) {
        console.log(`⏭️ Skipped: ${img.note}`);
      }
      
      if (img.promptMetadata) {
        console.log(`   Metadata:`, JSON.stringify(img.promptMetadata, null, 2));
      }
    });
    
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    console.error("Make sure the server is running on http://localhost:3002");
  }
}

// Run the test
testContinuity();