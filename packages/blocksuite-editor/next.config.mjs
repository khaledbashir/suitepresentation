/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@blocksuite/blocks',
    '@blocksuite/presets', 
    '@blocksuite/store',
    '@blocksuite/global'
  ],
};

export default nextConfig;
