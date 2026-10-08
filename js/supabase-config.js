// js/supabase-config.js

const SUPABASE_URL = "https://oeaveahbzflitbgsspcs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PNJCzveUSmEjQ47vLFUUIQ_AMjbvCWX";

// กำหนดตัวแปรให้เรียกใช้ได้ทั้งสองชื่อ ป้องกันความผิดพลาด
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;
