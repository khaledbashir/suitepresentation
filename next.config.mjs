/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['@blocksuite/store', '@blocksuite/blocks', '@blocksuite/presets'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '__REDUX_DEVTOOLS_EXTENSION__': false,
      };
    }

    // Exclude BlockSuite from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@blocksuite/blocks': '@blocksuite/blocks',
        '@blocksuite/presets': '@blocksuite/presets',
        '@blocksuite/store': '@blocksuite/store',
      });
    }

    return config;
  },
};

export default nextConfig;
