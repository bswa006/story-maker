import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

interface MockSubscription {
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  cancelAtPeriodEnd: boolean;
  monthlyStoriesUsed: number;
  monthlyStoriesLimit: number;
  lastStoryDate: string;
}

// Mock subscription data - replace with actual database queries
const mockSubscriptions: Record<string, MockSubscription> = {
  'bswa006@gmail.com': {
    planId: 'family',
    status: 'active',
    startDate: new Date('2024-06-01').toISOString(),
    endDate: new Date('2024-07-01').toISOString(),
    cancelAtPeriodEnd: false,
    monthlyStoriesUsed: 3,
    monthlyStoriesLimit: 10,
    lastStoryDate: new Date('2024-06-20').toISOString()
  }
};

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user subscription from mock data (replace with database query)
    const userSubscription = mockSubscriptions[session.user.email];
    
    // Default to free plan if no subscription
    const planId = userSubscription?.planId || 'free';
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || {
      id: 'free',
      name: 'Free',
      description: 'Limited access with 1 story per month',
      price: { monthly: 0, yearly: 0, usd: { monthly: 0, yearly: 0 } },
      features: ['1 story per month', 'Basic templates', 'Digital downloads'],
      limits: {
        storiesPerMonth: 1,
        childrenProfiles: 1,
        storyTemplates: 'basic' as const,
        physicalPrints: 0,
        prioritySupport: false,
        advancedPersonalization: false
      },
      target: ''
    };
    
    // Calculate subscription details
    const now = new Date();
    const endDate = userSubscription?.endDate ? new Date(userSubscription.endDate) : null;
    const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    
    const monthlyStoriesUsed = userSubscription?.monthlyStoriesUsed || 0;
    const monthlyStoriesLimit = typeof plan.limits.storiesPerMonth === 'number' 
      ? plan.limits.storiesPerMonth 
      : 9999; // unlimited
    
    const canGenerateStory = monthlyStoriesUsed < monthlyStoriesLimit;

    return NextResponse.json({
      subscription: {
        plan: plan.id,
        planName: plan.name,
        status: userSubscription?.status || 'free',
        startDate: userSubscription?.startDate || null,
        endDate: userSubscription?.endDate || null,
        daysRemaining,
        autoRenew: userSubscription?.status === 'active' && !userSubscription?.cancelAtPeriodEnd,
      },
      usage: {
        storiesUsed: monthlyStoriesUsed,
        storiesLimit: monthlyStoriesLimit,
        storiesRemaining: Math.max(0, monthlyStoriesLimit - monthlyStoriesUsed),
        canGenerateStory,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
      features: plan.features,
    });

  } catch (error) {
    console.error('Subscription status error:', error);

    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}