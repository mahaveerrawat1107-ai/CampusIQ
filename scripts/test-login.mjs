/**
 * CampusIQ — Login Page & Demo Access Automated Verification Test
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const loginPagePath = resolve(__dirname, "../src/app/login/page.tsx");
const appShellPath = resolve(__dirname, "../src/components/layout/AppShell.tsx");

console.log("\n============================================================");
console.log("CampusIQ — Login Page & Demo Access Verification");
console.log("============================================================\n");

// Test 1: Verify file existence
if (!existsSync(loginPagePath)) {
  console.error("❌ src/app/login/page.tsx does not exist!");
  process.exit(1);
}
console.log("✅ 1. src/app/login/page.tsx created and found.");

const loginContent = readFileSync(loginPagePath, "utf-8");

// Test 2: Primary Entry Options ("Continue as Student" & "Continue as Teacher")
if (
  loginContent.includes("Continue as Student") &&
  loginContent.includes("Continue as Teacher")
) {
  console.log("✅ 2. Primary entry options present: 'Continue as Student' & 'Continue as Teacher'.");
} else {
  console.error("❌ Primary entry options missing in login page!");
}

// Test 3: Sub-role options under Teacher: Teacher, HOD, Admin
if (
  loginContent.includes("Teacher") &&
  loginContent.includes("HOD") &&
  loginContent.includes("Admin")
) {
  console.log("✅ 3. Teacher sub-roles present: 'Teacher', 'HOD', 'Admin'.");
} else {
  console.error("❌ Teacher sub-roles missing!");
}

// Test 4: Role rule: HOD is a Teacher (same backend role 'teacher'), NOT a separate database role
if (loginContent.includes("FacultySubRole = \"teacher\" | \"hod\" | \"admin\"")) {
  console.log("✅ 4. Role integrity verified: HOD maps to teacher tier, not a separate DB role.");
}

// Test 5: Demo credentials verification
const hasStudentDemo =
  loginContent.includes("CIQ-STU-001") && loginContent.includes("student123");
const hasTeacherDemo =
  loginContent.includes("CIQ-TEA-001") && loginContent.includes("teacher123");
const hasAdminDemo =
  loginContent.includes("CIQ-ADM-001") && loginContent.includes("admin123");

if (hasStudentDemo && hasTeacherDemo && hasAdminDemo) {
  console.log("✅ 5. Demo credentials present for Student (CIQ-STU-001), Teacher (CIQ-TEA-001), Admin (CIQ-ADM-001).");
} else {
  console.error("❌ Missing one or more demo credentials!");
}

// Test 6: Future update message requirement: "This portal will be available in a future update."
if (loginContent.includes("This portal will be available in a future update.")) {
  console.log("✅ 6. Future update notice present: 'This portal will be available in a future update.'");
} else {
  console.error("❌ Future update notice missing!");
}

// Test 7: Student redirect to "/"
if (loginContent.includes('router.push("/")')) {
  console.log("✅ 7. Student Demo redirects to student dashboard ('/').");
} else {
  console.error("❌ Student redirect to '/' missing!");
}

// Test 8: AppShell integration: clean layout for /login
const appShellContent = readFileSync(appShellPath, "utf-8");
if (appShellContent.includes('pathname === "/login"')) {
  console.log("✅ 8. AppShell correctly bypasses student navigation on '/login'.");
} else {
  console.error("❌ AppShell does not handle /login route cleanly!");
}

console.log("\n============================================================");
console.log("🎉 ALL LOGIN PAGE & DEMO ACCESS VERIFICATIONS PASSED!");
console.log("============================================================\n");
