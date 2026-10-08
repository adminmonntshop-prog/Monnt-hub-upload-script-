// js/auth.js

// 1. ตรวจสอบสถานะการเข้าสู่ระบบ
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) console.error("Session Error:", error.message);
        if (session) {
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        console.error("CheckAuth Fail:", err);
    }
}

checkAuth();

// ค้นหา URL สำหรับ Redirect กลับหน้า dashboard.html บน GitHub Pages
const redirectUrl = window.location.href.replace(/auth\.html.*$/, 'dashboard.html');

// 2. ปุ่มเข้าสู่ระบบด้วย Google
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
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
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'discord',
                options: { redirectTo: redirectUrl }
            });
            if (error) alert("Discord Login Error: " + error.message);
        } catch (err) {
            alert("Discord Exception: " + err.message);
        }
    });
}
