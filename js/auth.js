// js/auth.js

async function checkAuth() {
    try {
        if (!window.supabaseClient) return;
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error) console.error("Session Error:", error.message);
        if (session) {
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        console.error("Auth check failed:", err);
    }
}

checkAuth();

// คำนวณ Redirect URL บน GitHub Pages
const redirectUrl = window.location.origin + window.location.pathname.replace(/auth\.html.*$/, 'dashboard.html');

// ปุ่ม Google
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            if (!window.supabaseClient) {
                alert("❌ ไม่สามารถเชื่อมต่อ Supabase ได้ กรุณารีเฟรชหน้าเว็บ");
                return;
            }
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: redirectUrl }
            });
            if (error) alert("❌ Google Login Error: " + error.message);
        } catch (err) {
            alert("❌ เกิดข้อผิดพลาด: " + err.message);
        }
    });
}

// ปุ่ม Discord
const btnDiscord = document.getElementById('btn-discord');
if (btnDiscord) {
    btnDiscord.addEventListener('click', async () => {
        try {
            if (!window.supabaseClient) {
                alert("❌ ไม่สามารถเชื่อมต่อ Supabase ได้ กรุณารีเฟรชหน้าเว็บ");
                return;
            }
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'discord',
                options: { redirectTo: redirectUrl }
            });
            if (error) alert("❌ Discord Login Error: " + error.message);
        } catch (err) {
            alert("❌ เกิดข้อผิดพลาด: " + err.message);
        }
    });
            }
