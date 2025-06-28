import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, getUserByEmail } from '@/lib/database';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  let userById = null;
  let userByEmail = null;
  
  if (session?.user?.id) {
    userById = await getUserById(session.user.id);
  }
  
  if (session?.user?.email) {
    userByEmail = await getUserByEmail(session.user.email);
  }
  
  // Get all users in database
  const { getAllUsers } = await import('@/lib/database');
  const allUsers = await getAllUsers();
  
  return NextResponse.json({
    session,
    userById,
    userByEmail,
    allUsersInDb: allUsers,
  });
}