# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered children's storybook generator creating personalized "If I Were an Animal..." stories with Studio Ghibli-style illustrations featuring the actual child.

## Development Commands

### Setup & Install
```bash
# Install dependencies (requires Node.js >= 22.0.0)
npm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local

# Add API keys to .env.local:
# - OPENAI_API_KEY (required for AI features)
# - REPLICATE_API_TOKEN (optional for alternative image generation)
# - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET (for payments)
```

### Development
```bash
# Start development server (http://localhost:3002)
npm run dev

# Run linting
npm run lint

# Run TypeScript type checking
npm run type-check

# Build for production
npm run build

# Format code
npm run format
```

### Testing Features
```bash
# Test AI features at /demo
# 1. Click "AI Generator" in sidebar
# 2. Upload child photo
# 3. Select interests and learning goals
# 4. Generate custom template with AI
# 5. Watch real-time AI story generation

# Test Mode - Bypass subscription limits
# Set TEST_MODE=true in .env.local to:
# - Allow unlimited story generation
# - Skip usage tracking
# - Bypass monthly limits
# Note: Only use for development/testing
```

## High-Level Architecture

### Monorepo Structure (Turborepo)
```
/apps/web/              # Next.js 15 web application
  src/
    app/                # App Router pages
      api/              # API routes (ai/, payment/, stories/)
      demo/             # Demo page with all features
    components/
      ai/               # AI-powered components
      story/            # Story generation & viewing
      b2b/              # Business/educational features
    lib/database/       # PostgreSQL schema & queries
    services/           # External service integrations
    
/packages/              # Shared packages
  ui/                   # Shadcn UI components
  tsconfig/             # Shared TypeScript configs
  eslint-config/        # Shared ESLint rules
```

### Core Tech Stack
- **Frontend**: Next.js 15.3.4, React 19, TypeScript 5.5
- **Styling**: Tailwind CSS + Shadcn/ui components
- **AI**: OpenAI (GPT-4, DALL-E 3), Google Gemini, Anthropic Claude, Replicate
- **Payments**: Razorpay integration
- **Export**: PDF generation with jsPDF

### Key AI Integration Points

1. **Story Generation** (`/api/ai/generate-story`)
   - GPT-4 for personalized content
   - Template-based prompt engineering
   - Cost optimization with configurable modes

2. **Image Generation** (`/api/ai/generate-image`)
   - DALL-E 3 for Studio Ghibli-style illustrations
   - Child photo integration
   - Testing mode (2 images) vs Production (10 images)

3. **Template Recommendations** (`/api/ai/recommend-templates`)
   - AI-powered template suggestions based on child profile
   - Custom template generation

### Cost Optimization Strategy
- **Testing Mode**: ~$0.081/story (90% cost reduction)
- **Production Mode**: ~$0.801/story
- **Optimization Techniques**:
  - Limit to 2 images in testing
  - Use standard quality DALL-E 3
  - Smart caching strategies
  - Real-time cost tracking

## Coding Standards (JavaScript Engineering Bible)

### Strict Limits
- **File max**: 300 lines of code
- **Function max**: 40 lines of code  
- **Component max**: 200 lines of code

### TypeScript Requirements
- Strict mode enabled
- Use `&apos;` for apostrophes in JSX
- Prefer `undefined` over `null`
- Use `Record<string, unknown>` instead of `any`
- Always use optional chaining for API responses

### React/Next.js Patterns
- Functional components only
- Server Components by default, Client Components for interactivity
- Custom hooks prefixed with `use`
- Colocation: keep related files together
- Error boundaries at route level

### Build Process
- Always run `npm run build` before committing
- Fix TypeScript errors systematically
- Ensure all lint rules pass

## API Endpoints

### Story Management
- `POST /api/stories/generate` - Generate AI story
- `GET /api/stories` - List user stories
- `POST /api/stories/:id/regenerate` - Regenerate pages

### AI Services
- `POST /api/ai/generate-story` - GPT-4 story content
- `POST /api/ai/generate-image` - DALL-E 3 illustrations
- `POST /api/ai/analyze-photo` - GPT-4 Vision photo analysis
- `POST /api/ai/recommend-templates` - Template suggestions

### Payment & Subscription
- `POST /api/payment/create-order` - Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/subscription/plans` - Available plans

## Environment Variables

Critical for AI features:
```bash
# Required for core functionality
OPENAI_API_KEY=sk-...

# Optional AI providers
REPLICATE_API_TOKEN=...
GOOGLE_AI_API_KEY=...
ANTHROPIC_API_KEY=...

# Payment processing
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Database (if using)
DATABASE_URL=postgresql://...
```

## Feature Implementation Status

✅ **Completed**:
- AI story generation with GPT-4
- AI image generation with DALL-E 3
- Photo upload and processing
- Template selection system
- Page-by-page story viewer
- PDF export functionality
- Razorpay payment integration
- Cost optimization (90% reduction)
- B2B educational dashboards

🚧 **In Progress**:
- User authentication system
- Database persistence
- Email notifications
- Analytics tracking

## Important Files

- `/IMPLEMENTATION_CHECKLIST.md` - Complete feature roadmap
- `/apps/web/src/data/story-templates.ts` - Story template definitions
- `/apps/web/src/config/subscription-plans.ts` - Pricing tiers
- `/apps/web/src/components/story/enhanced-story-generator.tsx` - Main AI generator
- `/apps/web/src/app/demo/page.tsx` - Full demo implementation

## Testing Approach

Currently no test framework is configured. When implementing tests:
1. Use Vitest for unit tests (90% coverage target)
2. React Testing Library for components
3. Playwright for E2E tests
4. Run tests with `npm run test`

## Common Development Tasks

### Adding a New Story Template
1. Add template to `/apps/web/src/data/story-templates.ts`
2. Include category, learning objectives, and AI prompts
3. Test with AI generator at `/demo`

### Modifying AI Prompts
1. Update prompts in API routes under `/apps/web/src/app/api/ai/`
2. Test cost implications in testing mode first
3. Monitor generation quality and adjust

### Implementing New Features
1. Follow folder-by-feature structure
2. Keep components under 200 LOC
3. Use Server Components where possible
4. Add proper TypeScript types
5. Test in `/demo` page first