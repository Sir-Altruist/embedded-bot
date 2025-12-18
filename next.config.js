/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // Allow embedding the chat page
      {
        source: '/embed/chat',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // Allow loading the embed script from anywhere
      {
        source: '/embed/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;