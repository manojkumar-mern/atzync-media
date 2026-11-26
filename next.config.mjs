/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['10.65.158.16', '10.*.*.*', '192.168.*.*'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
};

export default nextConfig;
