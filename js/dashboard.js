// js/dashboard.js

let currentUser = null;

// 1. ตรวจสอบ Session การเข้าสู่ระบบ
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // ถ้าไม่ได้ล็อกอิน ให้เด้งกลับหน้า auth.html
        window.location.href = "auth.html";
        return;
    }
    currentUser = session.user;
    
    // แสดงชื่อ Email หรือ Display Name บน Header
    const userEmailSpan = document.getElementById('user-email');
    if (userEmailSpan) {
        userEmailSpan.textContent = currentUser.email || currentUser.user_metadata.full_name || "User";
    }
}

checkAuth();

// 2. ปุ่ม ออกจากระบบ (Logout)
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = "auth.html";
    });
}

// 3. ซ่อน/แสดง ช่องกรอกรหัสผ่าน ตามการติ๊ก Checkbox
const togglePassword = document.getElementById('toggle-password');
const passwordInputBox = document.getElementById('password-input-box');

if (togglePassword && passwordInputBox) {
    togglePassword.addEventListener('change', () => {
        passwordInputBox.style.display = togglePassword.checked ? 'block' : 'none';
    });
}

// 4. ฟังก์ชันสุ่มตัวเลขล้วน ความยาว N หลัก (ค่าเริ่มต้น 25 หลัก)
function generateNumericID(length = 25) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

// 5. ปุ่ม ยืนยันสร้างสคริปต์
const btnCreate = document.getElementById('btn-create');
if (btnCreate) {
    btnCreate.addEventListener('click', async () => {
        const nameInput = document.getElementById('script-name').value.trim();
        const codeInput = document.getElementById('script-code').value.trim();
        const hasPassword = togglePassword.checked;
        const passwordInput = document.getElementById('script-password').value.trim();

        // ตรวจสอบความถูกต้องของข้อมูล
        if (!nameInput || !codeInput) {
            alert('⚠️ กรุณากรอกชื่อสคริปต์และเนื้อหาโค้ดให้ครบถ้วน!');
            return;
        }

        if (hasPassword && !passwordInput) {
            alert('⚠️ กรุณากรอกรหัสผ่านที่ต้องการตั้งด้วยครับ!');
            return;
        }

        btnCreate.disabled = true;
        btnCreate.textContent = "⏳ กำลังบันทึกข้อมูล...";

        // สุ่ม Script ID ตัวเลขล้วน 25 หลัก
        const scriptId = generateNumericID(25);

        // บันทึกลงตาราง scripts ใน Supabase
        const { error } = await supabase
            .from('scripts')
            .insert([
                {
                    id: scriptId,
                    user_id: currentUser.id,
                    script_name: nameInput,
                    script_code: codeInput,
                    has_password: hasPassword,
                    password: hasPassword ? passwordInput : null
                }
            ]);

        btnCreate.disabled = false;
        btnCreate.textContent = "✨ ยืนยันสร้างสคริปต์";

        if (error) {
            alert('❌ เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
            return;
        }

        // แสดงผลลัพธ์ ID และ Loadstring
        const resultBox = document.getElementById('result-box');
        const resId = document.getElementById('res-id');
        const resLoadstring = document.getElementById('res-loadstring');

        resId.textContent = scriptId;
        
        // รูปแบบ URL ตามโครงสร้างที่เรากำหนดไว้
        const loadstringCode = `loadstring(game:HttpGet("https://adminmonntshop-prog.github.io/script-upload/${scriptId}/raw/main.lua"))()`;
        resLoadstring.value = loadstringCode;

        resultBox.style.display = 'block';
        resultBox.scrollIntoView({ behavior: 'smooth' });
    });
}

// 6. ปุ่มคัดลอกคำสั่ง Loadstring
const btnCopy = document.getElementById('btn-copy');
if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        const copyInput = document.getElementById('res-loadstring');
        copyInput.select();
        navigator.clipboard.writeText(copyInput.value);
        alert('📋 คัดลอกคำสั่ง Loadstring เรียบร้อยแล้ว!');
    });
}
