import type { Config } from "tailwindcss";

export default {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		fontFamily: {
			sans: "var(--font-geist-sans)",
			serif: "var(--font-geist-mono)",
		},
		extend: {
			colors: {
				lime: {
					50: "#FFFAE0",
					100: "#FFF5C1",
					200: "#FEEDA3",
					300: "#FEE684",
					400: "#FEDF66",
					500: "#FEF27A",
					600: "#E5D766",
					700: "#CCBC51",
					800: "#B3A13D",
					900: "#998629",
					950: "7F7320",
				},
			},
		},
	},
	plugins: [],
} satisfies Config;
