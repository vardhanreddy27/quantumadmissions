/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://cdn.1millionresume.com/**"),
      new URL("https://blogger.googleusercontent.com/**"),
      new URL("https://imgv2-2-f.scribdassets.com/**"),
      new URL("https://i.pinimg.com/**"),
      new URL("https://static.vecteezy.com/**"),
      new URL("https://illustrations.miraheze.org/**"),
    ],
  },
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
