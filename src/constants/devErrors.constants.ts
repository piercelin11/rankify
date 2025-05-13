export const getDevInputTypeError = (
	expectedType: string,
	receivedType: string
): string =>
	`Invalid input: Expected a ${expectedType}, but received ${receivedType}.`;
