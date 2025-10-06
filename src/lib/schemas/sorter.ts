import z from "zod/v4";

export const sorterFilterSchema = z.object({
	selectedAlbumIds: z.array(z.string()).min(2, "至少選擇2個專輯"),
	selectedTrackIds: z.array(z.string()),
});

export const sorterStateSnapshotSchema = z.object({
	lstMember: z.array(z.array(z.number())),
	parent: z.array(z.number()),
	equal: z.array(z.number()),
	rec: z.array(z.number()),
	cmp1: z.number(),
	cmp2: z.number(),
	head1: z.number(),
	head2: z.number(),
	nrec: z.number(),
	totalSize: z.number(),
	finishSize: z.number(),
	finishFlag: z.number(),
	percent: z.number(),
	namMember: z.array(z.string()),
	currentLeftIndex: z.number().nullable(),
	currentRightIndex: z.number().nullable(),
});

export const sorterStateSchema = sorterStateSnapshotSchema.extend({
	history: z.array(sorterStateSnapshotSchema),
});

export type SorterFilterType = z.infer<typeof sorterFilterSchema>;
export type SorterStateSnapshotType = z.infer<typeof sorterStateSnapshotSchema>;
export type SorterStateType = z.infer<typeof sorterStateSchema>;