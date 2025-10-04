import nextJest from "next/jest"; 


import type { Config } from 'jest'
 
const createJestConfig = nextJest({
  dir: './',
})
 
// Add any custom config to be passed to Jest
const config: Config = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], 
	testEnvironment: "jsdom",
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: "coverage",
	coverageProvider: "v8",
	moduleNameMapper: {
		"\\.(css|less|sass|scss)$": "identity-obj-proxy",
		"\\.(gif|ttf|eot|svg|png|jpg)$": "<rootDir>/__mocks__/fileMock.js",
	},
	transformIgnorePatterns: [
		// 讓 Jest 轉換 color-convert ES Module
		'node_modules/(?!color-convert/)',
	],
}
 
export default createJestConfig(config)