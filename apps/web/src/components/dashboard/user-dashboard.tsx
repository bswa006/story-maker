'use client';

import { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';
import { STORY_CATEGORIES } from '@/data/story-templates';
import { 
  BookOpen, 
  Crown, 
  Heart, 
  Star, 
  Download, 
  Plus,
  TrendingUp,
  Award,
  Clock,
  Users
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  subscriptionRenewsAt: string;
  storiesCreated: number;
  storiesThisMonth: number;
  monthlyLimit: number | 'unlimited';
  childrenProfiles: Array<{
    id: string;
    name: string;
    age: number;
    photo?: string;
    favoriteCategories: string[];
  }>;
  createdStories: Array<{
    id: string;
    title: string;
    childName: string;
    template: string;
    category: string;
    createdAt: string;
    status: 'completed' | 'generating' | 'draft';
    thumbnail?: string;
    downloadCount: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

interface UserDashboardProps {
  user: UserProfile;
  onCreateStory: () => void;
  onUpgradePlan: () => void;
  onManageSubscription: () => void;
}

export function UserDashboard({ user, onCreateStory, onUpgradePlan, onManageSubscription }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'children' | 'achievements'>('overview');
  
  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === user.subscriptionPlan);
  const isUnlimited = user.monthlyLimit === 'unlimited';
  const usagePercentage = isUnlimited ? 0 : (user.storiesThisMonth / (user.monthlyLimit as number)) * 100;
  
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Heart className="w-5 h-5" />;
      case 'family': return <Star className="w-5 h-5" />;
      case 'premium': return <Crown className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'starter': return 'from-green-500 to-emerald-600';
      case 'family': return 'from-violet-500 to-purple-600';
      case 'premium': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Completed</span>;
      case 'generating':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Generating</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to create some magical stories today?
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onCreateStory}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Story
            </button>
            <button
              onClick={onManageSubscription}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Subscription Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${getPlanColor(user.subscriptionPlan)} text-white`}>
              {getPlanIcon(user.subscriptionPlan)}
              <span className="font-medium">{currentPlan?.name}</span>
            </div>
            {user.subscriptionPlan !== 'premium' && (
              <button
                onClick={onUpgradePlan}
                className="text-violet-600 hover:text-violet-700 text-sm font-medium"
              >
                Upgrade
              </button>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {user.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
          </div>
          <div className="text-sm text-gray-500">
            {user.subscriptionStatus === 'active' ? 'Renews' : 'Expired'} {user.subscriptionRenewsAt}
          </div>
        </div>

        {/* Usage This Month */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-900">This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {user.storiesThisMonth} {isUnlimited ? '' : `/ ${user.monthlyLimit}`}
          </div>
          {!isUnlimited && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          )}
          <div className="text-sm text-gray-500 mt-2">
            {isUnlimited ? 'Unlimited stories' : `${usagePercentage.toFixed(0)}% used`}
          </div>
        </div>

        {/* Total Stories */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900">Total Stories</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {user.storiesCreated}
          </div>
          <div className="text-sm text-gray-500">
            Stories created
          </div>
        </div>

        {/* Children Profiles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-gray-900">Children</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {user.childrenProfiles.length}
          </div>
          <div className="text-sm text-gray-500">
            Profiles created
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'stories', label: 'My Stories', icon: BookOpen },
              { id: 'children', label: 'Children', icon: Users },
              { id: 'achievements', label: 'Achievements', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'stories' | 'children' | 'achievements')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Recent Stories */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Stories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.createdStories.slice(0, 3).map((story) => {
                const categoryInfo = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];
                return (
                  <div key={story.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      {story.thumbnail ? (
                        <img src={story.thumbnail} alt={story.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-violet-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${categoryInfo?.color}`}>
                          <span>{categoryInfo?.icon}</span>
                          {categoryInfo?.name}
                        </div>
                        {getStatusBadge(story.status)}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{story.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">For {story.childName}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {story.downloadCount}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'Create Story', action: onCreateStory, color: 'bg-violet-500' },
                { icon: Users, label: 'Add Child', action: () => {}, color: 'bg-blue-500' },
                { icon: Crown, label: 'Upgrade Plan', action: onUpgradePlan, color: 'bg-amber-500' },
                { icon: Plus, label: 'New Template', action: () => {}, color: 'bg-green-500' }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-opacity text-center`}
                >
                  <action.icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">{action.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stories' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Stories ({user.createdStories.length})</h2>
            <button
              onClick={onCreateStory}
              className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Story
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.createdStories.map((story) => {
              const categoryInfo = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];
              return (
                <div key={story.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    {story.thumbnail ? (
                      <img src={story.thumbnail} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-12 h-12 text-violet-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${categoryInfo?.color}`}>
                        <span>{categoryInfo?.icon}</span>
                        {categoryInfo?.name}
                      </div>
                      {getStatusBadge(story.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{story.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">For {story.childName}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {story.downloadCount}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        View
                      </button>
                      <button className="flex-1 bg-violet-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-violet-600 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'children' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Children Profiles ({user.childrenProfiles.length})</h2>
            <button className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Child
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.childrenProfiles.map((child) => (
              <div key={child.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    {child.photo ? (
                      <img src={child.photo} alt={child.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Users className="w-10 h-10 text-violet-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                  <p className="text-gray-600">Age {child.age}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Favorite Categories:</h4>
                  <div className="flex flex-wrap gap-1">
                    {child.favoriteCategories.map((category) => {
                      const categoryInfo = STORY_CATEGORIES[category as keyof typeof STORY_CATEGORIES];
                      return (
                        <span key={category} className={`text-xs px-2 py-1 rounded-full ${categoryInfo?.color}`}>
                          {categoryInfo?.icon} {categoryInfo?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Edit Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements ({user.achievements.length})</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.achievements.map((achievement) => (
              <div key={achievement.id} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}