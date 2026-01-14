"use client";

import React, { useEffect, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlbumData, TrackData } from "@/types/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PLACEHOLDER_PIC } from "@/constants";
import Image from "next/image";
import { useForm, Controller, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sorterFilterSchema, SorterFilterType } from "@/lib/schemas/sorter";
import { createSubmission } from "../actions/createSubmission";
import { useSorterActions } from "@/contexts/SorterContext";
import { useRouter } from "next/navigation";

type FilterStageProps = {
	albums: AlbumData[];
	singles?: TrackData[];
};

export default function FilterStage({ albums, singles }: FilterStageProps) {
	const { setPercentage } = useSorterActions();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<SorterFilterType>({
		resolver: zodResolver(sorterFilterSchema),
		defaultValues: {
			selectedAlbumIds: albums.map((album) => album.id),
			selectedTrackIds: singles?.map((single) => single.id) || [],
		},
	});

	const onSubmit = async (data: SorterFilterType) => {
		try {
			const artistId = albums[0]?.artistId || singles?.[0]?.artistId;
			if (!artistId) {
				alert("找不到藝人 ID");
				return;
			}
			startTransition(async () => {
				const result = await createSubmission({
					selectedAlbumIds: data.selectedAlbumIds,
					selectedTrackIds: data.selectedTrackIds,
					type: "ARTIST",
					artistId,
				});

				// 成功後直接導航到新創建的 submission
				if (result.data && "id" in result.data) {
					// 使用 updateTag 硬失效,下次請求會強制取得新資料
					router.push(`/sorter/artist/${artistId}?skipPrompt=true`);
					router.refresh();
				}
			});
		} catch (error) {
			console.error("創建排序失敗:", error);
			alert("創建排序失敗，請重試");
		}
	};

	useEffect(() => {
		setPercentage(0);
	}, [setPercentage]);

	return (
		<div className="flex h-full flex-col">
			<div className="items-center justify-between space-y-6 py-10">
				<div className="space-y-2">
					<h3 className="text-center">Get Started</h3>
					<p className="text-description text-center">
						filter out the albums and singles you haven&apos;t listen to.
					</p>
				</div>
				<div className="flex justify-center gap-4">
					<Button type="submit" form="filter-form" disabled={isPending}>
						{isPending ? "Creating..." : "Start Sorter"}
					</Button>
					{albums.length > 0 && (
						<Link href={`/artist/${albums[0].artistId}`}>
							<Button variant="secondary">Quit Sorter</Button>
						</Link>
					)}
				</div>
				{errors.selectedAlbumIds && (
					<p className="text-center text-sm text-red-500">
						{errors.selectedAlbumIds.message}
					</p>
				)}
			</div>

			{/* 可滾動的表單區域 */}
			<div className="overflow-y-auto scrollbar-hidden">
				<form
					id="filter-form"
					onSubmit={handleSubmit(onSubmit)}
					className="p-6"
				>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-5">
						{albums.map((album) => (
							<FilterGalleryItem
								key={album.id}
								data={album}
								control={control}
								fieldName="selectedAlbumIds"
								value={album.id}
								subTitle="Album"
							/>
						))}
						{singles?.map((single) => (
							<FilterGalleryItem
								key={single.id}
								data={single}
								control={control}
								fieldName="selectedTrackIds"
								value={single.id}
								subTitle="Single"
							/>
						))}
					</div>
				</form>
			</div>
		</div>
	);
}

function FilterGalleryItem({
	data,
	control,
	fieldName,
	value,
	subTitle,
}: {
	data: AlbumData | TrackData;
	control: Control<SorterFilterType>;
	fieldName: keyof SorterFilterType;
	value: string;
	subTitle: string;
}) {
	return (
		//TODO: 調整樣式
		<Controller
			name={fieldName}
			control={control}
			render={({ field }) => {
				const isChecked = field.value.includes(value);

				const handleChange = (checked: boolean) => {
					if (checked) {
						field.onChange([...field.value, value]);
					} else {
						field.onChange(field.value.filter((id) => id !== value));
					}
				};

				return (
					<label className="group relative cursor-pointer space-y-2">
						<Checkbox
							checked={isChecked}
							onCheckedChange={handleChange}
							className="absolute left-2 top-2 z-10"
						/>
						<div className="relative aspect-square h-auto w-full rounded">
							<Image
								className={`transition-all ${
									isChecked ? "opacity-100" : "opacity-25"
								}`}
								alt={data.name}
								src={data.img ?? PLACEHOLDER_PIC}
								draggable={false}
								sizes="160px"
								fill
							/>
						</div>
						<div>
							<p className="line-clamp-2">{data.name}</p>
							<p className="text-sm text-secondary-foreground">{subTitle}</p>
						</div>
					</label>
				);
			}}
		/>
	);
}
