# Production Setup Guide

This guide will help you set up the Book Generator application for production use with a real PostgreSQL database.

## Prerequisites

- Node.js 22.0.0 or higher
- PostgreSQL 13 or higher (or a PostgreSQL-compatible service)
- A domain name (for production deployment)
- SSL certificate (for HTTPS)

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL:
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows
   # Download installer from https://www.postgresql.org/download/windows/
   ```

2. Create database:
   ```bash
   createdb book_generator
   ```

3. Run the setup script:
   ```bash
   npm run setup
   ```

### Option 2: Cloud Database Services

#### Neon (Recommended for Vercel)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env.local`:
   ```
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

#### Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Add to `.env.local`

#### Railway
1. Sign up at [railway.app](https://railway.app)
2. Create new PostgreSQL service
3. Copy DATABASE_URL from service variables
4. Add to `.env.local`

## Environment Variables

Create a `.env.local` file with all required variables:

```bash
# Database (Required for production)
DATABASE_URL="postgresql://username:password@localhost:5432/book_generator"

# Authentication (Required)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth (Optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services (Required)
OPENAI_API_KEY="sk-..."

# Additional AI Services (Optional)
REPLICATE_API_TOKEN="..."
GOOGLE_AI_API_KEY="..."
ANTHROPIC_API_KEY="..."

# Payment Gateway (Required for subscriptions)
RAZORPAY_KEY_ID="rzp_..."
RAZORPAY_KEY_SECRET="..."

# Email Service (Optional)
RESEND_API_KEY="..."
```

## Database Migrations

1. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

2. Push schema to database:
   ```bash
   npm run db:push
   ```

3. For production migrations:
   ```bash
   npm run db:migrate
   ```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Add environment variables in Vercel dashboard

### Docker

1. Create `Dockerfile`:
   ```dockerfile
   FROM node:22-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:22-alpine
   WORKDIR /app
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/prisma ./prisma
   RUN npm ci --production
   RUN npx prisma generate

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. Build and run:
   ```bash
   docker build -t book-generator .
   docker run -p 3000:3000 --env-file .env.local book-generator
   ```

### Traditional VPS

1. Clone repository on server
2. Install dependencies:
   ```bash
   npm install
   npm run db:generate
   npm run db:push
   ```

3. Build application:
   ```bash
   npm run build
   ```

4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "book-generator" -- start
   pm2 save
   pm2 startup
   ```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate keys regularly

2. **Database**
   - Use SSL connections in production
   - Regular backups
   - Principle of least privilege for database users

3. **Authentication**
   - Enforce strong passwords
   - Enable 2FA for admin accounts
   - Regular session cleanup

4. **API Security**
   - Rate limiting (already implemented)
   - Input validation (Zod schemas)
   - CORS configuration

## Monitoring

1. **Application Monitoring**
   - Set up error tracking (Sentry)
   - Performance monitoring (Vercel Analytics)
   - Uptime monitoring (UptimeRobot)

2. **Database Monitoring**
   - Query performance
   - Connection pool usage
   - Storage growth

3. **Cost Monitoring**
   - OpenAI API usage
   - Database usage
   - Bandwidth usage

## Backup Strategy

1. **Database Backups**
   ```bash
   # Manual backup
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Restore
   psql $DATABASE_URL < backup_file.sql
   ```

2. **Automated Backups**
   - Use database service's built-in backups
   - Schedule regular exports
   - Test restore procedures

## Scaling Considerations

1. **Database**
   - Connection pooling (PgBouncer)
   - Read replicas for heavy read operations
   - Indexes on frequently queried fields

2. **Application**
   - CDN for static assets
   - Image optimization and caching
   - Background job processing for heavy operations

3. **Caching**
   - Redis for session storage
   - CDN for generated images
   - API response caching

## Maintenance

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm update
   
   # Check for vulnerabilities
   npm audit
   
   # Update Prisma
   npm update @prisma/client prisma
   ```

2. **Database Maintenance**
   - Regular VACUUM operations
   - Index optimization
   - Query performance analysis

3. **Log Management**
   - Centralized logging
   - Log rotation
   - Error alerting

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review logs in production
3. Contact support with error details

Remember to always test changes in a staging environment before deploying to production!