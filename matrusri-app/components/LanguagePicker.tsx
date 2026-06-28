"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMyLanguage } from "@/lib/actions";
import { LANG_LABEL, type Lang } from "@/lib/i18n";

export default function LanguagePicker({ current }: { current: Lang }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(lang: Lang) {
    if (lang === current) return;
    startTransition(async () => {
      await setMyLanguage(lang);
      router.refresh();
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
      <div className="text-xs text-slate-500 mb-2">Language</div>
      <div className="grid grid-cols-3 gap-2">
        {(["en", "te", "hi"] as const).map((l) => (
          <button
            key={l}
            onClick={() => change(l)}
            disabled={pending}
            className={`py-2 rounded text-sm font-semibold border ${
              current === l
                ? "bg-blue-800 text-white border-blue-800"
                : "bg-slate-50 text-slate-700 border-slate-300"
            } disabled:opacity-50`}
          >
            {LANG_LABEL[l]}
          </button>
        ))}
      </div>
      {pending && <div className="text-[11px] text-slate-500 mt-2">Saving…</div>}
    </div>
  );
}
