import { configureStore } from '@reduxjs/toolkit';
import sorterReducer from "@/features/sorter/sorterSlice";

export const store = configureStore({
    reducer: {
        sorter: sorterReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
