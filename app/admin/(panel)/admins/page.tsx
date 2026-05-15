import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import AdminRow from "./AdminRow";
import { createAdmin } from "./actions";

export default async function AdminsPage() {
  const me = await requireAdmin();
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      displayName: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-[16px] font-bold text-gray-900">Add admin</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Create a new admin account with their own username and password.
        </p>
        <form action={createAdmin} className="mt-4 flex flex-col gap-3">
          <input
            name="username"
            placeholder="username (lowercase)"
            required
            minLength={3}
            maxLength={30}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            name="displayName"
            placeholder="Display name (optional)"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 chars)"
            required
            minLength={6}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="submit"
            className="bg-emerald-500 text-white font-bold text-[14px] py-2.5 rounded-xl active:scale-[0.98] transition-transform"
          >
            Create admin
          </button>
        </form>
      </div>

      <h2 className="text-[14px] font-bold text-gray-900 mt-2">Existing admins</h2>
      <div className="flex flex-col gap-2">
        {admins.map((a) => (
          <AdminRow
            key={a.id}
            admin={{
              id: a.id,
              username: a.username,
              displayName: a.displayName,
              isActive: a.isActive,
              createdAt: a.createdAt.toLocaleDateString("en-IN"),
              isSelf: a.id === me.id,
            }}
          />
        ))}
      </div>
    </div>
  );
}
