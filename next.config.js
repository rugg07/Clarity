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
  webpack: (/** @type {{ resolve: { fallback: any; alias: { '@': string; }; }; }} */ config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.resolve.alias = {
      '@': '/src',
    };
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      maxDuration: 60,
    },
    esmExternals: 'loose',
  },
  modularizeImports: {
    '@radix-ui/react-*': {
      transform: '@radix-ui/react-{{member}}',
    },
  }
};

export default config;