import { ADMIN_MESSAGES } from "@/constants/messages";
import { AppResponseType } from "@/types/response";
import { AdminItemType } from "@/types/admin";

type DeleteOutcome<T> =
	| { ok: true; result: T }
	| { ok: false; response: AppResponseType };

export async function runDelete<T>(
	type: AdminItemType,
	operation: () => Promise<T>
): Promise<DeleteOutcome<T>> {
	try {
		const result = await operation();
		return { ok: true, result };
	} catch (error) {
		console.error(ADMIN_MESSAGES.OPERATION_MESSAGES.DELETE.FAILURE(type), error);
		return {
			ok: false,
			response: {
				type: "error",
				message: ADMIN_MESSAGES.OPERATION_MESSAGES.DELETE.FAILURE(type),
			},
		};
	}
}
