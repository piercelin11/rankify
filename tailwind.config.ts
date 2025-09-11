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
			sans: "var(--font-geist)",
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
				lavender: {
					50: "#F7F9FA",
					100: "#F0F3F5",
					200: "#DDE5E9",
					300: "#C7D3DB",
					400: "#B0BCC6",
					500: "#90A4AE",
					600: "#748892",
					700: "#59676E",
					800: "#424E54",
					900: "#2C3437",
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
				"sidebar-sm": "80px",
				"sidebar-lg": "260px",
				"sidebar-xl": "300px",
				"22": "5.5rem",
			},
			backgroundImage: {
				glow: `radial-gradient(ellipse farthest-side at top, ${colors.neutral[800]}40, ${colors.neutral[950]}CC)`,
			},
			/* fontSize: {
				xs: ["0.625rem", "1rem"], // 10px
				sm: ["0.75rem", "1.25rem"], // 12px
				base: ["0.875rem", "1.5rem"], // 14px
				lg: ["1rem", "1.75rem"], // 16px
				xl: ["1.125rem", "1.75rem"], // 18px
				"2xl": ["1.375rem", "2rem"], // 22px
				"3xl": ["1.75rem", "2.25rem"], // 28px
				"4xl": ["2.125rem", "2.5rem"], // 34px
				"5xl": ["2.875rem", "1"], // 46px
				"6xl": ["3.625rem", "1"], // 58px
				"7xl": ["4.375rem", "1"], // 70px
				"8xl": ["5.875rem", "1"], // 94px
				"9xl": ["7.875rem", "1"], // 126px
			}, */
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
