import { generateSearchParams } from "../url.utils";

describe("generateSearchParams function", () => {
	test("should turn a basic object to query string", () => {
		const inputObject = {
			name: "Alice",
			age: "30",
			city: "London",
		};

		const result = generateSearchParams(inputObject);

		const params = new URLSearchParams(result);

		expect(params.get("name")).toBe("Alice");
		expect(params.get("age")).toBe("30");
		expect(params.get("city")).toBe("London");

		expect(Array.from(params.keys()).length).toBe(
			Object.keys(inputObject).length
		);
	});

	test("should handle special characters", () => {
		const inputObject = {
			query: "test & search = value",
			url: "http://example.com?a=1",
			greeting: "Hello World",
		};

		const result = generateSearchParams(inputObject);
		const params = new URLSearchParams(result);

		expect(params.get("query")).toBe("test & search = value");
		expect(params.get("url")).toBe("http://example.com?a=1");
		expect(params.get("greeting")).toBe("Hello World");
	});

	test("should return empty string when receive an empty object", () => {
		const inputObject = {};
		const expectedResult = "";

		const result = generateSearchParams(inputObject);

		expect(result).toBe(expectedResult);
	});

	test("should handle empty string value", () => {
		const inputObject = {
			name: "Bob",
			age: "",
		};

		const result = generateSearchParams(inputObject);
		const params = new URLSearchParams(result);

		expect(params.get("name")).toBe("Bob");
		expect(params.get("age")).toBe("");
		expect(result).toContain("age=");
	});
});
