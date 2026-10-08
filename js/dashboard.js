// js/dashboard.js

let currentUser = null;
let selectedStatus = 'active'; // ค่าเริ่มต้น: เปิดใช้งาน

// 1. ตรวจสอบการเข้าสู่ระบบ
async function checkAuth() {
    if (!window.supabaseClient) return;
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = "auth.html";
        return;
    }
    currentUser = session.user;
}

checkAuth();

// 2. ควบคุมสวิตช์เปิด-ปิดรหัสผ่าน
const togglePassword = document.getElementById('toggle-password');
const passwordBox = document.getElementById('password-input-box');

if (togglePassword) {
    togglePassword.addEventListener('change', () => {
        passwordBox.style.display = togglePassword.checked ? 'block' : 'none';
    });
}

// 3. ควบคุมปุ่ม Segmented Control (สถานะสคริปต์)
const segmentBtns = document.querySelectorAll('.segment-btn');
segmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        segmentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStatus = btn.getAttribute('data-status');
    });
});

// 4. ควบคุมป๊อปอัปออกจากระบบ (Modal)
const btnOpenLogout = document.getElementById('btn-open-logout-modal');
const logoutModal = document.getElementById('logout-modal');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const btnModalConfirm = document.getElementById('btn-modal-confirm');

if (btnOpenLogout) {
    btnOpenLogout.addEventListener('click', () => {
        logoutModal.style.display = 'flex'; // แสดงป๊อปอัป
    });
}

if (btnModalCancel) {
    btnModalCancel.addEventListener('click', () => {
        logoutModal.style.display = 'none'; // ปิดป๊อปอัป
    });
}

if (btnModalConfirm) {
    btnModalConfirm.addEventListener('click', async () => {
        if (window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
            window.location.href = "auth.html"; // กลับไปหน้าล็อกอิน
        }
    });
}

// 5. สุ่ม Script ID ตัวเลข 25 หลัก
function generate25DigitId() {
    let id = "";
    for (let i = 0; i < 25; i++) {
        id += Math.floor(Math.random() * 10).toString();
    }
    return id;
}

// 6. ปุ่มยืนยันสร้างสคริปต์
const btnCreate = document.getElementById('btn-create');
if (btnCreate) {
    btnCreate.addEventListener('click', async () => {
        const nameInput = document.getElementById('script-name').value.trim();
        const codeInput = document.getElementById('script-code').value.trim();
        const hasPassword = togglePassword.checked;
        const passwordInput = document.getElementById('script-password').value.trim();

        if (!nameInput || !codeInput) {
            alert('⚠️ กรุณากรอกชื่อสคริปต์และโค้ด Lua ให้ครบถ้วน!');
            return;
        }

        if (hasPassword && !passwordInput) {
            alert('⚠️ กรุณากรอกรหัสผ่านด้วยครับ!');
            return;
        }

        btnCreate.disabled = true;
        btnCreate.textContent = "⏳ กำลังสร้างสคริปต์...";

        const scriptId = generate25DigitId();

        // บันทึกลง Supabase
        const { error } = await window.supabaseClient
            .from('scripts')
            .insert([
                {
                    id: scriptId,
                    user_id: currentUser.id,
                    script_name: nameInput,
                    script_code: codeInput,
                    has_password: hasPassword,
                    password: hasPassword ? passwordInput : null,
                    status: selectedStatus
                }
            ]);

        btnCreate.disabled = false;
        btnCreate.textContent = "✨ ยืนยันสร้าง link script";

        if (error) {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message);
        } else {
            // สร้างลิงก์ loadstring
            const generatedLink = `loadstring(game:HttpGet("https://adminmonntshop-prog.github.io/script-upload/${scriptId}/raw/main.lua"))()`;
            
            document.getElementById('display-script-link').textContent = generatedLink;
            document.getElementById('result-box').style.display = 'block';

            // ปุ่มกดคัดลอกลิงก์
            document.getElementById('btn-copy-link').onclick = () => {
                navigator.clipboard.writeText(generatedLink);
                alert('📋 คัดลอกลิงก์สคริปต์เรียบร้อยแล้ว!');
            };
        }
    });
}
