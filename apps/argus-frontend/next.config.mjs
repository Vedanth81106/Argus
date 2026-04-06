/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Fallback to localhost if the env var isn't set (for local dev outside Docker)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://spring:8080';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;