#!/bin/bash

# Test the AI story generation API with diversity theme
echo "Testing diversity-themed story generation..."

curl -X POST 'http://localhost:3002/api/ai/generate-story' \
  -H 'Content-Type: application/json' \
  -d '{
    "theme": {
      "id": "diversity-culture",
      "name": "Diversity & Culture",
      "category": "diversity",
      "imageStyle": "Rich, culturally authentic illustrations with traditional patterns and vibrant colors"
    },
    "customization": {
      "setting": "Cultural festivals",
      "characters": ["Children from different cultures", "Grandparents with stories", "Cultural guides"],
      "learningGoals": ["Appreciating differences", "Learning about traditions", "Global citizenship"],
      "tone": "inspiring",
      "additionalInstructions": ""
    },
    "childName": "Ira",
    "childAge": "6-8",
    "childInterests": ["Animals", "Art", "Music", "Science", "Nature"],
    "childPhotoAnalysis": {
      "appearance": "Character Ira should consistently be depicted with a young girl wearing a yellow dress, a crown, and holding a toothbrush. Her hair should be curly and brown, and her facial features should include brown eyes, thin eyebrows, a small nose, and a heart-shaped face. Her skin tone should be light brown, and she should have a slender build for her age.",
      "characteristics": "Ira is curious, adventurous, and loves learning about different cultures and traditions."
    },
    "learningObjectives": ["Problem Solving", "Creativity", "Critical Thinking", "Empathy", "Confidence"],
    "specialConsiderations": []
  }' | jq .