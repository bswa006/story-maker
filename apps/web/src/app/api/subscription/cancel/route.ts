import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, updateUserSubscription } from '@/lib/database';

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user subscription
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.subscriptionPlan === 'free') {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      );
    }

    // Update user subscription to cancelled
    await updateUserSubscription(session.user.id, {
      subscriptionPlan: user.subscriptionPlan, // Keep current plan until end date
      subscriptionStatus: 'cancelled',
      subscriptionEndDate: user.subscriptionEndDate, // Will remain active until this date
      monthlyStoriesLimit: user.monthlyStoriesLimit,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      activeUntil: user.subscriptionEndDate,
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}