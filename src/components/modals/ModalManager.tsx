"use client";

import { useModalContext, Modal as ModalType } from "@/contexts";
import { AlertModal } from "./AlertModal";
import { Modal } from "./Modal";

export function ModalManager() {
	const { modals, closeModal } = useModalContext();

	const handleCloseModal = (modalId: string) => {
		closeModal(modalId);
	};

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
									modal.onConfirm?.();
									handleCloseModal(id);
								}}
								onCancel={() => {
									modal.onCancel?.();
									handleCloseModal(id);
								}}
							/>
						</div>
					);
				}

				if (config.type === "custom") {
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
								footer={modal.footer}
							>
								{modal.content}
							</Modal>
						</div>
					);
				}

				return null;
			})}
		</>
	);
}