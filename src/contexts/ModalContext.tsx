"use client";

import React, { createContext, useContext, useCallback, useState, ReactNode } from "react";

// === 類型定義 ===
export type ModalType = "alert" | "custom" | "confirm" | "authGuard";

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

export type ConfirmModalConfig = {
	type: "confirm";
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "default" | "destructive";
};

export type AuthGuardModalConfig = {
	type: "authGuard";
	callbackUrl: string;
};

export type ModalConfig = AlertModalConfig | CustomModalConfig | ConfirmModalConfig | AuthGuardModalConfig;

export type Modal = {
	id: string;
	config: ModalConfig;
	onConfirm?: () => void;
	onCancel?: () => void;
	content?: ReactNode;
	footer?: ReactNode;
};

// === Show Options 類型 ===
type ShowAlertOptions = Omit<AlertModalConfig, "type"> & {
	onConfirm: () => void;
	onCancel?: () => void;
};

type ShowCustomOptions = Omit<CustomModalConfig, "type"> & {
	content: ReactNode;
	footer?: ReactNode;
};

type ShowConfirmOptions = Omit<ConfirmModalConfig, "type"> & {
	onConfirm: () => void;
	onCancel?: () => void;
};

type ShowAuthGuardOptions = {
	callbackUrl: string;
};

// === Context 類型 ===
type ModalContextType = {
	modal: Modal | null;
	showAlert: (options: ShowAlertOptions) => void;
	showCustom: (options: ShowCustomOptions) => void;
	showConfirm: (options: ShowConfirmOptions) => void;
	showAuthGuard: (options: ShowAuthGuardOptions) => void;
	close: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// === Provider ===
export function ModalProvider({ children }: { children: ReactNode }) {
	const [modal, setModal] = useState<Modal | null>(null);

	const showAlert = useCallback((options: ShowAlertOptions) => {
		const { onConfirm, onCancel, ...config } = options;
		setModal({
			id: `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
			config: { ...config, type: "alert" },
			onConfirm,
			onCancel,
		});
	}, []);

	const showCustom = useCallback((options: ShowCustomOptions) => {
		const { content, footer, ...config } = options;
		setModal({
			id: `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
			config: { ...config, type: "custom" },
			content,
			footer,
		});
	}, []);

	const showConfirm = useCallback((options: ShowConfirmOptions) => {
		const { onConfirm, onCancel, ...config } = options;
		setModal({
			id: `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
			config: { ...config, type: "confirm" },
			onConfirm,
			onCancel,
		});
	}, []);

	const showAuthGuard = useCallback((options: ShowAuthGuardOptions) => {
		setModal({
			id: `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
			config: { type: "authGuard", callbackUrl: options.callbackUrl },
		});
	}, []);

	const close = useCallback(() => {
		setModal(null);
	}, []);

	const value: ModalContextType = {
		modal,
		showAlert,
		showCustom,
		showConfirm,
		showAuthGuard,
		close,
	};

	return (
		<ModalContext.Provider value={value}>
			{children}
		</ModalContext.Provider>
	);
}

// === Hook ===
export function useModal() {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
}
