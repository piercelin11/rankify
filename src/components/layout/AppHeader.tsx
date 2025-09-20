import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
			<div className="flex h-14 items-center px-4">
				<SidebarTrigger className="h-8 w-8" />
				<div className="flex flex-1 items-center justify-center">
					<h1 className="text-lg font-semibold">Rankify</h1>
				</div>
			</div>
		</header>
	);
}