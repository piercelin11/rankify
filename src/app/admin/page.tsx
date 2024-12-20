import ArtistAddingModal from "@/components/admin/add-artist/ArtistaAddingModal";
import ModalOpenButton from "@/components/modal/ModalOpenButton";
import SidebarLayout from "@/components/sidebar/SidebarLayout";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";

export default async function AdminPage() {

	return (
		<SidebarLayout>
			<p>sidebar</p>
 
			<div className="p-8">
				<ModalOpenButton variant="gray">
					<ArtistAddingModal />
					<div className="flex items-center justify-center gap-2 pr-2">
						<PlusIcon />
						Add Artist
					</div>
				</ModalOpenButton>
			</div>
		</SidebarLayout>
	);
}
