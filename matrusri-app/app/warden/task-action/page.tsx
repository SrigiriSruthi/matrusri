"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PhoneHeader from "@/components/PhoneHeader";

export default function TaskAction() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  return (
    <div className="min-h-screen">
      <PhoneHeader
        back="/warden"
        title="Yoga Photo"
        subtitle="Yoga session — proof photo"
      />

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
          ⏰ Window: 5:15 – 7:45 am · Now 5:42 am · 2 hr 3 min remaining
        </div>

        {/* Hidden file input — camera only, no gallery */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPick}
          className="hidden"
        />

        {/* Tap area opens camera */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-slate-900 text-white rounded-xl h-72 flex flex-col items-center justify-center mb-4 overflow-hidden"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="text-6xl">📷</div>
              <div className="text-sm opacity-80 mt-2">Tap to open camera</div>
              <div className="text-[11px] opacity-60 mt-1">
                Camera only — gallery disabled
              </div>
            </>
          )}
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="font-semibold mb-2">Requirements</div>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>All students visible in frame</li>
            <li>Camera only — no gallery upload</li>
            <li>Date and time stamped automatically</li>
          </ul>
        </div>

        <button
          onClick={() => {
            alert("Photo uploaded. Task marked done.");
            router.push("/warden");
          }}
          disabled={!preview}
          className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
        >
          {preview ? "📤 Upload" : "📤 Upload (take photo first)"}
        </button>
        <button
          onClick={() => router.push("/warden")}
          className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
