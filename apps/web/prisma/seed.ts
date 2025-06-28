import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
      emailVerified: new Date(),
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      monthlyStoriesLimit: 1,
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create a test story for the demo user
  const testStory = await prisma.story.upsert({
    where: { 
      id: 'demo-story-1' 
    },
    update: {},
    create: {
      id: 'demo-story-1',
      userId: demoUser.id,
      title: 'The Magical Adventure',
      childName: 'Alex',
      childAge: '5-7',
      theme: {
        id: 'adventure',
        name: 'Adventure',
        category: 'fantasy',
        imageStyle: 'Whimsical illustrations'
      },
      pages: [
        {
          pageNumber: 1,
          text: 'Once upon a time, Alex discovered a magical door...',
          imagePrompt: 'A child discovering a glowing magical door',
        },
        {
          pageNumber: 2,
          text: 'Behind the door was a world full of wonders...',
          imagePrompt: 'A magical world with floating islands and rainbows',
        }
      ],
      imagesGenerated: false,
    },
  });

  console.log('✅ Created test story:', testStory.title);

  // Log summary
  const userCount = await prisma.user.count();
  const storyCount = await prisma.story.count();
  
  console.log(`
🎉 Seed completed!
- Users: ${userCount}
- Stories: ${storyCount}

Demo credentials:
- Email: demo@example.com
- Password: demo123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });