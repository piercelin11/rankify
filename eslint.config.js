// eslint.config.js

import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsdoc from "eslint-plugin-jsdoc";
import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
	// 1. 全域忽略設定
	{
		ignores: [
			"dist/",
			".next/",
			"out/",
			"node_modules/",
			"coverage/",
			"**/*.test.{ts,tsx}",
		],
	},

	// 2. 全域基礎設定 (套用到所有檔案)
	{
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],

		// 3. 插件設定
		plugins: {
			"@typescript-eslint": tseslint.plugin,
			react: pluginReact,
			"react-hooks": pluginReactHooks,
			jsdoc: pluginJsdoc,
			"@next/next": nextPlugin,
		},

		// 4. 語言與環境設定
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tseslint.parser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},

		// 5. React 版本自動偵測
		settings: {
			react: {
				version: "detect",
			},
		},

		// 6. 規則設定 (合併所有推薦規則與你的自訂規則)
		rules: {
			// 啟用各插件的推薦規則
			...tseslint.configs.recommended.rules,
			...pluginReact.configs.recommended.rules,
			...pluginReactHooks.configs.recommended.rules,
			...pluginJsdoc.configs.recommended.rules,
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs["core-web-vitals"].rules,

			// --- 以下是你原本的自訂規則 ---
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-explicit-any": "warn",
			"no-console": "off",
			"prefer-const": "error",
			"react/react-in-jsx-scope": "off", // 在 Next.js 和新版 React 中通常不需要
			"react/jsx-uses-react": "off", // 同上
			"react/prop-types": "off", // 使用 TypeScript 時通常不需要 prop-types
			"jsdoc/require-jsdoc": "off",
			"jsdoc/require-param-description": "off",
			"jsdoc/require-returns-description": "off",
			"jsdoc/require-description": "off",
			"jsdoc/no-types": "error",
			"jsdoc/require-param-type": "off",
			"jsdoc/require-returns-type": "off",
		},
	},

	// 7. Prettier 設定 (必須放在最後，用來覆蓋樣式規則)
	eslintConfigPrettier
);
