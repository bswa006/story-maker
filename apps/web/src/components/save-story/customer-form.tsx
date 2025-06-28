'use client';

import { useState } from 'react';
import { CustomerInfo, OutputFormat } from '@/types/order';
import { OUTPUT_OPTIONS } from '@/data/output-options';
import { MapPin, Mail, Phone, User } from 'lucide-react';

interface CustomerFormProps {
  outputFormat: OutputFormat;
  onSubmit: (customerInfo: CustomerInfo) => void;
  onBack: () => void;
}

export function CustomerForm({ outputFormat, onSubmit, onBack }: CustomerFormProps) {
  const selectedOption = OUTPUT_OPTIONS.find(opt => opt.id === outputFormat);
  const requiresShipping = ['hardcover', 'softcover', 'photoFrames', 'poster', 'giftBox'].includes(outputFormat);

  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: requiresShipping ? {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    } : undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid Indian phone number';
    }

    if (requiresShipping && formData.address) {
      if (!formData.address.line1.trim()) {
        newErrors.address_line1 = 'Address is required';
      }
      if (!formData.address.city.trim()) {
        newErrors.address_city = 'City is required';
      }
      if (!formData.address.state.trim()) {
        newErrors.address_state = 'State is required';
      }
      if (!formData.address.pincode.trim()) {
        newErrors.address_pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.address.pincode)) {
        newErrors.address_pincode = 'Invalid pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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

      <form onSubmit={handleSubmit} className="space-y-4 pb-24">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-violet-600" />
            Contact Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              } focus:outline-none focus:border-violet-400`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              } focus:outline-none focus:border-violet-400`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.phone ? 'border-red-300' : 'border-gray-200'
              } focus:outline-none focus:border-violet-400`}
              placeholder="9876543210"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        {requiresShipping && formData.address && (
          <div className="bg-white rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-600" />
              Delivery Address
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.address.line1}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address!, line1: e.target.value }
                })}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.address_line1 ? 'border-red-300' : 'border-gray-200'
                } focus:outline-none focus:border-violet-400`}
                placeholder="House/Flat No, Building Name"
              />
              {errors.address_line1 && (
                <p className="text-sm text-red-600 mt-1">{errors.address_line1}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.address.line2 || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address!, line2: e.target.value }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400"
                placeholder="Street, Landmark"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, city: e.target.value }
                  })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.address_city ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:border-violet-400`}
                  placeholder="City"
                />
                {errors.address_city && (
                  <p className="text-sm text-red-600 mt-1">{errors.address_city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, state: e.target.value }
                  })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.address_state ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:border-violet-400`}
                  placeholder="State"
                />
                {errors.address_state && (
                  <p className="text-sm text-red-600 mt-1">{errors.address_state}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={formData.address.pincode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address!, pincode: e.target.value }
                })}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.address_pincode ? 'border-red-300' : 'border-gray-200'
                } focus:outline-none focus:border-violet-400`}
                placeholder="600001"
                maxLength={6}
              />
              {errors.address_pincode && (
                <p className="text-sm text-red-600 mt-1">{errors.address_pincode}</p>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-semibold bg-white text-gray-700 border border-gray-300"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-4 rounded-2xl font-semibold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}