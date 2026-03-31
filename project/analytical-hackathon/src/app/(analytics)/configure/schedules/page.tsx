import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { PageHeader } from "@/components/analytics/page-header";
import { Calendar, Clock, Mail, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function SchedulesPage() {
  const customerId = await getActiveCustomerId();

  const schedules = await prisma.reportSchedule.findMany({
    where: { report: { customerId } },
    include: {
      report: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Schedules"
        description="Manage automated report delivery"
        actions={
          <div className="relative group">
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#7d654e]/60 bg-[#f7f3ef] border border-[#e8dfd4] rounded-lg cursor-not-allowed"
            >
              <Plus size={15} />
              Create Schedule
            </button>
            <div className="absolute right-0 top-full mt-2 px-3 py-2 text-xs text-[#7d654e] bg-[#e8dfd4] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Save a report first
            </div>
          </div>
        }
      />

      {schedules.length > 0 ? (
        <div className="rounded-xl border border-[#e8dfd4] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f3ef]">
                {["Report", "Frequency", "Day / Time", "Format", "Recipients", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold py-3 px-4 text-left"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, i) => {
                let recipients: string[] = [];
                try {
                  recipients = JSON.parse(s.recipients);
                } catch {}
                const dayLabel =
                  s.frequency === "WEEKLY"
                    ? `Day ${s.dayOfWeek ?? "—"}`
                    : s.frequency === "MONTHLY"
                      ? `${s.dayOfMonth ?? "—"}th`
                      : "—";
                return (
                  <tr
                    key={s.id}
                    className={cn(
                      "transition-colors hover:bg-[#f7f3ef]",
                      i % 2 === 1 && "bg-[#f7f3ef]",
                    )}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-[#1a1510]">
                      {s.report.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-[#1a1510]">{s.frequency}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-[#7d654e]">
                        {dayLabel} at {s.time}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] text-[#7d654e] bg-[#f7f3ef] border border-[#e8dfd4] rounded px-1.5 py-0.5">
                        {s.format}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-[#7d654e]/60" />
                        <span className="text-xs text-[#7d654e]">
                          {recipients.length}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            s.isActive ? "bg-emerald-500" : "bg-[#7d654e]/40",
                          )}
                        />
                        <span className="text-xs text-[#7d654e]">
                          {s.isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-[#e8dfd4] bg-white py-16 px-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#f7f3ef] flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[#7d654e]/60" />
          </div>
          <h3 className="text-sm font-semibold text-[#1a1510] mb-1">
            No scheduled deliveries yet
          </h3>
          <p className="text-xs text-[#7d654e]/60 max-w-sm mx-auto">
            Save a report and configure delivery to get started. Schedules can
            deliver PDF or Excel reports daily, weekly, or monthly.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#7d654e]/60">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />
              Daily, Weekly, Monthly
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} />
              Email delivery
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
