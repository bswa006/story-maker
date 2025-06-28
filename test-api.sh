#!/bin/bash

# Test the AI story generation API
curl -X POST 'http://localhost:3002/api/ai/generate-story' \
  -H 'Content-Type: application/json' \
  -d '{
    "theme": {
      "id": "stem-adventures",
      "name": "STEM Adventures",
      "category": "stem",
      "imageStyle": "Vibrant, detailed scientific illustrations with futuristic elements"
    },
    "customization": {
      "setting": "Prehistoric times",
      "characters": ["Animal experts", "Time travelers"],
      "learningGoals": ["Environmental science"],
      "tone": "exciting",
      "additionalInstructions": ""
    },
    "childName": "Ira",
    "childAge": "6-8",
    "childInterests": ["Animals", "Space"],
    "childPhotoAnalysis": {
      "appearance": "Character Ira should consistently be depicted with a young girl wearing a yellow dress, a crown, and holding a toothbrush. She should have dark hair, brown eyes, and a smile on her face.",
      "characteristics": "Ira is a happy and playful character with a curious personality."
    },
    "learningObjectives": ["Emotional Intelligence", "Critical Thinking", "Creativity"],
    "specialConsiderations": []
  }' | jq .