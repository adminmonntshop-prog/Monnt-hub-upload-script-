<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monnt Hub - Login</title>
    <link rel="stylesheet" href="css/style.css">
    
    <!-- Supabase Library CDN -->
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

    <!-- โหลดสคริปต์ตั้งค่าและสคริปต์ล็อกอิน -->
    <script src="js/supabase-config.js"></script>
    <script src="js/auth.js"></script>
</body>
</html>
```

---

### 📍 2. ไฟล์ `js/supabase-config.js` (วางในโฟลเดอร์ `js/`)

```javascript
// js/supabase-config.js

const SUPABASE_URL = "https://oeaveahbzflitbgsspcs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PNJCzveUSmEjQ47vLFUUIQ_AMjbvCWX";

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### 📍 3. ไฟล์ `js/auth.js` (วางในโฟลเดอร์ `js/`)

```javascript
// js/auth.js

async function checkAuth() {
    if (!window.supabaseClient) return;
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
        window.location.href = "dashboard.html";
    }
}

checkAuth();

const redirectUrl = window.location.href.replace(/auth\.html.*$/, 'dashboard.html');

const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl }
        });
    });
}

const btnDiscord = document.getElementById('btn-discord');
if (btnDiscord) {
    btnDiscord.addEventListener('click', async () => {
        await window.supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: redirectUrl }
        });
    });
}
