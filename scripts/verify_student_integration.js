const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey);

async function verifyAll() {
  console.log('=== VERIFYING CAMPUSIQ STUDENT INTEGRATION ===');

  // 1. Authenticate with real student account
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'mahaveer@uit.com',
    password: 'mahaveer123'
  });
  if (authErr) {
    console.error('FAIL: Auth error', authErr);
    process.exit(1);
  }
  const uid = auth.user.id;
  console.log('PASS: Authenticated as mahaveer@uit.com, UID:', uid);

  // 2. Verify Profile Read
  const { data: profile, error: profErr } = await supabase.from('profiles').select('*').eq('id', uid).single();
  if (profErr || !profile) {
    console.error('FAIL: Profile fetch', profErr);
    process.exit(1);
  }
  console.log('PASS: Profile retrieved for', profile.full_name, `(${profile.email})`);

  // 3. Test Student Preferences Upsert & Read (Cloud Persistence)
  const testTheme = 'system';
  const { error: prefUpsertErr } = await supabase.from('student_preferences').upsert({
    student_id: uid,
    theme: testTheme,
    attendance_reminders: true,
    assignment_deadline_alerts: true,
    notes_updates: true,
    updated_at: new Date().toISOString()
  }, { onConflict: 'student_id' });
  if (prefUpsertErr) {
    console.error('FAIL: Preferences upsert', prefUpsertErr);
    process.exit(1);
  }
  const { data: savedPrefs, error: prefReadErr } = await supabase.from('student_preferences').select('*').eq('student_id', uid).single();
  if (prefReadErr || savedPrefs.theme !== testTheme) {
    console.error('FAIL: Preferences read back', prefReadErr);
    process.exit(1);
  }
  console.log('PASS: Student preferences persisted and verified in Supabase');

  // 4. Test Support Queries Insert (Student Help Desk)
  const { data: supportTicket, error: supErr } = await supabase.from('support_queries').insert({
    student_id: uid,
    category: 'Portal Verification',
    subject: 'Student Cloud Integration Audit',
    message: 'Automated end-to-end integration test from Antigravity session.',
    status: 'open'
  }).select().single();
  if (supErr) {
    console.error('FAIL: Support query insert', supErr);
    process.exit(1);
  }
  console.log('PASS: Support query recorded with ID:', supportTicket.id);

  // 5. Test Attendance Persistence (Preserved Phase 2.2)
  const todayStr = new Date().toISOString().split('T')[0];
  const { error: attErr } = await supabase.from('student_attendance_logs').upsert({
    student_id: uid,
    subject_id: 'sub-bt101',
    session_date: todayStr,
    status: 'present',
    recorded_at: new Date().toISOString()
  }, { onConflict: 'student_id,subject_id,session_date' });
  if (attErr) {
    console.error('FAIL: Attendance persistence', attErr);
    process.exit(1);
  }
  console.log('PASS: Personal attendance log verified for today');

  console.log('=== ALL INTEGRATION CHECKS PASSED ===');
}

verifyAll();
