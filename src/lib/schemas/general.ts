import z from "zod/v4";

export const cuidSchema = z.cuid();

export type cuidType = z.infer<typeof cuidSchema>;
