/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.50.121",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
