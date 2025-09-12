import { useState, useEffect } from "react";
import {
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { TrackData } from "@/types/data";

interface UseDragAndDropProps {
	data: TrackData[];
	setData: React.Dispatch<React.SetStateAction<TrackData[]>>;
	handleUpdateTrack: (trackId: string, updates: Partial<TrackData>) => void;
}

export function useDragAndDrop({ data: _data, setData, handleUpdateTrack }: UseDragAndDropProps) {
	const [pendingTrackUpdates, setPendingTrackUpdates] = useState<
		Array<{ id: string; trackNumber: number }>
	>([]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// 使用 useEffect 來處理拖拽後的資料庫更新
	useEffect(() => {
		if (pendingTrackUpdates.length > 0) {
			pendingTrackUpdates.forEach((update) => {
				handleUpdateTrack(update.id, { trackNumber: update.trackNumber });
			});
			setPendingTrackUpdates([]);
		}
	}, [pendingTrackUpdates, handleUpdateTrack]);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (active.id !== over?.id) {
			setData((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over?.id);

				const newItems = arrayMove(items, oldIndex, newIndex);

				// 重要：針對同一個 disc 的 trackNumber 重新排序
				// 按照新的順序重新分配 trackNumber (1, 2, 3, ...)
				const updatedItems = newItems.map((item, index) => ({
					...item,
					trackNumber: index + 1,
				}));

				// 收集需要更新到資料庫的變更（只更新真正變化的項目）
				const updates: Array<{ id: string; trackNumber: number }> = [];
				updatedItems.forEach((item, index) => {
					const originalItem = items.find((orig) => orig.id === item.id);
					if (originalItem && originalItem.trackNumber !== item.trackNumber) {
						updates.push({ id: item.id, trackNumber: index + 1 });
					}
				});

				// 設置待更新的項目，會在 useEffect 中處理
				if (updates.length > 0) {
					setPendingTrackUpdates(updates);
				}

				return updatedItems;
			});
		}
	}

	return {
		sensors,
		handleDragEnd,
	};
}