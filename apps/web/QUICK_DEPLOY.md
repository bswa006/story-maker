# Quick Deployment Steps

Follow these steps to deploy your Book Generator app:

## Step 1: Create Neon Database (5 minutes)

1. **Sign up at Neon**
   - Go to https://neon.tech
   - Click "Sign up" (free, no credit card)
   - Verify your email

2. **Create a database**
   - Click "Create a project"
   - Name: `book-generator`
   - Database name: `book_generator_db`
   - Region: Choose closest to you
   - Click "Create project"

3. **Copy connection string**
   - You'll see a connection string like:
   ```
   postgresql://[username]:[password]@[endpoint]/book_generator_db?sslmode=require
   ```
   - Copy this entire string

## Step 2: Update Your .env.local

1. Open `.env.local` in your code editor
2. Find the line that says:
   ```
   # DATABASE_URL="postgresql://username:password@ep-xyz.region.aws.neon.tech/book_generator_db?sslmode=require"
   ```
3. Remove the `#` and replace with your actual connection string:
   ```
   DATABASE_URL="your-neon-connection-string-here"
   ```

## Step 3: Set Up Database

Run these commands in your terminal:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Run setup script
npm run setup
```

## Step 4: Test Locally

```bash
# Start the server
npm run dev

# Visit http://localhost:3000
# Create an account and test story generation
```

## Step 5: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `apps/web` directory as root
   - Click "Deploy"

3. **Add Environment Variables**
   - After deployment, go to Settings → Environment Variables
   - Add these variables:
   
   ```
   DATABASE_URL = [your-neon-connection-string]
   NEXTAUTH_URL = https://[your-project].vercel.app
   NEXTAUTH_SECRET = P0BezJPpQIy3XqpZ93hhoMyEiWGP9VvQlaFjBv/2m90=
   OPENAI_API_KEY = [your-openai-key]
   ```

### Option B: Using CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then add env vars:
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add OPENAI_API_KEY

# Deploy to production
vercel --prod
```

## Step 6: Update Production URL

After deployment, update your Vercel environment variables:
- `NEXTAUTH_URL` should be your actual Vercel URL (e.g., `https://book-generator.vercel.app`)

## Troubleshooting

### Database Connection Failed
- Make sure DATABASE_URL is correctly copied
- Ensure there are no extra spaces or quotes
- Check if Neon project is active

### Build Failed on Vercel
- Set root directory to `apps/web` in Vercel settings
- Ensure all environment variables are added
- Check build logs for specific errors

### Authentication Not Working
- Verify NEXTAUTH_URL matches your deployment URL
- Ensure NEXTAUTH_SECRET is set correctly
- For custom domains, update NEXTAUTH_URL

## What's Next?

1. **Custom Domain**: Add your domain in Vercel settings
2. **Google OAuth**: Set up Google sign-in (optional)
3. **Monitoring**: Check Vercel Analytics and Neon dashboard
4. **Backups**: Enable automatic backups in Neon

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs

Your app should now be live! 🎉