import SidebarLayout from "@/components/sidebar/SidebarLayout";

export default async function HomePage() {
	return (
		<SidebarLayout>
			<p className="font-serif font-semibold">sidebar</p>
			<p className="font-serif font-semibold">content</p>
		</SidebarLayout>
	);
}
