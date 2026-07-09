---
name: deploy
description: Deploy the Subly Store to Vercel production. Use when the user says "deploy", "release", "ship", "push to production", or "pull and deploy". Runs git pull from origin main, builds, and deploys prebuilt to Vercel production.
---

# Deploy to Vercel

Run these three commands sequentially:

```bash
git pull origin main
vercel build --prod
vercel deploy --prebuilt --prod
```
