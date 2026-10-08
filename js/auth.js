<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monnt Hub - Login</title>
    <link rel="stylesheet" href="css/style.css">
    <!-- 1. ดึง Supabase Library จาก CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <div class="auth-container">
        <div class="auth-box">
            <h2>🔐 Monnt Hub</h2>
            <p>กรุณาเข้าสู่ระบบเพื่อจัดการและสร้างสคริปต์</p>

            <div class="auth-buttons">
                <button id="btn-google" class="btn-auth google">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google">
                    เข้าสู่ระบบด้วย Google
                </button>
                <button id="btn-discord" class="btn-auth discord">
                    <img src="https://www.svgrepo.com/show/353655/discord-icon.svg" alt="Discord">
                    เข้าสู่ระบบด้วย Discord
                </button>
            </div>
        </div>
    </div>

    <!-- 2. ดึงไฟล์ตั้งค่า Supabase (ต้องอยู่ก่อน auth.js) -->
    <script src="js/supabase-config.js"></script>
    
    <!-- 3. ดึงไฟล์ควบคุมระบบล็อกอิน -->
    <script src="js/auth.js"></script>
</body>
</html>
```

---

### 📍 ไฟล์ที่ 2: `js/supabase-config.js` (ใส่ในโฟลเดอร์ `js/`)
*(กำหนดผูกเข้ากับ `window.supabaseClient` โดยตรงเพื่อความชัวร์)*

```javascript
// js/supabase-config.js

const SUPABASE_URL = "https://oeaveahbzflitbgsspcs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PNJCzveUSmEjQ47vLFUUIQ_AMjbvCWX";

// สร้าง Supabase Client ผูกเข้ากับ window
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### 📍 ไฟล์ที่ 3: `js/auth.js` (ใส่ในโฟลเดอร์ `js/`)

```javascript
// js/auth.js

// 1. ตรวจสอบสถานะการเข้าสู่ระบบ
async function checkAuth() {
    try {
        if (!window.supabaseClient) return;
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error) console.error("Session Error:", error.message);
        if (session) {
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        console.error("CheckAuth Fail:", err);
    }
}

checkAuth();

// หา URL สำหรับ Redirect กลับหน้า dashboard.html บน GitHub Pages
const redirectUrl = window.location.href.replace(/auth\.html.*$/, 'dashboard.html');

// 2. ปุ่มเข้าสู่ระบบด้วย Google
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            if (!window.supabaseClient) {
                alert("❌ ระบบเชื่อมต่อ Supabase ไม่พร้อมใช้งาน กรุณารีเฟรชหน้าเว็บ");
                return;
            }
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: redirectUrl }
            });
            if (error) alert("Google Login Error: " + error.message);
        } catch (err) {
            alert("Google Exception: " + err.message);
        }
    });
}

// 3. ปุ่มเข้าสู่ระบบด้วย Discord
const btnDiscord = document.getElementById('btn-discord');
if (btnDiscord) {
    btnDiscord.addEventListener('click', async () => {
        try {
            if (!window.supabaseClient) {
                alert("❌ ระบบเชื่อมต่อ Supabase ไม่พร้อมใช้งาน กรุณารีเฟรชหน้าเว็บ");
                return;
            }
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'discord',
                options: { redirectTo: redirectUrl }
            });
            if (error) alert("Discord Login Error: " + error.message);
        } catch (err) {
            alert("Discord Exception: " + err.message);
        }
    });
}
