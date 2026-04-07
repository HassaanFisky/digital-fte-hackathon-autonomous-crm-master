/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app",
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
