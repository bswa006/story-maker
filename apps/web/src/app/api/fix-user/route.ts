import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Check if user exists
  const existingUser = await getUserByEmail(session.user.email!);
  
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists', user: existingUser });
  }
  
  // Create the user with the session ID
  const hashedPassword = await bcrypt.hash('password123', 10);
  const newUser = await createUser({
    email: session.user.email!,
    name: session.user.name || '',
    password: hashedPassword,
    provider: 'credentials',
    emailVerified: true,
  });
  
  // Update the user ID to match the session
  const userMap = (global as any).__users as Map<string, any>;
  
  // Remove the auto-generated ID
  userMap.delete(newUser.id);
  
  // Set with the session ID
  newUser.id = session.user.id;
  userMap.set(session.user.id, newUser);
  
  return NextResponse.json({ 
    message: 'User created and fixed', 
    user: newUser,
    sessionId: session.user.id 
  });
}