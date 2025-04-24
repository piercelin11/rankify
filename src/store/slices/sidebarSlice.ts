import { createSlice } from "@reduxjs/toolkit";

type SidebarSliceType = {
	isSidebarOpen: boolean;
};

const initialState: SidebarSliceType = {
	isSidebarOpen: true,
};

const sidebarSlice = createSlice({
	name: "sidebar",
	initialState,
	reducers: {
		toggleSidebar: (state) => {
			state.isSidebarOpen = !state.isSidebarOpen;
		},
	},
});

export const { toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
