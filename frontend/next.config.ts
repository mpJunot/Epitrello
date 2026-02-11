import type { NextConfig } from "next";

// Allow images from API host when uploads are served by backend (no GCS)
function getApiImagePatterns(): { protocol: 'http' | 'https'; hostname: string; pathname: string }[] {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl?.trim()) return [];
  try {
    const u = new URL(apiUrl.trim());
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return [];
    return [
      { protocol: u.protocol === 'https:' ? 'https' : 'http', hostname: u.hostname, pathname: '/**' },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      ...getApiImagePatterns(),
    ],
  },
};

export default nextConfig;
