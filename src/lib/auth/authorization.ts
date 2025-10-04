import { getUserSession } from "@/../auth";

/**
 * 驗證當前使用者是否為管理員
 * @throws 如果使用者不是管理員或 session 不存在
 * @returns 管理員的 Session 資訊
 * @example
 * export default async function deleteItem() {
 *   const admin = await requireAdmin(); // 如果不是管理員,這行會拋出錯誤
 *   await db.item.delete(...);
 * }
 */
export async function requireAdmin() {
	const session = await getUserSession();

	if (session.role !== "ADMIN") {
		throw new Error("Forbidden: Admin access required");
	}

	return session;
}

/**
 * 檢查當前使用者是否為管理員 (不拋出錯誤)
 * @returns true 如果是管理員
 * @example
 * const canEdit = await isAdmin();
 * if (canEdit) {
 *   // 顯示編輯按鈕
 * }
 */
export async function isAdmin(): Promise<boolean> {
	try {
		const session = await getUserSession();
		return session.role === "ADMIN";
	} catch {
		return false;
	}
}

/**
 * 驗證使用者是否有權限操作指定的資源
 * @param resourceUserId - 要操作的資源所屬的使用者 ID
 * @throws 如果當前使用者既不是資源擁有者也不是管理員
 * @returns 當前使用者的 Session
 * @example
 * export default async function updateProfile({ userId, data }) {
 *   await requireOwnerOrAdmin(userId); // 只有本人或管理員能修改
 *   await db.user.update(...);
 * }
 */
export async function requireOwnerOrAdmin(resourceUserId: string) {
	const session = await getUserSession();

	const isOwner = session.id === resourceUserId;
	const isAdminUser = session.role === "ADMIN";

	if (!isOwner && !isAdminUser) {
		throw new Error("Unauthorized: You can only modify your own resources");
	}

	return session;
}
