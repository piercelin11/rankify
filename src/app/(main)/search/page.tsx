import GlobalSearch from "@/features/home/components/GlobalSearch";

export default function SearchPage() {
	return (
		<div className="flex h-full flex-col items-center justify-start p-6">
			<div className="w-full max-w-2xl">
				<h1 className="mb-4 text-2xl font-bold">Search</h1>
				<GlobalSearch />
			</div>
		</div>
	);
}
