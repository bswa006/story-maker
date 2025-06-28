import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { canUserGenerateStory, incrementUserStoriesUsed, getUserById, getUserByEmail } from './database';
import { NextResponse } from 'next/server';

export async function checkSubscriptionLimits() {
  const session = await getServerSession(authOptions);
  console.log('Session in subscription check:', session);
  
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: 'Please sign in to generate stories',
      requiresAuth: true,
    };
  }

  // Check if we're in test mode
  const isTestMode = process.env.TEST_MODE === 'true';
  if (isTestMode) {
    console.log('TEST MODE: Bypassing subscription limits');
  }

  console.log('Looking for user with ID:', session.user.id);
  let user = await getUserById(session.user.id);
  
  // If user not found by ID, try by email as fallback
  if (!user && session.user.email) {
    console.log('User not found by ID, trying email:', session.user.email);
    user = await getUserByEmail(session.user.email);
  }
  
  console.log('Found user:', user);
  
  if (!user) {
    return {
      allowed: false,
      error: 'User not found',
    };
  }

  // In test mode, always allow story generation
  if (isTestMode) {
    return {
      allowed: true,
      user,
      testMode: true,
    };
  }

  const canGenerate = await canUserGenerateStory(user.id);
  
  if (!canGenerate) {
    return {
      allowed: false,
      error: `You've reached your monthly limit of ${user.monthlyStoriesLimit} stories`,
      limitReached: true,
      currentPlan: user.subscriptionPlan,
      storiesUsed: user.monthlyStoriesUsed,
      storiesLimit: user.monthlyStoriesLimit,
    };
  }

  return {
    allowed: true,
    user,
  };
}

export async function incrementUsage(userId: string) {
  // Skip incrementing usage in test mode
  if (process.env.TEST_MODE === 'true') {
    console.log('TEST MODE: Skipping usage increment');
    return;
  }
  return await incrementUserStoriesUsed(userId);
}

export function createSubscriptionErrorResponse(check: {
  requiresAuth?: boolean;
  limitReached?: boolean;
  error?: string;
  currentPlan?: string;
  storiesUsed?: number;
  storiesLimit?: number;
}) {
  if (check.requiresAuth) {
    return NextResponse.json(
      { 
        error: check.error || 'Unauthorized',
        requiresAuth: true,
      },
      { status: 401 }
    );
  }

  if (check.limitReached) {
    return NextResponse.json(
      { 
        error: check.error || 'Unauthorized',
        limitReached: true,
        currentPlan: check.currentPlan,
        usage: {
          used: check.storiesUsed,
          limit: check.storiesLimit,
        },
        upgradeUrl: '/pricing',
      },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { error: check.error },
    { status: 400 }
  );
}