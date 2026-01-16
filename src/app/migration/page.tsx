import { getSession } from "@/../auth";
import { redirect } from "next/navigation";
import MigrationPage from "@/features/sorter/components/MigrationPage";

export default async function page() {
	const user = await getSession();

	// 未登入 → 跳轉首頁
	if (!user) {
		redirect("/");
	}

	return <MigrationPage />;
}
