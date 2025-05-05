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
			numeric: "var(--font-raleway)",
		},
		container: {
			center: true,
		},
		extend: {
			colors: {
				/* primary: {
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
				} */
				primary: {
					50: "#F2FFE1",
					100: "#E0FFBF",
					200: "#C9FF94",
					300: "#A9F56C",
					400: "#83E845",
					500: "#C3F75F",
					600: "#9FC040",
					700: "#7C972E",
					800: "#5E7022",
					900: "#3B4511",
				},
				neutral: colors.zinc,
				success: colors.green,
				warning: colors.yellow,
				danger: colors.red,
				spotify: "#1ed760",
			},
			boxShadow: {
				dent: `inset -2px 2px 8px 0 ${colors.neutral[950]}AA`,
				card: `inset -1px 1px 0 0 ${colors.neutral[600]},inset 1px -1px 0 0 ${colors.neutral[600]}40`,
				button: `inset -1px 1px 2px 0 ${colors.neutral[500]},inset 1.5px -1.5px 2px 0 ${colors.neutral[800]}`,
			},
			borderRadius: {
				"4xl": "2rem",
				"5xl": "2.5rem",
			},
			spacing: {
				"sidebar-sm": "88px",
				"sidebar-lg": "260px",
				"sidebar-xl": "300px",
			},
			backgroundImage: {
				"glow": `radial-gradient(ellipse farthest-side at top, ${colors.neutral[800]}40, ${colors.neutral[950]}CC)`
			}
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
