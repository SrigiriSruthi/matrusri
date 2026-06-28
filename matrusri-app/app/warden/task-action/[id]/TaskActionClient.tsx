"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { markTaskTapDone, submitTaskPhoto } from "@/lib/actions";

type Props = {
  taskInstanceId: string;
  status: string;
  proofType: "photo" | "count" | "tap";
  existingPhoto: string | null;
  windowStart: string;
  windowEnd: string;
};

function formatHHMM(t: string) {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function parseHHMM(t: string) {
  if (!t) return 0;
  const p = t.split(":");
  return (parseInt(p[0]) || 0) * 60 + (parseInt(p[1]) || 0);
}

function useWindowState(windowStart: string, windowEnd: string) {
  const [now, setNow] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNow(d.getHours() * 60 + d.getMinutes());
    }, 30000); // refresh every 30 sec
    return () => clearInterval(id);
  }, []);

  const start = parseHHMM(windowStart);
  const end = parseHHMM(windowEnd);
  const state: "before" | "open" | "after" =
    now < start ? "before" : now > end ? "after" : "open";

  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
  };
  const message =
    state === "before"
      ? `Window opens in ${fmt(start - now)}`
      : state === "after"
      ? `Window closed (${fmt(now - end)} ago)`
      : `Window closes in ${fmt(end - now)}`;

  return { state, message };
}

export default function TaskActionClient(props: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(props.existingPhoto);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyDone = props.status === "done";
  const win = useWindowState(props.windowStart, props.windowEnd);
  const locked = !alreadyDone && win.state !== "open";

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function compressImage(f: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("compress fail"))),
          "image/jpeg",
          0.75
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(f);
    });
  }

  async function uploadAndSubmit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", compressed, `task-${Date.now()}.jpg`);
      form.append("kind", "task");

      const res = await fetch("/api/upload-photo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      await submitTaskPhoto(props.taskInstanceId, data.url);
      router.push("/warden");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function tapDone() {
    setBusy(true);
    setError(null);
    try {
      await markTaskTapDone(props.taskInstanceId);
      router.push("/warden");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (alreadyDone) {
    return (
      <div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded p-3 mb-4">
          ✓ This task is already done.
        </div>
        {preview && (
          <img src={preview} alt="proof" className="w-full rounded-xl mb-4" />
        )}
        <button
          onClick={() => router.push("/warden")}
          className="w-full bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
        >
          ← Back to tasks
        </button>
      </div>
    );
  }

  if (props.proofType === "tap") {
    return (
      <div>
        <WindowBanner state={win.state} message={win.message} windowStart={props.windowStart} windowEnd={props.windowEnd} />
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4 text-center">
          <div className="text-5xl mb-3">✓</div>
          <div className="text-sm text-slate-600">
            Confirm this task has been completed. No photo required.
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3 mb-4">{error}</div>}
        <button
          onClick={tapDone}
          disabled={busy || locked}
          className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
        >
          {locked
            ? win.state === "before"
              ? "🔒 Window not open yet"
              : "🔒 Window closed"
            : busy
            ? "Saving…"
            : "✓ Mark done"}
        </button>
        <button
          onClick={() => router.push("/warden")}
          className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
        >
          Cancel
        </button>
      </div>
    );
  }

  // photo flow
  return (
    <div>
      <WindowBanner state={win.state} message={win.message} windowStart={props.windowStart} windowEnd={props.windowEnd} />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        className="hidden"
        disabled={locked}
      />

      <button
        onClick={() => !locked && fileRef.current?.click()}
        disabled={locked}
        className="w-full bg-slate-900 text-white rounded-xl h-72 flex flex-col items-center justify-center mb-4 overflow-hidden disabled:opacity-50"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : locked ? (
          <>
            <div className="text-6xl">🔒</div>
            <div className="text-sm opacity-80 mt-2">
              {win.state === "before" ? "Window not open yet" : "Window closed"}
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl">📷</div>
            <div className="text-sm opacity-80 mt-2">Tap to open camera</div>
            <div className="text-[11px] opacity-60 mt-1">Camera only — no gallery</div>
          </>
        )}
      </button>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3 mb-4">{error}</div>}

      <button
        onClick={uploadAndSubmit}
        disabled={!file || busy || locked}
        className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
      >
        {locked
          ? win.state === "before"
            ? "🔒 Window not open yet"
            : "🔒 Window closed"
          : busy
          ? "Uploading…"
          : preview
          ? "📤 Upload"
          : "📤 Upload (take photo first)"}
      </button>
      <button
        onClick={() => router.push("/warden")}
        className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
      >
        Cancel
      </button>
    </div>
  );
}

function WindowBanner({
  state,
  message,
  windowStart,
  windowEnd,
}: {
  state: "before" | "open" | "after";
  message: string;
  windowStart: string;
  windowEnd: string;
}) {
  const bg =
    state === "open"
      ? "bg-blue-50 border-blue-200 text-blue-800"
      : "bg-amber-50 border-amber-200 text-amber-800";
  const icon = state === "open" ? "⏰" : state === "before" ? "⏳" : "🔒";
  return (
    <div className={`${bg} border text-xs px-3 py-2 rounded mb-4`}>
      {icon} Window: {formatHHMM(windowStart)} – {formatHHMM(windowEnd)} · <strong>{message}</strong>
    </div>
  );
}
