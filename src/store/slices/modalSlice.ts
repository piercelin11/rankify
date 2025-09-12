import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModalType = "alert" | "custom";

export type AlertModalConfig = {
	type: "alert";
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "default" | "destructive";
};

export type CustomModalConfig = {
	type: "custom";
	title: string;
	description?: string;
	size?: "sm" | "md" | "lg" | "xl";
	// 移除 content 和 footer，因為 ReactNode 不能序列化
};

export type ModalConfig = AlertModalConfig | CustomModalConfig;

export type Modal = {
	id: string;
	config: ModalConfig;
	priority: number;
	createdAt: number;
};

type ModalState = {
	modals: Modal[];
	nextId: number;
};

const initialState: ModalState = {
	modals: [],
	nextId: 1,
};

const modalSlice = createSlice({
	name: "modal",
	initialState,
	reducers: {
		openModal: (state, action: PayloadAction<{ config: ModalConfig; priority?: number; id?: string }>) => {
			const { config, priority = 0, id } = action.payload;
			const modal: Modal = {
				id: id || `modal-${state.nextId}`,
				config,
				priority,
				createdAt: Date.now(),
			};
			state.modals.push(modal);
			if (!id) {
				state.nextId += 1;
			}
			
			// 依優先級排序，優先級高的在後面（會顯示在最上層）
			state.modals.sort((a, b) => a.priority - b.priority);
		},
		
		closeModal: (state, action: PayloadAction<string>) => {
			const modalId = action.payload;
			state.modals = state.modals.filter(modal => modal.id !== modalId);
		},
		
		closeTopModal: (state) => {
			if (state.modals.length > 0) {
				state.modals.pop();
			}
		},
		
		closeAllModals: (state) => {
			state.modals = [];
		},
		
		updateModal: (state, action: PayloadAction<{ id: string; config: ModalConfig }>) => {
			const { id, config } = action.payload;
			const modal = state.modals.find(m => m.id === id);
			if (modal) {
				modal.config = config;
			}
		},
	},
});

export const { openModal, closeModal, closeTopModal, closeAllModals, updateModal } = modalSlice.actions;
export default modalSlice.reducer;