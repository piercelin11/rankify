import { RootState } from "@/redux/store/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FilterType = { albums: string[]; tracks: string[] };

type SaveStatusType = "idle" | "pending" | "saved" | "failed";

type SorterSliceType = {
	excluded: FilterType | null;
	percentage: number;
	saveStatus: SaveStatusType;
};

const initialState: SorterSliceType = {
	excluded: null,
	percentage: 0,
	saveStatus: "idle",
};

const sorterSlice = createSlice({
	name: "sorter",
	initialState,
	reducers: {
		setExcluded: (state, action: PayloadAction<FilterType>) => {
			state.excluded = action.payload;
		},
		setPercentage: (state, action: PayloadAction<number>) => {
			state.percentage = action.payload;
		},
		setSaveStatus: (state, action: PayloadAction<SaveStatusType>) => {
			state.saveStatus = action.payload;
		},
	},
});

export const { setExcluded, setPercentage, setSaveStatus } =
	sorterSlice.actions;

export default sorterSlice.reducer;
