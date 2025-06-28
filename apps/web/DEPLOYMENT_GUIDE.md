# Step-by-Step Deployment Guide

This guide will walk you through deploying the Book Generator application to production.

## 1. Set Up Neon PostgreSQL Database

### Create a Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account (no credit card required)
3. Click "Create a project"

### Create Your Database
1. **Project Name**: `book-generator` (or your preferred name)
2. **Database Name**: `book_generator_db`
3. **Region**: Choose closest to your users
4. Click "Create project"

### Get Your Connection String
1. In the Neon dashboard, go to "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xyz.region.aws.neon.tech/book_generator_db?sslmode=require
   ```

## 2. Configure Local Environment

### Update .env.local
```bash
# Database (paste your Neon connection string)
DATABASE_URL="postgresql://username:password@ep-xyz.region.aws.neon.tech/book_generator_db?sslmode=require"

# NextAuth (for local testing)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl"

# Generate NEXTAUTH_SECRET with:
# openssl rand -base64 32
```

### Other Required Environment Variables
Make sure you have these configured:
```bash
# AI Service (required)
OPENAI_API_KEY="sk-..."

# Payment (if using payments)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 3. Run Database Setup

### Install dependencies and generate Prisma client
```bash
npm install
npm run db:generate
```

### Push schema to Neon database
```bash
npm run db:push
```

### Run the setup script
```bash
npm run setup
```

This will:
- Verify database connection
- Run migrations
- Optionally create a test user

## 4. Test Locally

### Start the development server
```bash
npm run dev
```

### Test the application
1. Go to http://localhost:3000
2. Sign up for a new account
3. Try generating a story

## 5. Deploy to Vercel

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy
```bash
vercel
```

Follow the prompts:
1. Set up and deploy: Yes
2. Which scope: Your account
3. Link to existing project: No
4. Project name: book-generator (or your choice)
5. Directory: ./
6. Override settings: No

### Configure Environment Variables on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add the following variables:

```bash
# Database
DATABASE_URL="your-neon-connection-string"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-generated-secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# Razorpay (if using)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."

# Google OAuth (if using)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Deploy to Production
```bash
vercel --prod
```

## 6. Post-Deployment Setup

### Update OAuth Redirect URLs

If using Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Edit your OAuth client
5. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/callback/google`

### Set Up Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update NEXTAUTH_URL to your custom domain

### Monitor Your Application

1. **Vercel Analytics**: Built-in performance monitoring
2. **Neon Dashboard**: Monitor database usage
3. **OpenAI Dashboard**: Track API usage and costs

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly set in Vercel
- Check if SSL is required (add `?sslmode=require`)
- Verify Neon project is active

### Authentication Issues
- Ensure NEXTAUTH_URL matches your deployment URL
- Regenerate NEXTAUTH_SECRET if needed
- Check OAuth redirect URLs are configured

### Build Failures
- Run `npm run build` locally first
- Check for TypeScript errors: `npm run type-check`
- Ensure all environment variables are set

## Security Checklist

- [ ] Strong NEXTAUTH_SECRET generated
- [ ] Database connection uses SSL
- [ ] API keys are kept secret
- [ ] OAuth redirect URLs are restricted
- [ ] Rate limiting is enabled
- [ ] Error messages don't leak sensitive info

## Next Steps

1. Set up monitoring and alerts
2. Configure backups in Neon
3. Set up a staging environment
4. Implement CI/CD with GitHub Actions

Congratulations! Your Book Generator is now live! 🎉