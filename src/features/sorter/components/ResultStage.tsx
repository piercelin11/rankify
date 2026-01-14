"use client";

import { TrackData } from "@/types/data";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RankingResultData } from "../types";
import { useModal } from "@/contexts";
import { SorterStateType } from "@/lib/schemas/sorter";
import { generateFinalResult } from "../utils/convertResult";
import {
	DndContext,
	closestCenter,
	DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { PLACEHOLDER_PIC } from "@/constants";
import { useSorterActions } from "@/contexts/SorterContext";
import { StorageStrategy } from "../storage/StorageStrategy";

type ResultStageProps = {
	draftState?: SorterStateType;
	tracks: TrackData[];
	storage: StorageStrategy;
	initialRankedList?: string[];
	albumId?: string; // Guest 模式需要 albumId 來清除 LocalStorage
};

export default function ResultStage({
	draftState,
	tracks,
	storage,
	initialRankedList,
	albumId,
}: ResultStageProps) {
	const { showAlert } = useModal();
	const { setPercentage } = useSorterActions();

	// 配置拖曳感測器
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	// 解析 draftState 並生成初始結果
	const [result, setResult] = useState<RankingResultData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// 初始化結果數據
	useEffect(() => {
		const initializeResult = async () => {
			try {
				// 使用 initialRankedList 重建結果 (Guest 模式)
				if (initialRankedList) {
					const guestResult: RankingResultData[] = initialRankedList.map((trackId, index) => {
						const track = tracks.find((t) => t.id === trackId);
						if (!track) {
							throw new Error(`Track ${trackId} not found`);
						}
						return {
							...track,
							ranking: index + 1,
						};
					});
					setResult(guestResult);
					setIsLoading(false);
					return;
				}

				// 使用 draftState 生成結果 (User 模式)
				if (!draftState) {
					setIsLoading(false);
					return;
				}
				const finalResult = generateFinalResult(draftState, tracks);
				setResult(finalResult);
				setIsLoading(false);
			} catch (error) {
				console.error("Failed to generate result:", error);
				setIsLoading(false);
			}
		};

		initializeResult();
	}, [draftState, tracks, initialRankedList]);


	// 設定進度為 100%
	useEffect(() => {
		setPercentage(100);
	}, [setPercentage]);

	// beforeunload 警告
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (storage.capabilities.needsBeforeUnload) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [storage.capabilities.needsBeforeUnload]);

	// Fail-fast 檢查: tracks 不應為空
	if (tracks.length === 0) {
		console.error('ResultStage: tracks array is empty - this should not happen');
		return null;
	}

	// 拖曳結束處理
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const oldIndex = result.findIndex((item) => item.id === active.id);
		const newIndex = result.findIndex((item) => item.id === over.id);

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		// 重新排列數組
		const newResult = [...result];
		const [movedItem] = newResult.splice(oldIndex, 1);
		newResult.splice(newIndex, 0, movedItem);

		// 更新排名
		const updatedResult = newResult.map((item, index) => ({
			...item,
			ranking: index + 1,
		}));

		// 直接更新本地狀態
		setResult(updatedResult);
	};

	const handleSubmit = async () => {
		await storage.submitResult(result);
	};

	const handleDelete = () => {
		if (!storage.capabilities.canDelete) return;

		showAlert({
			title: "Are You Sure?",
			description: "This action cannot be undone.",
			confirmText: "Delete Record",
			onConfirm: async () => {
				await storage.delete();
			},
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20 2xl:py-32">
				<div>Loading results...</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="sticky top-0 flex items-center justify-between py-10">
				<h3>Your ranking result</h3>
				<div className="flex gap-5">
					{/* Guest 模式: 重新排名按鈕 */}
					{!storage.capabilities.canAutoSave && albumId && (
						<Button
							variant="outline"
							onClick={() => {
								showAlert({
									title: "Restart Ranking?",
									description: "Your current ranking will be cleared and cannot be recovered",
									confirmText: "Restart",
									onConfirm: () => {
										localStorage.removeItem(`rankify_guest_result_${albumId}`);
										window.location.reload();
									},
								});
							}}
						>
							Restart Ranking
						</Button>
					)}

					{/* 儲存排名/登入按鈕 */}
					<Button onClick={handleSubmit}>
						{storage.capabilities.canAutoSave ? "Submit" : "Login to Save"}
					</Button>

					{/* User 模式: Delete 按鈕 */}
					{storage.capabilities.canDelete && (
						<Button variant="secondary" onClick={handleDelete}>
							<p className="w-full">Delete</p>
						</Button>
					)}

					{/* Guest 模式: Quit 按鈕 */}
					{!storage.capabilities.canAutoSave ? (
						<Button
							variant="outline"
							onClick={() => {
								showAlert({
									title: "Leave Without Saving?",
									description: "Your ranking has not been saved yet",
									confirmText: "Leave",
									onConfirm: () => {
										window.location.href = "/";
									},
								});
							}}
						>
							Quit
						</Button>
					) : (
						<Button variant="outline" onClick={() => storage.quit()}>
							Quit
						</Button>
					)}
				</div>
			</div>
			<div className="overflow-y-auto scrollbar-hidden">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={result.map((item) => item.id)}
						strategy={verticalListSortingStrategy}
					>
						<div>
							{result.map((data, index) => (
								<SortableResultItem
									key={data.id}
									data={data}
									ranking={index + 1}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
}

// 可拖曳的列表項目組件
function SortableResultItem({
	data,
	ranking,
}: {
	data: RankingResultData;
	ranking: number;
}) {
	const {
		setNodeRef,
		transform,
		transition,
		isDragging,
		attributes,
		listeners,
	} = useSortable({
		id: data.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn("relative", isDragging && "z-50 opacity-50")}
		>
			<div className="flex cursor-pointer select-none items-center gap-3 rounded border-b px-6 py-3 hover:bg-accent">
				<div
					{...attributes}
					{...listeners}
					className="flex w-8 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
				>
					<GripVertical className="h-5 w-5" />
				</div>

				{/* 排名 */}
				<p className="w-8 text-center text-secondary-foreground">{ranking}</p>

				{/* 專輯封面 */}
				<div className="flex-shrink-0">
					<Image
						className="rounded"
						src={data.img || PLACEHOLDER_PIC}
						alt={data.name}
						width={60}
						height={60}
					/>
				</div>

				{/* 歌曲資訊 */}
				<div className="min-w-0 flex-1">
					<p className="truncate">{data.name}</p>
					<p className="truncate text-muted-foreground">{data.album?.name}</p>
				</div>
			</div>
		</div>
	);
}
