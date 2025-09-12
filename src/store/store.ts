import { configureStore } from '@reduxjs/toolkit';
import sorterReducer from "@/features/sorter/slices/sorterSlice";
import sidebarReducer from "./slices/sidebarSlice";
import modalReducer from "./slices/modalSlice";

export const store = configureStore({
    reducer: {
        sorter: sorterReducer,
        sidebar: sidebarReducer,
        modal: modalReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
