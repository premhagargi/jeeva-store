import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const entity = sp.entity ?? "";

  const where = entity ? { entity } : {};
  const [logs, total, entities] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { admin: { select: { username: true, displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["entity"] }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <a
          href="/admin/audit"
          className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold ${
            !entity ? "bg-emerald-500 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          All
        </a>
        {entities.map((e) => (
          <a
            key={e.entity}
            href={`/admin/audit?entity=${e.entity}`}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold ${
              entity === e.entity
                ? "bg-emerald-500 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {e.entity}
          </a>
        ))}
      </div>

      <p className="text-[11px] text-gray-400">
        {total} entr{total === 1 ? "y" : "ies"}
      </p>

      <div className="flex flex-col gap-1.5">
        {logs.length === 0 ? (
          <p className="text-center text-[13px] text-gray-400 py-8">No audit entries.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="text-[12px] font-bold text-gray-900">
                  <span className="text-emerald-600">{log.action}</span> {log.entity}
                  {log.entityId && (
                    <span className="text-gray-400 font-normal">
                      {" "}
                      · {log.entityId.slice(0, 8)}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 shrink-0">
                  {log.createdAt.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                by {log.admin?.displayName ?? log.admin?.username ?? "system"}
                {log.details && ` · ${log.details}`}
              </p>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          {page > 1 ? (
            <a
              href={`/admin/audit?page=${page - 1}${entity ? `&entity=${entity}` : ""}`}
              className="text-[12px] font-semibold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50"
            >
              Prev
            </a>
          ) : (
            <span />
          )}
          <span className="text-[12px] text-gray-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <a
              href={`/admin/audit?page=${page + 1}${entity ? `&entity=${entity}` : ""}`}
              className="text-[12px] font-semibold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50"
            >
              Next
            </a>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
