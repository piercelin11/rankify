import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	images: {
		qualities: [25, 50, 75],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.scdn.co",
				port: "",
				pathname: "/image/**",
			},
			{
				protocol: "https",
				hostname: "**.googleusercontent.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "rankify-avatar.s3.ap-southeast-2.amazonaws.com",
				port: "",
				pathname: "/avatars/**",
			},
		],
	},
};

export default nextConfig;
