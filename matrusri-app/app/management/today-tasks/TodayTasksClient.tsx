"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase-browser";
import { iconForTask } from "@/lib/i18n";

export type TaskRow = {
  id: string;
  name: string;
  slotTime: string;
  windowStart: string;
  windowEnd: string;
  proofType: "photo" | "count" | "tap";
  status: "pending" | "open" | "done" | "missed";
  photoUrl: string | null;
  countData: { boys_present?: number; girls_present?: number; absent_with_permission?: number; absent_without_permission?: number } | null;
  submittedAt: string | null;
  assignedName: string | null;
};

function formatHHMM(t: string) {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

function formatTimestamp(iso: string | null) {
  if (!iso) return "";
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const date = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  let h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

const STATUS_LABEL: Record<TaskRow["status"], { text: string; cls: string; bar: string }> = {
  done:    { text: "Done",     cls: "bg-green-100 text-green-800",   bar: "border-l-emerald-500" },
  missed:  { text: "Missed",   cls: "bg-red-100 text-red-800",       bar: "border-l-red-500" },
  open:    { text: "Pending",  cls: "bg-slate-100 text-slate-500",   bar: "border-l-slate-300" },
  pending: { text: "Pending",  cls: "bg-slate-100 text-slate-500",   bar: "border-l-slate-300" },
};

type FilterKey = "all" | "missed" | "done" | "pending";

export default function TodayTasksClient({ initialTasks }: { initialTasks: TaskRow[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [modalPhoto, setModalPhoto] = useState<{ url: string; title: string } | null>(null);

  // Sync with server changes (in case initialTasks changes from a refresh)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Realtime subscription: re-fetch when any task instance changes
  useEffect(() => {
    const sb = browserClient();
    const channel = sb
      .channel("task_instances_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_instances" },
        () => {
          // Simplest path: refresh the server data
          router.refresh();
        }
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, [router]);

  const counts = {
    all:     tasks.length,
    missed:  tasks.filter((t) => t.status === "missed").length,
    done:    tasks.filter((t) => t.status === "done").length,
    pending: tasks.filter((t) => t.status === "pending" || t.status === "open").length,
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "done") return t.status === "done";
    if (filter === "missed") return t.status === "missed";
    if (filter === "pending") return t.status === "pending" || t.status === "open";
    return true;
  });

  // Sort by slot_time
  filteredTasks.sort((a, b) => a.slotTime.localeCompare(b.slotTime));

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(
          [
            { id: "all" as const,     label: "All" },
            { id: "missed" as const,  label: "Missed" },
            { id: "done" as const,    label: "Done" },
            { id: "pending" as const, label: "Pending" },
          ]
        ).map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                active
                  ? "bg-blue-800 text-white border-blue-800"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {c.label} ({counts[c.id]})
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-500">
          No tasks in this filter.
        </div>
      )}

      {filteredTasks.map((t) => {
        const status = STATUS_LABEL[t.status];
        const icon = iconForTask(t.name);
        return (
          <div
            key={t.id}
            className={`bg-white border border-slate-200 border-l-4 ${status.bar} rounded-xl p-3 mb-2`}
          >
            <div className="flex items-start gap-2">
              <div className="text-2xl shrink-0 leading-none">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {formatHHMM(t.slotTime)} · window {formatHHMM(t.windowStart)}–{formatHHMM(t.windowEnd)}
                  {t.assignedName && <> · assigned to {t.assignedName}</>}
                </div>

                {/* Proof details */}
                {t.status === "done" && (
                  <div className="mt-2">
                    {t.proofType === "photo" && t.photoUrl && (
                      <button
                        onClick={() => setModalPhoto({ url: t.photoUrl!, title: t.name })}
                        className="block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={t.photoUrl}
                          alt={t.name}
                          className="w-24 h-24 object-cover rounded border border-slate-200"
                        />
                      </button>
                    )}
                    {t.proofType === "count" && t.countData && (
                      <div className="text-xs text-slate-700 bg-slate-50 rounded p-2 inline-block">
                        Boys: <strong>{t.countData.boys_present}</strong>
                        {" · "}Girls: <strong>{t.countData.girls_present}</strong>
                        {t.countData.absent_with_permission !== undefined && (
                          <> · With perm: <strong>{t.countData.absent_with_permission}</strong></>
                        )}
                      </div>
                    )}
                    {t.proofType === "tap" && (
                      <div className="text-xs text-emerald-700">
                        ✓ Tap done {t.assignedName && <>by {t.assignedName}</>}
                        {t.submittedAt && <> at {formatTimestamp(t.submittedAt)}</>}
                      </div>
                    )}
                  </div>
                )}

                {t.status === "missed" && (
                  <div className="text-xs text-red-700 mt-1">
                    🔴 Window closed without submission
                  </div>
                )}
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase shrink-0 ${status.cls}`}>
                {status.text}
              </span>
            </div>
          </div>
        );
      })}

      <div className="text-[11px] text-slate-400 text-center mt-4">
        ✅ Live · auto-updates when wardens submit
      </div>

      {/* Photo modal */}
      {modalPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setModalPhoto(null)}
        >
          <div className="text-white text-center mb-3 max-w-full">
            <div className="font-semibold">{modalPhoto.title}</div>
            <div className="text-xs opacity-75 mt-1">Tap anywhere to close</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={modalPhoto.url}
            alt={modalPhoto.title}
            className="max-w-full max-h-[80vh] object-contain rounded"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalPhoto(null);
            }}
            className="mt-3 px-4 py-2 bg-white text-slate-900 rounded font-semibold text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
