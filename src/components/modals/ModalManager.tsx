"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState } from "@/store/store";
import { closeModal, Modal as ModalType } from "@/store/slices/modalSlice";
import { clear, triggerCancel, triggerConfirm, unregister, getContent, getFooter } from "@/lib/modalEventManager";
import { AlertModal } from "./AlertModal";
import { Modal } from "./Modal";

export function ModalManager() {
	const dispatch = useDispatch();
	const modals = useSelector((state: RootState) => state.modal.modals);

	const handleCloseModal = (modalId: string) => {
		unregister(modalId);
		dispatch(closeModal(modalId));
	};

	// 清理已關閉的 modal 的事件監聽器
	useEffect(() => {
		return () => {
			clear();
		};
	}, []);

	return (
		<>
			{modals.map((modal: ModalType, index: number) => {
				const { id, config } = modal;
				const zIndex = 50 + index; // 確保每個 modal 有不同的 z-index

				if (config.type === "alert") {
					return (
						<div key={id} style={{ zIndex }}>
							<AlertModal
								isOpen={true}
								onOpenChange={(open) => {
									if (!open) handleCloseModal(id);
								}}
								title={config.title}
								description={config.description}
								confirmText={config.confirmText}
								cancelText={config.cancelText}
								variant={config.variant}
								onConfirm={() => {
									triggerConfirm(id);
									handleCloseModal(id);
								}}
								onCancel={() => {
									triggerCancel(id);
									handleCloseModal(id);
								}}
							/>
						</div>
					);
				}

				if (config.type === "custom") {
					const content = getContent(id);
					const footer = getFooter(id);
					
					return (
						<div key={id} style={{ zIndex }}>
							<Modal
								isOpen={true}
								onOpenChange={(open) => {
									if (!open) handleCloseModal(id);
								}}
								title={config.title}
								description={config.description}
								size={config.size}
								footer={footer}
							>
								{content}
							</Modal>
						</div>
					);
				}

				return null;
			})}
		</>
	);
}