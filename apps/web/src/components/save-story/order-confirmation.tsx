'use client';

import { useEffect, useState } from 'react';
import { OutputFormat, CustomerInfo } from '@/types/order';
import { Storybook } from '@/types/storybook';
import { OUTPUT_OPTIONS } from '@/data/output-options';
import { CheckCircle, Download, Mail, Package } from 'lucide-react';
import { PDFGenerator } from '@/services/pdf-generator';

interface OrderConfirmationProps {
  orderId: string;
  paymentId: string;
  outputFormat: OutputFormat;
  customerInfo: CustomerInfo;
  storybook: Storybook;
  onClose: () => void;
}

export function OrderConfirmation({
  orderId,
  paymentId,
  outputFormat,
  customerInfo,
  storybook,
  onClose
}: OrderConfirmationProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const selectedOption = OUTPUT_OPTIONS.find(opt => opt.id === outputFormat);
  const isDigital = ['pdf', 'images', 'digitalBundle'].includes(outputFormat);

  useEffect(() => {
    // Send confirmation email
    sendConfirmationEmail();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendConfirmationEmail = async () => {
    try {
      await fetch('/api/email/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerInfo,
          outputFormat,
          amount: selectedOption?.price
        })
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      if (outputFormat === 'pdf') {
        const blob = await PDFGenerator.generateStorybook(
          storybook.pages,
          storybook.childName,
          "If I Were an Animal..."
        );
        PDFGenerator.downloadPDF(blob, `${storybook.childName}-storybook.pdf`);
      } else if (outputFormat === 'images') {
        // Generate ZIP of images
        await downloadImages();
      } else if (outputFormat === 'digitalBundle') {
        // Generate bundle with PDF + images
        await downloadBundle();
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadImages = async () => {
    // Implementation for downloading images as ZIP
    console.log('Downloading images...');
  };

  const downloadBundle = async () => {
    // Implementation for downloading digital bundle
    console.log('Downloading bundle...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      {/* Success Animation */}
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-green-500 rounded-full opacity-30 animate-ping" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 text-center mb-2">
          Thank you for your order, {customerInfo.name}
        </p>
        <p className="text-sm text-gray-500">
          Order ID: {orderId}
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Product</span>
            <span className="font-medium">{selectedOption?.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-medium">₹{selectedOption?.price}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment ID</span>
            <span className="font-mono text-sm">{paymentId.slice(0, 20)}...</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Delivery</span>
            <span className="font-medium">{selectedOption?.deliveryTime}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            {isDigital ? (
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Your download is ready below</p>
                <p>• We&apos;ve sent a confirmation email to {customerInfo.email}</p>
                <p>• The download link is also in your email</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-blue-800">
                <p>• We&apos;ve sent a confirmation email to {customerInfo.email}</p>
                <p>• Our team will start processing your order</p>
                <p>• You&apos;ll receive tracking information once shipped</p>
                <p>• Estimated delivery: {selectedOption?.deliveryTime}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Section for Digital Products */}
      {isDigital && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-20">
          <div className="text-center">
            <Download className="w-12 h-12 text-violet-600 mx-auto mb-3" />
            <h3 className="font-semibold text-violet-900 mb-2">Ready to Download</h3>
            <p className="text-sm text-violet-700 mb-4">
              Your {selectedOption?.name} is ready!
            </p>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-8 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:bg-gray-400"
            >
              {isDownloading ? 'Preparing Download...' : 'Download Now'}
            </button>
          </div>
        </div>
      )}

      {/* Shipping Address for Physical Products */}
      {!isDigital && customerInfo.address && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-20">
          <div className="flex items-start gap-3">
            <Package className="w-6 h-6 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <div className="text-sm text-gray-700">
                <p>{customerInfo.address.line1}</p>
                {customerInfo.address.line2 && <p>{customerInfo.address.line2}</p>}
                <p>{customerInfo.address.city}, {customerInfo.address.state} - {customerInfo.address.pincode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Done Button */}
      <div className="fixed bottom-4 left-4 right-4">
        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-2xl font-semibold shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}