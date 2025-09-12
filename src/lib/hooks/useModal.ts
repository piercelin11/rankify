import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { 
	openModal, 
	closeModal, 
	closeTopModal, 
	closeAllModals,
	AlertModalConfig,
	CustomModalConfig
} from "@/store/slices/modalSlice";
import { clear, register, unregister } from "@/lib/modalEventManager";
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
	const dispatch = useDispatch();
	const modals = useSelector((state: RootState) => state.modal.modals);

	const showAlert = useCallback((options: ShowAlertOptions, priority?: number) => {
		const { onConfirm, onCancel, ...config } = options;
		
		// 生成唯一的 modal ID
		const modalId = `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
		
		// 先註冊事件監聽器
		register(modalId, {
			onConfirm,
			onCancel
		});
		
		// 派發 action 創建 modal
		dispatch(openModal({
			config: { ...config, type: "alert" },
			priority,
			id: modalId
		}));
		
		return modalId;
	}, [dispatch]);

	const showCustom = useCallback((options: ShowCustomOptions, priority?: number) => {
		const { content, footer, ...config } = options;
		
		// 生成唯一的 modal ID
		const modalId = `modal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
		
		// 先註冊內容到事件管理器
		register(modalId, {
			content,
			footer
		});
		
		// 派發 action 創建 modal（只包含序列化數據）
		dispatch(openModal({
			config: { ...config, type: "custom" },
			priority,
			id: modalId
		}));
		
		return modalId;
	}, [dispatch]);

	const close = useCallback((modalId: string) => {
		unregister(modalId);
		dispatch(closeModal(modalId));
	}, [dispatch]);

	const closeTop = useCallback(() => {
		dispatch(closeTopModal());
	}, [dispatch]);

	const closeAll = useCallback(() => {
		clear();
		dispatch(closeAllModals());
	}, [dispatch]);

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