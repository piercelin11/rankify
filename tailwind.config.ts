import type { Config } from "tailwindcss";
import { PluginAPI } from "tailwindcss/types/config";

export default {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		fontFamily: {
			sans: "var(--font-poppins)",
			serif: "var(--font-geist-mono)",
			numeric: "var(--font-lato)",
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
					950: "#7F7320",
				},
				zinc: {
					650: "#48484F",
					750: "#2F2F37",
					800: "#25252A",
					850: "#1C1C20",
					900: "#161619",
				},
				spotify: "#1ed760",
			},
		},
	},
	plugins: [
		function ({ addUtilities }: PluginAPI) {
			addUtilities({
				".scrollbar-hidden": {
					"-ms-overflow-style": "none", // IE & Edge
					"scrollbar-width": "none", // Firefox
				},
				".scrollbar-hidden::-webkit-scrollbar": {
					display: "none", // Chrome, Safari, Edge
				},
				".scrollbar-visible": {
					"-ms-overflow-style": "auto",
					"scrollbar-width": "auto",
				},
			});
		},
	],
} satisfies Config;
