'use client';

import { useState, useRef, useEffect } from 'react';
import { Storybook } from '@/types/storybook';
import { STORY_ANIMALS } from '@/data/story-template';

// Mobile App Story Viewer Component
function StoryViewer({ storybook }: { storybook: Storybook }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [updatedStorybook, setUpdatedStorybook] = useState(storybook);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Generate images when storybook is created
  useEffect(() => {
    if (storybook.status === 'created') {
      generateImages();
    }
  }, [storybook]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateImages = async () => {
    setIsGeneratingImages(true);
    const updatedPages = [...updatedStorybook.pages];

    // Generate images for each page
    for (let i = 0; i < updatedPages.length; i++) {
      const page = updatedPages[i];
      
      // Set loading state for this specific page
      setImageLoadingStates(prev => ({ ...prev, [page.id]: true }));
      
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: page.imagePrompt,
            childPhotoUrl: storybook.childPhotoUrl,
            style: 'ghibli'
          })
        });

        if (response.ok) {
          const result = await response.json();
          updatedPages[i] = { ...page, imageUrl: result.imageUrl };
          setUpdatedStorybook(prev => ({
            ...prev,
            pages: [...updatedPages]
          }));
        }
      } catch (error) {
        console.error('Failed to generate image for page', i, error);
      }
      
      // Remove loading state for this page
      setImageLoadingStates(prev => ({ ...prev, [page.id]: false }));
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsGeneratingImages(false);
    setUpdatedStorybook(prev => ({ ...prev, status: 'completed' }));
  };

  const goToNextPage = () => {
    if (currentPage < updatedStorybook.pages.length - 1) {
      const nextPageData = updatedStorybook.pages[currentPage + 1];
      // Set loading state for next page if it has no image yet
      if (!nextPageData?.imageUrl) {
        setImageLoadingStates(prev => ({ ...prev, [nextPageData.id]: true }));
      }
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      const prevPageData = updatedStorybook.pages[currentPage - 1];
      // Set loading state for previous page if it has no image yet
      if (!prevPageData?.imageUrl) {
        setImageLoadingStates(prev => ({ ...prev, [prevPageData.id]: true }));
      }
      setCurrentPage(currentPage - 1);
    }
  };

  const currentPageData = updatedStorybook.pages[currentPage];
  const isImageLoading = imageLoadingStates[currentPageData?.id];
  const hasImageUrl = currentPageData?.imageUrl && !isImageLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 relative overflow-hidden">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">📚</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 text-center">
            {updatedStorybook.childName}&apos;s Story
          </h1>
          <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600">⋯</span>
          </button>
        </div>
      </div>

      {/* Mobile Story Content */}
      <div className="px-4 pb-32">
        {/* Story Card */}
        <div className="mt-4 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Image Section */}
          <div className="relative aspect-square bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
            {hasImageUrl ? (
              <img
                src={currentPageData.imageUrl}
                alt={`Page ${currentPage + 1} illustration`}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoadingStates(prev => ({ ...prev, [currentPageData.id]: false }))}
                onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, [currentPageData.id]: true }))}
              />
            ) : (
              <div className="text-center p-8">
                {isImageLoading || isGeneratingImages ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-gray-700 font-medium">
                      Creating magic...
                    </div>
                    <div className="text-sm text-violet-600 font-medium">
                      ✨ AI at work ✨
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-4xl">{currentPageData?.animal || '📖'}</span>
                    </div>
                    <p className="text-gray-600 font-medium">
                      Your illustration will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Page Counter Badge */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentPage + 1}/{updatedStorybook.pages.length}
            </div>
          </div>

          {/* Text Section */}
          <div className="p-6 space-y-4">
            {/* Animal Emoji */}
            {currentPageData?.animal && (
              <div className="text-center">
                <span className="text-5xl">{currentPageData.animal}</span>
              </div>
            )}

            {/* Story Text */}
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-gray-900 leading-relaxed whitespace-pre-line">
                {currentPageData?.text.replace('{{childName}}', updatedStorybook.childName)}
              </p>
              
              {currentPageData?.lesson && (
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                  <p className="text-sm font-medium text-violet-800">
                    💡 {currentPageData.lesson}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {updatedStorybook.pages.map((page, index) => (
            <button
              key={index}
              onClick={() => {
                // Set loading state for target page if it has no image yet
                if (!page?.imageUrl) {
                  setImageLoadingStates(prev => ({ ...prev, [page.id]: true }));
                }
                setCurrentPage(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                currentPage === index
                  ? 'bg-violet-500 w-6'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
              currentPage === 0
                ? 'bg-gray-100 text-gray-400'
                : 'bg-violet-500 text-white shadow-lg active:scale-95'
            } transition-all`}
          >
            <span className="text-xl">←</span>
          </button>

          <button className="flex-1 mx-4 bg-emerald-500 text-white py-4 rounded-2xl font-semibold shadow-lg active:scale-95 transition-all">
            📥 Save Story
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage === updatedStorybook.pages.length - 1}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
              currentPage === updatedStorybook.pages.length - 1
                ? 'bg-gray-100 text-gray-400'
                : 'bg-violet-500 text-white shadow-lg active:scale-95'
            } transition-all`}
          >
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile App Main Component
export default function Home() {
  const [childName, setChildName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(['bird', 'lion', 'turtle', 'butterfly']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (file: File) => {
    setSelectedPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoSelect(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoSelect(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAnimal = (animalName: string) => {
    setSelectedAnimals(prev => {
      if (prev.includes(animalName)) {
        return prev.filter(name => name !== animalName);
      } else {
        if (prev.length < 6) {
          return [...prev, animalName];
        }
        return prev;
      }
    });
  };

  const selectAllAnimals = () => {
    setSelectedAnimals(STORY_ANIMALS.map(animal => animal.name));
  };

  const clearAllAnimals = () => {
    setSelectedAnimals([]);
  };

  const handleSubmit = async () => {
    if (!childName || !selectedPhoto || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload the photo
      const formData = new FormData();
      formData.append('file', selectedPhoto);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo');
      }

      const { url: photoUrl } = await uploadResponse.json();

      // Create the storybook
      const storybookResponse = await fetch('/api/storybook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          childName, 
          childPhotoUrl: photoUrl,
          selectedAnimals: selectedAnimals.length > 0 ? selectedAnimals : STORY_ANIMALS.map(a => a.name)
        }),
      });

      if (!storybookResponse.ok) {
        throw new Error('Failed to create storybook');
      }

      const newStorybook = await storybookResponse.json();
      setStorybook({
        ...newStorybook,
        childPhotoUrl: photoUrl,
        createdAt: new Date(newStorybook.createdAt),
      });

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create storybook. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = childName.trim().length > 0 && selectedPhoto !== null && selectedAnimals.length > 0;

  // Show story viewer if storybook exists
  if (storybook) {
    return <StoryViewer storybook={storybook} />;
  }

  // Elegant & Refined Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-100/40 via-transparent to-blue-100/40"></div>
      
      {/* Refined Header */}
      <div className="fixed top-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">✨</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">StoryMaker</h1>
              <p className="text-xs text-gray-500">AI Stories</p>
            </div>
          </div>
          <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-600">⋯</span>
          </button>
        </div>
      </div>

      {/* Elegant Hero */}
      <div className="pt-20 pb-6 px-5">
        <div className="text-center max-w-xs mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-3xl">📖</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
            If I Were an<br/>
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Animal...
            </span>
          </h1>
          <p className="text-gray-600 text-base">
            Create personalized AI stories
          </p>
        </div>
      </div>

      {/* Elegant Form Sections */}
      <div className="px-5 pb-28 space-y-5">
        {/* Child's Name */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👋</span>
              </div>
              <label className="text-lg font-semibold text-gray-900">Child&apos;s Name</label>
            </div>
            <input
              type="text"
              placeholder="Enter your little one's name"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📸</span>
              </div>
              <label className="text-lg font-semibold text-gray-900">Child&apos;s Photo</label>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!photoPreview ? (
              <div 
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 hover:bg-gray-50/50 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <p className="text-gray-700 font-medium mb-1">Drop your child&apos;s photo here</p>
                <p className="text-gray-500 text-sm">or tap to browse • JPG, PNG up to 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Child&apos;s photo preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={removePhoto}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Animal Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🦋</span>
                </div>
                <label className="text-lg font-semibold text-gray-900">Animal Friends</label>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={selectAllAnimals}
                  className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={clearAllAnimals}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-4">
              <p className="text-sm font-medium text-gray-700 text-center">
                Choose up to 6 animals • {selectedAnimals.length}/6 selected
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {STORY_ANIMALS.map((animal) => (
                <button
                  key={animal.name}
                  type="button"
                  onClick={() => toggleAnimal(animal.name)}
                  disabled={!selectedAnimals.includes(animal.name) && selectedAnimals.length >= 6}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedAnimals.includes(animal.name)
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  } ${
                    !selectedAnimals.includes(animal.name) && selectedAnimals.length >= 6
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{animal.emoji}</div>
                    <div className="text-sm font-semibold text-gray-900 capitalize mb-1">
                      {animal.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {animal.lesson}
                    </div>
                  </div>
                  
                  {selectedAnimals.includes(animal.name) && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {selectedAnimals.length === 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm font-medium text-red-600 text-center">
                  Please select at least one animal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Elegant CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <button 
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
            isValid && !isSubmitting
              ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]' 
              : 'bg-gray-300 text-gray-500 shadow-sm'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Story...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>✨</span>
              <span>Create Magical Story</span>
              <span>🚀</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}