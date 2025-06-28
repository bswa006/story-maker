import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { getUserById } from '@/lib/database';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const UpgradeSubscriptionSchema = z.object({
  newPlanId: z.enum(['story_explorer', 'family_storyteller', 'story_universe']),
  billingCycle: z.enum(['monthly', 'yearly']),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = UpgradeSubscriptionSchema.parse(body);

    // Get current user subscription
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if upgrade is valid
    const currentPlanIndex = SUBSCRIPTION_PLANS.findIndex(p => p.id === user.subscriptionPlan);
    const newPlanIndex = SUBSCRIPTION_PLANS.findIndex(p => p.id === validatedData.newPlanId);
    
    if (newPlanIndex <= currentPlanIndex) {
      return NextResponse.json(
        { error: 'Can only upgrade to a higher tier plan' },
        { status: 400 }
      );
    }

    // Get new plan details
    const newPlan = SUBSCRIPTION_PLANS[newPlanIndex];
    const price = validatedData.billingCycle === 'monthly' 
      ? newPlan.price.monthly 
      : newPlan.price.yearly;

    // Create upgrade order in Razorpay
    const order = await razorpay.orders.create({
      amount: price * 100, // Convert to paise
      currency: 'INR',
      notes: {
        userId: session.user.id,
        upgradeFrom: user.subscriptionPlan,
        upgradeTo: validatedData.newPlanId,
        billingCycle: validatedData.billingCycle,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: price,
      currency: 'INR',
      currentPlan: user.subscriptionPlan,
      newPlan: validatedData.newPlanId,
    });

  } catch (error) {
    console.error('Subscription upgrade error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}