/**
 * Upload a task photo to Supabase Storage.
 * Returns the signed URL that gets saved with the task instance.
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { serviceClient } from "@/lib/supabase";
import { todayIST } from "@/lib/timezone";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const taskKind = (form.get("kind") as string) ?? "task";

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const sb = serviceClient();
  const today = todayIST();
  const ts = Date.now();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${taskKind}/${today}/${me.id}-${ts}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const { error } = await sb.storage.from("task-photos").upload(path, new Uint8Array(arrayBuf), {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Public URL — bucket is private but we'll generate signed URLs at view time
  const { data: publicData } = sb.storage.from("task-photos").getPublicUrl(path);

  return NextResponse.json({
    path,
    url: publicData.publicUrl,
  });
}
