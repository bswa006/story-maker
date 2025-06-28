'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';
import { toast } from '@/hooks/use-toast';

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(planId);
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Razorpay payment link
        if (data.paymentLink) {
          window.location.href = data.paymentLink;
        }
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to start subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getPrice = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    return billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
  };

  const getPriceDisplay = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    const price = getPrice(plan);
    const period = billingCycle === 'monthly' ? '/month' : '/year';
    return { price, period };
  };

  const getSavings = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    if (billingCycle === 'yearly') {
      const monthlyTotal = plan.price.monthly * 12;
      const yearlyPrice = plan.price.yearly;
      const savings = monthlyTotal - yearlyPrice;
      const savingsPercent = Math.round((savings / monthlyTotal) * 100);
      return savingsPercent;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Premium Personalized Stories
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Story Adventure
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock unlimited personalized stories that grow with your child. Educational,
            therapeutic, and magical content created by AI and approved by child development
            experts.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-violet-600 transition-colors"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-2 text-sm text-green-600 font-medium">Save 17%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const { price, period } = getPriceDisplay(plan);
            const savings = getSavings(plan);
            const isCurrentPlan = session?.user?.subscriptionPlan === plan.id;
            const isPopular = plan.id === 'family';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                  isPopular ? 'ring-4 ring-violet-500 ring-offset-4' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">₹{price}</span>
                    <span className="text-gray-500 ml-2">{period}</span>
                  </div>
                  {savings > 0 && (
                    <p className="text-sm text-green-600 mt-2">Save {savings}% with yearly billing</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading !== null || isCurrentPlan}
                  className={`w-full ${
                    isPopular
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } text-white`}
                >
                  {isLoading === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Enterprise Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              <Zap className="inline-block w-8 h-8 mr-2 text-yellow-400" />
              Enterprise & Educational Institutions
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Special pricing for schools, libraries, and educational organizations.
              Unlimited stories for all your students with advanced analytics and management tools.
            </p>
            <Button
              onClick={() => router.push('/contact')}
              variant="outline"
              className="bg-white text-gray-900 hover:bg-gray-100"
              size="lg"
            >
              Contact Sales
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately and we&apos;ll prorate the billing.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                New users get 1 free story to try our platform. No credit card required!
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How do physical prints work?</h3>
              <p className="text-gray-600">
                Family and Universe plans include monthly print credits. Simply select any story
                and we&apos;ll ship a beautifully printed book to your address.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Absolutely! Cancel your subscription anytime from your billing page. You&apos;ll
                retain access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}