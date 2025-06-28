// Database abstraction layer that switches between Prisma and in-memory based on environment

const isPrismaEnabled = !!(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0);

// Import the appropriate module based on environment
import * as prismaQueries from './prisma-queries';
import * as memoryQueries from './queries';

// Select the appropriate implementation
const db = isPrismaEnabled ? prismaQueries : memoryQueries;

// Export all database functions
export const {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserLastLogin,
  getAllUsers,
  canUserGenerateStory,
  incrementUserStoriesUsed,
  resetMonthlyUsage,
  updateUserSubscription,
  createStory,
  getUserStories,
  getStoryById,
  updateStoryImages,
  createPayment,
  updatePaymentStatus,
  getPaymentByOrderId,
  checkAndResetMonthlyUsage,
} = db;

// Log which database is being used
if (typeof window === 'undefined') {
  console.log(`🗄️  Using ${isPrismaEnabled ? 'PostgreSQL (Prisma)' : 'In-Memory'} database`);
}