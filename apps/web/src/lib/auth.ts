import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, updateUserLastLogin } from './database';

export const authOptions: NextAuthOptions = {
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
          throw new Error('Invalid credentials');
        }

        const user = await getUserByEmail(credentials.email);
        
        if (!user || !user.password) {
          throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Update last login
        await updateUserLastLogin(user.id);

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
    })
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if user exists, if not create
        const existingUser = await getUserByEmail(user.email!);
        
        if (!existingUser) {
          await createUser({
            email: user.email!,
            name: user.name || '',
            provider: 'google',
            emailVerified: true,
          });
        } else {
          await updateUserLastLogin(existingUser.id);
        }
      }
      return true;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string || token.sub!;
        session.user.subscriptionPlan = token.subscriptionPlan as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await getUserByEmail(user.email!);
        if (dbUser) {
          token.id = dbUser.id; // Store the actual database user ID
          token.subscriptionPlan = dbUser.subscriptionPlan;
          token.subscriptionStatus = dbUser.subscriptionStatus;
        }
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
};