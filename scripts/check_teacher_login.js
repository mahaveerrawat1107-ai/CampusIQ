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

async function checkLogin() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'mahaveer@uit.com',
    password: 'mahaveer123'
  });
  console.log('Mahaveer login:', auth?.user?.id, authErr);

  // Attempt login with demo teacher if registered
  const { data: teaAuth, error: teaErr } = await supabase.auth.signInWithPassword({
    email: 'teacher@uit.com',
    password: 'teacher123'
  });
  console.log('Teacher login test (teacher@uit.com):', teaAuth?.user?.id, teaErr?.message);
}

checkLogin();
