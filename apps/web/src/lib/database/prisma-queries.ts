import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// User queries
export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function createUser(data: {
  email: string;
  name: string;
  password?: string;
  provider?: 'credentials' | 'google';
  emailVerified?: boolean;
}) {
  try {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        emailVerified: data.emailVerified ? new Date() : null,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        monthlyStoriesUsed: 0,
        monthlyStoriesLimit: 1,
        totalStoriesCreated: 0,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('User with this email already exists');
      }
    }
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUserLastLogin(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

// Subscription and usage queries
export async function canUserGenerateStory(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) return false;
    
    // Unlimited plans
    if (['story_universe', 'educational_institution'].includes(user.subscriptionPlan)) {
      return true;
    }
    
    // Check monthly limit
    return user.monthlyStoriesUsed < user.monthlyStoriesLimit;
  } catch (error) {
    console.error('Error checking story generation limit:', error);
    return false;
  }
}

export async function incrementUserStoriesUsed(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyStoriesUsed: { increment: 1 },
        totalStoriesCreated: { increment: 1 },
        lastStoryCreatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error incrementing stories used:', error);
    throw error;
  }
}

export async function resetMonthlyUsage(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyStoriesUsed: 0,
        usageResetDate: new Date(),
      },
    });
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
  }
}

export async function updateUserSubscription(
  userId: string,
  plan: string,
  status: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const planLimits: Record<string, number> = {
      free: 1,
      story_explorer: 5,
      family_storyteller: 15,
      story_universe: 999999, // Effectively unlimited
    };
    
    return await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: status,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        monthlyStoriesLimit: planLimits[plan] || 1,
        // Reset usage if upgrading
        monthlyStoriesUsed: 0,
        usageResetDate: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

// Story management
export async function createStory(data: {
  userId: string;
  title: string;
  childName: string;
  childAge: string;
  theme: Record<string, unknown>;
  customization?: Record<string, unknown>;
  pages: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}) {
  try {
    return await prisma.story.create({
      data: {
        userId: data.userId,
        title: data.title,
        childName: data.childName,
        childAge: data.childAge,
        theme: data.theme as Prisma.JsonObject,
        customization: data.customization as Prisma.JsonObject,
        pages: data.pages as Prisma.JsonArray,
        metadata: data.metadata as Prisma.JsonObject,
      },
    });
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
}

export async function getUserStories(userId: string, limit = 10) {
  try {
    return await prisma.story.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        childName: true,
        theme: true,
        createdAt: true,
        imagesGenerated: true,
      },
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    return [];
  }
}

export async function getStoryById(id: string, userId: string) {
  try {
    return await prisma.story.findFirst({
      where: {
        id,
        userId, // Ensure user owns the story
      },
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return null;
  }
}

export async function updateStoryImages(storyId: string, imageUrls: string[]) {
  try {
    return await prisma.story.update({
      where: { id: storyId },
      data: {
        imagesGenerated: true,
        imageUrls: imageUrls as Prisma.JsonArray,
      },
    });
  } catch (error) {
    console.error('Error updating story images:', error);
    throw error;
  }
}

// Payment management
export async function createPayment(data: {
  userId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  planId: string;
  billingCycle?: string;
}) {
  try {
    return await prisma.payment.create({
      data: {
        userId: data.userId,
        razorpayOrderId: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        status: 'created',
        planId: data.planId,
        billingCycle: data.billingCycle,
      },
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

export async function updatePaymentStatus(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  status: string
) {
  try {
    return await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status,
      },
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

export async function getPaymentByOrderId(razorpayOrderId: string) {
  try {
    return await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: { user: true },
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

// Cleanup and maintenance
export async function checkAndResetMonthlyUsage() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Find users whose usage hasn't been reset this month
    const usersToReset = await prisma.user.findMany({
      where: {
        usageResetDate: {
          lt: startOfMonth,
        },
      },
    });
    
    // Reset usage for each user
    for (const user of usersToReset) {
      await resetMonthlyUsage(user.id);
    }
    
    return usersToReset.length;
  } catch (error) {
    console.error('Error checking and resetting monthly usage:', error);
    return 0;
  }
}