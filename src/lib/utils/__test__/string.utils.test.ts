import { getDevInputTypeError } from "@/constants";
import { toAcronym, capitalizeFirstLetter } from "../string.utils";

describe("toAcronym funtion", () => {
	describe("When given a valid string input", () => {
		test.each([
			["THE TORTURED POETS DEPARTMENT", "TTPD"],
			["1989", "1989"],
			["SOUR", "SOUR"],
			["Dragon New Warm Mountain I Believe In You", "DNWMIBIY"],
			["A Tiny House, In Secret Speeches, Polar Equals", "ATHISSPE"],
			["", ""],
			["                      Red", "Red"],
		])("should turn '%s' into '%s'", (input, output) => {
			expect(toAcronym(input)).toBe(output);
		});
	});

	describe("When given an ivalid string input", () => {
		test.each([
			[12, "number"],
			[null, "object"],
			[undefined, "undefined"],
			[{ key: "value" }, "object"],
			[[2, 4, 8], "object"],
			[true, "boolean"],
		])(
			"should throw an error for non-string input '%s' with type '%s'",
			(input, typeName) => {
				expect(() => toAcronym(input as any)).toThrow(
					getDevInputTypeError("string", typeName)
				);
			}
		);
	});
});

describe("capitalizeFirstLetter function", () => {
	describe("When given a valid string input", () => {
		test.each([
			["hello World", "Hello world"],
			["hello", "Hello"],
			["", ""],
			["  123", "  123"],
			["@123!", "@123!"],
			["hELLo", "Hello"],
			["Hello", "Hello"],
		])("should capitalized '%s' to '%s'", (input, output) => {
			expect(capitalizeFirstLetter(input)).toBe(output);
		});
	});

	describe("When given an ivalid string input", () => {
		test.each([
			[12, "number"],
			[null, "object"],
			[undefined, "undefined"],
			[{ key: "value" }, "object"],
			[[2, 4, 8], "object"],
			[true, "boolean"],
		])(
			"should throw an error for non-string input '%s' with type '%s'",
			(input, typeName) => {
				expect(() => capitalizeFirstLetter(input as any)).toThrow(
					getDevInputTypeError("string", typeName)
				);
			}
		);
	});
});
