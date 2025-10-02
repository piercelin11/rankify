"use client";

import { useModal } from "@/contexts";
import { AlertModal } from "./AlertModal";
import { Modal } from "./Modal";
import { ConfirmModal } from "./ConfirmModal";

export function ModalManager() {
	const { modal, close } = useModal();

	if (!modal) return null;

	const { config } = modal;

	if (config.type === "alert") {
		return (
			<AlertModal
				isOpen={true}
				onOpenChange={(open) => {
					if (!open) close();
				}}
				title={config.title}
				description={config.description}
				confirmText={config.confirmText}
				cancelText={config.cancelText}
				variant={config.variant}
				onConfirm={() => {
					modal.onConfirm?.();
					close();
				}}
				onCancel={() => {
					modal.onCancel?.();
					close();
				}}
			/>
		);
	}

	if (config.type === "custom") {
		return (
			<Modal
				isOpen={true}
				onOpenChange={(open) => {
					if (!open) close();
				}}
				title={config.title}
				description={config.description}
				size={config.size}
				footer={modal.footer}
			>
				{modal.content}
			</Modal>
		);
	}

	if (config.type === "confirm") {
		return (
			<ConfirmModal
				isOpen={true}
				onOpenChange={(open) => {
					if (!open) close();
				}}
				title={config.title}
				description={config.description}
				confirmText={config.confirmText}
				cancelText={config.cancelText}
				variant={config.variant}
				onConfirm={() => {
					modal.onConfirm?.();
					close();
				}}
				onCancel={() => {
					modal.onCancel?.();
					close();
				}}
			/>
		);
	}

	return null;
}