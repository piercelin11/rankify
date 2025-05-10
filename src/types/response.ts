export type ResponseType = "success" | "error" | "warning" | "info";

export type AppResponseType<T = null> = {
	type: ResponseType;
	message: string;
	data?: T;
};
