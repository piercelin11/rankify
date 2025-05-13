import { getDevInputTypeError } from "@/constants";
import { getPrevNextIndex } from "./collection.utils";

describe("getPrevNextIndex function", () => {
	type MockDataType = {
		id: string;
		name: string;
	};

	const mockData: MockDataType[] = [
		{ id: "a", name: "Item A" },
		{ id: "b", name: "Item B" },
		{ id: "c", name: "Item C" },
		{ id: "d", name: "Item D" },
		{ id: "e", name: "Item E" },
	];

	describe("when the targetId is found in the array", () => {
		test.each([
			[mockData, "a", 4, 1],
			[mockData, "b", 0, 2],
			[mockData, "c", 1, 3],
			[mockData, "d", 2, 4],
			[mockData, "e", 3, 0],
		])(
			"should return correct previous (%d) and next (%d) indices for targetId '%s'",
			(items, targetItemId, expectedPrev, expectedNext) => {
				const result = getPrevNextIndex({
					items: items,
					targetItemId: targetItemId,
				});
				expect(result.previousIndex).toBe(expectedPrev);
				expect(result.nextIndex).toBe(expectedNext);
			}
		);
	});

	describe("when handling edge cases", () => {
		test("should throw an error for invalid target id", () => {
			expect(() =>
				getPrevNextIndex({
					items: mockData,
					targetItemId: "f",
				})
			).toThrow(`Item with ID "f" not found in the items array`);
		});

		test.each([
			[123, "a", "number"],
			[null, "a", "object"],
			[undefined, "a", "undefined"],
			[{}, "a", "object"],
			[true, "a", "boolean"],
		])(
			"should throw an error for non-array input '%j' with type '%s'",
			(items, targetId, typeName) => {
				expect(() =>
					getPrevNextIndex({ items: items as any, targetItemId: targetId })
				).toThrow(getDevInputTypeError("array", typeName));
			}
		);
	});
});
