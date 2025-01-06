// /**
//  * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
//  * for Docker builds.
//  */
// import "./src/env.js";

// /** @type {import("next").NextConfig} */
// const config = {
//     eslint: {
//         ignoreDuringBuilds: true,
//     },
//     typescript:{
//         ignoreBuildErrors: true,
//     }
// };

// export default config;
/** @type {import('next').NextConfig} */
import "./src/env.js";

const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@trpc/server", "@trpc/client"],
  webpack: (/** @type {{ resolve: { fallback: any; alias: any; }; }} */ config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/src',
    };
    return config;
  },
  // Additional settings for proper module resolution
  experimental: {
    esmExternals: 'loose',
  },
  // Ensure proper handling of external packages
  modularizeImports: {
    '@radix-ui/react-*': {
      transform: '@radix-ui/react-{{member}}',
    },
  }
};

export default config;