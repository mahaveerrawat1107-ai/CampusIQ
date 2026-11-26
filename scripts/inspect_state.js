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

async function run() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'mahaveer@uit.com',
    password: 'mahaveer123'
  });
  if (authErr) {
    console.error('Auth error:', authErr);
    return;
  }
  console.log('Logged in UID:', auth.user.id);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
  console.log('Profile:', JSON.stringify(profile, null, 2));

  const { data: enrollments, error: enrErr } = await supabase.from('student_class_enrollments').select('*, classes(*)').eq('student_id', auth.user.id);
  console.log('Enrollments:', enrollments, enrErr);

  const { data: classes } = await supabase.from('classes').select('*');
  console.log('Classes count:', classes?.length, classes);

  const { data: assignments, error: aErr } = await supabase.from('assignments').select('*, assignment_attachments(*)');
  console.log('Assignments count:', assignments?.length, aErr);

  const { data: notes, error: nErr } = await supabase.from('academic_notes').select('*');
  console.log('Notes count:', notes?.length, nErr);

  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Storage Buckets:', buckets, bErr);
}

run();
