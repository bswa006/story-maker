'use client';

import { useState, useRef } from 'react';
import { STORY_TEMPLATES, StoryTemplate, AgeGroup } from '@/data/story-templates';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';
import { TemplateSelector } from './template-selector';
import { PricingPlans } from '../subscription/pricing-plans';
import { StoryViewer } from './story-viewer';
import { StoryPage } from '@/types/storybook';
import { 
  Upload, 
  User, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Crown,
  Star,
  BookOpen,
  Palette
} from 'lucide-react';
import { ART_STYLE_OPTIONS, ArtStyleId } from '@/services/art-styles-system';

interface ChildProfile {
  name: string;
  age: AgeGroup;
  photo?: File;
  photoPreview?: string;
  interests: string[];
  specialNeeds?: string[];
}

interface StoryGenerationProps {
  userSubscription?: string;
  onStoryGenerated: (storyData: unknown) => void;
  existingChildren?: ChildProfile[];
}

export function EnhancedStoryGenerator({ 
  userSubscription = 'starter', 
  onStoryGenerated
}: StoryGenerationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedArtStyle, setSelectedArtStyle] = useState<ArtStyleId>('studio_ghibli');
  const [childProfile, setChildProfile] = useState<ChildProfile>({
    name: '',
    age: '6-8',
    interests: [],
    specialNeeds: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === userSubscription);
  const selectedTemplateData = STORY_TEMPLATES.find(t => t.id === selectedTemplate);

  // Check if user can access the selected template
  const canAccessTemplate = (template: StoryTemplate) => {
    if (!currentPlan) return false;
    if (template.subscriptionTier === 'basic') return true;
    if (template.subscriptionTier === 'premium' && currentPlan.limits.storyTemplates !== 'basic') return true;
    return false;
  };

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

  const handleTemplateSelect = (templateId: string) => {
    const template = STORY_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    if (!canAccessTemplate(template)) {
      setShowUpgrade(true);
      return;
    }

    setSelectedTemplate(templateId);
  };

  const handleStoryGeneration = async () => {
    console.log('🎯 Generate button clicked!');
    console.log('Template:', selectedTemplateData?.title);
    console.log('Child:', childProfile.name);
    console.log('Photo:', childProfile.photo ? 'Yes' : 'No');
    
    if (!selectedTemplateData || !childProfile.name) {
      console.log('❌ Missing required data');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Step 1: Upload photo if provided
      let photoUrl = '';
      if (childProfile.photo) {
        const formData = new FormData();
        formData.append('file', childProfile.photo);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          photoUrl = url;
        }
      }

      // Step 2: Generate story content with AI
      console.log('📖 Generating story content...');
      const storyResponse = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: selectedTemplateData.title,
          templateId: selectedTemplate,
          customization: {
            setting: selectedTemplateData.setting || 'magical forest',
            characters: selectedTemplateData.characters || ['talking animals'],
            learningGoals: selectedTemplateData.learningObjectives,
            tone: 'whimsical and educational'
          },
          childDetails: {
            name: childProfile.name,
            age: childProfile.age,
            interests: childProfile.interests,
            appearance: photoUrl ? 'from photo' : 'cheerful and curious'
          },
          testingMode: true // Enable testing mode for cost optimization
        }),
      });

      if (!storyResponse.ok) {
        throw new Error('Story generation failed');
      }

      const { story } = await storyResponse.json();
      console.log('✅ Story content generated');

      // Step 3: Generate images with enhanced AI (V2)
      console.log('🎨 Generating enhanced images...');
      // CRITICAL: Build proper child description
      let childDescription = `${childProfile.name}, a ${childProfile.age} year old`;
      
      // Add appearance from photo analysis if available
      if (story.metadata?.childPhotoAnalysis?.appearance) {
        childDescription = story.metadata.childPhotoAnalysis.appearance;
      } else if (photoUrl) {
        // If we have a photo but no analysis, we need to describe what we expect
        childDescription += ' child (appearance from uploaded photo)';
      } else {
        // No photo - use any provided description
        childDescription += ' child with cheerful appearance';
      }
      
      console.log('🚨 CHILD DESCRIPTION FOR IMAGES:', childDescription);
      
      const imagesResponse = await fetch('/api/ai/generate-images-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: Date.now().toString(),
          childName: childProfile.name,
          childAge: childProfile.age,
          childPhotoUrl: photoUrl,
          childDescription: childDescription, // CRITICAL: This was missing!
          pages: story.pages.map((page: { pageNumber: number; text: string; imagePrompt: string }, index: number) => ({
            pageNumber: index + 1,
            text: page.text,
            imagePrompt: page.imagePrompt || page.text // Use imagePrompt if available, fallback to text
          })),
          artStyle: selectedArtStyle,
          testingMode: true,
          enhancedMode: true,
          promptVersion: 'v3_ultra_quality'
        }),
      });

      if (!imagesResponse.ok) {
        throw new Error('Image generation failed');
      }

      const { images } = await imagesResponse.json();
      console.log('✅ Enhanced images generated');

      // Step 4: Combine story and images
      const storyData = {
        templateId: selectedTemplate,
        template: selectedTemplateData,
        child: childProfile,
        title: story.title,
        status: 'completed',
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pages: story.pages.map((page: { pageNumber: number; text: string }, index: number) => ({
          pageNumber: page.pageNumber,
          text: page.text,
          imageUrl: images[index]?.imageUrl || 'https://images.unsplash.com/photo-1618085219724-c59ba48e08cd?w=400',
          qualityScore: images[index]?.qualityScore
        }))
      };

      // Store locally and call parent handler
      setGeneratedStory(storyData);
      onStoryGenerated(storyData);
      
      console.log('🎉 Story generation complete!');
    } catch (error) {
      console.error('Story generation failed:', error);
      alert('Failed to generate story. Please ensure your OpenAI API key is configured in .env.local');
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { number: 1, title: 'Choose Template', description: 'Select a story theme' },
    { number: 2, title: 'Child Profile', description: 'Tell us about your child' },
    { number: 3, title: 'Customize', description: 'Personalize the story' },
    { number: 4, title: 'Generate', description: 'Create your magical story' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          AI-Powered Story Generation
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Create Your Child&apos;s Magical Story
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your child into the hero of their own personalized adventure. 
          Choose from educational themes that entertain while teaching valuable life lessons.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step.number
                    ? 'bg-violet-500 text-white'
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
                  currentStep > step.number ? 'bg-violet-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Story Template</h2>
              <p className="text-gray-600">
                Select from our collection of educational and entertaining story themes
              </p>
            </div>
            
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              childAge={childProfile.age}
              subscriptionTier={currentPlan?.limits.storyTemplates || 'basic'}
            />

            {selectedTemplateData && (
              <div className="mt-8 p-6 bg-violet-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected: {selectedTemplateData.title}</h3>
                <p className="text-gray-600 mb-4">{selectedTemplateData.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {selectedTemplateData.pages} pages
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Ages {selectedTemplateData.ageGroups.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Child Profile */}
        {currentStep === 2 && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Your Child</h2>
              <p className="text-gray-600">
                This information helps us create a more personalized story experience
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
                    placeholder="Enter your child&apos;s name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['3-5', '6-8', '9-12', '13+'] as AgeGroup[]).map((age) => (
                    <button
                      key={age}
                      onClick={() => setChildProfile(prev => ({ ...prev, age }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        childProfile.age === age
                          ? 'border-violet-300 bg-violet-50 text-violet-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Age {age}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s Photo *
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
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-medium text-gray-900 mb-2">Upload Photo</div>
                    <div className="text-gray-500">Click to select your child&apos;s photo</div>
                  </button>
                ) : (
                  <div className="relative">
                    <img
                      src={childProfile.photoPreview}
                      alt="Child's photo"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center"
                    >
                      <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                        Change Photo
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Animals', 'Science', 'Art', 'Sports', 'Music', 'Reading', 'Nature', 'Space'].map((interest) => (
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
            </div>
          </div>
        )}

        {/* Step 3: Customize */}
        {currentStep === 3 && selectedTemplateData && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Story</h2>
              <p className="text-gray-600">
                Review and personalize the final details of {childProfile.name}&apos;s story
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              {/* Story Preview */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Story Preview</h3>
                <div className="text-gray-700">
                  <p className="mb-2">
                    <strong>Title:</strong> {selectedTemplateData.title.replace('{childName}', childProfile.name)}
                  </p>
                  <p className="mb-2">
                    <strong>Category:</strong> {selectedTemplateData.category.replace('_', ' ')}
                  </p>
                  <p className="mb-4">
                    <strong>Preview:</strong> {selectedTemplateData.preview.coverText.replace('{childName}', childProfile.name)}
                  </p>
                  <div className="bg-white rounded-lg p-4 italic text-gray-600">
                    &quot;{selectedTemplateData.preview.samplePage}&quot;
                  </div>
                </div>
              </div>

              {/* Art Style Selection */}
              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Choose Art Style
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the visual style for your story&apos;s illustrations
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ART_STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setSelectedArtStyle(style.value as ArtStyleId)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedArtStyle === style.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-1">{style.label}</div>
                      <div className="text-sm text-gray-600">{style.description}</div>
                      {selectedArtStyle === style.value && (
                        <div className="mt-2 text-xs text-purple-600 font-medium">✓ Selected</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What Your Child Will Learn</h3>
                <ul className="space-y-2">
                  {selectedTemplateData.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Generate */}
        {currentStep === 4 && (
          <div className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Create Magic!</h2>
                <p className="text-gray-600">
                  We&apos;re about to create a personalized story featuring {childProfile.name} in a {selectedTemplateData?.title} adventure.
                </p>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-8 mb-8">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-violet-500" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Story Summary</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Child:</strong> {childProfile.name} (Age {childProfile.age})</p>
                  <p><strong>Story:</strong> {selectedTemplateData?.title}</p>
                  <p><strong>Theme:</strong> {selectedTemplateData?.category.replace('_', ' ')}</p>
                  <p><strong>Art Style:</strong> {ART_STYLE_OPTIONS.find(s => s.value === selectedArtStyle)?.label}</p>
                  <p><strong>Pages:</strong> {selectedTemplateData?.pages}</p>
                  <p><strong>Reading Time:</strong> ~{selectedTemplateData?.estimatedReadingTime} minutes</p>
                </div>
              </div>

              {/* Show missing requirements */}
              {(!selectedTemplateData || !childProfile.name) && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    ⚠️ Missing requirements:
                    {!selectedTemplateData && " Select a template"}
                    {!childProfile.name && " Enter child's name"}
                  </p>
                </div>
              )}

              <button
                onClick={handleStoryGeneration}
                disabled={isGenerating || !selectedTemplateData || !childProfile.name}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  isGenerating || !selectedTemplateData || !childProfile.name
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Creating your magical story...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate My Story
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === 1
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
                currentStep === steps.length ||
                (currentStep === 1 && !selectedTemplate) ||
                (currentStep === 2 && !childProfile.name)
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                (currentStep === steps.length ||
                (currentStep === 1 && !selectedTemplate) ||
                (currentStep === 2 && !childProfile.name))
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

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Upgrade Required</h2>
                </div>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="w-6 h-6">×</div>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                This premium story template requires a Family or Premium subscription.
              </p>
            </div>
            
            <div className="p-6">
              <PricingPlans
                currentPlan={userSubscription}
                onPlanSelect={() => setShowUpgrade(false)}
                showYearly={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Generated Story Viewer */}
      {generatedStory && (
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <h2 className="text-2xl font-bold mb-2">📚 Your Story is Complete!</h2>
              <p className="text-violet-100">
                {(generatedStory as Record<string, unknown>)?.title as string || `${childProfile.name}'s Adventure`}
              </p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Your Complete Story</h3>
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