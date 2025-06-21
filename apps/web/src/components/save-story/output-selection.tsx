'use client';

import { useState } from 'react';
import { OUTPUT_OPTIONS } from '@/data/output-options';
import { OutputFormat } from '@/types/order';
import { Check, Clock, Star } from 'lucide-react';

interface OutputSelectionProps {
  onSelect: (format: OutputFormat) => void;
  storybookId: string;
}

export function OutputSelection({ onSelect }: OutputSelectionProps) {
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat | null>(null);

  const handleContinue = () => {
    if (selectedFormat) {
      onSelect(selectedFormat);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">Save Your Story</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Choose how you&apos;d like to preserve this magical journey</p>
        </div>
      </div>

      {/* Output Options Grid */}
      <div className="p-4 space-y-4">
        {OUTPUT_OPTIONS.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedFormat(option.id)}
            className={`relative bg-white rounded-2xl border-2 transition-all cursor-pointer ${
              selectedFormat === option.id
                ? 'border-violet-500 shadow-lg'
                : 'border-gray-200 hover:border-violet-300'
            }`}
          >
            {option.popular && (
              <div className="absolute -top-3 left-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                Popular
              </div>
            )}

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{option.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedFormat === option.id
                    ? 'bg-violet-500 border-violet-500'
                    : 'border-gray-300'
                }`}>
                  {selectedFormat === option.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-bold text-violet-600">
                  ₹{option.price}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {option.deliveryTime}
                </div>
              </div>

              <div className="space-y-2">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <button
          onClick={handleContinue}
          disabled={!selectedFormat}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
            selectedFormat
              ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          Continue to Details
        </button>
      </div>
    </div>
  );
}