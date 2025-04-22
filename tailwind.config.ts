import type { Config } from "tailwindcss";
import { PluginAPI } from "tailwindcss/types/config";
import colors from "tailwindcss/colors";

export default {
	content: [
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/features/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.css",
	],
	theme: {
		fontFamily: {
			sans: "var(--font-poppins)",
			serif: "var(--font-geist-mono)",
			numeric: "var(--font-lato)",
		},
		container: {
			center: true,
		},
		extend: {
			colors: {
				primary: {
					50: "#FFFAE0",
					100: "#FFF5C1",
					200: "#FFF3AA",
					300: "#FEF598",
					400: "#FFF485",
					500: "#FEF27A",
					600: "#E5D766",
					700: "#CCBC51",
					800: "#B3A13D",
					900: "#998629",
					950: "#7F7320",
				},
				neutral: colors.zinc,
				success: colors.green,
				warning: colors.yellow,
				danger: colors.red,
				spotify: "#1ed760",
			},
		},
	},
	plugins: [
		function ({ addUtilities }: PluginAPI) {
			addUtilities({
				".scrollbar-hidden": {
					"-ms-overflow-style": "none",
					"scrollbar-width": "none", 
				},
				".scrollbar-hidden::-webkit-scrollbar": {
					display: "none", 
				},
				".scrollbar-visible": {
					"-ms-overflow-style": "auto",
					"scrollbar-width": "auto",
				},
			});
		},
	],
} satisfies Config;
