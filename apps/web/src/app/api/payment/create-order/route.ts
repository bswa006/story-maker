import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

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

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay configuration missing' },
        { status: 500 }
      );
    }

    // Check for placeholder values
    if (process.env.RAZORPAY_KEY_ID.includes('placeholder') || 
        process.env.RAZORPAY_KEY_SECRET.includes('placeholder')) {
      return NextResponse.json(
        { 
          error: 'Razorpay API keys not configured. Please add your actual keys from https://dashboard.razorpay.com/app/keys',
          details: 'Replace placeholder values in environment variables'
        },
        { status: 500 }
      );
    }

    // Initialize Razorpay instance with environment variables
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Generate unique receipt ID
    const receipt = `receipt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        storybookId,
        outputFormat,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email
      }
    });

    // Generate our internal order ID
    const orderId = `ORDER_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Save order to database (simulated for now)
    console.log('Order details:', {
      id: orderId,
      razorpayOrderId: razorpayOrder.id,
      storybookId,
      outputFormat,
      customerInfo,
      amount: amount / 100, // Convert back to rupees
      status: 'payment_pending',
      createdAt: new Date(),
      receipt: receipt
    });

    console.log('Order created successfully:', {
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: amount / 100,
      receipt
    });

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      receipt
    });

  } catch (error) {
    console.error('Create order error:', error);
    let errorMessage = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }
    
    return NextResponse.json(
      { error: `Failed to create order: ${errorMessage}` },
      { status: 500 }
    );
  }
}