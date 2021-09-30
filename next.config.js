const basePath = '';

module.exports = {
  serverRuntimeConfig: {
    rootDir: __dirname,
  },
  webpack: (config, options) => {
    config.resolve.fallback = {
      fs: false,
      path: require.resolve('path-browserify'),
    };
    return config;
  },
  basePath,
  devIndicators: {
    autoPrerender: false,
  },
  trailingSlash: false,
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};
