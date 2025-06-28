'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useSubscription } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CreditCard, AlertCircle, CheckCircle, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

interface SubscriptionStatus {
  subscription: {
    plan: string;
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    autoRenew: boolean;
  };
  usage: {
    storiesUsed: number;
    storiesLimit: number;
    storiesRemaining: number;
    canGenerateStory: boolean;
    resetDate: string;
  };
  features: Record<string, unknown>;
}

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const subscription = useSubscription();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch {
      console.error('Failed to fetch subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Subscription cancelled',
          description: 'Your subscription has been cancelled and will remain active until the end of your billing period.',
        });
        fetchSubscriptionStatus();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === status?.subscription.plan) || SUBSCRIPTION_PLANS[0];
  const usagePercentage = status ? (status.usage.storiesUsed / status.usage.storiesLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-xl text-gray-600">Manage your subscription and track your usage</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentPlan.name}</CardTitle>
                    <CardDescription>Your current subscription plan</CardDescription>
                  </div>
                  <Crown className="w-8 h-8 text-violet-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {status?.subscription.status === 'active' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-600">Active</span>
                        </>
                      ) : status?.subscription.status === 'cancelled' ? (
                        <>
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          <span className="font-medium text-orange-600">Cancelled</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-gray-500" />
                          <span className="font-medium text-gray-600">{status?.subscription.status}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Next billing date</p>
                    <p className="font-medium">
                      {status?.subscription.endDate 
                        ? new Date(status.subscription.endDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Usage Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Monthly Story Usage</span>
                    <span className="text-sm text-gray-600">
                      {status?.usage.storiesUsed || 0} / {status?.usage.storiesLimit === 999999 ? 'Unlimited' : status?.usage.storiesLimit || 0}
                    </span>
                  </div>
                  {status?.usage.storiesLimit !== 999999 && (
                    <Progress value={usagePercentage} className="h-2" />
                  )}
                  {status?.usage.resetDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Resets on {new Date(status.usage.resetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Plan Features */}
                <div>
                  <h4 className="font-medium mb-3">Your Plan Features</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  {subscription.isFree ? (
                    <Button
                      onClick={() => router.push('/pricing')}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                      Upgrade Plan
                    </Button>
                  ) : subscription.isPro ? (
                    <Button variant="outline" disabled>
                      You have the best plan!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push('/pricing')}
                      variant="outline"
                    >
                      Upgrade Plan
                    </Button>
                  )}
                  
                  {!subscription.isFree && status?.subscription.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel Subscription'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No billing history available</p>
                  <p className="text-sm mt-1">Your transactions will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/create-story')}
                  className="w-full"
                  variant="outline"
                >
                  Create New Story
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                  variant="outline"
                >
                  View Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/pricing')}
                  className="w-full"
                  variant="outline"
                >
                  View All Plans
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your subscription or billing?
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}