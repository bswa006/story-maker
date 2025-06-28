import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { updateUserSubscription } from '@/lib/database';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const CreateSubscriptionSchema = z.object({
  planId: z.enum(['story_explorer', 'family_storyteller', 'story_universe']),
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
    const validatedData = CreateSubscriptionSchema.parse(body);

    // Get plan details
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === validatedData.planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Calculate price based on billing cycle
    const price = validatedData.billingCycle === 'monthly' 
      ? plan.price.monthly 
      : plan.price.yearly;

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: `${validatedData.planId}_${validatedData.billingCycle}`,
      customer_notify: 1,
      total_count: validatedData.billingCycle === 'monthly' ? 12 : 1,
      notes: {
        userId: session.user.id,
        planId: validatedData.planId,
        billingCycle: validatedData.billingCycle,
      },
    });

    // Update user subscription in database
    await updateUserSubscription(session.user.id, {
      subscriptionPlan: validatedData.planId,
      subscriptionStatus: 'pending', // Will be active after payment
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + (validatedData.billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
      monthlyStoriesLimit: plan.limits.storiesPerMonth === 'unlimited' ? 999999 : plan.limits.storiesPerMonth,
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      paymentLink: subscription.short_url,
      amount: price,
      currency: 'INR',
    });

  } catch (error) {
    console.error('Subscription creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}