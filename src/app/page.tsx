import SidebarLayout from "@/components/sidebar/SidebarLayout";
import { auth } from "../../auth";

export default async function HomePage() {
	const session = await auth();

	console.log(session)

	return (
		<SidebarLayout>
			<p className="font-serif font-semibold">sidebar</p>
			<div>
				<p>content</p>
			</div>
			
		</SidebarLayout>
	);
}
