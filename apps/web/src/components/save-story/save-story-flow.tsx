'use client';

import { useState } from 'react';
import { Storybook } from '@/types/storybook';
import { OutputFormat, CustomerInfo } from '@/types/order';
import { OutputSelection } from './output-selection';
import { CustomerForm } from './customer-form';
import { PaymentCheckout } from './payment-checkout';
import { OrderConfirmation } from './order-confirmation';
import { PDFGenerator } from '@/services/pdf-generator';

type FlowStep = 'output' | 'customer' | 'payment' | 'confirmation';

interface SaveStoryFlowProps {
  storybook: Storybook;
  onClose: () => void;
}

export function SaveStoryFlow({ storybook, onClose }: SaveStoryFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('output');
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleOutputSelect = (format: OutputFormat) => {
    setSelectedFormat(format);
    
    // For digital formats, check if we need customer info
    if (format === 'pdf' || format === 'images' || format === 'digitalBundle') {
      // For now, still collect customer info for all formats
      setCurrentStep('customer');
    } else {
      setCurrentStep('customer');
    }
  };

  const handleCustomerSubmit = async (info: CustomerInfo) => {
    setCustomerInfo(info);
    
    // For free/instant digital downloads, skip payment
    if (selectedFormat === 'pdf' && false) { // Disabled for now - all require payment
      // Generate and download PDF directly
      await handleInstantDownload();
    } else {
      setCurrentStep('payment');
    }
  };

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    setPaymentId(paymentId);
    setOrderId(orderId);
    setCurrentStep('confirmation');

    // For digital formats, trigger download after payment
    if (selectedFormat === 'pdf' || selectedFormat === 'images' || selectedFormat === 'digitalBundle') {
      handlePostPaymentDownload();
    }
  };

  const handleInstantDownload = async () => {
    if (selectedFormat === 'pdf') {
      try {
        const blob = await PDFGenerator.generateStorybook(
          storybook.pages,
          storybook.childName,
          "If I Were an Animal..."
        );
        PDFGenerator.downloadPDF(blob, `${storybook.childName}-storybook.pdf`);
      } catch (error) {
        console.error('Failed to generate PDF:', error);
      }
    }
  };

  const handlePostPaymentDownload = async () => {
    // Trigger download based on format
    // This would be handled by the order confirmation component
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'customer':
        setCurrentStep('output');
        break;
      case 'payment':
        setCurrentStep('customer');
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {currentStep === 'output' && (
        <OutputSelection
          storybookId={storybook.id}
          onSelect={handleOutputSelect}
        />
      )}

      {currentStep === 'customer' && selectedFormat && (
        <CustomerForm
          outputFormat={selectedFormat}
          onSubmit={handleCustomerSubmit}
          onBack={handleBack}
        />
      )}

      {currentStep === 'payment' && selectedFormat && customerInfo && (
        <PaymentCheckout
          outputFormat={selectedFormat}
          customerInfo={customerInfo}
          storybookId={storybook.id}
          onSuccess={handlePaymentSuccess}
          onBack={handleBack}
        />
      )}

      {currentStep === 'confirmation' && orderId && paymentId && selectedFormat && customerInfo && (
        <OrderConfirmation
          orderId={orderId}
          paymentId={paymentId}
          outputFormat={selectedFormat}
          customerInfo={customerInfo}
          storybook={storybook}
          onClose={onClose}
        />
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[101] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100"
      >
        <span className="text-2xl">×</span>
      </button>
    </div>
  );
}