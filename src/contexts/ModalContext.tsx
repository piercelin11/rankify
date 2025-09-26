"use client";

import React, { createContext, useContext, useCallback, useState, ReactNode } from "react";

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
};

export type ModalConfig = AlertModalConfig | CustomModalConfig;

export type Modal = {
	id: string;
	config: ModalConfig;
	priority: number;
	createdAt: number;
	onConfirm?: () => void;
	onCancel?: () => void;
	content?: ReactNode;
	footer?: ReactNode;
};

type ModalContextType = {
	modals: Modal[];
	openModal: (modal: Omit<Modal, "id" | "createdAt"> & { id?: string }) => string;
	closeModal: (modalId: string) => void;
	closeTopModal: () => void;
	closeAllModals: () => void;
	updateModal: (id: string, config: ModalConfig) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
	const [modals, setModals] = useState<Modal[]>([]);
	const [nextId, setNextId] = useState(1);

	const openModal = useCallback((modal: Omit<Modal, "id" | "createdAt"> & { id?: string }) => {
		const modalId = modal.id || `modal-${nextId}`;
		const newModal: Modal = {
			...modal,
			id: modalId,
			createdAt: Date.now(),
		};

		setModals(prevModals => {
			const updated = [...prevModals, newModal];
			// 依優先級排序，優先級高的在後面（會顯示在最上層）
			return updated.sort((a, b) => a.priority - b.priority);
		});

		if (!modal.id) {
			setNextId(prev => prev + 1);
		}

		return modalId;
	}, [nextId]);

	const closeModal = useCallback((modalId: string) => {
		setModals(prevModals => prevModals.filter(modal => modal.id !== modalId));
	}, []);

	const closeTopModal = useCallback(() => {
		setModals(prevModals => {
			if (prevModals.length > 0) {
				return prevModals.slice(0, -1);
			}
			return prevModals;
		});
	}, []);

	const closeAllModals = useCallback(() => {
		setModals([]);
	}, []);

	const updateModal = useCallback((id: string, config: ModalConfig) => {
		setModals(prevModals =>
			prevModals.map(modal =>
				modal.id === id ? { ...modal, config } : modal
			)
		);
	}, []);

	const value: ModalContextType = {
		modals,
		openModal,
		closeModal,
		closeTopModal,
		closeAllModals,
		updateModal,
	};

	return (
		<ModalContext.Provider value={value}>
			{children}
		</ModalContext.Provider>
	);
}

export function useModalContext() {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error("useModalContext must be used within a ModalProvider");
	}
	return context;
}