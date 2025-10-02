"use client";

import ContentSelectionForm from "./ContentSelectionForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import addSingle from "@/features/admin/addContent/actions/addSingle";
import { useModal } from "@/contexts";

type AddSingleButtonProps = {
	artistId: string;
};

export default function AddSingleButton({ artistId }: AddSingleButtonProps) {
	const { showCustom, close } = useModal();

	function handleSubmit(singleIds: string[], token: string) {
		return addSingle({ artistId, trackIds: singleIds, token });
	}

	return (
		<Button
			variant="secondary"
			className="pl-4 pr-6"
			onClick={() =>
				showCustom({
					title: "Add Single",
					content: (
						<ContentSelectionForm
							artistId={artistId}
							onCancel={close}
							type="Single"
							submitAction={handleSubmit}
						/>
					),
				})
			}
		>
			<PlusIcon />
			Add Single
		</Button>
	);
}
