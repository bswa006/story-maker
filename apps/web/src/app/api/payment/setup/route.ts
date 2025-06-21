import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = process.env.RAZORPAY_KEY_ID && 
                      process.env.RAZORPAY_KEY_SECRET &&
                      !process.env.RAZORPAY_KEY_ID.includes('placeholder') &&
                      !process.env.RAZORPAY_KEY_SECRET.includes('placeholder');

  return NextResponse.json({
    configured: isConfigured,
    currentKeyId: process.env.RAZORPAY_KEY_ID?.substring(0, 20) + '...' || 'Not set',
    instructions: {
      step1: 'Go to https://dashboard.razorpay.com and sign up/login',
      step2: 'Navigate to Settings > API Keys',
      step3: 'Generate Test/Live API Keys',
      step4: 'Update .env.local with your actual keys:',
      example: {
        RAZORPAY_KEY_ID: 'rzp_test_1234567890abcdef',
        RAZORPAY_KEY_SECRET: 'your_secret_key_here'
      },
      step5: 'Restart your development server'
    },
    testCards: {
      cardNumber: '4111 1111 1111 1111',
      expiry: 'Any future date',
      cvv: 'Any 3 digits',
      name: 'Any name'
    }
  });
}