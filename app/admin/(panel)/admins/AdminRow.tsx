"use client";

import { useState, useTransition } from "react";
import { Key, Trash2, Power } from "lucide-react";
import { resetAdminPassword, toggleAdminActive, deleteAdmin } from "./actions";

interface Props {
  admin: {
    id: string;
    username: string;
    displayName: string | null;
    isActive: boolean;
    createdAt: string;
    isSelf: boolean;
  };
}

export default function AdminRow({ admin }: Props) {
  const [pending, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-gray-900">{admin.username}</p>
            {admin.isSelf && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                YOU
              </span>
            )}
            {!admin.isActive && (
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                DISABLED
              </span>
            )}
          </div>
          {admin.displayName && (
            <p className="text-[12px] text-gray-500">{admin.displayName}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-0.5">Added {admin.createdAt}</p>
        </div>
      </div>

      {resetting ? (
        <div className="flex gap-2 items-center">
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="New password"
            className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-[13px] outline-none"
          />
          <button
            disabled={pending || newPw.length < 6}
            onClick={() =>
              run(async () => {
                await resetAdminPassword(admin.id, newPw);
                setResetting(false);
                setNewPw("");
              })
            }
            className="text-[12px] font-bold text-white bg-emerald-500 px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => {
              setResetting(false);
              setNewPw("");
              setError(null);
            }}
            className="text-[12px] font-semibold text-gray-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setResetting(true)}
            className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700"
          >
            <Key size={12} />
            Reset password
          </button>
          {!admin.isSelf && (
            <button
              disabled={pending}
              onClick={() => run(() => toggleAdminActive(admin.id))}
              className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 disabled:opacity-50"
            >
              <Power size={12} />
              {admin.isActive ? "Deactivate" : "Activate"}
            </button>
          )}
          {!admin.isSelf && (
            <button
              disabled={pending}
              onClick={() => {
                if (confirm(`Delete admin "${admin.username}"?`)) {
                  run(() => deleteAdmin(admin.id));
                }
              }}
              className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 disabled:opacity-50"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
