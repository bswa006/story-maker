import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// For production, move to secure backend
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, storybookId, outputFormat, customerInfo } = body;

    if (!amount || !storybookId || !outputFormat || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Create Razorpay order
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const razorpayOrderData = {
      amount: amount, // Already in paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        storybookId,
        outputFormat,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email
      }
    };

    // For demo purposes, we'll simulate the order creation
    // In production, you would call Razorpay API here
    const razorpayOrderId = `order_${crypto.randomBytes(12).toString('hex')}`;

    // Save order to database (simulated)
    const order = {
      id: orderId,
      razorpayOrderId,
      storybookId,
      outputFormat,
      customerInfo,
      amount: amount / 100, // Convert back to rupees
      status: 'payment_pending',
      createdAt: new Date()
    };

    console.log('Order created:', order);

    return NextResponse.json({
      orderId,
      razorpayOrderId,
      razorpayKey: RAZORPAY_KEY_ID || 'rzp_test_demo_key', // Use demo key for testing
      amount
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Helper to create actual Razorpay order (for production)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createRazorpayOrder(orderData: Record<string, unknown>) {
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order');
  }

  return response.json();
}