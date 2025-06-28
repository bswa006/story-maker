import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      subscriptionPlan?: string;
      subscriptionStatus?: string;
      monthlyStoriesUsed?: number;
      monthlyStoriesLimit?: number;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    monthlyStoriesUsed?: number;
    monthlyStoriesLimit?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    subscriptionPlan?: string;
    subscriptionStatus?: string;
  }
}