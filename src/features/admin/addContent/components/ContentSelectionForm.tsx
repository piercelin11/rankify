import React from "react";
import SelectablecContentItem from "./SelectablecContentItem";
import Button from "@/components/ui/Button";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import FormMessage from "@/components/form/FormMessage";
import { ActionResponse } from "@/types/action";
import useSearchInput from "@/lib/hooks/useSearchInput";
import useAdminContentAddtion from "../hooks/useAdminContentAddtion";
import SearchInput from "@/components/ui/SearchInput";

export type ContentType = "Album" | "EP" | "Single";
export type ContentSubmitActionType = (
	selectedIds: string[],
	accessToken: string
) => Promise<ActionResponse>;

type ContentSelectionFormProps = {
	artistId: string;
	onCancel: () => void;
	type: ContentType;
	submitAction: ContentSubmitActionType;
};

export default function ContentSelectionForm({
	artistId,
	onCancel,
	type,
	submitAction,
}: ContentSelectionFormProps) {
	const {
		albums,
		artist,
		selectedIds,
		response,
		isLoading,
		isPending,
		handleCheckboxClick,
		handleSubmit,
	} = useAdminContentAddtion(type, artistId, submitAction, onCancel);

	const { inputValue, handleInput, result, isSearcing } = useSearchInput(
		type === "Single" ? "track" : "album",
		artist?.name
	);

	return (
		<div className="mt-4 space-y-8">
			<SearchInput
				onChange={handleInput}
				value={inputValue}
				placeholder={`search for ${type.toLowerCase()}s`}
				spellCheck={false}
			/>

			<div className="space-y-8">
				<div className="relaive h-[500px] overflow-y-auto">
					{isLoading || isSearcing ? (
						<div className="flex h-full items-center justify-center">
							<LoadingAnimation />
						</div>
					) : (
						<>
							{(result || (type === "Album" && albums) || []).map((item) => (
								<SelectablecContentItem
									key={item.id}
									data={item}
									handleClick={handleCheckboxClick}
									checked={selectedIds.includes(item.id)}
									type={
										type === "Album"
											? "Album"
											: type === "Single"
												? "Track"
												: "Single/EP"
									}
								/>
							))}
						</>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button variant="outline" onClick={onCancel} disabled={isPending}>
					Cancel
				</Button>
				<Button variant="lime" onClick={handleSubmit} disabled={isPending}>
					Add {type}
				</Button>
				{isPending && (
					<div className="px-5">
						<LoadingAnimation />
					</div>
				)}
				{response && !isPending && (
					<FormMessage message={response.message} isError={!response.success} />
				)}
			</div>
		</div>
	);
}
