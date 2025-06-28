'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserDashboard } from '@/components/dashboard/user-dashboard';
import { Loader2 } from 'lucide-react';

// Mock data for demonstration - in production, this would come from your database
const getMockUserProfile = (session: Record<string, unknown>) => {
  return {
    id: (session?.user as Record<string, unknown>)?.id as string || '1',
    name: (session?.user as Record<string, unknown>)?.name as string || 'Guest User',
    email: (session?.user as Record<string, unknown>)?.email as string || 'user@example.com',
    subscriptionPlan: (session?.user as Record<string, unknown>)?.subscriptionPlan as string || 'free',
    subscriptionStatus: 'active' as const,
    subscriptionRenewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    storiesCreated: 12,
    storiesThisMonth: 3,
    monthlyLimit: (session?.user as Record<string, unknown>)?.subscriptionPlan === 'story_universe' ? 'unlimited' as const : 
                   (session?.user as Record<string, unknown>)?.subscriptionPlan === 'family_storyteller' ? 10 : 
                   (session?.user as Record<string, unknown>)?.subscriptionPlan === 'story_explorer' ? 5 : 1,
    childrenProfiles: [
      {
        id: '1',
        name: 'Emma',
        age: 6,
        favoriteCategories: ['adventure', 'friendship']
      },
      {
        id: '2',
        name: 'Noah',
        age: 4,
        favoriteCategories: ['discovery', 'nature']
      }
    ],
    createdStories: [
      {
        id: '1',
        title: 'If I Were an Animal',
        childName: 'Emma',
        template: 'if-i-were-animal',
        category: 'adventure',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        downloadCount: 3
      },
      {
        id: '2',
        title: 'My Magical Day',
        childName: 'Noah',
        template: 'magical-day',
        category: 'discovery',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        downloadCount: 2
      },
      {
        id: '3',
        title: 'Adventure in the Forest',
        childName: 'Emma',
        template: 'forest-adventure',
        category: 'nature',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        downloadCount: 5
      }
    ],
    achievements: [
      {
        id: '1',
        title: 'First Story',
        description: 'Created your first magical story',
        icon: '🎉',
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Story Explorer',
        description: 'Created 5 unique stories',
        icon: '🌟',
        unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Family Storyteller',
        description: 'Created stories for multiple children',
        icon: '👨‍👩‍👧‍👦',
        unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userProfile = getMockUserProfile(session as unknown as Record<string, unknown>);

  const handleCreateStory = () => {
    router.push('/create-story');
  };

  const handleUpgradePlan = () => {
    router.push('/pricing');
  };

  const handleManageSubscription = () => {
    router.push('/billing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <UserDashboard 
        user={userProfile}
        onCreateStory={handleCreateStory}
        onUpgradePlan={handleUpgradePlan}
        onManageSubscription={handleManageSubscription}
      />
    </div>
  );
}