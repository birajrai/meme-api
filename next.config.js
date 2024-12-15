/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['i.redd.it', 'external-preview.redd.it', 'preview.redd.it'],
    },
};

module.exports = nextConfig;
