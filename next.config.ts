const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config: any) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.join(__dirname, 'components'),
      '@data': path.join(__dirname, 'data'),
      '@styles': path.join(__dirname, 'styles')
    };
    return config;
  }
};
module.exports = nextConfig;