import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ColorSelector from "./ColorSelector";
import TrackCoverSelector from "./TrackCoverSelector";
import { Controller, useForm } from "react-hook-form";
import { updateTrackCoverSchema, UpdateTrackCoverType } from "@/lib/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrackData } from "@/types/data";
import updateTrackCover from "@/features/admin/editContent/actions/updateTrackCover";
import FormMessage from "@/components/form/FormMessage";
import { AppResponseType } from "@/types/response";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import { ADMIN_MESSAGES } from "@/constants/messages";
import { useServerAction } from "@/lib/hooks/useServerAction";

type TrackCoverEditingFormProps = {
	data: TrackData;
	onClose: () => void;
};

export default function TrackCoverEditingForm({
	data,
	onClose,
}: TrackCoverEditingFormProps) {
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const isMounted = useRef<HTMLFormElement | null>(null);
	const { execute, isPending } = useServerAction(updateTrackCover);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateTrackCoverType>({
		resolver: zodResolver(updateTrackCoverSchema),
		defaultValues: {
			img: data.img ?? "",
			color: data.color ?? "",
		},
	});

	async function onSubmit(formData: UpdateTrackCoverType) {
		try {
			const result = await execute({ trackId: data.id, formData });
			if (isMounted.current) setResponse(result);
			if (result.type === "success" && isMounted.current) onClose();
		} catch (error) {
			if (error instanceof Error && error.message !== "NEXT_REDIRECT" && isMounted.current) {
				setResponse({
					type: "error",
					message: ADMIN_MESSAGES.TRACK.UPDATE.FAILURE,
				});
			}
			console.error(`Failed to update track cover ${data.name}`, error);
		}
	}

	return (
		<div className="space-y-6">
			<form
				ref={isMounted}
				className="space-y-6"
				onSubmit={handleSubmit(onSubmit)}
			>
				<Controller
					name="img"
					control={control}
					render={({ field }) => (
						<TrackCoverSelector
							track={data}
							onChange={field.onChange}
							onBlur={field.onBlur}
							value={field.value}
						/>
					)}
				/>
				<Controller
					name="color"
					control={control}
					render={({ field }) => (
						<ColorSelector
							data={data}
							message={errors.color?.message}
							onChange={field.onChange}
							onBlur={field.onBlur}
							value={field.value}
							name={field.name}
						/>
					)}
				/>
				<div className="flex items-center gap-3">
					<Button type="submit" disabled={isPending} className="flex-1">
						Save
					</Button>
					<Button
						variant="outline"
						type="button"
						className="flex-1"
						onClick={onClose}
						disabled={isPending}
					>
						Cancel
					</Button>
					{isPending && (
						<div className="px-5">
							<LoadingAnimation />
						</div>
					)}
					{response && (
						<FormMessage message={response.message} type={response.type} />
					)}
				</div>
			</form>
		</div>
	);
}
