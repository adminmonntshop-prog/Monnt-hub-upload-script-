// js/auth.js

// 1. ตรวจสอบว่าผู้ใช้ล็อกอินอยู่แล้วหรือไม่
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = "dashboard.html";
    }
}

checkAuth();

// หา URL ปัจจุบันเพื่อให้ Redirect กลับมาที่หน้า dashboard.html บน GitHub Pages ได้ถูกพาธ
const redirectUrl = window.location.href.replace(/auth\.html.*$/, 'dashboard.html');

// 2. ปุ่ม Google Login
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });
        if (error) alert("เกิดข้อผิดพลาด Google: " + error.message);
    });
}

// 3. ปุ่ม Discord Login
const btnDiscord = document.getElementById('btn-discord');
if (btnDiscord) {
    btnDiscord.addEventListener('click', async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: redirectUrl
            }
        });
        if (error) alert("เกิดข้อผิดพลาด Discord: " + error.message);
    });
}
