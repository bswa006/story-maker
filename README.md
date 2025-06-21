# If I Were an Animal - Children's Storybook Generator

A personalized children's storybook generator that creates magical stories with AI-generated illustrations featuring the child in the story.

## Features

- Upload child's photo for personalization
- Generate 10-page storybook with 8 different animals
- Studio Ghibli-style AI illustrations
- Each page teaches a valuable life lesson
- Export as PDF or digital format

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript 5.5
- **Styling**: Tailwind CSS, Shadcn/ui
- **Architecture**: Turborepo monorepo
- **Image Generation**: AI API integration (to be implemented)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
/apps
  /web          # Next.js application
/packages
  /ui           # Shared UI components
  /tsconfig     # Shared TypeScript configs
  /eslint-config # Shared ESLint configs
```

## Life Lessons

Each animal teaches a unique lesson:
- Bird → Perspective/Imagination
- Lion → Courage
- Turtle → Patience
- Monkey → Joy/Fun
- Ant → Teamwork/Strength
- Butterfly → Change/Self-Discovery
- Dog → Loyalty/Love
- Fish → Curiosity/Exploration

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp apps/web/.env.example apps/web/.env.local
```

For AI image generation, choose one of:
- **Replicate** (Recommended): Get API token from https://replicate.com
- **OpenAI DALL-E**: Get API key from https://openai.com
- **Stable Diffusion**: Various providers available

### 2. Development Mode

The app works in development mode without AI API keys, using placeholder images.

## Features Implemented

✅ **Core Functionality**
- Photo upload with drag-and-drop
- Story generation with 8 animals
- Page-by-page story viewer
- PDF export functionality

✅ **API Integration**
- Image upload endpoint
- AI image generation (Replicate/placeholder)
- Storybook creation API

✅ **User Experience**
- Loading states and progress indicators
- Toast notifications
- Responsive design
- Beautiful Ghibli-inspired UI

## Architecture

- **Frontend**: Next.js 14 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **API Routes**: Next.js API routes for backend logic
- **Image Generation**: Modular AI provider system
- **PDF Export**: Client-side PDF generation with jsPDF

## Production Deployment

1. Set up environment variables in your hosting platform
2. Configure image storage (local/S3/Cloudinary)
3. Add rate limiting for AI API calls
4. Implement caching for generated images
5. Add user authentication if needed