# How to Enable PostgreSQL Database

## Current Status
You're using an **in-memory database**. Users are stored temporarily and lost on server restart.

## Quick Setup (5 minutes)

### 1. Create Free PostgreSQL Database on Neon

1. Go to https://neon.tech
2. Sign up (free, no credit card)
3. Create a new project:
   - Name: `book-generator`
   - Database: `book_generator_db`
4. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xyz.region.aws.neon.tech/book_generator_db?sslmode=require
   ```

### 2. Enable Database in Your App

1. Open `.env.local`
2. Find this line:
   ```
   # DATABASE_URL="postgresql://username:password@ep-xyz.region.aws.neon.tech/book_generator_db?sslmode=require"
   ```
3. Remove the `#` and replace with your actual connection string:
   ```
   DATABASE_URL="your-actual-neon-connection-string-here"
   ```

### 3. Set Up Database Tables

Run these commands:
```bash
# Generate Prisma client
npm run db:generate

# Create tables in database
npm run db:push

# Optional: Seed with demo data
npm run db:seed
```

### 4. Restart Your Server

```bash
npm run dev
```

## How to Verify It's Working

1. Check console output - you should see:
   ```
   🗄️  Using PostgreSQL (Prisma) database
   ```

2. Create a user account
3. Restart the server (`Ctrl+C` then `npm run dev`)
4. Try logging in - if the user still exists, database is working!

## Database Management

- View your data: `npm run db:studio` (opens Prisma Studio)
- View in Neon: Go to your Neon dashboard

## Switching Back to In-Memory

Just comment out the DATABASE_URL line again:
```
# DATABASE_URL="..."
```

## Benefits of Real Database

✅ Users persist between restarts
✅ Stories are saved permanently  
✅ Can deploy to production
✅ Multiple users can use simultaneously
✅ Backup and restore capabilities

## Current In-Memory Limitations

❌ Data lost on restart
❌ Can't deploy to production
❌ Single server instance only
❌ No data backup