import { configureStore } from '@reduxjs/toolkit';
import sorterReducer from "@/features/sorter/slices/sorterSlice";
import sidebarReducer from "./slices/sidebarSlice";

export const store = configureStore({
    reducer: {
        sorter: sorterReducer,
        sidebar: sidebarReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
