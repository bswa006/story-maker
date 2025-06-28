# Test Mode Guide

## Overview
Test Mode allows you to bypass subscription limits during development and testing. When enabled, you can generate unlimited stories without incrementing usage counters.

## How to Enable Test Mode

1. Open `.env.local` file
2. Ensure `TEST_MODE=true` is set
3. Restart the development server

## What Test Mode Does

- ✅ Bypasses monthly story generation limits
- ✅ Allows unlimited story creation
- ✅ Skips usage increment tracking
- ✅ Logs "TEST MODE" messages in console for visibility

## Important Notes

- ⚠️ Only use for development/testing purposes
- ⚠️ Do NOT enable in production environments
- ⚠️ Remember to set `TEST_MODE=false` or remove it before deploying

## Testing Story Generation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/demo or http://localhost:3001/demo

3. Sign in with any account

4. Generate stories without worrying about limits

## Console Output

When Test Mode is active, you'll see these messages:
- `TEST MODE: Bypassing subscription limits`
- `TEST MODE: Skipping usage increment`

## Disabling Test Mode

To return to normal subscription behavior:
1. Set `TEST_MODE=false` in `.env.local` or remove the line entirely
2. Restart the development server

## Production Deployment

Before deploying to production:
1. Remove or set `TEST_MODE=false` in your environment variables
2. Ensure production environment doesn't have TEST_MODE set
3. Test that subscription limits work correctly