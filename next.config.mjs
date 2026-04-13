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
  webpack: (config, { isServer }) => {
    // Enable WASM for WebLLM (required for its WASM/WGSL shader runtime)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    // Never bundle WebLLM on the server — it requires WebGPU (browser-only)
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mlc-ai/web-llm': false,
      };
    }
    return config;
  },
};

export default nextConfig;
