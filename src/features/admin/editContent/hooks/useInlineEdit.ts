import { useState } from "react";

export function useInlineEdit(initialValue: string) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(initialValue);

	const startEdit = () => setIsEditing(true);
	const cancelEdit = () => {
		setEditValue(initialValue);
		setIsEditing(false);
	};

	const saveEdit = (onSave: (value: string) => void) => {
		onSave(editValue);
		setIsEditing(false);
	};

	return {
		isEditing,
		editValue,
		setEditValue,
		startEdit,
		cancelEdit,
		saveEdit,
	};
}