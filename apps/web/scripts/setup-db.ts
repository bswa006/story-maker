#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🚀 Book Generator Database Setup\n');

  // Check if .env.local exists
  const envPath = join(process.cwd(), '.env.local');
  const envExamplePath = join(process.cwd(), '.env.example');
  
  if (!existsSync(envPath)) {
    console.log('📝 Creating .env.local from .env.example...');
    const envContent = readFileSync(envExamplePath, 'utf-8');
    writeFileSync(envPath, envContent);
  }

  // Check if DATABASE_URL is set
  const envContent = readFileSync(envPath, 'utf-8');
  const hasDatabase = envContent.includes('DATABASE_URL') && !envContent.includes('DATABASE_URL=postgresql://username:password');

  if (!hasDatabase) {
    console.log('\n⚠️  No database configured. You have two options:\n');
    console.log('1. Use PostgreSQL (recommended for production)');
    console.log('2. Continue with in-memory database (development only)\n');

    const choice = await question('Enter your choice (1 or 2): ');

    if (choice === '1') {
      console.log('\n📚 PostgreSQL Setup Instructions:\n');
      console.log('1. Install PostgreSQL if not already installed:');
      console.log('   - Mac: brew install postgresql');
      console.log('   - Ubuntu: sudo apt-get install postgresql');
      console.log('   - Windows: Download from https://www.postgresql.org/download/\n');
      
      console.log('2. Create a database:');
      console.log('   createdb book_generator\n');
      
      console.log('3. Update your .env.local with:');
      console.log('   DATABASE_URL="postgresql://username:password@localhost:5432/book_generator"\n');
      
      const setupNow = await question('Would you like to set up the database URL now? (y/n): ');
      
      if (setupNow.toLowerCase() === 'y') {
        const dbHost = await question('Database host (default: localhost): ') || 'localhost';
        const dbPort = await question('Database port (default: 5432): ') || '5432';
        const dbName = await question('Database name (default: book_generator): ') || 'book_generator';
        const dbUser = await question('Database username: ');
        const dbPass = await question('Database password: ');
        
        const databaseUrl = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
        
        // Update .env.local
        let newEnvContent = envContent;
        if (envContent.includes('DATABASE_URL=')) {
          newEnvContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${databaseUrl}"`);
        } else {
          newEnvContent += `\n# Database\nDATABASE_URL="${databaseUrl}"\n`;
        }
        
        writeFileSync(envPath, newEnvContent);
        console.log('\n✅ Database URL configured!');
        
        // Run Prisma migrations
        console.log('\n🔄 Running database migrations...');
        try {
          execSync('npx prisma generate', { stdio: 'inherit' });
          execSync('npx prisma db push', { stdio: 'inherit' });
          console.log('✅ Database migrations completed!');
        } catch (error) {
          console.error('❌ Migration failed:', error);
          console.log('\nYou can run migrations manually later with:');
          console.log('  npx prisma generate');
          console.log('  npx prisma db push');
        }
      }
    } else {
      console.log('\n✅ Continuing with in-memory database.');
      console.log('⚠️  Note: Data will be lost when the server restarts.\n');
    }
  } else {
    console.log('✅ Database already configured.');
    
    // Check if we need to run migrations
    const runMigrations = await question('\nRun database migrations? (y/n): ');
    
    if (runMigrations.toLowerCase() === 'y') {
      console.log('\n🔄 Running database migrations...');
      try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ Database migrations completed!');
      } catch (error) {
        console.error('❌ Migration failed:', error);
      }
    }
  }

  // Create test user
  const createTestUser = await question('\nCreate a test user? (y/n): ');
  
  if (createTestUser.toLowerCase() === 'y') {
    console.log('\n📝 Creating test user...');
    try {
      const setupScript = `
        import { prisma } from '../src/lib/prisma';
        import bcrypt from 'bcryptjs';
        
        async function createTestUser() {
          const hashedPassword = await bcrypt.hash('password123', 10);
          
          const user = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
              email: 'test@example.com',
              name: 'Test User',
              password: hashedPassword,
              emailVerified: new Date(),
            },
          });
          
          console.log('✅ Test user created:', user.email);
          process.exit(0);
        }
        
        createTestUser().catch(console.error);
      `;
      
      writeFileSync('setup-test-user.ts', setupScript);
      execSync('npx tsx setup-test-user.ts', { stdio: 'inherit' });
      execSync('rm setup-test-user.ts');
    } catch (error) {
      console.log('⚠️  Could not create test user. You can create one manually later.');
    }
  }

  console.log('\n🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Add your OpenAI API key to .env.local');
  console.log('2. Run: npm run dev');
  console.log('3. Visit: http://localhost:3000\n');

  rl.close();
}

main().catch(console.error);