import { useState } from "react";

export function useInlineSelect() {
	const [isEditing, setIsEditing] = useState(false);

	const startEdit = () => setIsEditing(true);
	const closeEdit = () => setIsEditing(false);

	const selectValue = (value: string, onSave: (value: string) => void) => {
		onSave(value);
		setIsEditing(false);
	};

	return {
		isEditing,
		setIsEditing,
		startEdit,
		closeEdit,
		selectValue,
	};
}