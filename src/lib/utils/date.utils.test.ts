import { getDevInputTypeError } from "@/constants";
import {
	calculateDateRangeFromSlug,
	dateToDashFormat,
	dateToLong,
} from "./date.utils";

describe("dateToLong Function", () => {
	describe("when given a valid Date input", () => {
		test.each([
			[new Date("2025-1-1"), "January 1, 2025"],
			[new Date("December 17, 1995 03:24:00"), "December 17, 1995"],
		])("should formatted '%s' to '%s'", (input, output) => {
			expect(dateToLong(input)).toBe(output);
		});
	});

	describe("when given an invalid input", () => {
		test.each([
			["2025-1-1", "string"],
			[12, "number"],
			[null, "object"],
			[undefined, "undefined"],
			[{ key: "value" }, "object"],
			[[2, 4, 8], "object"],
			[true, "boolean"],
		])(
			"should throw an error for non-Date input '%j' with type '%s'",
			(input, typeName) => {
				expect(() => dateToLong(input as any)).toThrow(
					getDevInputTypeError("Date", typeName)
				);
			}
		);
	});
});

describe("dateToDashFormat Function", () => {
	describe("when given a valid Date input", () => {
		test.each([
			[new Date("2025-1-1"), "2025-01-01"],
			[new Date("December 17, 1995 03:24:00"), "1995-12-17"],
		])("should formatted '%s' to '%s'", (input, output) => {
			expect(dateToDashFormat(input)).toBe(output);
		});
	});

	describe("when given an invalid input", () => {
		test.each([
			["2025-1-1", "string"],
			[12, "number"],
			[null, "object"],
			[undefined, "undefined"],
			[{ key: "value" }, "object"],
			[[2, 4, 8], "object"],
			[true, "boolean"],
		])(
			"should throw an error for non-Date input '%j' with type '%s'",
			(input, typeName) => {
				expect(() => dateToDashFormat(input as any)).toThrow(
					getDevInputTypeError("Date", typeName)
				);
			}
		);
	});
});

describe("calculateDateRangeFromSlug Function", () => {
	jest.useFakeTimers();

	afterAll(() => {
		jest.useRealTimers();
	});

	describe("when given a valid Date input", () => {
		const mockDate = new Date("2023-10-26T10:00:00Z");

		beforeEach(() => {
			jest.setSystemTime(mockDate);
		});

		test('should return the correct start date for "past-month"', () => {
			const expectedDate = new Date(mockDate);
			expectedDate.setMonth(expectedDate.getMonth() - 1);

			const result = calculateDateRangeFromSlug("past-month");

			expect(result).toBeInstanceOf(Date);
			expect(result?.getTime()).toBe(expectedDate.getTime());
		});

		test('should return the correct start date for "past-6-months"', () => {
			const expectedDate = new Date(mockDate);
			expectedDate.setMonth(expectedDate.getMonth() - 6);

			const result = calculateDateRangeFromSlug("past-6-months");

			expect(result).toBeInstanceOf(Date);
			expect(result?.getTime()).toBe(expectedDate.getTime());
		});

		test('should return the correct start date for "past-year"', () => {
			const expectedDate = new Date(mockDate);
			expectedDate.setFullYear(expectedDate.getFullYear() - 1);

			const result = calculateDateRangeFromSlug("past-year");

			expect(result).toBeInstanceOf(Date);
			expect(result?.getTime()).toBe(expectedDate.getTime());
		});

		test('should return the correct start date for "past-2-years"', () => {
			const expectedDate = new Date(mockDate);
			expectedDate.setFullYear(expectedDate.getFullYear() - 2);

			const result = calculateDateRangeFromSlug("past-2-years");

			expect(result).toBeInstanceOf(Date);
			expect(result?.getTime()).toBe(expectedDate.getTime());
		});

		test('should return undefined for "all-time"', () => {
			const result = calculateDateRangeFromSlug("all-time");
			expect(result).toBeUndefined();
		});

		test("should return undefined for an unknown slug", () => {
			const result = calculateDateRangeFromSlug("some-other-random-slug");
			expect(result).toBeUndefined();
		});
	});

	describe("when given an invalid input", () => {
		test.each([
			[123, "number"],
			[null, "object"],
			[undefined, "undefined"],
			[{}, "object"],
			[[], "object"],
			[true, "boolean"],
		])(
			"should throw an error for non-string input '%j' with type '%s'",
			(input, typeName) => {
				expect(() => calculateDateRangeFromSlug(input as any)).toThrow(
					getDevInputTypeError("Date", typeName)
				);
			}
		);
	});
});
