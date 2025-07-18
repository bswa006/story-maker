'use client';

import { useEffect, useState } from 'react';
import { CustomerInfo, OutputFormat } from '@/types/order';
import { OUTPUT_OPTIONS } from '@/data/output-options';
import { CreditCard, Shield } from 'lucide-react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface PaymentCheckoutProps {
  outputFormat: OutputFormat;
  customerInfo: CustomerInfo;
  storybookId: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onBack: () => void;
}

export function PaymentCheckout({ 
  outputFormat, 
  customerInfo, 
  storybookId,
  onSuccess,
  onBack 
}: PaymentCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const selectedOption = OUTPUT_OPTIONS.find(opt => opt.id === outputFormat);
  const amount = selectedOption?.price || 0;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create order on backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount, // Amount in rupees, backend will convert to paise
          storybookId,
          outputFormat,
          customerInfo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { orderId, razorpayOrderId, razorpayKey, currency } = await response.json();

      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded');
      }

      // Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Convert to paise for Razorpay frontend
        currency: currency || 'INR',
        name: 'StoryMaker',
        description: `${selectedOption?.name} - ${customerInfo.name}'s Storybook`,
        image: '/favicon.ico', // Optional logo
        order_id: razorpayOrderId,
        handler: async function (response: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId
              })
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              onSuccess(verifyData.paymentId, verifyData.orderId);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
            setIsLoading(false);
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: `+91${customerInfo.phone}`
        },
        notes: {
          storybookId,
          outputFormat,
          customerEmail: customerInfo.email
        },
        theme: {
          color: '#8b5cf6'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          },
          escape: true,
          animation: true
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setIsLoading(false);
      });

      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-4">
      {/* Simple Back Button Header */}
      <div className="sticky top-0 z-50 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{selectedOption?.name}</span>
            <span className="font-semibold">₹{amount}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery</span>
            <span>{selectedOption?.deliveryTime}</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-violet-600">₹{amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h2>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>
            <span className="ml-2 text-gray-900">{customerInfo.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>
            <span className="ml-2 text-gray-900">{customerInfo.email}</span>
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>
            <span className="ml-2 text-gray-900">+91 {customerInfo.phone}</span>
          </div>
          {customerInfo.address && (
            <div>
              <span className="text-gray-500">Address:</span>
              <div className="ml-2 text-gray-900">
                {customerInfo.address.line1}<br />
                {customerInfo.address.line2 && <>{customerInfo.address.line2}<br /></>}
                {customerInfo.address.city}, {customerInfo.address.state} - {customerInfo.address.pincode}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Payment</p>
            <p className="text-sm text-blue-700 mt-1">
              Your payment information is encrypted and secure. We use Razorpay for processing payments.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-4 rounded-2xl font-semibold bg-white text-gray-700 border border-gray-300"
        >
          Back
        </button>
        <button
          onClick={initiatePayment}
          disabled={isLoading}
          className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-gray-300 text-gray-500'
              : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          {isLoading ? 'Processing...' : `Pay ₹${amount}`}
        </button>
      </div>
    </div>
  );
}