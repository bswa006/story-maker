import bcrypt from 'bcryptjs';
import { createUser } from './queries';

export async function initTestData() {
  try {
    // Check if test user already exists
    const { getUserByEmail } = await import('./queries');
    const existingUser = await getUserByEmail('test@example.com');
    
    if (!existingUser) {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await createUser({
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        provider: 'credentials',
        emailVerified: true,
      });
      console.log('Test user created: test@example.com / password123');
    }
  } catch (error) {
    console.error('Failed to initialize test data:', error);
  }
}