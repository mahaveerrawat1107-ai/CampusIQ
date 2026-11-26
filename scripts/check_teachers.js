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

async function checkTeachers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, verification_status');
  console.log('All Profiles:', profiles, error);

  const { data: tsa, error: tsaErr } = await supabase
    .from('teacher_subject_assignments')
    .select('*');
  console.log('Teacher Subject Assignments:', tsa, tsaErr);
}

checkTeachers();
