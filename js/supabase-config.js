// js/supabase-config.js

const SUPABASE_URL = "https://oeaveahbzflitbgsspcs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PNJCzveUSmEjQ47vLFUUIQ_AMjbvCWX";

// สร้าง Supabase Client ผูกเข้ากับ window
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
