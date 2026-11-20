/**
 * CampusIQ Stage 6.2 — Database Migration Verification Probe
 * Verifies existence of all 21 tables and the class_student_directory view.
 * Checks for PGRST205 (missing table in schema cache) vs successful table discovery.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

function parseEnvFile(filePath) {
  const env = {};
  const content = readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    env[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim();
  }
  return env;
}

const env = parseEnvFile(envPath);
const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY =
  env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ||
  env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

console.log("\n============================================================");
console.log("CampusIQ Stage 6.2 — Database Migration Verification Probe");
console.log("============================================================\n");
console.log("Target Project URL:", SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  // Domain A: Institutional Reference Data
  "colleges",
  "departments",
  "classes",
  "subjects",
  "class_subjects",
  // Domain B: Identity & Enrollment
  "profiles",
  "approved_enrollments",
  "teacher_invitations",
  "student_class_enrollments",
  "teacher_subject_assignments",
  // Domain C: Student Personal Data
  "student_attendance_logs",
  "student_preferences",
  // Domain D: Institutional Academic Data
  "institutional_attendance_sessions",
  "institutional_attendance_records",
  "assignments",
  "assignment_attachments",
  "student_assignment_status",
  // Domain E: Academic Content
  "academic_notes",
  "support_queries",
  // Domain F: AI Chat
  "ai_conversations",
  "ai_messages",
  // Views
  "class_student_directory",
];

let existingCount = 0;
let missingCount = 0;

for (const tableName of TABLES) {
  const { data, error } = await supabase.from(tableName).select("*").limit(1);

  if (error) {
    if (error.code === "PGRST205" || error.message.includes("schema cache")) {
      console.log(`  ❌ ${tableName.padEnd(36)} -> NOT FOUND (table missing in schema)`);
      missingCount++;
    } else {
      // Table exists in schema cache, but query returned error (e.g. RLS blocked unauthenticated access)
      console.log(`  ✅ ${tableName.padEnd(36)} -> EXISTS (RLS active: ${error.message})`);
      existingCount++;
    }
  } else {
    console.log(`  ✅ ${tableName.padEnd(36)} -> EXISTS (Accessible rows: ${data ? data.length : 0})`);
    existingCount++;
  }
}

console.log("\n============================================================");
console.log(`Summary: ${existingCount}/${TABLES.length} tables/views detected in Supabase.`);
if (missingCount === 0) {
  console.log("🎉 ALL TABLES & VIEWS ARE PRESENT AND OPERATIONAL!");
} else {
  console.log(`⚠️ ${missingCount} tables/views are not yet created in Supabase.`);
  console.log("Run the migration by pasting supabase/combined_migration.sql into the Supabase SQL Editor.");
}
console.log("============================================================\n");
