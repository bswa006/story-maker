/**
 * Subscription plans and pricing configuration
 * Based on market research for premium positioning in personalized children's content
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number; // in rupees
    yearly: number; // in rupees (with discount)
    usd: {
      monthly: number;
      yearly: number;
    };
  };
  features: string[];
  limits: {
    storiesPerMonth: number | 'unlimited';
    childrenProfiles: number;
    storyTemplates: 'basic' | 'premium' | 'all';
    physicalPrints: number;
    prioritySupport: boolean;
    advancedPersonalization: boolean;
  };
  popular?: boolean;
  target: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Story Explorer',
    description: 'Perfect for trying out personalized stories',
    price: {
      monthly: 499,
      yearly: 4990, // 2 months free
      usd: {
        monthly: 6,
        yearly: 60
      }
    },
    features: [
      '3 personalized stories per month',
      'Basic story templates',
      '1 child profile',
      'Digital PDF downloads',
      'Studio Ghibli art style',
      'Basic personalization'
    ],
    limits: {
      storiesPerMonth: 3,
      childrenProfiles: 1,
      storyTemplates: 'basic',
      physicalPrints: 0,
      prioritySupport: false,
      advancedPersonalization: false
    },
    target: 'First-time users and budget-conscious families'
  },
  {
    id: 'family',
    name: 'Family Storyteller',
    description: 'Most popular plan for growing families',
    price: {
      monthly: 999,
      yearly: 9990, // 2 months free
      usd: {
        monthly: 12,
        yearly: 120
      }
    },
    features: [
      '10 personalized stories per month',
      'All story templates & themes',
      'Up to 3 children profiles',
      'HD quality illustrations',
      'Multiple art styles available',
      'Educational content included',
      '2 physical prints per month',
      'Age-appropriate content filtering',
      'Multi-language support (Hindi, English)'
    ],
    limits: {
      storiesPerMonth: 10,
      childrenProfiles: 3,
      storyTemplates: 'premium',
      physicalPrints: 2,
      prioritySupport: false,
      advancedPersonalization: true
    },
    popular: true,
    target: 'Families with multiple children who value education'
  },
  {
    id: 'premium',
    name: 'Story Universe',
    description: 'Unlimited creativity for dedicated storytelling families',
    price: {
      monthly: 1999,
      yearly: 19990, // 2 months free
      usd: {
        monthly: 24,
        yearly: 240
      }
    },
    features: [
      'Unlimited personalized stories',
      'All current & future templates',
      'Up to 5 children profiles',
      'Premium HD+ quality',
      'Advanced personalization (pets, family)',
      'Early access to new features',
      '5 physical prints per month',
      'Priority customer support',
      'Therapeutic & special needs content',
      'B2B educational licensing',
      'Custom story requests',
      'Audio narration (coming soon)',
      'AR features (coming soon)'
    ],
    limits: {
      storiesPerMonth: 'unlimited',
      childrenProfiles: 5,
      storyTemplates: 'all',
      physicalPrints: 5,
      prioritySupport: true,
      advancedPersonalization: true
    },
    target: 'Power users, educators, and families with special needs'
  }
];

// Physical product pricing (à la carte for all plans)
export const PHYSICAL_PRODUCTS = {
  softcover: {
    name: 'Softcover Storybook',
    price: 899,
    usd: 11,
    deliveryTime: '5-7 days'
  },
  hardcover: {
    name: 'Premium Hardcover',
    price: 1499,
    usd: 18,
    deliveryTime: '7-10 days',
    popular: true
  },
  poster: {
    name: 'Story Poster (A3)',
    price: 799,
    usd: 10,
    deliveryTime: '3-5 days'
  },
  framedArt: {
    name: 'Framed Art Collection',
    price: 2999,
    usd: 36,
    deliveryTime: '10-14 days'
  },
  giftBox: {
    name: 'Premium Gift Box',
    price: 3999,
    usd: 48,
    deliveryTime: '14-21 days'
  }
};

// Market positioning data
export const MARKET_POSITIONING = {
  competitorComparison: {
    childbook_ai: {
      name: 'Childbook.ai',
      pricing: { hobby: 19, premium: 29 }, // USD
      features: ['AI generation', 'Basic templates']
    },
    wonderbly: {
      name: 'Wonderbly',
      pricing: { perBook: 25 }, // USD
      features: ['High customization', 'Premium printing']
    },
    iSeeMe: {
      name: 'I See Me!',
      pricing: { perBook: 20 }, // USD
      features: ['Name personalization', 'Traditional themes']
    }
  },
  ourAdvantage: [
    'Subscription model with unlimited options',
    'Advanced AI with character consistency',
    'Educational content backed by research',
    'Multi-language support for Indian market',
    'Age-appropriate content filtering',
    'Therapeutic and special needs focus'
  ]
};

// Discount and promotion codes
export const PROMOTIONS = {
  welcome: {
    code: 'WELCOME30',
    discount: 30, // percentage
    validFor: 'first_month',
    description: 'Welcome offer for new subscribers'
  },
  yearly: {
    code: 'YEARLY20',
    discount: 20, // percentage
    validFor: 'yearly_plans',
    description: 'Additional 20% off yearly subscriptions'
  },
  student: {
    code: 'STUDENT50',
    discount: 50, // percentage
    validFor: 'all_plans',
    description: 'Student discount for educational use'
  }
};

export default SUBSCRIPTION_PLANS;