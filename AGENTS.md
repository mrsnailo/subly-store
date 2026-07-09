<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Debugging Notes

## Vercel Blob images show as black/broken

If uploaded logos or favicons appear black or broken on Vercel deployment (but work locally), the root cause is likely the **Content Security Policy** blocking Vercel Blob URLs.

Check the `img-src` directive in `next.config.ts`. It must include `https://*.public.blob.vercel-storage.com`:

```ts
"img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
```

Without this, the browser silently blocks images hosted on Vercel Blob even though the upload succeeds and the URL is correctly stored in the database. The `Logo` component's `onError` fallback will trigger, showing the store name instead of the image.

To verify: curl the page and check the `Content-Security-Policy` response header for `img-src`.
