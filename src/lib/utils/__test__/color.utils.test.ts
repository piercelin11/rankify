jest.mock("color-convert", () => ({
	hex: {
		rgb: jest.fn(),
	},
	rgb: {
		lab: jest.fn(),
		hex: jest.fn(),
	},
	lab: {
		lch: jest.fn(),
		rgb: jest.fn(),
	},
	lch: {
		lab: jest.fn(),
	},
}));

import colorConvert from "color-convert";
import { adjustColor, adjustColorOpacity } from "../color.utils";
const mockColorConvert = jest.mocked(colorConvert);

describe("adjustColor function", () => {
	beforeEach(() => {
		mockColorConvert.hex.rgb.mockClear();
		mockColorConvert.lab.lch.mockClear();
		mockColorConvert.lab.rgb.mockClear();
		mockColorConvert.lch.lab.mockClear();
		mockColorConvert.rgb.lab.mockClear();
		mockColorConvert.rgb.hex.mockClear();
	});

	describe("when receive valid input", () => {
		test("should return a hex string that start with '#'", () => {
			const hexString = "#917a8e";
			const saturationFactor = 2;
			const targetLightness = 0.6;

			const mockRgb: [number, number, number] = [145, 122, 142];
			const mockLab: [number, number, number] = [54, 13, -8];
			const mockLch: [number, number, number] = [54, 15, 328];

			mockColorConvert.hex.rgb.mockReturnValue(mockRgb);
			mockColorConvert.rgb.lab.mockReturnValue(mockLab);
			mockColorConvert.lab.lch.mockReturnValue(mockLch);

			const newLch = [
				targetLightness * 100,
				mockLch[1] * saturationFactor,
				mockLch[2],
			];

			const mockNewLab: [number, number, number] = [60, 25, -16];
			const mockNewRgb: [number, number, number] = [176, 130, 173];
			mockColorConvert.lch.lab.mockReturnValue(mockNewLab);
			mockColorConvert.lab.rgb.mockReturnValue(mockNewRgb);
			mockColorConvert.rgb.hex.mockReturnValue("B082AD");

			const result = adjustColor(hexString, targetLightness, saturationFactor);

			expect(mockColorConvert.hex.rgb).toHaveBeenCalledWith(hexString.slice(1));
			expect(mockColorConvert.rgb.lab).toHaveBeenCalledWith(mockRgb);
			expect(mockColorConvert.lab.lch).toHaveBeenCalledWith(mockLab);
			expect(mockColorConvert.lab.rgb).toHaveBeenCalledWith(mockNewLab);
			expect(mockColorConvert.rgb.hex).toHaveBeenCalledWith(mockNewRgb);
			expect(mockColorConvert.lch.lab).toHaveBeenCalledWith(newLch);
			expect(mockColorConvert.lch.lab).toHaveBeenCalledTimes(1);
			expect(result).toBe("#B082AD");
		});
	});

	describe("when receive invalid input", () => {
		test.each([
			["", 1, 1],
			["FFFFFF", 1, 1],
			["#FFF", 1, 1],
			[123, 1, 1],
		])(
			"should throw an error when receive invalid hex string '%s'",
			(hex, lightness, saturation) => {
				const errorMessage = `Invalid hexColor format: ${hex}. Expected '#RRGGBB'.`;
				expect(() => adjustColor(hex as any, lightness, saturation)).toThrow(
					errorMessage
				);
			}
		);

		test.each([
			["#ZZZZZZ", 1, 1],
			["#S9V2J5", 1, 1],
		])(
			"should throw an error when receive invalid hex value '%s'",
			(hex, lightness, saturation) => {
				const errorMessage = `Invalid Hex value: ${hex}`;
				expect(() => adjustColor(hex, lightness, saturation)).toThrow(
					errorMessage
				);
			}
		);

		test.each([
			["#FFFFFF", -1, 1],
			["#FFFFFF", 10, 1],
		])(
			"should throw an error when receive invalid targetLightness '%f'",
			(hex, lightness, saturation) => {
				const errorMessage = `Invalid targetLightness: ${lightness}. Expected a number or float between 0.0 and 1.0.`;
				expect(() => adjustColor(hex, lightness, saturation)).toThrow(
					errorMessage
				);
			}
		);
	});
});

describe("adjustColorOpacity function", () => {
	test.each([
		[0.95, "F2"],
		[0.9, "E6"],
		[0.85, "D9"],
		[0.8, "CC"],
		[0.75, "BF"],
		[0.7, "B3"],
		[0.65, "A6"],
		[0.6, "99"],
		[0.55, "8C"],
		[0.5, "80"],
		[0.45, "73"],
		[0.4, "66"],
		[0.35, "59"],
		[0.3, "4D"],
		[0.25, "40"],
		[0.2, "33"],
		[0.15, "26"],
		[0.1, "1A"],
		[0.05, "0D"],
		[0, ""],
		[1, ""],
		[0.42, ""],
		[-0.1, ""],
		[1.1, ""],
	])(
		'when opacity is %f, add "%s" as an Alpha value',
		(opacity, expectedAlpha) => {
			const baseHex = "#RRGGBB";
			const expectedHex = baseHex + expectedAlpha;

			const result = adjustColorOpacity(baseHex, opacity);

			expect(result).toBe(expectedHex);
		}
	);
});
