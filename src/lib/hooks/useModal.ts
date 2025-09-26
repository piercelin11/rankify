import { useCallback } from "react";
import { useModalContext, AlertModalConfig, CustomModalConfig } from "@/contexts";
import { ReactNode } from "react";

type ShowAlertOptions = Omit<AlertModalConfig, "type"> & {
	onConfirm: () => void;
	onCancel?: () => void;
};

type ShowCustomOptions = Omit<CustomModalConfig, "type"> & {
	content: ReactNode;
	footer?: ReactNode;
};

export function useModal() {
	const { modals, openModal, closeModal, closeTopModal, closeAllModals } = useModalContext();

	const showAlert = useCallback((options: ShowAlertOptions, priority?: number) => {
		const { onConfirm, onCancel, ...config } = options;

		// 生成唯一的 modal ID
		const modalId = `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

		// 直接創建 modal，包含所有數據和回調
		return openModal({
			config: { ...config, type: "alert" },
			priority: priority || 0,
			onConfirm,
			onCancel,
			id: modalId
		});
	}, [openModal]);

	const showCustom = useCallback((options: ShowCustomOptions, priority?: number) => {
		const { content, footer, ...config } = options;

		// 生成唯一的 modal ID
		const modalId = `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

		// 直接創建 modal，包含所有數據和內容
		return openModal({
			config: { ...config, type: "custom" },
			priority: priority || 0,
			content,
			footer,
			id: modalId
		});
	}, [openModal]);

	const close = useCallback((modalId: string) => {
		closeModal(modalId);
	}, [closeModal]);

	const closeTop = useCallback(() => {
		closeTopModal();
	}, [closeTopModal]);

	const closeAll = useCallback(() => {
		closeAllModals();
	}, [closeAllModals]);

	// 便利方法：快速顯示確認對話框
	const confirm = useCallback((
		title: string,
		onConfirm: () => void,
		options?: {
			description?: string;
			confirmText?: string;
			cancelText?: string;
			variant?: "default" | "destructive";
			priority?: number;
			onCancel?: () => void;
		}
	) => {
		return showAlert({
			title,
			description: options?.description,
			confirmText: options?.confirmText,
			cancelText: options?.cancelText,
			variant: options?.variant,
			onConfirm,
			onCancel: options?.onCancel
		}, options?.priority);
	}, [showAlert]);

	// 便利方法：快速顯示帶內容的 modal
	/* const show = useCallback((
		content: ReactNode,
		options?: {
			title: string;
			description?: string;
			size?: "sm" | "md" | "lg" | "xl";
			footer?: ReactNode;
			priority?: number;
		}
	) => {
		return showCustom({
			content,
			title: options?.title,
			description: options?.description,
			size: options?.size,
			footer: options?.footer
		}, options?.priority);
	}, [showCustom]); */

	return {
		// 基本方法
		showAlert,
		showCustom,
		close,
		closeTop,
		closeAll,
		
		// 便利方法
		confirm,
		/* show, */
		
		// 狀態
		modals,
		hasModals: modals.length > 0,
		topModal: modals[modals.length - 1] || null
	};
}