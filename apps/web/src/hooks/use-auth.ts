'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [requireAuth, status, router]);

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}

export function useSubscription() {
  const { user } = useAuth();

  return {
    plan: user?.subscriptionPlan || 'free',
    status: user?.subscriptionStatus || 'inactive',
    isPro: user?.subscriptionPlan === 'story_universe',
    isFamilyPlan: user?.subscriptionPlan === 'family_storyteller',
    isStarter: user?.subscriptionPlan === 'story_explorer',
    isFree: !user?.subscriptionPlan || user?.subscriptionPlan === 'free',
  };
}