"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function fetchAttendance() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("student_attendance_logs")
    .select("*")
    .eq("student_id", user.id);

  if (error) throw error;
  return data;
}

export async function upsertAttendanceRecord(record: {
  subject_id: string;
  session_date: string;
  status: "present" | "absent";
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("student_attendance_logs")
    .upsert({
      student_id: user.id,
      ...record,
    }, { onConflict: "student_id,subject_id,session_date" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAttendanceRecord(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("student_attendance_logs")
    .delete()
    .eq("id", id)
    .eq("student_id", user.id);

  if (error) throw error;
}
