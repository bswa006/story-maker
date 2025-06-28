import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateUserSubscription, getUserById } from '@/lib/database';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

// Verify Razorpay webhook signature
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    switch (eventType) {
      case 'subscription.activated': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes.userId;
        const planId = subscription.notes.planId;
        
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) break;

        await updateUserSubscription(userId, {
          subscriptionPlan: planId,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(subscription.start_at * 1000),
          subscriptionEndDate: new Date(subscription.end_at * 1000),
          monthlyStoriesLimit: plan.limits.storiesPerMonth === 'unlimited' ? 999999 : plan.limits.storiesPerMonth,
        });
        break;
      }

      case 'subscription.pending': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes.userId;
        
        await updateUserSubscription(userId, {
          subscriptionPlan: subscription.notes.planId,
          subscriptionStatus: 'pending',
          subscriptionStartDate: undefined,
          subscriptionEndDate: undefined,
          monthlyStoriesLimit: 1, // Free tier limit
        });
        break;
      }

      case 'subscription.halted':
      case 'subscription.cancelled': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes.userId;
        
        const user = await getUserById(userId);
        if (user) {
          await updateUserSubscription(userId, {
            subscriptionPlan: user.subscriptionPlan,
            subscriptionStatus: 'cancelled',
            subscriptionStartDate: user.subscriptionStartDate,
            subscriptionEndDate: new Date(subscription.end_at * 1000),
            monthlyStoriesLimit: user.monthlyStoriesLimit,
          });
        }
        break;
      }

      case 'subscription.completed': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes.userId;
        
        await updateUserSubscription(userId, {
          subscriptionPlan: 'free',
          subscriptionStatus: 'inactive',
          subscriptionStartDate: undefined,
          subscriptionEndDate: undefined,
          monthlyStoriesLimit: 1,
        });
        break;
      }

      case 'subscription.updated': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes.userId;
        const planId = subscription.notes.planId;
        
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) break;

        await updateUserSubscription(userId, {
          subscriptionPlan: planId,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(subscription.start_at * 1000),
          subscriptionEndDate: new Date(subscription.end_at * 1000),
          monthlyStoriesLimit: plan.limits.storiesPerMonth === 'unlimited' ? 999999 : plan.limits.storiesPerMonth,
        });
        break;
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}