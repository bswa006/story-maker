'use client';

import { useState } from 'react';
import { STORY_TEMPLATES, STORY_CATEGORIES, StoryTemplate, StoryCategory, AgeGroup } from '@/data/story-templates';
import { Check, Clock, BookOpen, Star, Filter, Search } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (templateId: string) => void;
  childAge?: AgeGroup;
  subscriptionTier?: 'basic' | 'premium' | 'all';
  showTherapeutic?: boolean;
}

export function TemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  childAge, 
  subscriptionTier = 'basic',
  showTherapeutic = false 
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter templates based on criteria
  const getFilteredTemplates = (): StoryTemplate[] => {
    let filtered = STORY_TEMPLATES;

    // Filter by subscription tier
    if (subscriptionTier !== 'all') {
      if (subscriptionTier === 'basic') {
        filtered = filtered.filter(template => template.subscriptionTier === 'basic');
      } else if (subscriptionTier === 'premium') {
        filtered = filtered.filter(template => 
          template.subscriptionTier === 'premium' || template.subscriptionTier === 'basic'
        );
      }
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by age if provided
    if (childAge) {
      filtered = filtered.filter(template => template.ageGroups.includes(childAge));
    }

    // Filter by therapeutic value if requested
    if (showTherapeutic) {
      filtered = filtered.filter(template => template.therapeuticValue && template.therapeuticValue.length > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.themes.some(theme => theme.toLowerCase().includes(query)) ||
        template.learningObjectives.some(obj => obj.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredTemplates = getFilteredTemplates();

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Starter</span>;
      case 'premium':
        return <span className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full">Premium</span>;
      default:
        return null;
    }
  };

  const getTherapeuticBadge = (template: StoryTemplate) => {
    if (template.therapeuticValue && template.therapeuticValue.length > 0) {
      return <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">Therapeutic</span>;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header and Search */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Story Adventure</h2>
            <p className="text-gray-600">
              Select from our collection of educational and entertaining story templates
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Stories
          </button>
          {Object.entries(STORY_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as StoryCategory)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === key
                  ? category.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Active Filters Display */}
        {(childAge || subscriptionTier !== 'all' || showTherapeutic) && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {childAge && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Age {childAge}
              </span>
            )}
            {subscriptionTier !== 'all' && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                {subscriptionTier === 'premium' ? 'Premium + Basic' : 'Basic Only'}
              </span>
            )}
            {showTherapeutic && (
              <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">
                Therapeutic Stories
              </span>
            )}
          </div>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const categoryInfo = STORY_CATEGORIES[template.category];
          
          return (
            <div
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              className={`relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                isSelected
                  ? 'border-violet-300 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${categoryInfo.color}`}>
                      <span>{categoryInfo.icon}</span>
                      {categoryInfo.name}
                    </div>
                    <div className="flex flex-col gap-1">
                      {getSubscriptionBadge(template.subscriptionTier)}
                      {getTherapeuticBadge(template)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{template.description}</p>
                </div>

                {/* Story Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {template.pages} pages
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {template.estimatedReadingTime} min
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.ageGroups.map((age) => (
                      <span key={age} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        Age {age}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.themes.slice(0, 3).map((theme) => (
                      <span key={theme} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {theme.replace('_', ' ')}
                      </span>
                    ))}
                    {template.themes.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        +{template.themes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    &quot;{template.preview.samplePage}&quot;
                  </p>
                </div>

                {/* Learning Objectives */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Learning Goals:</h4>
                  <ul className="space-y-1">
                    {template.learningObjectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <Star className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                        {objective}
                      </li>
                    ))}
                    {template.learningObjectives.length > 2 && (
                      <li className="text-sm text-gray-500">
                        +{template.learningObjectives.length - 2} more learning goals
                      </li>
                    )}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                    isSelected
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select This Story'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search terms to find the perfect story.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="bg-violet-500 text-white px-6 py-2 rounded-lg hover:bg-violet-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}