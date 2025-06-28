import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Email & Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionStatus: user.subscriptionStatus,
        };
      }
    }),
    
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Update last login time for OAuth users
          await prisma.user.update({
            where: { email: user.email! },
            data: { lastLoginAt: new Date() },
          });
        } catch (error) {
          console.error('Error updating last login for OAuth user:', error);
        }
      }
      return true;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        // Fetch fresh user data from database
        const user = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            monthlyStoriesUsed: true,
            monthlyStoriesLimit: true,
          },
        });
        
        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionStatus: user.subscriptionStatus,
            monthlyStoriesUsed: user.monthlyStoriesUsed,
            monthlyStoriesLimit: user.monthlyStoriesLimit,
          };
        }
      }
      return session;
    },
    
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email);
      // You can add additional logic here like sending welcome emails
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};