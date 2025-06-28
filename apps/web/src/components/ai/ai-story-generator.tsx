'use client';

import { useState, useRef } from 'react';
import { StoryViewer } from '../story/story-viewer';
import { StoryPage } from '@/types/storybook';
import { STORY_THEMES, StoryTheme, getThemesForAge } from '@/data/story-themes';
import { 
  Upload, 
  User, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  Palette
} from 'lucide-react';
import { ART_STYLE_OPTIONS, ArtStyleId } from '@/services/art-styles-system';

interface AIStoryGeneratorProps {
  userSubscription?: string;
  onStoryGenerated: (storyData: Record<string, unknown>) => void;
}

interface ChildProfile {
  name: string;
  age: string;
  photo?: File;
  photoPreview?: string;
  interests: string[];
  learningGoals: string[];
  specialNeeds?: string[];
  culturalBackground?: string;
}

interface StoryCustomization {
  theme: StoryTheme;
  setting?: string;
  characters?: string[];
  learningGoals?: string[];
  tone?: string;
  additionalInstructions?: string;
}

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  result?: Record<string, unknown>;
  error?: string;
}

export function AIStoryGenerator({ 
  onStoryGenerated
}: AIStoryGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | null>(null);
  const [selectedArtStyle, setSelectedArtStyle] = useState<ArtStyleId>('studio_ghibli');
  const [storyCustomization, setStoryCustomization] = useState<StoryCustomization | null>(null);
  const [childProfile, setChildProfile] = useState<ChildProfile>({
    name: '',
    age: '6-8',
    interests: [],
    learningGoals: [],
    specialNeeds: [],
    culturalBackground: 'diverse'
  });
  
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<Record<string, unknown> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get age-appropriate themes
  const getAvailableThemes = () => {
    const age = parseInt(childProfile.age.split('-')[0]);
    return age ? getThemesForAge(age) : STORY_THEMES;
  };

  const steps = [
    { number: 1, title: 'Theme Selection', description: 'Choose your story theme' },
    { number: 2, title: 'Child Profile', description: 'AI photo analysis & personalization' },
    { number: 3, title: 'Customize Story', description: 'Personalize theme settings' },
    { number: 4, title: 'AI Generation', description: 'Create your story with AI' }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChildProfile(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setChildProfile(prev => ({ ...prev, photoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const startAIGeneration = async () => {
    if (!selectedTheme || !childProfile.name || !childProfile.photo) return;

    setIsGenerating(true);
    
    const steps: GenerationStep[] = [
      { id: 'photo_analysis', title: 'Character Profile Creation', description: 'Creating consistent character description for illustrations', status: 'pending' },
      { id: 'story_generation', title: 'Generating Story Content', description: 'Creating personalized story with GPT-4', status: 'pending' },
      { id: 'image_generation', title: 'Creating Illustrations', description: 'Generating custom images with DALL-E 3', status: 'pending' },
      { id: 'finalization', title: 'Finalizing Story', description: 'Preparing your personalized storybook', status: 'pending' }
    ];

    setGenerationSteps(steps);

    try {
      // Step 1: Analyze child photo
      await updateStepStatus('photo_analysis', 'in_progress');
      
      // Try alternative AI models for photo analysis
      let childDescription = `Character ${childProfile.name} should always have:
      - Age appearance: ${childProfile.age} years old
      - Consistent facial features throughout all illustrations
      - Same hair color, texture, and style in every image
      - Same skin tone and build
      - Bright, friendly expression that matches their curious personality
      - Should be immediately recognizable as the same character across different scenes
      - Interests in: ${childProfile.interests.join(', ') || 'adventure and learning'}
      
      CRITICAL: Maintain exact character consistency - same face, hair, and physical traits in all images.`;

      if (childProfile.photoPreview) {
        console.log('🔍 Trying alternative AI models for photo analysis...');
        
        // Try Replicate LLaVA first (most permissive and reliable)
        try {
          console.log('🤖 Attempting Replicate LLaVA analysis...');
          const replicateResponse = await fetch('/api/ai/analyze-photo-replicate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photoUrl: childProfile.photoPreview,
              childName: childProfile.name
            })
          });
          
          const replicateData = await replicateResponse.json();
          if (replicateData.success && replicateData.description && !replicateData.description.includes("I can't")) {
            childDescription = replicateData.description;
            console.log('✅ Replicate analysis successful:', childDescription.substring(0, 100) + '...');
          } else {
            throw new Error('Replicate declined to analyze');
          }
        } catch (replicateError) {
          console.error('⚠️ Replicate failed:', replicateError);
          console.log('⚠️ Replicate failed, trying Claude 3.5 Sonnet...');
          
          // Try Claude 3.5 Sonnet as backup
          try {
            const claudeResponse = await fetch('/api/ai/analyze-photo-claude', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                photoUrl: childProfile.photoPreview,
                childName: childProfile.name
              })
            });
            
            const claudeData = await claudeResponse.json();
            if (claudeData.success && claudeData.description && !claudeData.description.includes("I can't")) {
              childDescription = claudeData.description;
              console.log('✅ Claude analysis successful:', childDescription.substring(0, 100) + '...');
            } else {
              throw new Error('Claude declined to analyze');
            }
          } catch {
            console.log('⚠️ All AI models failed photo analysis, using profile-based description');
          }
        }
      }
      
      await updateStepStatus('photo_analysis', 'completed', { description: childDescription });

      // Step 2: Generate story content
      await updateStepStatus('story_generation', 'in_progress');
      
      console.log('🤖 Generating story with AI...');
      const customization = storyCustomization || { theme: selectedTheme };
      
      const storyResponse = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: {
            id: selectedTheme.id,
            name: selectedTheme.name,
            category: selectedTheme.category,
            imageStyle: selectedTheme.imageStyle
          },
          customization: {
            setting: customization.setting || 'AI will choose',
            characters: customization.characters || [],
            learningGoals: customization.learningGoals || selectedTheme.customOptions.learningGoals || [],
            tone: customization.tone || selectedTheme.defaultSettings.tone,
            additionalInstructions: customization.additionalInstructions || ''
          },
          childName: childProfile.name,
          childAge: childProfile.age,
          childInterests: childProfile.interests,
          childPhotoAnalysis: {
            appearance: childDescription,
            characteristics: childDescription
          },
          learningObjectives: childProfile.learningGoals,
          specialConsiderations: childProfile.specialNeeds
        })
      });

      const storyData = await storyResponse.json();
      if (!storyData.success) {
        throw new Error(storyData.error || 'Story generation failed');
      }

      await updateStepStatus('story_generation', 'completed', storyData);

      // Step 3: Generate images
      await updateStepStatus('image_generation', 'in_progress');
      
      console.log('🎨 Generating images with AI...');
      console.log('📖 Story data structure:', storyData);
      
      // Try different possible paths for pages data
      let originalPages: Record<string, unknown>[] = [];
      if ((storyData.story as Record<string, unknown>)?.pages) {
        originalPages = (storyData.story as Record<string, unknown>)?.pages as Record<string, unknown>[];
        console.log('📄 Found pages at storyData.story.pages:', originalPages.length);
      } else if (((storyData.story as Record<string, unknown>)?.Story as Record<string, unknown>)?.Pages) {
        originalPages = (((storyData.story as Record<string, unknown>)?.Story as Record<string, unknown>)?.Pages as Record<string, unknown>[]);
        console.log('📄 Found pages at storyData.story.Story.Pages:', originalPages.length);
      } else if (((storyData as Record<string, unknown>)?.Story as Record<string, unknown>)?.pages) {
        originalPages = ((storyData as Record<string, unknown>)?.Story as Record<string, unknown>)?.pages as Record<string, unknown>[];
        console.log('📄 Found pages at storyData.Story.pages:', originalPages.length);
      } else if ((storyData as Record<string, unknown>)?.pages) {
        originalPages = (storyData as Record<string, unknown>)?.pages as Record<string, unknown>[];
        console.log('📄 Found pages at storyData.pages:', originalPages.length);
      } else {
        console.log('📄 No pages found in any expected location');
        console.log('📄 Available keys in storyData:', Object.keys(storyData as Record<string, unknown>));
        console.log('📄 Available keys in storyData.story:', Object.keys((storyData.story as Record<string, unknown>) || {}));
        if ((storyData.story as Record<string, unknown>)?.Story) {
          console.log('📄 Available keys in storyData.story.Story:', Object.keys(((storyData.story as Record<string, unknown>)?.Story as Record<string, unknown>) || {}));
        }
      }
      
      console.log('📋 Original pages count:', originalPages.length);
      console.log('🔍 First page structure:', originalPages[0]);
      
      const pagesWithImagePrompts = originalPages.map((page: Record<string, unknown>, index: number) => ({
        pageNumber: (page.pageNumber as number) || (index + 1),
        text: page.text as string || `Page ${index + 1} content`,
        imagePrompt: page.imagePrompt as string || `Children's book illustration showing: ${((page.text as string) || '').substring(0, 100)}...`
      }));
      
      console.log('🖼️ Pages with image prompts:', pagesWithImagePrompts.length);
      
      // Use the selected art style
      
      // Build child description from story metadata or profile
      let imageGenerationDescription = `${childProfile.name}, a ${childProfile.age} year old`;
      
      // Check if story generation included appearance
      const storyMetadata = (storyData.story as Record<string, unknown>)?.metadata as Record<string, unknown>;
      if (storyMetadata?.childPhotoAnalysis?.appearance) {
        imageGenerationDescription = storyMetadata.childPhotoAnalysis.appearance as string;
      } else if (childProfile.photoPreview) {
        imageGenerationDescription += ' child (from uploaded photo)';
      } else {
        imageGenerationDescription += ' child with a cheerful appearance';
      }
      
      console.log('🚨 AI STORY GEN - Child description for images:', imageGenerationDescription);
      
      const imageResponse = await fetch('/api/ai/generate-images-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: (storyData.story as Record<string, unknown>)?.id as string || 'generated',
          childName: childProfile.name,
          childAge: childProfile.age,
          childPhotoUrl: childProfile.photoPreview,
          childDescription: imageGenerationDescription, // CRITICAL: Add this!
          pages: pagesWithImagePrompts,
          artStyle: selectedArtStyle,
          testingMode: true, // Cost optimization
          enhancedMode: true, // Enable magical prompts
          promptVersion: 'v3_ultra_quality' // Use latest prompt version
        })
      });

      const imageData = await imageResponse.json();
      if (!imageData.success) {
        throw new Error(imageData.error || 'Image generation failed');
      }

      await updateStepStatus('image_generation', 'completed', imageData);

      // Step 3: Finalize
      await updateStepStatus('finalization', 'in_progress');

      // Combine story and images
      const finalStory = {
        ...storyData.story,
        images: imageData.images,
        metadata: {
          ...storyData.metadata,
          imageMetadata: imageData.metadata,
          aiGenerated: true,
          totalCost: (storyData.metadata.estimatedCost || 0) + (imageData.metadata.totalCost || 0),
          generatedAt: new Date().toISOString()
        }
      };

      // Process story for UI display - merge images with pages
      const processedStory = {
        ...finalStory,
        title: ((finalStory as Record<string, unknown>).story as Record<string, unknown>)?.title as string || `${childProfile.name}'s AI Adventure`,
        pages: originalPages.map((page: Record<string, unknown>, index: number) => ({
          ...page,
          imageUrl: ((finalStory as Record<string, unknown>).images as Record<string, unknown>[])?.[index]?.imageUrl as string || 'https://images.unsplash.com/photo-1618085219724-c59ba48e08cd?w=400'
        }))
      };

      await updateStepStatus('finalization', 'completed', processedStory);
      
      console.log('✅ AI story generation complete!');
      setGeneratedStory(processedStory);
      onStoryGenerated(processedStory);

    } catch (error) {
      console.error('❌ AI generation failed:', error);
      const currentInProgressStep = generationSteps.find(s => s.status === 'in_progress');
      if (currentInProgressStep) {
        await updateStepStatus(currentInProgressStep.id, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStepStatus = async (stepId: string, status: GenerationStep['status'], result?: Record<string, unknown>, error?: string) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, error }
        : step
    ));
    
    // Add delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="text-center py-8 px-6 bg-gradient-to-b from-violet-50/50 to-white">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Brain className="w-4 h-4" />
          AI-Powered Story Generation
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Create Your Child&apos;s AI Story
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our advanced AI analyzes your child&apos;s photo, interests, and learning goals to create 
          a completely personalized educational story with custom illustrations.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step.number
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <div className="text-center mt-2">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-violet-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Step 1: Theme Selection */}
        {currentStep === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Story Theme</h2>
              <p className="text-gray-600">
                Select a theme that matches your child&apos;s interests and learning goals. Our AI will create a personalized story based on your choice.
              </p>
            </div>
            
            {/* Theme Categories */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {getAvailableThemes().map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedTheme?.id === theme.id
                      ? 'border-violet-300 bg-violet-50 ring-2 ring-violet-200'
                      : 'border-gray-200 hover:border-violet-200 hover:shadow-lg'
                  }`}
                >
                  <div className="mb-3 text-center">
                    <span className="text-3xl">{theme.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-center">{theme.name}</h3>
                  <p className="text-xs text-gray-600 mb-3 text-center line-clamp-2">{theme.shortDescription}</p>
                  <div className="flex justify-center">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      Ages {theme.ageGroups[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Theme Details */}
            {selectedTheme && (
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{selectedTheme.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedTheme.name}</h4>
                    <p className="text-gray-700 mb-3">{selectedTheme.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Default tone:</span>
                        <span className="ml-2 text-gray-600">{selectedTheme.defaultSettings.tone}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Story length:</span>
                        <span className="ml-2 text-gray-600">{selectedTheme.defaultSettings.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Child Profile with AI Analysis */}
        {currentStep === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Child Profile for AI Personalization</h2>
              <p className="text-gray-600">
                Our AI will analyze this information to create the most personalized story possible
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s Name *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={childProfile.name}
                    onChange={(e) => setChildProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your child's name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Photo Upload with AI Analysis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s Photo * (for AI character consistency)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {!childProfile.photoPreview ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-violet-400 hover:bg-violet-50 transition-all"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-medium text-gray-900 mb-2">Upload for AI Analysis</div>
                    <div className="text-gray-500">Our AI will analyze the photo to create consistent character illustrations</div>
                  </button>
                ) : (
                  <div className="relative">
                    <img
                      src={childProfile.photoPreview}
                      alt="Child's photo"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      AI Ready
                    </div>
                  </div>
                )}
              </div>

              {/* Interests for AI Personalization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests (for AI story personalization)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Animals', 'Space', 'Art', 'Sports', 'Music', 'Science', 'Nature', 'Adventure'].map((interest) => (
                    <button
                      key={interest}
                      onClick={() => {
                        setChildProfile(prev => ({
                          ...prev,
                          interests: prev.interests.includes(interest)
                            ? prev.interests.filter(i => i !== interest)
                            : [...prev.interests, interest]
                        }));
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        childProfile.interests.includes(interest)
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Goals (AI will adapt the story)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Emotional Intelligence', 'Critical Thinking', 'Creativity', 'Problem Solving', 'Empathy', 'Confidence'].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => {
                        setChildProfile(prev => ({
                          ...prev,
                          learningGoals: prev.learningGoals.includes(goal)
                            ? prev.learningGoals.filter(g => g !== goal)
                            : [...prev.learningGoals, goal]
                        }));
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        childProfile.learningGoals.includes(goal)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Customize Story */}
        {currentStep === 3 && selectedTheme && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your {selectedTheme.name} Story</h2>
              <p className="text-gray-600">
                Personalize the story settings to create the perfect adventure for {childProfile.name}
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Story Setting */}
              {selectedTheme.customOptions.settings && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Story Setting</label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTheme.customOptions.settings.map((setting) => (
                      <button
                        key={setting}
                        onClick={() => setStoryCustomization(prev => ({ 
                          ...prev || { theme: selectedTheme }, 
                          setting 
                        }))}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          storyCustomization?.setting === setting
                            ? 'border-violet-300 bg-violet-50 text-violet-700'
                            : 'border-gray-200 hover:border-violet-200 text-gray-700'
                        }`}
                      >
                        {setting}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Characters */}
              {selectedTheme.customOptions.characters && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Include Characters</label>
                  <div className="space-y-2">
                    {selectedTheme.customOptions.characters.map((character) => (
                      <label key={character} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={storyCustomization?.characters?.includes(character) || false}
                          onChange={(e) => {
                            const characters = storyCustomization?.characters || [];
                            setStoryCustomization(prev => ({
                              ...prev || { theme: selectedTheme },
                              characters: e.target.checked 
                                ? [...characters, character]
                                : characters.filter(c => c !== character)
                            }));
                          }}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-700">{character}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Goals */}
              {selectedTheme.customOptions.learningGoals && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Learning Goals</label>
                  <div className="space-y-2">
                    {selectedTheme.customOptions.learningGoals.map((goal) => (
                      <label key={goal} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={storyCustomization?.learningGoals?.includes(goal) || false}
                          onChange={(e) => {
                            const goals = storyCustomization?.learningGoals || [];
                            setStoryCustomization(prev => ({
                              ...prev || { theme: selectedTheme },
                              learningGoals: e.target.checked 
                                ? [...goals, goal]
                                : goals.filter(g => g !== goal)
                            }));
                          }}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Story Tone</label>
                <div className="grid grid-cols-3 gap-3">
                  {['exciting', 'calming', 'educational', 'inspiring', 'funny'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setStoryCustomization(prev => ({ 
                        ...prev || { theme: selectedTheme }, 
                        tone 
                      }))}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        (storyCustomization?.tone || selectedTheme.defaultSettings.tone) === tone
                          ? 'border-violet-300 bg-violet-50 text-violet-700'
                          : 'border-gray-200 hover:border-violet-200 text-gray-700'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Art Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Art Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ART_STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setSelectedArtStyle(style.value as ArtStyleId)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedArtStyle === style.value
                          ? 'border-violet-300 bg-violet-50'
                          : 'border-gray-200 hover:border-violet-200'
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm">{style.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={storyCustomization?.additionalInstructions || ''}
                  onChange={(e) => setStoryCustomization(prev => ({ 
                    ...prev || { theme: selectedTheme }, 
                    additionalInstructions: e.target.value 
                  }))}
                  placeholder="Any special requests for the story? (e.g., include a pet dog named Max)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Preview Summary */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Story Preview</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Theme:</strong> {selectedTheme.name}</p>
                  <p><strong>Setting:</strong> {storyCustomization?.setting || 'AI will choose'}</p>
                  <p><strong>Tone:</strong> {storyCustomization?.tone || selectedTheme.defaultSettings.tone}</p>
                  <p><strong>Art Style:</strong> {ART_STYLE_OPTIONS.find(s => s.value === selectedArtStyle)?.label}</p>
                  {storyCustomization?.characters && storyCustomization.characters.length > 0 && (
                    <p><strong>Characters:</strong> {storyCustomization.characters.join(', ')}</p>
                  )}
                  {storyCustomization?.learningGoals && storyCustomization.learningGoals.length > 0 && (
                    <p><strong>Learning Goals:</strong> {storyCustomization.learningGoals.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Generation */}
        {currentStep === 4 && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Story Generation</h2>
              <p className="text-gray-600">
                Our AI is creating {childProfile.name}&apos;s personalized story with custom illustrations
              </p>
            </div>

            {generationSteps.length > 0 ? (
              <div className="max-w-2xl mx-auto">
                <div className="space-y-4 mb-8">
                  {generationSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      {getStepIcon(step)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.error && (
                          <p className="text-sm text-red-600 mt-1">{step.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={startAIGeneration}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating with AI...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Start AI Generation
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isGenerating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === 1 || isGenerating
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>

            <button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={
                isGenerating ||
                currentStep === steps.length ||
                (currentStep === 1 && !selectedTheme) ||
                (currentStep === 2 && (!childProfile.name || !childProfile.photo))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isGenerating ||
                currentStep === steps.length ||
                (currentStep === 1 && !selectedTheme) ||
                (currentStep === 2 && (!childProfile.name || !childProfile.photo))
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generated Story Viewer */}
      {generatedStory && (
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <h2 className="text-2xl font-bold mb-2">🎉 Your Story is Ready!</h2>
              <p className="text-violet-100">
                {(generatedStory as Record<string, unknown>)?.title as string || `${childProfile.name}'s Personalized Adventure`}
              </p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Your Personalized Story</h3>
                <button
                  onClick={() => setGeneratedStory(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Close Story
                </button>
              </div>
              <StoryViewer 
                pages={(generatedStory as Record<string, unknown>)?.pages as StoryPage[] || []}
                childName={childProfile.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}