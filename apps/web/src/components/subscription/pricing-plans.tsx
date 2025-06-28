'use client';

import { useState } from 'react';
import { SUBSCRIPTION_PLANS, PHYSICAL_PRODUCTS, PROMOTIONS } from '@/config/subscription-plans';
import { Check, Star, Sparkles, Heart, Zap, Crown } from 'lucide-react';

interface PricingPlansProps {
  currentPlan?: string;
  onPlanSelect: (planId: string) => void;
  showYearly?: boolean;
}

export function PricingPlans({ currentPlan, onPlanSelect, showYearly = false }: PricingPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(showYearly ? 'yearly' : 'monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan || '');

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Heart className="w-6 h-6" />;
      case 'family': return <Star className="w-6 h-6" />;
      case 'premium': return <Crown className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    onPlanSelect(planId);
  };

  const yearlyDiscount = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const savings = ((monthlyCost - yearly) / monthlyCost) * 100;
    return Math.round(savings);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Premium Personalized Stories
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Story Adventure
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Unlock unlimited personalized stories that grow with your child. 
          Educational, therapeutic, and magical content created by AI and approved by child development experts.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isPopular = plan.popular;
          const isSelected = selectedPlan === plan.id;
          const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
          const usdPrice = billingCycle === 'yearly' ? plan.price.usd.yearly : plan.price.usd.monthly;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                isPopular
                  ? 'border-violet-200 shadow-lg scale-105'
                  : isSelected
                  ? 'border-violet-300'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${getPlanColor(plan.id)} text-white mb-4`}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">₹{price}</span>
                      <span className="text-gray-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      ${usdPrice} USD {billingCycle === 'yearly' ? '/year' : '/month'}
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save {yearlyDiscount(plan.price.monthly, plan.price.yearly)}% with yearly billing
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                    isPopular
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg'
                      : isSelected
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Choose Plan'}
                </button>

                {/* Target Audience */}
                <div className="text-center mt-4">
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    {plan.target}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Physical Products Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Physical Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bring your digital stories to life with beautiful printed books, posters, and gift sets. 
            Perfect for special occasions and lasting memories.
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Object.entries(PHYSICAL_PRODUCTS).map(([key, product]) => (
            <div key={key} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              {'popular' in product && product.popular && (
                <div className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full mb-3 inline-block">
                  Popular
                </div>
              )}
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">₹{product.price}</div>
              <div className="text-sm text-gray-500 mb-3">${product.usd} USD</div>
              <div className="text-xs text-gray-500">{product.deliveryTime}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotions */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Special Offers</h2>
          <p className="text-gray-600">Limited time promotions for new and existing subscribers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PROMOTIONS).map(([key, promo]) => (
            <div key={key} className="bg-white rounded-xl p-6 text-center">
              <div className="bg-green-100 text-green-700 font-mono text-lg font-bold px-3 py-2 rounded-lg mb-3">
                {promo.code}
              </div>
              <div className="text-2xl font-bold text-green-600 mb-2">{promo.discount}% OFF</div>
              <div className="text-sm text-gray-600">{promo.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Advantage */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-8 h-8" />,
              title: 'Advanced AI Personalization',
              description: 'Your child looks consistent across all stories with our advanced character recognition'
            },
            {
              icon: <Star className="w-8 h-8" />,
              title: 'Educational Excellence',
              description: 'Content developed with child psychologists and education experts'
            },
            {
              icon: <Heart className="w-8 h-8" />,
              title: 'Therapeutic Value',
              description: 'Stories designed to support emotional growth and mental health'
            },
            {
              icon: <Sparkles className="w-8 h-8" />,
              title: 'Multi-Language Support',
              description: 'Stories available in Hindi, English, and more languages coming soon'
            },
            {
              icon: <Crown className="w-8 h-8" />,
              title: 'Premium Quality',
              description: 'Studio Ghibli-inspired artwork with multiple art styles available'
            },
            {
              icon: <Check className="w-8 h-8" />,
              title: 'Age-Appropriate Content',
              description: 'Intelligent filtering ensures content matches your child\'s developmental stage'
            }
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}