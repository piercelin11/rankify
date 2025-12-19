import type { Config } from "tailwindcss";
import { PluginAPI } from "tailwindcss/types/config";
import colors from "tailwindcss/colors";

export default {
	darkMode: ["class"],
	content: [
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/features/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.css",
	],
	theme: {
		fontFamily: {
			sans: "var(--font-sans)",
			serif: "var(--font-serif)",
			numeric: "var(--font-numeric)",
		},
		container: {
			center: true,
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				field: "hsl(var(--field))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				neutral: colors.purple,
				success: colors.green,
				warning: colors.yellow,
				danger: colors.red,
				spotify: "#1ed760",
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			boxShadow: {
				dent: "`inset -2px 2px 8px 0 ${colors.neutral[950]}AA`",
				"stats-card":
					"`inset -1px 1px 0 0 ${colors.neutral[600]},inset 1px -1px 0 0 ${colors.neutral[600]}40`",
				button:
					"`inset -1px 1px 2px 0 ${colors.neutral[500]},inset 1.5px -1.5px 2px 0 ${colors.neutral[800]}`",
			},
			borderRadius: {
				"4xl": "2rem",
				"5xl": "2.5rem",
			},
			spacing: {
				"18": "4.5rem",
				"22": "5.5rem",
				"content": "3rem"
			},
			backgroundImage: {
				glow: "`radial-gradient(ellipse farthest-side at top, ${colors.neutral[800]}40, ${colors.neutral[950]}CC)`",
			},
			fontSize: {
				xs: ["var(--font-size-xs)", { lineHeight: "1.2rem" }],
				sm: ["var(--font-size-sm)", { lineHeight: "1.2rem" }],
				base: ["var(--font-size-base)", { lineHeight: "1.4rem" }],
				md: ["var(--font-size-md)", { lineHeight: "1.5rem" }],
				lg: ["var(--font-size-lg)", { lineHeight: "1.75rem" }],
				xl: ["var(--font-size-xl)", { lineHeight: "1.75rem" }],
				"2xl": ["var(--font-size-2xl)", { lineHeight: "2rem" }],
				"3xl": ["var(--font-size-3xl)", { lineHeight: "1.3" }],
				"4xl": ["var(--font-size-4xl)", { lineHeight: "4rem" }],
			},
			flexBasis: {
				"1/8": "12.5%",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
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
