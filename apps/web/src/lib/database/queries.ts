// Mock database queries - Replace with actual database implementation
// This is a temporary in-memory implementation for development

interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  provider: 'credentials' | 'google';
  emailVerified: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  monthlyStoriesUsed: number;
  monthlyStoriesLimit: number;
  createdAt: Date;
  lastLoginAt?: Date;
  usageResetDate?: Date;
}

// In-memory storage (replace with actual database)
// Using global to persist data across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __users: Map<string, User> | undefined;
}

const users: Map<string, User> = global.__users || new Map();
if (!global.__users) {
  global.__users = users;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

export async function getUserById(id: string): Promise<User | null> {
  console.log('getUserById called with:', id);
  console.log('Current users in database:', Array.from(users.keys()));
  const user = users.get(id) || null;
  console.log('Found user:', user);
  return user;
}

export async function createUser(data: {
  email: string;
  name: string;
  password?: string;
  provider: 'credentials' | 'google';
  emailVerified: boolean;
}): Promise<User> {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: data.email,
    name: data.name,
    password: data.password,
    provider: data.provider,
    emailVerified: data.emailVerified,
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    monthlyStoriesUsed: 0,
    monthlyStoriesLimit: 1, // Free tier gets 1 story
    createdAt: new Date(),
    usageResetDate: new Date(),
  };
  
  users.set(user.id, user);
  console.log('Created user with ID:', user.id, 'Email:', user.email);
  return user;
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const user = users.get(userId);
  if (user) {
    user.lastLoginAt = new Date();
    users.set(userId, user);
  }
}

export async function updateUserSubscription(
  userId: string,
  plan: string,
  status: string,
  startDate?: Date,
  endDate?: Date
): Promise<User | null> {
  const user = users.get(userId);
  if (!user) return null;
  
  const planLimits: Record<string, number> = {
    free: 1,
    story_explorer: 5,
    family_storyteller: 15,
    story_universe: 999999, // Effectively unlimited
  };
  
  user.subscriptionPlan = plan;
  user.subscriptionStatus = status;
  user.subscriptionStartDate = startDate;
  user.subscriptionEndDate = endDate;
  user.monthlyStoriesLimit = planLimits[plan] || 1;
  user.monthlyStoriesUsed = 0; // Reset usage on plan change
  
  users.set(userId, user);
  return user;
}

export async function incrementUserStoriesUsed(userId: string): Promise<User | null> {
  const user = users.get(userId);
  if (!user) return null;
  
  user.monthlyStoriesUsed += 1;
  users.set(userId, user);
  return user;
}

export async function resetMonthlyUsage(userId: string): Promise<void> {
  const user = users.get(userId);
  if (user) {
    user.monthlyStoriesUsed = 0;
    user.usageResetDate = new Date();
    users.set(userId, user);
  }
}

export async function getAllUsers(): Promise<User[]> {
  return Array.from(users.values());
}

export async function canUserGenerateStory(userId: string): Promise<boolean> {
  const user = users.get(userId);
  if (!user) return false;
  
  // Unlimited plans
  if (user.subscriptionPlan === 'story_universe') return true;
  
  // Check monthly limit
  return user.monthlyStoriesUsed < user.monthlyStoriesLimit;
}

// Subscription plan limits mapping
export const PLAN_LIMITS = {
  free: {
    monthlyStories: 1,
    childProfiles: 1,
    templates: ['basic'],
    features: ['pdf_download'],
  },
  story_explorer: {
    monthlyStories: 3,
    childProfiles: 1,
    templates: ['basic'],
    features: ['pdf_download', 'ghibli_style'],
  },
  family_storyteller: {
    monthlyStories: 10,
    childProfiles: 3,
    templates: ['all'],
    features: ['pdf_download', 'all_styles', 'hd_quality', 'physical_prints', 'multi_language'],
  },
  story_universe: {
    monthlyStories: -1, // Unlimited
    childProfiles: 5,
    templates: ['all'],
    features: ['all'],
  },
};

// Story management (in-memory)
const stories: Map<string, any> = new Map();

export async function createStory(data: {
  userId: string;
  title: string;
  childName: string;
  childAge: string;
  theme: Record<string, unknown>;
  customization?: Record<string, unknown>;
  pages: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}): Promise<any> {
  const story = {
    id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    imagesGenerated: false,
    imageUrls: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  stories.set(story.id, story);
  console.log('Created story with ID:', story.id);
  return story;
}

export async function getUserStories(userId: string, limit = 10): Promise<any[]> {
  const userStories = Array.from(stories.values())
    .filter(story => story.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
  
  return userStories;
}

export async function getStoryById(id: string, userId: string): Promise<any | null> {
  const story = stories.get(id);
  if (story && story.userId === userId) {
    return story;
  }
  return null;
}

export async function updateStoryImages(storyId: string, imageUrls: string[]): Promise<any> {
  const story = stories.get(storyId);
  if (!story) {
    throw new Error('Story not found');
  }
  
  story.imagesGenerated = true;
  story.imageUrls = imageUrls;
  story.updatedAt = new Date();
  stories.set(storyId, story);
  
  return story;
}

// Payment management (in-memory)
const payments: Map<string, any> = new Map();

export async function createPayment(data: {
  userId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  planId: string;
  billingCycle?: string;
}): Promise<any> {
  const payment = {
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    status: 'created',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  payments.set(payment.razorpayOrderId, payment);
  return payment;
}

export async function updatePaymentStatus(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  status: string
): Promise<any> {
  const payment = payments.get(razorpayOrderId);
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = status;
  payment.updatedAt = new Date();
  
  payments.set(razorpayOrderId, payment);
  return payment;
}

export async function getPaymentByOrderId(razorpayOrderId: string): Promise<any | null> {
  const payment = payments.get(razorpayOrderId);
  if (payment) {
    const user = await getUserById(payment.userId);
    return { ...payment, user };
  }
  return null;
}

export async function checkAndResetMonthlyUsage(): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let resetCount = 0;
  
  for (const user of users.values()) {
    if (!user.usageResetDate || user.usageResetDate < startOfMonth) {
      await resetMonthlyUsage(user.id);
      resetCount++;
    }
  }
  
  return resetCount;
}