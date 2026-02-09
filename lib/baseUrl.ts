export function getBaseUrl() {
  // Vercel provides this automatically
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Custom domain (if you set it later)
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  // Local fallback
  return "http://127.0.0.1:3000";
}

