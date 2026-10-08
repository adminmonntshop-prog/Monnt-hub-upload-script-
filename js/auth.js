// js/auth.js

async function checkAuth() {
    try {
        if (!window.supabaseClient) return;
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) {
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        console.error("Auth check failed:", err);
    }
}

checkAuth();

// ⚡ ลิงก์ Redirect ตรงเป๊ะตามชื่อ Repository ของคุณ
const redirectUrl = "https://adminmonntshop-prog.github.io/Monnt-hub-upload-script-/dashboard.html";

// ปุ่ม Google
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
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
