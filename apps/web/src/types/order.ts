export type OutputFormat = 
  | 'pdf'           // Digital PDF download
  | 'images'        // High-res image collection (ZIP)
  | 'hardcover'     // Premium hardcover book
  | 'softcover'     // Softcover book
  | 'photoFrames'   // Individual pages as framed prints
  | 'poster'        // Large format poster with all pages
  | 'digitalBundle' // PDF + Images + Wallpapers
  | 'giftBox';      // Premium gift box with book + frames

export interface OutputOption {
  id: OutputFormat;
  name: string;
  description: string;
  price: number; // in INR
  deliveryTime: string;
  features: string[];
  popular?: boolean;
  image?: string;
}

export interface CustomerInfo {
  email: string;
  phone: string;
  name: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface Order {
  id: string;
  storybookId: string;
  customerInfo: CustomerInfo;
  outputFormat: OutputFormat;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paymentId?: string;
  orderStatus: 'created' | 'payment_pending' | 'processing' | 'printing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}