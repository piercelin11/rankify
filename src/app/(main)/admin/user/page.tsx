import getAllUsers from "@/lib/database/user/getAllUser";
import UserTable from "@/features/admin/user/components/UserTable";

export default async function AdminUserPage() {
    const users = await getAllUsers();

    return (
        <div className="p-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">
                    Manage roles and information for all registered users
                </p>
            </div>
            
            <UserTable users={users} />
        </div>
    );
}