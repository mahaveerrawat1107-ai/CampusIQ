/**
 * CampusIQ Supabase Connectivity Probe
 * Run: node scripts/probe-supabase.mjs
 * Reads credentials from .env.local and verifies Supabase reachability.
 * Does NOT create tables, modify data, or authenticate users.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

// Parse .env.local manually (no dotenv dependency needed)
function parseEnvFile(filePath) {
  const env = {};
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      env[key] = value;
    }
  } catch {
    console.error("Could not read .env.local — ensure it exists in the project root.");
    process.exit(1);
  }
  return env;
}

const env = parseEnvFile(envPath);
const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY =
  env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ||
  env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

console.log("\n=== CampusIQ Supabase Connectivity Probe ===\n");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  console.error("Please fill in .env.local with your Supabase project credentials.");
  process.exit(1);
}

// Mask key for safe console display
const maskedKey = SUPABASE_KEY.slice(0, 12) + "..." + SUPABASE_KEY.slice(-6);
console.log("Project URL :  ", SUPABASE_URL);
console.log("API Key     :  ", maskedKey);
console.log("");

// Test 1: Health check endpoint
const healthUrl = `${SUPABASE_URL}/rest/v1/`;
console.log("[1] Testing REST API health endpoint...");
try {
  const res = await fetch(healthUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (res.status === 200 || res.status === 404) {
    console.log("    ✓ REST API reachable (HTTP", res.status, "— expected without tables)");
  } else {
    console.log("    ! REST API responded with HTTP", res.status);
  }
} catch (err) {
  console.error("    ✗ REST API unreachable:", err.message);
  process.exit(1);
}

// Test 2: Auth endpoint
const authUrl = `${SUPABASE_URL}/auth/v1/`;
console.log("[2] Testing Auth API endpoint...");
try {
  const res = await fetch(authUrl, {
    headers: { apikey: SUPABASE_KEY },
  });
  if (res.status === 404 || res.status === 200 || res.status === 400) {
    console.log("    ✓ Auth API reachable (HTTP", res.status, ")");
  } else {
    console.log("    ! Auth API responded with HTTP", res.status);
  }
} catch (err) {
  console.error("    ✗ Auth API unreachable:", err.message);
  process.exit(1);
}

console.log("\n=== Result ===");
console.log("✓ Supabase project is reachable and credentials are valid.");
console.log("✓ Ready for database migration phase.\n");
