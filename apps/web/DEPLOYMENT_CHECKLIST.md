# Deployment Checklist

## Pre-Deployment (Local)

- [ ] Test the app locally with `npm run dev`
- [ ] Run `npm run build` to ensure no build errors
- [ ] Run `npm run lint` to check for linting issues
- [ ] Ensure all environment variables are in `.env.local`

## Neon Database Setup

- [ ] Create account at https://neon.tech
- [ ] Create new project named "book-generator"
- [ ] Copy the connection string
- [ ] Add `DATABASE_URL` to `.env.local`
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:push`
- [ ] Run `npm run db:seed` (optional, creates demo user)

## GitHub

- [ ] Create a new repository (if not already done)
- [ ] Push your code:
  ```bash
  git add .
  git commit -m "Initial commit"
  git push origin main
  ```

## Vercel Deployment

- [ ] Go to https://vercel.com
- [ ] Click "Add New Project"
- [ ] Import your GitHub repository
- [ ] Configure:
  - Root Directory: `apps/web`
  - Framework Preset: Next.js
  - Node.js Version: 22.x
- [ ] Add Environment Variables:
  ```
  DATABASE_URL = [Neon connection string]
  NEXTAUTH_URL = https://[your-project].vercel.app
  NEXTAUTH_SECRET = P0BezJPpQIy3XqpZ93hhoMyEiWGP9VvQlaFjBv/2m90=
  OPENAI_API_KEY = [Your OpenAI key]
  REPLICATE_API_TOKEN = [Your Replicate token]
  ANTHROPIC_API_KEY = [Your Anthropic key]
  RAZORPAY_KEY_ID = [Your Razorpay key]
  RAZORPAY_KEY_SECRET = [Your Razorpay secret]
  ```
- [ ] Click "Deploy"

## Post-Deployment

- [ ] Visit your deployed URL
- [ ] Create a test account
- [ ] Generate a test story
- [ ] Check Vercel logs for any errors
- [ ] Update `NEXTAUTH_URL` if using custom domain

## Optional Setup

- [ ] Configure custom domain in Vercel
- [ ] Set up Google OAuth:
  - Create project in Google Cloud Console
  - Add OAuth credentials
  - Update redirect URLs
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)

## Production Checklist

- [ ] Remove all console.log statements
- [ ] Ensure API keys are production keys (not test)
- [ ] Enable rate limiting
- [ ] Set up database backups in Neon
- [ ] Configure webhook endpoints (if using)
- [ ] Test payment flow with live keys

## Monitoring

- [ ] Check Vercel dashboard for performance
- [ ] Monitor Neon dashboard for database usage
- [ ] Track OpenAI API usage and costs
- [ ] Set up alerts for errors

## Documentation

- [ ] Update README with production URL
- [ ] Document any custom configurations
- [ ] Create user guide if needed

Ready to go live! 🚀