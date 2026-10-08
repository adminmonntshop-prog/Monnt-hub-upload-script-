// js/supabase-config.js

// ตั้งค่า URL และ Key ของ Supabase
const SUPABASE_URL = "https://oeaveahbzflitbgsspcs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PNJCzveUSmEjQ47vLFUUIQ_AMjbvCWX";

// สร้าง Supabase Client สำหรับเรียกใช้งานทั่วทั้งเว็บ
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
